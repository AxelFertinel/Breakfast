import type { Prisma } from "@/generated/prisma";
import { prisma } from "@/lib/prisma";

type GetOrgsMembersOptions = {
  page?: number;
  pageSize?: number;
};

export const getOrgsMembers = async (
  orgId: string,
  options: GetOrgsMembersOptions = {},
) => {
  const { page = 1, pageSize = 50 } = options;

  return prisma.member.findMany({
    where: {
      organizationId: orgId,
    },
    select: {
      user: {
        select: {
          image: true,
          id: true,
          name: true,
          email: true,
        },
      },
      id: true,
      role: true,
      userId: true,
    },
    skip: (page - 1) * pageSize,
    take: pageSize,
    orderBy: { createdAt: "desc" },
  });
};

export type OrgMembers = Prisma.PromiseReturnType<typeof getOrgsMembers>;
