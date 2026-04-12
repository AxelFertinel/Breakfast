import { Typography } from "@/components/nowts/typography";
import { getRequiredCurrentOrgCache } from "@/lib/react/cache";
import { BillingActions } from "../_components/billing-actions";
import { BillingTabsNav } from "../_components/billing-tabs-nav";

export default async function BillingTabsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const org = await getRequiredCurrentOrgCache({
    permissions: {
      subscription: ["manage"],
    },
  });

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <Typography variant="h2">Billing & Subscription</Typography>
        </div>
        {org.subscription && (
          <BillingActions subscription={org.subscription} orgSlug={org.slug} />
        )}
      </div>

      <BillingTabsNav hasSubscription={!!org.subscription?.stripeCustomerId} />

      {children}
    </div>
  );
}
