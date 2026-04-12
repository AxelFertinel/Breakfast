import { prisma } from "@/lib/prisma";
import { orgRoute } from "@/lib/zod-route";
import type { CommandSearchResult } from "@/types/command";
import { z } from "zod";

function getMatchScore(label: string, query: string): number {
  const normalizedLabel = label.toLowerCase();
  const normalizedQuery = query.toLowerCase();

  if (normalizedLabel === normalizedQuery) return 100;
  if (normalizedLabel.startsWith(normalizedQuery)) return 75;
  if (normalizedLabel.includes(` ${normalizedQuery} `)) return 50;
  if (normalizedLabel.includes(normalizedQuery)) return 25;

  const queryWords = normalizedQuery.split(" ");
  const matchingWords = queryWords.filter((word) =>
    normalizedLabel.includes(word),
  );
  return matchingWords.length > 0 ? 10 : 0;
}

export const GET = orgRoute
  .query(
    z.object({
      q: z.string().optional(),
    }),
  )
  .handler(async (_req, { query, ctx }) => {
    if (!query.q) {
      return [];
    }

    const members = await prisma.member.findMany({
      where: {
        organizationId: ctx.organization.id,
        user: {
          OR: [
            {
              name: {
                contains: query.q,
                mode: "insensitive",
              },
            },
            {
              email: {
                contains: query.q,
                mode: "insensitive",
              },
            },
          ],
        },
      },
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        user: {
          name: "asc",
        },
      },
      take: 10,
    });

    const searchQuery = query.q;
    const results: CommandSearchResult[] = members
      .map((member) => ({
        url: `/orgs/${ctx.organization.slug}/settings/members?search=${encodeURIComponent(member.user.email)}`,
        label: member.user.name || member.user.email,
        icon: "member" as const,
      }))
      .sort((a, b) => {
        const scoreA = getMatchScore(a.label, searchQuery);
        const scoreB = getMatchScore(b.label, searchQuery);

        if (scoreA !== scoreB) {
          return scoreB - scoreA;
        }

        return a.label.localeCompare(b.label);
      });

    return results;
  });
