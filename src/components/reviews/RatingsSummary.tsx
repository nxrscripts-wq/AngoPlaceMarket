import { useReviewStats } from "@/hooks/useCanReview";
import { StarRating } from "./StarRating";
import { cn } from "@/lib/utils";
import { Loader2, Star } from "lucide-react";

interface RatingsSummaryProps {
    productId: string;
    compact?: boolean;
    className?: string;
}

export const RatingsSummary = ({ productId, compact = false, className }: RatingsSummaryProps) => {
    const { stats, loading } = useReviewStats(productId);

    if (loading) {
        return (
            <div className={cn("flex items-center gap-2", className)}>
                <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
            </div>
        );
    }

    if (stats.total === 0) {
        return (
            <div className={cn("text-sm text-muted-foreground", className)}>
                Sem avaliações ainda
            </div>
        );
    }

    // Compact version for cards
    if (compact) {
        return (
            <div className={cn("flex items-center gap-1", className)}>
                <Star className="h-4 w-4 fill-yellow-400 text-yellow-500" />
                <span className="font-semibold text-sm">{stats.average.toFixed(1)}</span>
                <span className="text-xs text-muted-foreground">({stats.total})</span>
            </div>
        );
    }

    // Full version with distribution
    return (
        <div className={cn("space-y-4", className)}>
            {/* Header with average */}
            <div className="flex items-center gap-4">
                <div className="text-center">
                    <div className="text-4xl font-bold text-foreground">
                        {stats.average.toFixed(1)}
                    </div>
                    <StarRating rating={stats.average} size={18} readOnly className="justify-center mt-1" />
                    <div className="text-sm text-muted-foreground mt-1">
                        {stats.total} {stats.total === 1 ? 'avaliação' : 'avaliações'}
                    </div>
                </div>

                {/* Distribution bars */}
                <div className="flex-1 space-y-1.5">
                    {[5, 4, 3, 2, 1].map((star) => {
                        const count = stats.distribution[star] || 0;
                        const percentage = stats.total > 0 ? (count / stats.total) * 100 : 0;

                        return (
                            <div key={star} className="flex items-center gap-2">
                                <span className="text-xs w-3 text-muted-foreground">{star}</span>
                                <Star className="h-3 w-3 fill-yellow-400 text-yellow-500" />
                                <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-yellow-400 rounded-full transition-all duration-500"
                                        style={{ width: `${percentage}%` }}
                                    />
                                </div>
                                <span className="text-xs text-muted-foreground w-8 text-right">
                                    {count}
                                </span>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};
