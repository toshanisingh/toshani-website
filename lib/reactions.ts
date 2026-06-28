import { prisma } from "@/lib/prisma";
import { getVisitorId } from "@/lib/visitor";
import type { ReactionState, ReactionType } from "@/app/reactions/actions";

// Initial reaction counts + this visitor's current choice, for server render.
export async function getReactionState(pageId: string): Promise<ReactionState> {
  const visitorId = await getVisitorId();
  const [grouped, mineRow] = await Promise.all([
    prisma.reaction.groupBy({ by: ["type"], where: { pageId }, _count: { _all: true } }),
    visitorId
      ? prisma.reaction.findUnique({ where: { pageId_visitorId: { pageId, visitorId } } })
      : Promise.resolve(null),
  ]);
  const get = (t: ReactionType) => grouped.find((g) => g.type === t)?._count._all ?? 0;
  return { like: get("LIKE"), love: get("LOVE"), mine: (mineRow?.type as ReactionType) ?? null };
}
