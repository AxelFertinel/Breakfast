import { getRequiredUser } from "@/lib/auth/auth-user";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const user = await getRequiredUser();
    const members = await prisma.familyMember.findMany({
      where: { userId: user.id },
      select: { id: true, name: true, type: true, dietaryPrefs: true },
    });
    return NextResponse.json(members);
  } catch {
    return NextResponse.json([], { status: 200 });
  }
}
