"use server";

import { prisma } from "@/lib/prisma";
import { ensureVisitorId } from "@/lib/visitor";

export type ReactionType = "LIKE" | "LOVE";
export type ReactionTarget = "PAGE" | "SECTION" | "TAG";
export type ReactionState = { like: number; love: number; mine: ReactionType | null };

async function countsFor(
  targetType: ReactionTarget,
  targetId: string,
  mine: ReactionType | null,
): Promise<ReactionState> {
  const grouped = await prisma.reaction.groupBy({
    by: ["type"],
    where: { targetType, targetId },
    _count: { _all: true },
  });
  const get = (t: ReactionType) => grouped.find((g) => g.type === t)?._count._all ?? 0;
  return { like: get("LIKE"), love: get("LOVE"), mine };
}

async function targetExists(targetType: ReactionTarget, targetId: string): Promise<boolean> {
  if (targetType === "PAGE") return !!(await prisma.page.findUnique({ where: { id: targetId }, select: { id: true } }));
  if (targetType === "SECTION") return !!(await prisma.section.findUnique({ where: { id: targetId }, select: { id: true } }));
  return !!(await prisma.tag.findUnique({ where: { id: targetId }, select: { id: true } }));
}

// Toggle/switch the current visitor's reaction on a target:
//  - no reaction yet         -> create
//  - same type clicked again -> remove (toggle off)
//  - different type clicked  -> switch
export async function react(
  targetType: ReactionTarget,
  targetId: string,
  type: ReactionType,
): Promise<ReactionState> {
  if (!(await targetExists(targetType, targetId))) {
    return { like: 0, love: 0, mine: null };
  }

  const visitorId = await ensureVisitorId();
  const existing = await prisma.reaction.findUnique({
    where: { targetType_targetId_visitorId: { targetType, targetId, visitorId } },
  });

  let mine: ReactionType | null;
  if (!existing) {
    await prisma.reaction.create({ data: { targetType, targetId, visitorId, type } });
    mine = type;
  } else if (existing.type === type) {
    await prisma.reaction.delete({ where: { id: existing.id } });
    mine = null;
  } else {
    await prisma.reaction.update({ where: { id: existing.id }, data: { type } });
    mine = type;
  }

  return countsFor(targetType, targetId, mine);
}
