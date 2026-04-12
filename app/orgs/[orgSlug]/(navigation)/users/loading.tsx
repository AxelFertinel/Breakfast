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
        <LayoutTitle>Videos</LayoutTitle>
      </LayoutHeader>
      <LayoutContent className="flex flex-col gap-4 lg:gap-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:gap-6">
          <Skeleton className="h-80 flex-1" />
          <Skeleton className="h-80 flex-1" />
        </div>
        <Skeleton className="h-80" />
      </LayoutContent>
    </Layout>
  );
}
