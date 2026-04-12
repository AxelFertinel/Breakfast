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
import { EditBillingButton } from "./edit-billing-button";

type BillingInfoCardProps = {
  org: CurrentOrgPayload;
};

export async function BillingInfoCard({ org }: BillingInfoCardProps) {
  if (!org.subscription?.stripeCustomerId) {
    return null;
  }

  const customer = await stripe.customers.retrieve(
    org.subscription.stripeCustomerId,
  );

  if (customer.deleted) {
    return null;
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Billing Information</CardTitle>
        <EditBillingButton />
      </CardHeader>
      <CardContent>
        <ItemGroup className="flex flex-col gap-2">
          {customer.email && (
            <Item className="p-0">
              <ItemContent>
                <ItemTitle>Email</ItemTitle>
                <ItemDescription>{customer.email}</ItemDescription>
              </ItemContent>
            </Item>
          )}
          {customer.name && (
            <Item className="p-0">
              <ItemContent>
                <ItemTitle>Name</ItemTitle>
                <ItemDescription>{customer.name}</ItemDescription>
              </ItemContent>
            </Item>
          )}
          {customer.address && (
            <Item className="p-0">
              <ItemContent>
                <ItemTitle>Address</ItemTitle>
                <ItemDescription>
                  {[
                    customer.address.line1,
                    customer.address.line2,
                    customer.address.city,
                    customer.address.state,
                    customer.address.postal_code,
                    customer.address.country,
                  ]
                    .filter(Boolean)
                    .join(", ")}
                </ItemDescription>
              </ItemContent>
            </Item>
          )}
        </ItemGroup>
      </CardContent>
    </Card>
  );
}
