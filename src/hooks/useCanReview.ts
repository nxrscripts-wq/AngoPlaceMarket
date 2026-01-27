import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';

interface CanReviewResult {
    canReview: boolean;
    loading: boolean;
    reason: string | null;
    orderItemId: string | null;
    hasExistingReview: boolean;
}

/**
 * Hook to check if the current user can review a product
 * 
 * Requirements:
 * - User must be logged in
 * - User must have purchased the product
 * - Order must be delivered (status = 'delivered')
 * - User must not have already reviewed this order item
 */
export const useCanReview = (productId: string, sellerId?: string): CanReviewResult => {
    const { user } = useAuth();
    const [canReview, setCanReview] = useState(false);
    const [loading, setLoading] = useState(true);
    const [reason, setReason] = useState<string | null>(null);
    const [orderItemId, setOrderItemId] = useState<string | null>(null);
    const [hasExistingReview, setHasExistingReview] = useState(false);

    useEffect(() => {
        const checkEligibility = async () => {
            if (!user) {
                setCanReview(false);
                setReason('Faça login para avaliar');
                setLoading(false);
                return;
            }

            try {
                // Find a delivered order item for this product
                const { data: orderItems, error: orderError } = await supabase
                    .from('order_items')
                    .select(`
                        id,
                        orders!inner(
                            id,
                            user_id,
                            status
                        )
                    `)
                    .eq('product_id', productId)
                    .eq('orders.user_id', user.id)
                    .eq('orders.status', 'delivered')
                    .limit(10);

                if (orderError) throw orderError;

                if (!orderItems || orderItems.length === 0) {
                    setCanReview(false);
                    setReason('Compre e receba o produto para avaliar');
                    setLoading(false);
                    return;
                }

                // Check if user has already reviewed any of these order items
                const orderItemIds = orderItems.map(item => item.id);

                const { data: existingReviews, error: reviewError } = await supabase
                    .from('reviews')
                    .select('id, order_item_id')
                    .eq('reviewer_id', user.id)
                    .in('order_item_id', orderItemIds);

                if (reviewError) throw reviewError;

                // Find an order item that hasn't been reviewed yet
                const reviewedItemIds = existingReviews?.map(r => r.order_item_id) || [];
                const unreviewedItem = orderItems.find(item => !reviewedItemIds.includes(item.id));

                if (!unreviewedItem) {
                    setCanReview(false);
                    setReason('Você já avaliou todas as suas compras deste produto');
                    setHasExistingReview(true);
                    setLoading(false);
                    return;
                }

                // User is eligible to review
                setCanReview(true);
                setOrderItemId(unreviewedItem.id);
                setReason(null);
                setHasExistingReview(reviewedItemIds.length > 0);
            } catch (error) {
                console.error('Error checking review eligibility:', error);
                setCanReview(false);
                setReason('Erro ao verificar elegibilidade');
            } finally {
                setLoading(false);
            }
        };

        checkEligibility();
    }, [user, productId, sellerId]);

    return { canReview, loading, reason, orderItemId, hasExistingReview };
};

/**
 * Hook to get review statistics for a product
 */
export const useReviewStats = (productId: string) => {
    const [stats, setStats] = useState({
        average: 0,
        total: 0,
        distribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 } as Record<number, number>
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const { data, error } = await supabase
                    .from('reviews')
                    .select('rating')
                    .eq('product_id', productId);

                if (error) throw error;

                if (data && data.length > 0) {
                    const total = data.length;
                    const sum = data.reduce((acc, r) => acc + r.rating, 0);
                    const average = sum / total;

                    // Calculate distribution
                    const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
                    data.forEach(r => {
                        if (distribution[r.rating as keyof typeof distribution] !== undefined) {
                            distribution[r.rating as keyof typeof distribution]++;
                        }
                    });

                    setStats({ average, total, distribution });
                }
            } catch (error) {
                console.error('Error fetching review stats:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, [productId]);

    return { stats, loading };
};

/**
 * Hook to get seller rating stats
 */
export const useSellerRating = (sellerId: string) => {
    const [rating, setRating] = useState({ average: 0, total: 0 });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchSellerRating = async () => {
            try {
                const { data, error } = await supabase
                    .from('reviews')
                    .select('seller_rating')
                    .eq('seller_id', sellerId)
                    .not('seller_rating', 'is', null);

                if (error) throw error;

                if (data && data.length > 0) {
                    const total = data.length;
                    const sum = data.reduce((acc, r) => acc + (r.seller_rating || 0), 0);
                    setRating({ average: sum / total, total });
                }
            } catch (error) {
                console.error('Error fetching seller rating:', error);
            } finally {
                setLoading(false);
            }
        };

        if (sellerId) fetchSellerRating();
    }, [sellerId]);

    return { rating, loading };
};
