import { Typography } from "@/components/nowts/typography";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Item, ItemContent, ItemGroup, ItemTitle } from "@/components/ui/item";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { dayjs } from "@/lib/dayjs";
import { logger } from "@/lib/logger";
import { getRequiredCurrentOrgCache } from "@/lib/react/cache";
import { stripe } from "@/lib/stripe";
import { cn } from "@/lib/utils";
import { Download } from "lucide-react";
import { redirect } from "next/navigation";

function formatCurrency(amount: number, currency?: string | null) {
  const normalizedCurrency = currency ?? "USD";

  return new Intl.NumberFormat(undefined, {
    style: "currency",
    currency: normalizedCurrency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount / 100);
}

function getStatusColor(status: string) {
  switch (status.toLowerCase()) {
    case "paid":
      return "bg-emerald-500";
    case "open":
      return "bg-blue-500";
    case "draft":
      return "bg-gray-500";
    case "uncollectible":
      return "bg-red-500";
    case "void":
      return "bg-gray-400";
    default:
      return "bg-gray-500";
  }
}

function formatLineItemDescription(
  description: string | null | undefined,
  isUsageBased = false,
): string {
  if (!description) return "Invoice item";

  let cleaned = description
    // Remove tier pricing information (e.g., "Tier 1 at $0.00 / month")
    .replace(/\s*\(Tier \d+ at \$[\d,.]+ \/ \w+\)/gi, "")
    .trim();

  // For usage-based items, remove quantity prefix (e.g., "15229 × ")
  if (isUsageBased) {
    cleaned = cleaned.replace(/^[\d,]+\s*×\s*/i, "").trim();
  }

  return cleaned;
}

function isBaseSubscription(line: {
  description?: string | null;
  quantity?: number | null;
}): boolean {
  // Base subscription has quantity of 1 and includes "at $X.XX / month" in description
  return line.quantity === 1 && line.description?.includes(" / month") === true;
}

function isUsageCharge(line: {
  description?: string | null;
  quantity?: number | null;
}): boolean {
  // Usage charges typically have higher quantities and don't include pricing in description
  return (line.quantity ?? 0) > 1 && line.description?.includes("×") === true;
}

type StripeTier = {
  up_to: number | "inf" | null;
  unit_amount: number | null;
  flat_amount: number | null;
};

function calculateUsageBreakdown(
  totalQuantity: number,
  tiers: StripeTier[] | undefined | null,
  currency: string,
  lineAmount: number,
): { description: string; amount: string }[] {
  // Handle zero usage
  if (totalQuantity === 0) {
    return [
      {
        description: "0 emails sent this period",
        amount: "Free",
      },
    ];
  }

  // Handle missing tier data
  if (!tiers || tiers.length === 0) {
    if (lineAmount === 0) {
      return [
        {
          description: `${totalQuantity.toLocaleString()} emails sent`,
          amount: "Free",
        },
      ];
    }
    return [
      {
        description: `${totalQuantity.toLocaleString()} emails sent`,
        amount: formatCurrency(lineAmount, currency),
      },
    ];
  }

  const breakdown: { description: string; amount: string }[] = [];
  let remainingQuantity = totalQuantity;

  for (let i = 0; i < tiers.length; i++) {
    const tier = tiers[i];
    const tierLimit =
      tier.up_to === "inf" || tier.up_to === null
        ? Infinity
        : Number(tier.up_to);
    const previousTier = i > 0 ? tiers[i - 1] : null;
    const previousLimit =
      previousTier &&
      (previousTier.up_to === "inf" || previousTier.up_to === null)
        ? 0
        : previousTier
          ? Number(previousTier.up_to)
          : 0;
    const tierCapacity =
      tierLimit === Infinity ? Infinity : tierLimit - previousLimit;
    const quantityInTier = Math.min(remainingQuantity, tierCapacity);

    if (quantityInTier > 0) {
      const unitAmount = tier.unit_amount ?? 0;
      const isFree = unitAmount === 0;
      const tierAmount = quantityInTier * unitAmount + (tier.flat_amount ?? 0);

      breakdown.push({
        description: `${quantityInTier.toLocaleString()} ${isFree ? "included" : "extra"} emails`,
        amount: isFree ? "Free" : formatCurrency(tierAmount, currency),
      });

      remainingQuantity -= quantityInTier;
    }

    if (remainingQuantity <= 0) break;
  }

  return breakdown;
}

import { Suspense } from "react";

export default function Page() {
  return (
    <Suspense fallback={null}>
      <BillingPaymentPage />
    </Suspense>
  );
}

async function BillingPaymentPage() {
  const org = await getRequiredCurrentOrgCache({
    permissions: {
      subscription: ["manage"],
    },
  });

  if (!org.subscription?.stripeCustomerId) {
    redirect(`/orgs/${org.slug}/settings/billing`);
  }

  const [invoices, upcomingInvoice] = await Promise.all([
    stripe.invoices.list({
      customer: org.subscription.stripeCustomerId,
      limit: 12,
    }),
    stripe.invoices
      .createPreview({
        customer: org.subscription.stripeCustomerId,
      })
      .catch(() => null),
  ]);

  return (
    <div className="flex flex-col gap-6">
      {upcomingInvoice && (
        <Card>
          <CardHeader>
            <CardTitle>Upcoming Invoice</CardTitle>
            <CardDescription>
              Next billing date:{" "}
              {upcomingInvoice.period_end
                ? dayjs.unix(upcomingInvoice.period_end).format("MMMM D, YYYY")
                : "Pending"}
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-6">
            {upcomingInvoice.period_start || upcomingInvoice.period_end ? (
              <div className="flex flex-col gap-2">
                <Typography variant="small" className="text-muted-foreground">
                  Current period
                </Typography>
                <Typography variant="muted">
                  {upcomingInvoice.period_start
                    ? dayjs
                        .unix(upcomingInvoice.period_start)
                        .format("MMM D, YYYY")
                    : "TBD"}
                  {" – "}
                  {upcomingInvoice.period_end
                    ? dayjs
                        .unix(upcomingInvoice.period_end)
                        .format("MMM D, YYYY")
                    : "TBD"}
                </Typography>
              </div>
            ) : null}

            <ItemGroup className="gap-2">
              {upcomingInvoice.lines.data.map((line) => {
                const isBase = isBaseSubscription(line);
                const isUsage = isUsageCharge(line);

                if (!isBase && !isUsage) {
                  const unitAmount = line.pricing?.unit_amount_decimal
                    ? Math.round(parseFloat(line.pricing.unit_amount_decimal))
                    : null;
                  const isProration =
                    line.parent?.type === "subscription_item_details" &&
                    line.parent.subscription_item_details?.proration === true;

                  return (
                    <Item
                      key={line.id}
                      className="items-start gap-4"
                      variant="outline"
                    >
                      <ItemContent className="gap-2">
                        <ItemTitle className="text-sm font-medium">
                          {formatLineItemDescription(
                            line.description ?? "Invoice item",
                          )}
                        </ItemTitle>
                        <div className="text-muted-foreground flex flex-col gap-1 text-sm">
                          {line.quantity && unitAmount && unitAmount > 0 ? (
                            <span>
                              {line.quantity.toLocaleString()} ×{" "}
                              {formatCurrency(unitAmount, line.currency)}
                            </span>
                          ) : null}
                          {isProration ? <span>Prorated charge</span> : null}
                          {line.period.start && line.period.end ? (
                            <span>
                              {dayjs.unix(line.period.start).format("MMM D")} –{" "}
                              {dayjs
                                .unix(line.period.end)
                                .format("MMM D, YYYY")}
                            </span>
                          ) : null}
                        </div>
                      </ItemContent>
                      <Typography variant="large">
                        {formatCurrency(line.amount, line.currency)}
                      </Typography>
                    </Item>
                  );
                }

                if (isBase) {
                  return (
                    <Item
                      key={line.id}
                      className="items-start gap-4"
                      variant="outline"
                    >
                      <ItemContent className="gap-2">
                        <ItemTitle className="text-sm font-medium">
                          {formatLineItemDescription(
                            line.description ?? "Invoice item",
                          )}
                          <Badge variant="secondary" className="text-xs">
                            Base subscription
                          </Badge>
                        </ItemTitle>
                        <div className="text-muted-foreground flex flex-col gap-1 text-sm">
                          {line.period.start && line.period.end ? (
                            <span>
                              {dayjs.unix(line.period.start).format("MMM D")} –{" "}
                              {dayjs
                                .unix(line.period.end)
                                .format("MMM D, YYYY")}
                            </span>
                          ) : null}
                        </div>
                      </ItemContent>
                      <Typography variant="large">
                        {formatCurrency(line.amount, line.currency)}
                      </Typography>
                    </Item>
                  );
                }

                if (isUsage) {
                  logger.debug("Usage line item:", {
                    id: line.id,
                    quantity: line.quantity,
                    amount: line.amount,
                    pricing: line.pricing,
                  });

                  const usageBreakdown = calculateUsageBreakdown(
                    line.quantity ?? 0,
                    undefined, // Tier information not available in new API without expansion
                    line.currency,
                    line.amount,
                  );

                  return (
                    <Item
                      key={line.id}
                      className="items-start gap-4"
                      variant="outline"
                    >
                      <ItemContent className="gap-2">
                        <ItemTitle className="text-sm font-medium">
                          {formatLineItemDescription(
                            line.description ?? "Invoice item",
                            true,
                          )}
                          <Badge variant="outline" className="text-xs">
                            Usage-based
                          </Badge>
                        </ItemTitle>
                        <div className="text-muted-foreground flex flex-col gap-1.5 text-sm">
                          {usageBreakdown.map((tier, idx) => (
                            <span key={idx}>
                              {tier.description}{" "}
                              <span className="font-medium">
                                ({tier.amount})
                              </span>
                            </span>
                          ))}
                          {line.period.start && line.period.end ? (
                            <span className="mt-1">
                              {dayjs.unix(line.period.start).format("MMM D")} –{" "}
                              {dayjs
                                .unix(line.period.end)
                                .format("MMM D, YYYY")}
                            </span>
                          ) : null}
                        </div>
                      </ItemContent>
                      <Typography variant="large">
                        {formatCurrency(line.amount, line.currency)}
                      </Typography>
                    </Item>
                  );
                }

                return null;
              })}
            </ItemGroup>
          </CardContent>
          <CardFooter className="border-t pt-6">
            <div className="flex w-full flex-col gap-3">
              {upcomingInvoice.subtotal && upcomingInvoice.subtotal > 0 ? (
                <div className="flex items-center justify-between text-sm">
                  <Typography variant="muted">Subtotal</Typography>
                  <Typography variant="large">
                    {formatCurrency(
                      upcomingInvoice.subtotal,
                      upcomingInvoice.currency,
                    )}
                  </Typography>
                </div>
              ) : null}
              <div className="flex items-center justify-between">
                <Typography variant="large" className="font-semibold">
                  Total amount due
                </Typography>
                <Typography variant="h3">
                  {formatCurrency(
                    upcomingInvoice.amount_due,
                    upcomingInvoice.currency,
                  )}
                </Typography>
              </div>
            </div>
          </CardFooter>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Invoice History</CardTitle>
          <CardDescription>
            Your past invoices and payment history
          </CardDescription>
        </CardHeader>
        <CardContent>
          {invoices.data.length === 0 ? (
            <div className="text-muted-foreground flex min-h-[200px] items-center justify-center text-center">
              <Typography variant="muted">No invoices found</Typography>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Invoice #</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {invoices.data.map((invoice) => (
                  <TableRow key={invoice.id}>
                    <TableCell className="font-medium">
                      {invoice.number ?? `#${invoice.id.slice(-8)}`}
                    </TableCell>
                    <TableCell>
                      {dayjs.unix(invoice.created).format("MMM D, YYYY")}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="gap-1.5">
                        <span
                          className={cn(
                            "size-1.5 rounded-full",
                            getStatusColor(invoice.status ?? "unknown"),
                          )}
                          aria-hidden="true"
                        />
                        {invoice.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-semibold">
                      {formatCurrency(invoice.amount_paid, invoice.currency)}
                    </TableCell>
                    <TableCell>
                      {invoice.invoice_pdf && (
                        <Button
                          variant="ghost"
                          size="sm"
                          asChild
                          className="gap-2"
                        >
                          <a
                            href={invoice.invoice_pdf}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <Download className="size-4" />
                            PDF
                          </a>
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
