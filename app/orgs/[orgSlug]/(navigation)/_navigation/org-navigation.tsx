import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { getDismissedChangelogs } from "@/features/changelog/changelog.action";
import { getChangelogs } from "@/features/changelog/changelog-manager";
import { Layout } from "@/features/page/layout";
import { getRequiredCurrentOrgCache } from "@/lib/react/cache";
import { getUsersOrgs } from "@/query/org/get-users-orgs.query";
import type { PropsWithChildren } from "react";
import { FeedbackButton } from "./feedback-button";
import OrgBreadcrumb from "./org-breadcrumb";
import { OrgSidebar } from "./org-sidebar";

export async function OrgNavigation({ children }: PropsWithChildren) {
  const org = await getRequiredCurrentOrgCache();

  const [userOrganizations, allChangelogs, dismissedSlugs] = await Promise.all([
    getUsersOrgs(),
    getChangelogs(),
    getDismissedChangelogs(),
  ]);

  const changelogs = allChangelogs.filter(
    (c) => !dismissedSlugs.includes(c.slug),
  );

  return (
    <SidebarProvider>
      <OrgSidebar
        slug={org.slug}
        roles={org.memberRoles}
        userOrgs={userOrganizations}
        changelogs={changelogs.slice(0, 3)}
      />
      <SidebarInset className="border-border border">
        <header className="flex h-16 shrink-0 items-center gap-2">
          <Layout size="lg" className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <SidebarTrigger
                variant="outline"
                className="size-8 cursor-pointer"
              />
              <OrgBreadcrumb />
            </div>
            <FeedbackButton />
          </Layout>
        </header>
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  );
}
