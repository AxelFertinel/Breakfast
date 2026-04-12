import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function RouteLoading() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Team Members</CardTitle>
        <Skeleton className="h-4 w-48" />
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="flex items-center gap-4">
            <Skeleton className="size-10 rounded-full" />
            <div className="flex flex-1 flex-col gap-1">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-3 w-48" />
            </div>
            <Skeleton className="h-8 w-24" />
          </div>
        ))}
        <Skeleton className="mt-4 h-10 w-32" />
      </CardContent>
    </Card>
  );
}
