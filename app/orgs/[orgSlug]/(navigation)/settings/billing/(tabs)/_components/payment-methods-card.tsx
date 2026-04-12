"use cache";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Item,
  ItemContent,
  ItemDescription,
  ItemGroup,
  ItemTitle,
} from "@/components/ui/item";
import type { CurrentOrgPayload } from "@/lib/organizations/get-org";
import { stripe } from "@/lib/stripe";

type PaymentMethodsCardProps = {
  org: CurrentOrgPayload;
};

export async function PaymentMethodsCard({ org }: PaymentMethodsCardProps) {
  if (!org.subscription?.stripeCustomerId) {
    return null;
  }

  const paymentMethods = await stripe.paymentMethods
    .list({
      customer: org.subscription.stripeCustomerId,
      type: "card",
    })
    .catch(() => null);

  if (!paymentMethods || paymentMethods.data.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Payment Methods</CardTitle>
      </CardHeader>
      <CardContent>
        <ItemGroup className="flex flex-col gap-2">
          {paymentMethods.data.map((method) => (
            <Item key={method.id} className="p-0">
              <ItemContent>
                <ItemTitle>
                  {method.card?.brand.toUpperCase()} •••• {method.card?.last4}
                </ItemTitle>
                <ItemDescription>
                  Expires {method.card?.exp_month}/{method.card?.exp_year}
                </ItemDescription>
              </ItemContent>
            </Item>
          ))}
        </ItemGroup>
      </CardContent>
    </Card>
  );
}
