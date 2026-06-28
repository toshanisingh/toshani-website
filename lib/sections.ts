import { prisma } from "@/lib/prisma";

export function getSections() {
  return prisma.section.findMany({
    orderBy: [{ position: "asc" }, { createdAt: "asc" }],
  });
}

// For use in the public layout/home, where a transient DB hiccup should degrade
// to an empty nav rather than crash every page.
export async function getSectionsSafe() {
  try {
    return await getSections();
  } catch (err) {
    console.error("[sections] failed to load:", err);
    return [];
  }
}
