import { prisma } from "@/lib/prisma";
import { getRequiredCurrentOrgCache } from "@/lib/react/cache";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { OrgDetailsForm } from "./(details)/org-details-form";

export default function Page() {
  return (
    <Suspense fallback={null}>
      <RoutePage />
    </Suspense>
  );
}

async function RoutePage() {
  const { id: orgId } = await getRequiredCurrentOrgCache({
    permissions: {
      organization: ["update"],
    },
  });

  const org = await prisma.organization.findUnique({
    where: {
      id: orgId,
    },
    select: {
      logo: true,
      name: true,
      email: true,
    },
  });

  if (!org) {
    notFound();
  }

  return <OrgDetailsForm defaultValues={org} />;
}
