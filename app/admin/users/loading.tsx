import { Skeleton } from "@/components/ui/skeleton";
import {
  Layout,
  LayoutContent,
  LayoutHeader,
  LayoutTitle,
} from "@/features/page/layout";

export default function RouteLoading() {
  return (
    <Layout size="lg">
      <LayoutHeader>
        <LayoutTitle>User Management</LayoutTitle>
      </LayoutHeader>
      <LayoutContent>
        <div className="flex flex-col gap-4">
          <Skeleton className="h-10 w-64" />
          <div className="flex flex-col gap-2">
            {Array.from({ length: 10 }).map((_, i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </div>
        </div>
      </LayoutContent>
    </Layout>
  );
}
