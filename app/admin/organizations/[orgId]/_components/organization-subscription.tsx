"use client";

import { Typography } from "@/components/nowts/typography";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { dialogManager } from "@/features/dialog-manager/dialog-manager";
import type { Organization, Subscription } from "@/generated/prisma";
import { AUTH_PLANS, LIMITS_CONFIG } from "@/lib/auth/stripe/auth-plans";
import { cn } from "@/lib/utils";
import { dayjs } from "@/lib/dayjs";
import { Check, ChevronDown, ExternalLink, Ticket } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import {
  cancelSubscriptionAction,
  createSubscriptionAction,
  reactivateSubscriptionAction,
  updateSubscriptionPlanAction,
} from "../_actions/subscription-admin.actions";

type OrganizationWithSubscription = Organization & {
  subscription: Subscription | null;
};

type BillingCycle = "monthly" | "yearly";

const STATUS_CONFIG = {
  active: { color: "bg-emerald-500", label: "Active" },
  trialing: { color: "bg-amber-500", label: "Trial" },
  past_due: { color: "bg-red-500", label: "Past Due" },
  canceled: { color: "bg-zinc-400", label: "Canceled" },
} as const;

export function OrganizationSubscription({
  organization,
  subscription,
}: {
  organization: OrganizationWithSubscription;
  subscription: Subscription | null;
}) {
  const router = useRouter();
  const [isUpdating, setIsUpdating] = useState(false);

  const detectBillingCycle = (): BillingCycle => {
    if (!subscription?.periodEnd || !subscription.periodStart) return "monthly";
    const periodStart = new Date(subscription.periodStart);
    const periodEnd = new Date(subscription.periodEnd);
    const monthsDiff =
      (periodEnd.getFullYear() - periodStart.getFullYear()) * 12 +
      (periodEnd.getMonth() - periodStart.getMonth());
    return monthsDiff >= 11 ? "yearly" : "monthly";
  };

  const [billingCycle, setBillingCycle] =
    useState<BillingCycle>(detectBillingCycle());
  const [selectedPlan, setSelectedPlan] = useState<string>(
    subscription?.plan ?? "free",
  );
  const [showCoupon, setShowCoupon] = useState(false);
  const [couponCode, setCouponCode] = useState("");

  const currentPlan = AUTH_PLANS.find(
    (plan) => plan.name === subscription?.plan,
  );
  const isActive = ["active", "trialing", "past_due"].includes(
    subscription?.status ?? "",
  );
  const status = subscription?.status;
  const statusConfig =
    status && status in STATUS_CONFIG
      ? STATUS_CONFIG[status as keyof typeof STATUS_CONFIG]
      : null;

  const hasChanges =
    selectedPlan !== (subscription?.plan ?? "free") ||
    (subscription && billingCycle !== detectBillingCycle());

  const handlePlanUpdate = async () => {
    if (!hasChanges && !couponCode) return;

    setIsUpdating(true);
    try {
      const isYearly = billingCycle === "yearly";
      const coupon = couponCode.trim() || undefined;

      if (!subscription && selectedPlan !== "free") {
        await createSubscriptionAction({
          organizationId: organization.id,
          planName: selectedPlan,
          isYearly,
          couponCode: coupon,
        });
      } else if (subscription) {
        await updateSubscriptionPlanAction({
          organizationId: organization.id,
          planName: selectedPlan,
          isYearly,
          couponCode: coupon,
        });
      }
      setCouponCode("");
      setShowCoupon(false);
      router.refresh();
    } finally {
      setIsUpdating(false);
    }
  };

  const handleCancelSubscription = () => {
    if (!subscription) return;

    dialogManager.confirm({
      title: "Cancel Subscription",
      description:
        "The organization will lose access at the end of the billing period.",
      variant: "destructive",
      action: {
        label: "Cancel Subscription",
        variant: "destructive",
        onClick: async () => {
          setIsUpdating(true);
          try {
            await cancelSubscriptionAction({
              organizationId: organization.id,
            });
            router.refresh();
          } finally {
            setIsUpdating(false);
          }
        },
      },
    });
  };

  const handleReactivateSubscription = async () => {
    if (!subscription) return;

    setIsUpdating(true);
    try {
      await reactivateSubscriptionAction({
        organizationId: organization.id,
      });
      router.refresh();
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Subscription</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Current Status */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Typography variant="h3" className="capitalize">
              {currentPlan?.name ?? "Free"} Plan
            </Typography>
            {subscription?.status ? (
              <div className="flex items-center gap-1.5">
                <span
                  className={cn("size-1.5 rounded-full", statusConfig?.color)}
                />
                <Typography variant="muted" className="text-xs">
                  {statusConfig?.label ?? subscription.status}
                </Typography>
              </div>
            ) : null}
          </div>

          {subscription?.periodEnd && (
            <Typography variant="muted" className="text-xs">
              {subscription.cancelAtPeriodEnd ? "Cancels" : "Renews"}{" "}
              {dayjs(subscription.periodEnd).format("MMM DD, YYYY")}
            </Typography>
          )}
        </div>

        {subscription?.stripeSubscriptionId && (
          <Button variant="outline" size="sm" className="h-7" asChild>
            <a
              href={`https://dashboard.stripe.com/subscriptions/${subscription.stripeSubscriptionId}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              <ExternalLink className="mr-1.5 size-3" />
              Stripe
            </a>
          </Button>
        )}

        {/* Plan Selection */}
        <div className="space-y-4 border-t pt-6">
          <div className="flex items-center justify-between">
            <Typography variant="large">Change Plan</Typography>
            <Tabs
              value={billingCycle}
              onValueChange={(v) => setBillingCycle(v as BillingCycle)}
            >
              <TabsList>
                <TabsTrigger value="monthly">Monthly</TabsTrigger>
                <TabsTrigger value="yearly">Yearly</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          <div className="grid gap-2 sm:grid-cols-3">
            {AUTH_PLANS.filter((p) => !p.isHidden).map((plan) => {
              const price =
                billingCycle === "yearly" ? plan.yearlyPrice : plan.price;
              const isSelected = selectedPlan === plan.name;
              const isCurrent = subscription?.plan === plan.name;

              return (
                <button
                  key={plan.name}
                  type="button"
                  onClick={() => setSelectedPlan(plan.name)}
                  disabled={isUpdating}
                  className={cn(
                    "relative flex flex-col rounded-lg border p-3 text-left transition-colors",
                    "hover:bg-accent/50 disabled:cursor-not-allowed disabled:opacity-50",
                    isSelected && "border-primary bg-primary/5",
                  )}
                >
                  {isCurrent && (
                    <Badge
                      variant="secondary"
                      className="absolute -top-2 right-2 text-[10px]"
                    >
                      Current
                    </Badge>
                  )}

                  <div className="mb-2 flex items-center justify-between">
                    <span className="font-medium capitalize">{plan.name}</span>
                    <div
                      className={cn(
                        "flex size-4 items-center justify-center rounded-full border",
                        isSelected
                          ? "border-primary bg-primary text-primary-foreground"
                          : "border-muted-foreground/30",
                      )}
                    >
                      {isSelected && <Check className="size-2.5" />}
                    </div>
                  </div>

                  <div className="mb-2">
                    <span className="text-xl font-semibold">${price ?? 0}</span>
                    <span className="text-muted-foreground text-xs">
                      /{billingCycle === "yearly" ? "yr" : "mo"}
                    </span>
                  </div>

                  <div className="text-muted-foreground space-y-0.5 text-xs">
                    {(
                      Object.keys(
                        LIMITS_CONFIG,
                      ) as (keyof typeof LIMITS_CONFIG)[]
                    ).map((key) => {
                      const value = plan.limits[key];
                      const config = LIMITS_CONFIG[key];
                      return <div key={key}>{config.getLabel(value)}</div>;
                    })}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Coupon */}
          <div className="space-y-2">
            <button
              type="button"
              onClick={() => setShowCoupon(!showCoupon)}
              className="text-muted-foreground hover:text-foreground flex items-center gap-1.5 text-xs transition-colors"
            >
              <Ticket className="size-3" />
              {showCoupon ? "Hide coupon" : "Apply coupon"}
              <ChevronDown
                className={cn(
                  "size-3 transition-transform",
                  showCoupon && "rotate-180",
                )}
              />
            </button>
            {showCoupon && (
              <Input
                placeholder="Enter coupon code (e.g. 100OFF)"
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value)}
                className="h-8 max-w-xs text-sm"
              />
            )}
          </div>

          {/* Actions */}
          <div className="flex flex-wrap items-center gap-2 pt-2">
            <Button
              onClick={handlePlanUpdate}
              disabled={isUpdating || (!hasChanges && !couponCode.trim())}
              size="sm"
            >
              {isUpdating
                ? "Updating..."
                : !subscription && selectedPlan !== "free"
                  ? "Create"
                  : "Apply"}
            </Button>

            {subscription && isActive && !subscription.cancelAtPeriodEnd && (
              <Button
                onClick={handleCancelSubscription}
                disabled={isUpdating}
                variant="ghost"
                size="sm"
                className="text-muted-foreground"
              >
                Cancel
              </Button>
            )}

            {subscription?.cancelAtPeriodEnd && (
              <Button
                onClick={handleReactivateSubscription}
                disabled={isUpdating}
                variant="outline"
                size="sm"
              >
                Reactivate
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
