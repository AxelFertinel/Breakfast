"use server";

import { prisma } from "@/lib/prisma";
import { authAction } from "@/lib/actions/safe-actions";
import { ActionError } from "@/lib/errors/action-error";
import { z } from "zod";

export const addShoppingItemAction = authAction
  .inputSchema(
    z.object({
      name: z.string().min(1, "Le nom est requis"),
      note: z.string().optional(),
    }),
  )
  .action(async ({ parsedInput, ctx: { user } }) => {
    const item = await prisma.shoppingItem.create({
      data: {
        userId: user.id,
        name: parsedInput.name,
        note: parsedInput.note,
      },
    });
    return { item };
  });

export const deleteShoppingItemAction = authAction
  .inputSchema(z.object({ id: z.string() }))
  .action(async ({ parsedInput: { id }, ctx: { user } }) => {
    const existing = await prisma.shoppingItem.findFirst({
      where: { id, userId: user.id },
    });
    if (!existing) throw new ActionError("Article introuvable");

    await prisma.shoppingItem.delete({ where: { id } });
    return { success: true };
  });
