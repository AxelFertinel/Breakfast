import { prisma } from "@/lib/prisma";
import { getPlanLimits } from "@/lib/auth/stripe/auth-plans";

/**
 * Calculate remaining AI generations for a user based on their subscription plan
 * Returns { remaining, total, period } where period is "week" or "month" or "unlimited"
 */
export async function getRemainingAiQuota(
  userId: string,
  plan = "free",
): Promise<{
  remaining: number;
  total: number;
  period: "week" | "month" | "unlimited";
  used: number;
}> {
  const planLimits = getPlanLimits(plan);

  // Unlimited (Pro plan)
  if (planLimits.aiGenerationsPerMonth === -1) {
    return {
      remaining: -1, // unlimited
      total: -1,
      period: "unlimited",
      used: 0,
    };
  }

  // Monthly quota (Famille, Premium)
  if (planLimits.aiGenerationsPerMonth !== null) {
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    const usedThisMonth = await prisma.aiUsage.aggregate({
      where: {
        userId,
        createdAt: { gte: monthStart },
      },
      _sum: { tokenCount: true },
    });

    const used = usedThisMonth._sum.tokenCount || 0;
    const total = planLimits.aiGenerationsPerMonth;
    const remaining = Math.max(0, total - used);

    return { remaining, total, period: "month", used };
  }

  // Weekly quota (Free)
  if (planLimits.aiGenerationsPerWeek !== null) {
    const now = new Date();
    const dayOfWeek = now.getDay();
    // Monday = 1, Sunday = 0, so we need to go back to Monday
    const diff = now.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
    const weekStart = new Date(now);
    weekStart.setDate(diff);
    weekStart.setHours(0, 0, 0, 0);

    const usedThisWeek = await prisma.aiUsage.aggregate({
      where: {
        userId,
        createdAt: { gte: weekStart },
      },
      _sum: { tokenCount: true },
    });

    const used = usedThisWeek._sum.tokenCount || 0;
    const total = planLimits.aiGenerationsPerWeek;
    const remaining = Math.max(0, total - used);

    return { remaining, total, period: "week", used };
  }

  // Fallback (shouldn't happen)
  return {
    remaining: 0,
    total: 0,
    period: "month",
    used: 0,
  };
}

/**
 * Log an AI generation usage
 */
export async function logAiUsage(
  userId: string,
  feature: string,
  tokenCount = 1,
) {
  return prisma.aiUsage.create({
    data: {
      userId,
      feature,
      tokenCount,
    },
  });
}
