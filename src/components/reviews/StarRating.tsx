import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface StarRatingProps {
    rating: number; // 0 to 5
    maxRating?: number;
    onRatingChange?: (rating: number) => void;
    size?: number;
    readOnly?: boolean;
    className?: string;
}

export const StarRating = ({
    rating,
    maxRating = 5,
    onRatingChange,
    size = 20,
    readOnly = false,
    className
}: StarRatingProps) => {
    return (
        <div className={cn("flex items-center gap-1", className)}>
            {[...Array(maxRating)].map((_, index) => {
                const starValue = index + 1;
                const isFull = starValue <= Math.round(rating);
                const isHoverable = !readOnly && onRatingChange;

                return (
                    <button
                        key={index}
                        type="button"
                        disabled={readOnly}
                        onClick={() => onRatingChange?.(starValue)}
                        className={cn(
                            "transition-colors",
                            isHoverable && "hover:scale-110",
                            readOnly && "cursor-default"
                        )}
                        aria-label={`Avaliar com ${starValue} estrelas`}
                    >
                        <Star
                            size={size}
                            className={cn(
                                "transition-all",
                                isFull
                                    ? "fill-yellow-400 text-yellow-500"
                                    : "fill-muted text-muted-foreground/30",
                                !isFull && isHoverable && "hover:text-yellow-400"
                            )}
                        />
                    </button>
                );
            })}
        </div>
    );
};
