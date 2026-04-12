import {
  Layout,
  LayoutContent,
  LayoutHeader,
  LayoutTitle,
} from "@/features/page/layout";
import { getRequiredUser } from "@/lib/auth/auth-user";
import { prisma } from "@/lib/prisma";
import { Suspense } from "react";
import { StockClient } from "./_components/stock-client";

export default function StockPage() {
  return (
    <Suspense fallback={null}>
      <StockPageContent />
    </Suspense>
  );
}

async function StockPageContent() {
  const user = await getRequiredUser();

  const items = await prisma.pantryItem.findMany({
    where: { userId: user.id },
    orderBy: [{ category: "asc" }, { name: "asc" }],
  });

  return (
    <Layout size="lg">
      <LayoutHeader>
        <LayoutTitle>Mon stock</LayoutTitle>
      </LayoutHeader>
      <LayoutContent>
        <StockClient initialItems={items} />
      </LayoutContent>
    </Layout>
  );
}
