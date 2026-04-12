"use server";

import { adminAction } from "@/lib/actions/safe-actions";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

export const updateOrganizationNameAction = adminAction
  .inputSchema(
    z.object({
      organizationId: z.string(),
      name: z.string().min(1),
    }),
  )
  .action(async ({ parsedInput: { organizationId, name } }) => {
    await prisma.organization.update({
      where: { id: organizationId },
      data: { name },
    });
  });
