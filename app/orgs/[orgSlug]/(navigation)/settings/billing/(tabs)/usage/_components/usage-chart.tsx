"use client";

import { Typography } from "@/components/nowts/typography";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { ChartConfig } from "@/components/ui/chart";
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { Bar, BarChart, CartesianGrid, XAxis } from "recharts";

/**
 * UsageChart Component
 *
 * This component displays usage metrics over a billing period using a simple bar chart.
 *
 * ## Querying Live Usage Data
 *
 * To query real usage data for your application's value metric:
 *
 * 1. Replace the fake data with a query to your database or analytics service
 * 2. Fetch the usage data for your specific value metric (e.g., API calls, emails sent, storage used)
 * 3. Group the data by day within the billing period
 * 4. Format the data as: `{ date: string, usage: number }[]`
 *
 * Example with Prisma:
 * ```ts
 * const usageByDay = await Promise.all(
 *   billingPeriod30Days.map(async ({ date, startOfDay, endOfDay }) => {
 *     const count = await prisma.yourMetric.count({
 *       where: {
 *         organizationId: org.id,
 *         createdAt: { gte: startOfDay, lte: endOfDay },
 *       },
 *     });
 *     return { date, usage: count };
 *   }),
 * );
 * ```
 */

type UsageChartProps = {
  data: {
    date: string;
    usage: number;
  }[];
  totalUsage: number;
  limit: number;
  billingPeriodStart: Date;
  billingPeriodEnd: Date;
};

const chartConfig = {
  usage: {
    label: "Usage",
    color: "var(--chart-1)",
  },
} satisfies ChartConfig;

export function UsageChart({
  data,
  totalUsage,
  limit,
  billingPeriodStart,
  billingPeriodEnd,
}: UsageChartProps) {
  const formattedPeriod = `${billingPeriodStart.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  })} - ${billingPeriodEnd.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  })}`;

  const usagePercentage = Math.min(100, (totalUsage / limit) * 100);

  return (
    <Card className="py-0">
      <CardHeader className="flex flex-col items-stretch border-b !p-0 sm:flex-row">
        <div className="flex flex-1 flex-col justify-center gap-1 px-6 pt-4 pb-3 sm:!py-6">
          <CardTitle>Usage Metrics</CardTitle>
          <CardDescription>Billing period: {formattedPeriod}</CardDescription>
        </div>
        <div className="flex">
          <div className="data-[active=true]:bg-muted/50 relative z-30 flex flex-1 flex-col justify-center gap-1 border-t px-6 py-4 text-left sm:border-t-0 sm:border-l sm:px-8 sm:py-6">
            <Typography variant="muted" className="text-xs">
              Total Usage
            </Typography>
            <Typography variant="h2" className="font-bold">
              {totalUsage.toLocaleString()}
            </Typography>
            <Typography variant="small" className="text-muted-foreground pt-1">
              {usagePercentage.toFixed(1)}% of {limit.toLocaleString()} limit
            </Typography>
          </div>
        </div>
      </CardHeader>
      <CardContent className="px-2 sm:p-6">
        <ChartContainer
          config={chartConfig}
          className="aspect-auto h-[250px] w-full"
        >
          <BarChart
            accessibilityLayer
            data={data}
            margin={{
              left: 12,
              right: 12,
            }}
          >
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              minTickGap={32}
              tickFormatter={(value) => {
                const date = new Date(value);
                return date.toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                });
              }}
            />
            <ChartTooltip
              content={(props) => <ChartTooltipContent {...props} />}
            />
            <ChartLegend content={<ChartLegendContent />} />
            <Bar dataKey="usage" fill="var(--color-usage)" />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
