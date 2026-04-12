"use client";

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Link from "next/link";
import { useParams, usePathname } from "next/navigation";

type BillingTabsNavProps = {
  hasSubscription: boolean;
};

export function BillingTabsNav({ hasSubscription }: BillingTabsNavProps) {
  const params = useParams();
  const pathname = usePathname();
  const orgSlug = params.orgSlug as string;

  const baseUrl = `/orgs/${orgSlug}/settings/billing`;

  const tabs = [
    { value: "overview", label: "Overview", href: baseUrl },
    { value: "usage", label: "Usage", href: `${baseUrl}/usage` },
    ...(hasSubscription
      ? [{ value: "payment", label: "Payment", href: `${baseUrl}/payment` }]
      : []),
    { value: "plan", label: "Plan", href: `${baseUrl}/plan` },
  ];

  const getCurrentTab = () => {
    if (pathname === baseUrl) return "overview";
    if (pathname.endsWith("/usage")) return "usage";
    if (pathname.endsWith("/payment")) return "payment";
    if (pathname.endsWith("/plan")) return "plan";
    return "overview";
  };

  const activeTab = getCurrentTab();

  return (
    <Tabs value={activeTab}>
      <TabsList>
        {tabs.map((tab) => (
          <TabsTrigger key={tab.value} value={tab.value} asChild>
            <Link href={tab.href}>{tab.label}</Link>
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  );
}
