import { prisma } from "@/lib/prisma";
import type { ReactionTarget, ReactionType } from "@/app/reactions/actions";

export type ReactionCounts = { like: number; love: number };

// Counts only — NO cookie read, so pages that call this can be statically
// cached (ISR). The current visitor's own reaction ("mine") is resolved on the
// client from localStorage, keeping the page out of dynamic rendering.
export async function getReactionCounts(
  targetType: ReactionTarget,
  targetId: string,
): Promise<ReactionCounts> {
  const grouped = await prisma.reaction.groupBy({
    by: ["type"],
    where: { targetType, targetId },
    _count: { _all: true },
  });
  const get = (t: ReactionType) => grouped.find((g) => g.type === t)?._count._all ?? 0;
  return { like: get("LIKE"), love: get("LOVE") };
}
