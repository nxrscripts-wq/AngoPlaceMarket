import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { StarRating } from "./StarRating";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Loader2, ShieldCheck, ThumbsUp, Store, Image as ImageIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

interface Review {
    id: string;
    rating: number;
    seller_rating: number | null;
    comment: string;
    images: string[];
    created_at: string;
    is_verified_purchase: boolean;
    helpful_count: number;
    reviewer: {
        full_name: string;
        avatar_url: string;
    };
}

interface ReviewListProps {
    productId: string;
    showSummary?: boolean;
}

export const ReviewList = ({ productId, showSummary = true }: ReviewListProps) => {
    const [reviews, setReviews] = useState<Review[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedImage, setSelectedImage] = useState<string | null>(null);

    useEffect(() => {
        const fetchReviews = async () => {
            try {
                const { data, error } = await supabase
                    .from('reviews')
                    .select(`
                        *,
                        reviewer:reviewer_id(full_name, avatar_url)
                    `)
                    .eq('product_id', productId)
                    .order('created_at', { ascending: false });

                if (error) throw error;
                setReviews(data || []);
            } catch (err) {
                console.error("Error loading reviews:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchReviews();
    }, [productId]);

    const handleHelpful = async (reviewId: string) => {
        // Optimistic update
        setReviews(prev => prev.map(r =>
            r.id === reviewId
                ? { ...r, helpful_count: (r.helpful_count || 0) + 1 }
                : r
        ));

        try {
            await supabase.rpc('increment_helpful_count', { review_id: reviewId });
        } catch (error) {
            // Revert on error
            setReviews(prev => prev.map(r =>
                r.id === reviewId
                    ? { ...r, helpful_count: (r.helpful_count || 1) - 1 }
                    : r
            ));
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center p-8">
                <Loader2 className="animate-spin text-muted-foreground" />
            </div>
        );
    }

    if (reviews.length === 0) {
        return (
            <div className="text-center py-12 text-muted-foreground bg-muted/20 rounded-xl">
                <div className="flex justify-center mb-4">
                    <div className="p-4 rounded-full bg-muted">
                        <StarRating rating={0} size={24} readOnly />
                    </div>
                </div>
                <p className="font-medium">Este produto ainda não tem avaliações</p>
                <p className="text-sm mt-1">Seja o primeiro a avaliar após sua compra!</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold">
                    {reviews.length} {reviews.length === 1 ? 'Avaliação' : 'Avaliações'}
                </h3>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <ShieldCheck className="h-4 w-4 text-green-500" />
                    <span>{reviews.filter(r => r.is_verified_purchase).length} verificadas</span>
                </div>
            </div>

            <div className="grid gap-6">
                {reviews.map((review) => (
                    <article key={review.id} className="border-b last:border-0 pb-6">
                        {/* Header */}
                        <div className="flex items-start gap-3 mb-3">
                            <Avatar className="h-10 w-10">
                                <AvatarImage src={review.reviewer?.avatar_url} />
                                <AvatarFallback className="bg-secondary/20 text-secondary">
                                    {review.reviewer?.full_name?.substring(0, 2).toUpperCase() || 'U'}
                                </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 flex-wrap">
                                    <p className="font-semibold text-sm">
                                        {review.reviewer?.full_name || "Usuário Anônimo"}
                                    </p>
                                    {review.is_verified_purchase && (
                                        <Badge variant="secondary" className="bg-green-500/10 text-green-600 dark:text-green-400 text-[10px] gap-1">
                                            <ShieldCheck className="h-3 w-3" />
                                            Compra Verificada
                                        </Badge>
                                    )}
                                </div>
                                <div className="flex items-center gap-3 mt-1">
                                    <div className="flex items-center gap-1">
                                        <StarRating rating={review.rating} size={14} readOnly />
                                        <span className="text-xs font-medium">{review.rating}/5</span>
                                    </div>
                                    {review.seller_rating && (
                                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                            <Store className="h-3 w-3" />
                                            <span>Vendedor: {review.seller_rating}/5</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                            <span className="text-xs text-muted-foreground shrink-0">
                                {formatDistanceToNow(new Date(review.created_at), { addSuffix: true, locale: ptBR })}
                            </span>
                        </div>

                        {/* Comment */}
                        {review.comment && (
                            <p className="text-sm leading-relaxed pl-13 mb-3">
                                {review.comment}
                            </p>
                        )}

                        {/* Images */}
                        {review.images && review.images.length > 0 && (
                            <div className="flex gap-2 mb-3 overflow-x-auto pb-2 pl-13">
                                {review.images.map((img, i) => (
                                    <Dialog key={i}>
                                        <DialogTrigger asChild>
                                            <button className="relative group shrink-0">
                                                <img
                                                    src={img}
                                                    alt={`Foto ${i + 1} da avaliação`}
                                                    className="h-20 w-20 object-cover rounded-lg border cursor-pointer hover:opacity-90 transition-opacity"
                                                />
                                                <div className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg">
                                                    <ImageIcon className="h-5 w-5 text-white" />
                                                </div>
                                            </button>
                                        </DialogTrigger>
                                        <DialogContent className="max-w-3xl p-0 overflow-hidden">
                                            <img
                                                src={img}
                                                alt="Imagem ampliada"
                                                className="w-full h-auto max-h-[80vh] object-contain"
                                            />
                                        </DialogContent>
                                    </Dialog>
                                ))}
                            </div>
                        )}

                        {/* Actions */}
                        <div className="flex items-center gap-4 pl-13">
                            <Button
                                variant="ghost"
                                size="sm"
                                className="text-xs text-muted-foreground hover:text-foreground gap-1.5 h-8"
                                onClick={() => handleHelpful(review.id)}
                            >
                                <ThumbsUp className="h-3.5 w-3.5" />
                                Útil {review.helpful_count > 0 && `(${review.helpful_count})`}
                            </Button>
                        </div>
                    </article>
                ))}
            </div>
        </div>
    );
};
