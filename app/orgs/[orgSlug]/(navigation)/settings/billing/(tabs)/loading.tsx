import { Skeleton } from "@/components/ui/skeleton";

export default function LoadingPage() {
  return (
    <div className="flex flex-col gap-6">
      <Skeleton className="h-48 w-full" />
      <Skeleton className="h-96 w-full" />
    </div>
  );
}
