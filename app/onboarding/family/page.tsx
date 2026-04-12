import { getRequiredUser } from "@/lib/auth/auth-user";
import { getPlanLimits } from "@/lib/auth/stripe/auth-plans";
import { getOrgActiveSubscription } from "@/lib/organizations/get-org-subscription";
import { prisma } from "@/lib/prisma";
import { FamilyForm } from "./_components/family-form";

export default async function OnboardingFamilyPage() {
  const user = await getRequiredUser();

  const member = await prisma.member.findFirst({
    where: { userId: user.id },
    select: { organizationId: true },
  });

  let childrenLimit = 1;
  if (member) {
    const subscription = await getOrgActiveSubscription(member.organizationId);
    const limits = getPlanLimits(subscription?.plan ?? "free", null);
    childrenLimit = limits.childrenLimit;
  }

  return <FamilyForm childrenLimit={childrenLimit} />;
}
