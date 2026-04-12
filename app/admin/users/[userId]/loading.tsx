import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
        <LayoutTitle>User Details</LayoutTitle>
        <Skeleton className="h-4 w-64" />
      </LayoutHeader>
      <LayoutContent className="flex flex-col gap-4">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-4">
              <Skeleton className="size-16 rounded-full" />
              <div className="flex flex-col gap-2">
                <Skeleton className="h-6 w-48" />
                <Skeleton className="h-4 w-64" />
              </div>
            </div>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Organizations</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-2">
            {Array.from({ length: 2 }).map((_, i) => (
              <div key={i} className="flex items-center gap-4">
                <Skeleton className="size-10 rounded-full" />
                <div className="flex flex-1 flex-col gap-1">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-48" />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </LayoutContent>
    </Layout>
  );
}
