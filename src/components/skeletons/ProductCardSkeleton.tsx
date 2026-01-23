import { Skeleton } from "@/components/ui/skeleton";

export const ProductCardSkeleton = () => {
    return (
        <div className="bg-card rounded-xl overflow-hidden border border-border">
            <div className="aspect-square bg-muted">
                <Skeleton className="h-full w-full" />
            </div>
            <div className="p-3 space-y-2">
                <Skeleton className="h-4 w-3/4" />
                <div className="flex gap-2">
                    <Skeleton className="h-5 w-1/3" />
                    <Skeleton className="h-4 w-1/4" />
                </div>
                <div className="flex gap-1">
                    <Skeleton className="h-3 w-4" />
                    <Skeleton className="h-3 w-8" />
                </div>
            </div>
        </div>
    );
};
