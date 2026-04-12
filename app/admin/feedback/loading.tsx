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
        <LayoutTitle>Feedback Management</LayoutTitle>
        <Skeleton className="h-4 w-64" />
      </LayoutHeader>
      <LayoutContent>
        <div className="space-y-4">
          <Skeleton className="h-10 w-64" />
          <div className="space-y-2">
            {Array.from({ length: 10 }).map((_, i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </div>
        </div>
      </LayoutContent>
    </Layout>
  );
}
