import {
  Layout,
  LayoutContent,
  LayoutHeader,
  LayoutTitle,
} from "@/features/page/layout";
import { getRequiredAdmin } from "@/lib/auth/auth-user";
import { getUsersWithStats } from "./_actions/admin-users";
import {
  createSearchParamsCache,
  parseAsInteger,
  parseAsString,
} from "nuqs/server";
import { UsersList } from "./_components/users-list";

const searchParamsCache = createSearchParamsCache({
  q: parseAsString.withDefault(""),
  page: parseAsInteger.withDefault(1),
});

export default async function Page(props: PageProps<"/admin/users">) {
  await getRequiredAdmin();

  const { q, page } = await searchParamsCache.parse(props.searchParams);

  const pageSize = 10;
  const { users, total } = await getUsersWithStats({
    page,
    pageSize,
    search: q || undefined,
  });

  return (
    <Layout size="lg">
      <LayoutHeader>
        <LayoutTitle>User Management</LayoutTitle>
      </LayoutHeader>

      <LayoutContent>
        <UsersList
          users={users}
          total={total}
          limit={pageSize}
          currentPage={page}
        />
      </LayoutContent>
    </Layout>
  );
}
