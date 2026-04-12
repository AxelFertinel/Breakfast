import type { Subscription } from "@/generated/prisma";
import { prisma } from "@/lib/prisma";
import { redisClient } from "@/lib/redis";
import { CacheKeys, CacheTTL } from "@/lib/redis-keys";
import { stripe } from "@/lib/stripe";
import type { OverrideLimits, PlanLimit } from "../auth/stripe/auth-plans";
import { getPlanLimits } from "../auth/stripe/auth-plans";
import { logger } from "../logger";

export const getOrgActiveSubscription = async (
  organizationId: string,
): Promise<
  | (Subscription & {
      status: string | null;
      cancelAtPeriodEnd: boolean | null;
      limits: PlanLimit;
    })
  | null
> => {
  const cacheKey = CacheKeys.orgSubscription(organizationId);

  // Try to get cached subscription
  try {
    const cached = await redisClient.get(cacheKey);

    if (cached) {
      return JSON.parse(cached);
    }
  } catch (error) {
    logger.error("[Cache Error] getOrgActiveSubscription:", error);
  }
  // Get subscription from database
  const subscription = await prisma.subscription.findFirst({
    where: {
      referenceId: organizationId,
      OR: [
        { status: "active" },
        { status: "trialing" },
        { status: "past_due" }, // Include past_due as it's still technically active
      ],
    },
  });

  if (!subscription?.stripeSubscriptionId) {
    return null;
  }

  try {
    // Verify subscription status with Stripe
    const stripeSubscription = await stripe.subscriptions.retrieve(
      subscription.stripeSubscriptionId,
    );

    // If Stripe says it's not active, update our database
    if (
      !["active", "trialing", "past_due"].includes(stripeSubscription.status)
    ) {
      await prisma.subscription.update({
        where: { id: subscription.id },
        data: {
          status: stripeSubscription.status,
          // If canceled, revert to free plan
          ...(stripeSubscription.status === "canceled" && { plan: "free" }),
        },
      });
      return null;
    }

    // Return subscription with updated Stripe data
    const result = {
      ...subscription,
      status: stripeSubscription.status,
      cancelAtPeriodEnd: stripeSubscription.cancel_at_period_end,
      limits: getPlanLimits(
        subscription.plan,
        subscription.overrideLimits as OverrideLimits | null,
      ),
    };

    // Cache the result for 1 hour
    try {
      await redisClient.setex(
        cacheKey,
        CacheTTL.ORG_SUBSCRIPTION,
        JSON.stringify(result),
      );
    } catch (cacheError) {
      logger.error("[Cache Error] setex getOrgActiveSubscription:", cacheError);
    }

    return result;
  } catch (error) {
    logger.error("Error fetching Stripe subscription:", error);
    // If Stripe fails, return database subscription
    const result = {
      ...subscription,
      status: subscription.status,
      cancelAtPeriodEnd: null,
      limits: getPlanLimits(
        subscription.plan,
        subscription.overrideLimits as OverrideLimits | null,
      ),
    };

    // Cache the fallback result for shorter time (5 minutes)
    try {
      await redisClient.setex(cacheKey, 300, JSON.stringify(result));
    } catch (cacheError) {
      logger.error(
        "[Cache Error] setex getOrgActiveSubscription fallback:",
        cacheError,
      );
    }

    return result;
  }
};
