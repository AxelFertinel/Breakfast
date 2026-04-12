"use cache";

import { Typography } from "@/components/nowts/typography";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Item,
  ItemContent,
  ItemDescription,
  ItemGroup,
  ItemTitle,
} from "@/components/ui/item";
import { dayjs } from "@/lib/dayjs";
import type { CurrentOrgPayload } from "@/lib/organizations/get-org";
import { stripe } from "@/lib/stripe";

function formatCurrency(amount: number, currency?: string | null) {
  const normalizedCurrency = currency ?? "USD";

  return new Intl.NumberFormat(undefined, {
    style: "currency",
    currency: normalizedCurrency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount / 100);
}

type UpcomingInvoiceCardProps = {
  org: CurrentOrgPayload;
};

export async function UpcomingInvoiceCard({ org }: UpcomingInvoiceCardProps) {
  if (!org.subscription?.stripeCustomerId) {
    return null;
  }

  const upcomingInvoice = await stripe.invoices
    .createPreview({
      customer: org.subscription.stripeCustomerId,
    })
    .catch(() => null);

  if (!upcomingInvoice) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            Next Payment
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Typography variant="muted">No upcoming invoice</Typography>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          Next Payment
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ItemGroup className="flex flex-col gap-2">
          <Item className="p-0">
            <ItemContent>
              <ItemTitle>Amount Due</ItemTitle>
              <ItemDescription>
                <Typography variant="h3" className="font-bold">
                  {formatCurrency(
                    upcomingInvoice.amount_due,
                    upcomingInvoice.currency,
                  )}
                </Typography>
              </ItemDescription>
            </ItemContent>
          </Item>
          <Item className="p-0">
            <ItemContent>
              <ItemTitle>Payment Due Date</ItemTitle>
              <ItemDescription>
                {upcomingInvoice.period_end
                  ? dayjs
                      .unix(upcomingInvoice.period_end)
                      .format("MMMM D, YYYY")
                  : "Pending"}
              </ItemDescription>
            </ItemContent>
          </Item>
        </ItemGroup>
      </CardContent>
    </Card>
  );
}
