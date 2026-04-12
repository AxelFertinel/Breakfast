import {
  Layout,
  LayoutContent,
  LayoutHeader,
  LayoutTitle,
} from "@/features/page/layout";
import { getRequiredUser } from "@/lib/auth/auth-user";
import { getRequiredCurrentOrgCache } from "@/lib/react/cache";
import { getPlanLimits } from "@/lib/auth/stripe/auth-plans";
import { prisma } from "@/lib/prisma";
import { FamilyList } from "./_components/family-list";

export default async function FamilleContent() {
  const user = await getRequiredUser();
  const org = await getRequiredCurrentOrgCache();
  const planLimits = getPlanLimits(org.subscription?.plan ?? "free");

  const [physicalProfile, familyMembers] = await Promise.all([
    prisma.physicalProfile.findUnique({ where: { userId: user.id } }),
    prisma.familyMember.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "asc" },
    }),
  ]);

  return (
    <Layout size="lg">
      <LayoutHeader>
        <LayoutTitle>Famille</LayoutTitle>
      </LayoutHeader>
      <LayoutContent>
        <FamilyList
          physicalProfile={physicalProfile}
          familyMembers={familyMembers}
          adultLimit={planLimits.adultLimit}
          childrenLimit={planLimits.childrenLimit}
        />
      </LayoutContent>
    </Layout>
  );
}
