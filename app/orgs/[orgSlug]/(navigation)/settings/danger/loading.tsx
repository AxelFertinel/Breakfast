import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function RouteLoading() {
  return (
    <div className="flex flex-col gap-4 lg:gap-8">
      <Card>
        <CardHeader>
          <CardTitle>Organization Settings</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-2">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-24" />
        </CardContent>
      </Card>
      <Card className="border-destructive">
        <CardHeader>
          <CardTitle>Delete the organization</CardTitle>
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
        </CardHeader>
        <CardContent className="flex justify-end gap-2 border-t pt-4">
          <Skeleton className="h-10 w-32" />
        </CardContent>
      </Card>
    </div>
  );
}
