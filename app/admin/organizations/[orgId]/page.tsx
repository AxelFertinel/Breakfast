import { Button } from "@/components/ui/button";
import {
  Layout,
  LayoutActions,
  LayoutContent,
  LayoutHeader,
} from "@/features/page/layout";
import { OrganizationTitleForm } from "./_components/organization-title-form";
import { getRequiredAdmin } from "@/lib/auth/auth-user";
import { prisma } from "@/lib/prisma";
import { stripe } from "@/lib/stripe";
import { ExternalLink } from "lucide-react";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { OrganizationMembers } from "./_components/organization-members";
import { OrganizationOverrideLimits } from "./_components/organization-override-limits";
import { OrganizationPayments } from "./_components/organization-payments";
import { OrganizationSubscription } from "./_components/organization-subscription";

export default function Page(props: PageProps<"/admin/organizations/[orgId]">) {
  return (
    <Suspense fallback={null}>
      <OrganizationDetailPage {...props} />
    </Suspense>
  );
}

async function OrganizationDetailPage(
  props: PageProps<"/admin/organizations/[orgId]">,
) {
  const params = await props.params;
  await getRequiredAdmin();

  const organization = await prisma.organization.findUnique({
    where: {
      id: params.orgId,
    },
    include: {
      members: {
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              image: true,
            },
          },
        },
      },
      subscription: true,
    },
  });

  if (!organization) {
    notFound();
  }

  const stripeCustomerId =
    organization.stripeCustomerId ??
    organization.subscription?.stripeCustomerId ??
    null;

  let paymentMethod: {
    brand: string;
    last4: string;
    expMonth: number;
    expYear: number;
  } | null = null;

  if (stripeCustomerId) {
    const methods = await stripe.paymentMethods
      .list({ customer: stripeCustomerId, type: "card", limit: 1 })
      .catch(() => null);

    if (methods?.data[0]?.card) {
      const card = methods.data[0].card;
      paymentMethod = {
        brand: card.brand,
        last4: card.last4,
        expMonth: card.exp_month,
        expYear: card.exp_year,
      };
    }
  }

  return (
    <Layout size="lg">
      <LayoutHeader>
        <OrganizationTitleForm
          organizationId={organization.id}
          name={organization.name}
          logo={organization.logo}
        />
      </LayoutHeader>
      <LayoutActions>
        {organization.stripeCustomerId && (
          <Button variant="outline" asChild>
            <a
              href={`https://dashboard.stripe.com/customers/${organization.stripeCustomerId}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2"
            >
              <ExternalLink className="h-4 w-4" />
              View Stripe Customer
            </a>
          </Button>
        )}
      </LayoutActions>

      <LayoutContent>
        <div className="space-y-6">
          <OrganizationMembers members={organization.members} />
          <OrganizationPayments
            organizationId={organization.id}
            subscription={organization.subscription}
            paymentMethod={paymentMethod}
            stripeCustomerId={stripeCustomerId}
          />
          <OrganizationSubscription
            organization={organization}
            subscription={organization.subscription}
          />
          <OrganizationOverrideLimits
            subscription={organization.subscription}
            organizationId={organization.id}
          />
        </div>
      </LayoutContent>
    </Layout>
  );
}
