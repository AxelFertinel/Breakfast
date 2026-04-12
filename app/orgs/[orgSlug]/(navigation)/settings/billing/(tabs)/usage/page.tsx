import { dayjs } from "@/lib/dayjs";
import { getPlanLimits } from "@/lib/auth/stripe/auth-plans";
import { getRequiredCurrentOrgCache } from "@/lib/react/cache";
import { Suspense } from "react";
import { UsageChart } from "./_components/usage-chart";

export default function Page() {
  return (
    <Suspense fallback={null}>
      <BillingUsagePage />
    </Suspense>
  );
}

async function BillingUsagePage() {
  const org = await getRequiredCurrentOrgCache({
    permissions: {
      subscription: ["manage"],
    },
  });

  const billingPeriodStart = org.subscription?.periodStart
    ? dayjs(org.subscription.periodStart)
    : dayjs().subtract(30, "day");

  const billingPeriodEnd = billingPeriodStart.add(30, "day");

  const planLimits = getPlanLimits(org.subscription?.plan ?? "free");

  // TODO: Replace with actual database queries
  // const usageByDay = await Promise.all(
  //   billingPeriod30Days.map(async ({ date, startOfDay, endOfDay }) => {
  //     const count = await prisma.yourMetric.count({
  //       where: {
  //         organizationId: org.id,
  //         createdAt: { gte: startOfDay, lte: endOfDay },
  //       },
  //     });
  //     return { date, usage: count };
  //   })
  // );

  // PLACEHOLDER DATA - Replace with real database queries
  const usageData = Array.from({ length: 30 }, (_, i) => {
    const date = billingPeriodStart.add(i, "day");
    // Use deterministic placeholder value based on day index
    const usage = (i * 7 + 3) % 10;
    return {
      date: date.format("YYYY-MM-DD"),
      usage,
    };
  });

  const totalUsage = usageData.reduce((sum, d) => sum + d.usage, 0);

  return (
    <UsageChart
      data={usageData}
      totalUsage={totalUsage}
      limit={planLimits.projects}
      billingPeriodStart={billingPeriodStart.toDate()}
      billingPeriodEnd={billingPeriodEnd.toDate()}
    />
  );
}
