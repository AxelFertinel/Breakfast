"use cache";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemTitle,
} from "@/components/ui/item";
import {
  AUTH_PLANS,
  LIMITS_CONFIG,
  type PlanLimit,
} from "@/lib/auth/stripe/auth-plans";
import type { CurrentOrgPayload } from "@/lib/organizations/get-org";
import Link from "next/link";

type PlanUsageCardProps = {
  org: CurrentOrgPayload;
};

export async function PlanUsageCard({ org }: PlanUsageCardProps) {
  const currentPlan = org.subscription;
  const planName = currentPlan?.plan ?? "free";
  const planLimits = currentPlan?.limits ?? AUTH_PLANS[0].limits;

  const currentPlanIndex = AUTH_PLANS.findIndex((p) => p.name === planName);
  const hasUpgrades = currentPlanIndex < AUTH_PLANS.length - 1;

  return (
    <Card className="h-fit">
      <CardHeader>
        <CardTitle>
          {planName.charAt(0).toUpperCase() + planName.slice(1)} Plan
        </CardTitle>
        <CardDescription>
          {org.subscription?.status === "trialing"
            ? "Trial Period"
            : "Current plan usage and features"}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-6">
        {Object.entries(planLimits).map(([key, value]) => {
          const limitKey = key as keyof PlanLimit;
          const config = LIMITS_CONFIG[limitKey];
          const Icon = config.icon;

          return (
            <Item key={key} className="p-0">
              <ItemContent>
                <div className="flex items-center gap-2">
                  <Icon className="text-muted-foreground size-4" />
                  <ItemTitle>{config.getLabel(value)}</ItemTitle>
                </div>
                <ItemDescription className="text-xs">
                  {config.description}
                </ItemDescription>
              </ItemContent>
              {hasUpgrades && (
                <ItemActions>
                  <Button asChild variant="outline" size="sm">
                    <Link href={`/orgs/${org.slug}/settings/billing/plan`}>
                      Upgrade
                    </Link>
                  </Button>
                </ItemActions>
              )}
            </Item>
          );
        })}

        {hasUpgrades && (
          <>
            <div className="border-border border-t" />
            <Button asChild className="w-full">
              <Link href={`/orgs/${org.slug}/settings/billing/plan`}>
                Upgrade Plan
              </Link>
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  );
}
