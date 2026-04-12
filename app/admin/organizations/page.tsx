import {
  Layout,
  LayoutContent,
  LayoutHeader,
  LayoutTitle,
} from "@/features/page/layout";
import { getRequiredAdmin } from "@/lib/auth/auth-user";
import {
  createSearchParamsCache,
  parseAsInteger,
  parseAsString,
} from "nuqs/server";
import { getOrganizationsWithStats } from "./_actions/admin-organizations";
import { OrganizationsListClient } from "./_components/organizations-list-client";

const searchParamsCache = createSearchParamsCache({
  q: parseAsString.withDefault(""),
  page: parseAsInteger.withDefault(1),
});

export default async function Page(props: PageProps<"/admin/organizations">) {
  await getRequiredAdmin();

  const { q, page } = await searchParamsCache.parse(props.searchParams);

  const pageSize = 10;
  const { organizations, total } = await getOrganizationsWithStats({
    page,
    pageSize,
    search: q || undefined,
  });

  return (
    <Layout size="lg">
      <LayoutHeader>
        <LayoutTitle>Organization Management</LayoutTitle>
      </LayoutHeader>

      <LayoutContent>
        <OrganizationsListClient
          organizations={organizations}
          total={total}
          limit={pageSize}
          currentPage={page}
        />
      </LayoutContent>
    </Layout>
  );
}
