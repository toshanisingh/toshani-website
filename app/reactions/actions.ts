"use server";

import { prisma } from "@/lib/prisma";
import { ensureVisitorId } from "@/lib/visitor";

export type ReactionType = "LIKE" | "LOVE";
export type ReactionState = { like: number; love: number; mine: ReactionType | null };

async function countsFor(pageId: string, mine: ReactionType | null): Promise<ReactionState> {
  const grouped = await prisma.reaction.groupBy({
    by: ["type"],
    where: { pageId },
    _count: { _all: true },
  });
  const get = (t: ReactionType) => grouped.find((g) => g.type === t)?._count._all ?? 0;
  return { like: get("LIKE"), love: get("LOVE"), mine };
}

// Toggle/switch the current visitor's reaction on a page:
//  - no reaction yet         -> create
//  - same type clicked again -> remove (toggle off)
//  - different type clicked  -> switch
export async function react(pageId: string, type: ReactionType): Promise<ReactionState> {
  const page = await prisma.page.findUnique({ where: { id: pageId }, select: { id: true } });
  if (!page) return { like: 0, love: 0, mine: null };

  const visitorId = await ensureVisitorId();
  const existing = await prisma.reaction.findUnique({
    where: { pageId_visitorId: { pageId, visitorId } },
  });

  let mine: ReactionType | null;
  if (!existing) {
    await prisma.reaction.create({ data: { pageId, visitorId, type } });
    mine = type;
  } else if (existing.type === type) {
    await prisma.reaction.delete({ where: { id: existing.id } });
    mine = null;
  } else {
    await prisma.reaction.update({ where: { id: existing.id }, data: { type } });
    mine = type;
  }

  return countsFor(pageId, mine);
}
