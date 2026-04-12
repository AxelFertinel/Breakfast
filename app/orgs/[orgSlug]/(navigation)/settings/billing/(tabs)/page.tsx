import { getRequiredCurrentOrgCache } from "@/lib/react/cache";
import { Suspense } from "react";
import { BillingInfoCard } from "./_components/billing-info-card";
import { CardSkeleton } from "./_components/card-skeleton";
import { PaymentMethodsCard } from "./_components/payment-methods-card";
import { PlanUsageCard } from "./_components/plan-usage-card";
import { UpcomingInvoiceCard } from "./_components/upcoming-invoice-card";

export default function Page() {
  return (
    <Suspense fallback={null}>
      <BillingOverviewPage />
    </Suspense>
  );
}

async function BillingOverviewPage() {
  const org = await getRequiredCurrentOrgCache({
    permissions: {
      subscription: ["manage"],
    },
  });

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Suspense fallback={<CardSkeleton />}>
        <PlanUsageCard org={org} />
      </Suspense>

      <div className="flex flex-col gap-6">
        <Suspense fallback={<CardSkeleton />}>
          <UpcomingInvoiceCard org={org} />
        </Suspense>

        <Suspense fallback={<CardSkeleton />}>
          <BillingInfoCard org={org} />
        </Suspense>

        <Suspense fallback={<CardSkeleton />}>
          <PaymentMethodsCard org={org} />
        </Suspense>
      </div>
    </div>
  );
}
