import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { StarRating } from "./StarRating";
import { ImagePlus, Loader2, X, ShieldCheck, AlertTriangle, Store } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { useCanReview } from "@/hooks/useCanReview";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";

interface ReviewFormProps {
    productId: string;
    sellerId: string;
    onSuccess?: () => void;
    trigger?: React.ReactNode;
}

const MAX_IMAGES = 3;
const MIN_COMMENT_LENGTH = 10;
const MAX_COMMENT_LENGTH = 500;

export const ReviewForm = ({ productId, sellerId, onSuccess, trigger }: ReviewFormProps) => {
    const { canReview, loading: checkingEligibility, reason, orderItemId, hasExistingReview } = useCanReview(productId, sellerId);
    const [isOpen, setIsOpen] = useState(false);
    const [productRating, setProductRating] = useState(0);
    const [sellerRating, setSellerRating] = useState(0);
    const [comment, setComment] = useState("");
    const [images, setImages] = useState<File[]>([]);
    const [uploading, setUploading] = useState(false);

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const newImages = Array.from(e.target.files);

            // Limit images
            if (images.length + newImages.length > MAX_IMAGES) {
                toast.error(`Máximo de ${MAX_IMAGES} imagens permitidas`);
                return;
            }

            // Validate file sizes (max 5MB each)
            const validImages = newImages.filter(img => {
                if (img.size > 5 * 1024 * 1024) {
                    toast.error(`${img.name} é muito grande (máx. 5MB)`);
                    return false;
                }
                return true;
            });

            setImages(prev => [...prev, ...validImages]);
        }
    };

    const removeImage = (index: number) => {
        setImages(prev => prev.filter((_, i) => i !== index));
    };

    const validateForm = (): boolean => {
        if (productRating === 0) {
            toast.error("Por favor, avalie o produto.");
            return false;
        }

        if (sellerRating === 0) {
            toast.error("Por favor, avalie o vendedor.");
            return false;
        }

        if (comment.trim().length > 0 && comment.trim().length < MIN_COMMENT_LENGTH) {
            toast.error(`Comentário deve ter no mínimo ${MIN_COMMENT_LENGTH} caracteres.`);
            return false;
        }

        if (comment.length > MAX_COMMENT_LENGTH) {
            toast.error(`Comentário deve ter no máximo ${MAX_COMMENT_LENGTH} caracteres.`);
            return false;
        }

        return true;
    };

    const handleSubmit = async () => {
        if (!validateForm() || !orderItemId) return;

        try {
            setUploading(true);
            const user = (await supabase.auth.getUser()).data.user;
            if (!user) throw new Error("Usuário não autenticado");

            // Upload Images
            const uploadedUrls: string[] = [];
            for (const image of images) {
                const fileExt = image.name.split('.').pop();
                const fileName = `${user.id}/${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;

                const { error: uploadError } = await supabase.storage
                    .from('review-images')
                    .upload(fileName, image);

                if (uploadError) throw uploadError;

                const { data: { publicUrl } } = supabase.storage
                    .from('review-images')
                    .getPublicUrl(fileName);

                uploadedUrls.push(publicUrl);
            }

            // Insert Review
            const { error } = await supabase.from('reviews').insert({
                order_item_id: orderItemId,
                product_id: productId,
                seller_id: sellerId,
                reviewer_id: user.id,
                rating: productRating,
                seller_rating: sellerRating,
                comment: comment.trim() || null,
                images: uploadedUrls,
                is_verified_purchase: true
            });

            if (error) throw error;

            toast.success("Avaliação enviada com sucesso!");
            setIsOpen(false);

            // Reset form
            setProductRating(0);
            setSellerRating(0);
            setComment("");
            setImages([]);

            onSuccess?.();
        } catch (error: any) {
            console.error(error);
            if (error.code === '23505') {
                toast.error("Você já avaliou esta compra.");
            } else {
                toast.error(error.message || "Erro ao enviar avaliação.");
            }
        } finally {
            setUploading(false);
        }
    };

    // Loading state
    if (checkingEligibility) {
        return (
            <Button variant="outline" disabled>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Verificando...
            </Button>
        );
    }

    // Not eligible
    if (!canReview) {
        return (
            <div className="text-sm text-muted-foreground flex items-center gap-2">
                <AlertTriangle className="h-4 w-4" />
                <span>{reason}</span>
            </div>
        );
    }

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                {trigger || (
                    <Button className="gap-2">
                        <ShieldCheck className="h-4 w-4" />
                        Avaliar Produto
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Avaliar Produto</DialogTitle>
                    <DialogDescription>
                        Sua avaliação ajuda outros compradores
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-5 py-4">
                    {/* Verified Purchase Badge */}
                    <Alert className="border-green-500/30 bg-green-500/10">
                        <ShieldCheck className="h-4 w-4 text-green-500" />
                        <AlertDescription className="text-green-700 dark:text-green-300 text-sm">
                            Compra verificada - sua avaliação terá selo de autenticidade
                        </AlertDescription>
                    </Alert>

                    {/* Product Rating */}
                    <div className="space-y-2">
                        <Label className="text-sm font-medium">Avaliação do Produto</Label>
                        <div className="flex flex-col items-center gap-2 p-4 rounded-lg bg-muted/50">
                            <StarRating rating={productRating} onRatingChange={setProductRating} size={36} />
                            <span className="text-sm text-muted-foreground">
                                {productRating === 0 ? 'Toque para avaliar' :
                                    productRating === 1 ? 'Péssimo' :
                                        productRating === 2 ? 'Ruim' :
                                            productRating === 3 ? 'Regular' :
                                                productRating === 4 ? 'Bom' : 'Excelente'}
                            </span>
                        </div>
                    </div>

                    <Separator />

                    {/* Seller Rating */}
                    <div className="space-y-2">
                        <Label className="text-sm font-medium flex items-center gap-2">
                            <Store className="h-4 w-4" />
                            Avaliação do Vendedor
                        </Label>
                        <div className="flex flex-col items-center gap-2 p-4 rounded-lg bg-muted/50">
                            <StarRating rating={sellerRating} onRatingChange={setSellerRating} size={32} />
                            <span className="text-xs text-muted-foreground">
                                Atendimento, comunicação e entrega
                            </span>
                        </div>
                    </div>

                    <Separator />

                    {/* Comment */}
                    <div className="space-y-2">
                        <div className="flex justify-between items-center">
                            <Label className="text-sm font-medium">Comentário (opcional)</Label>
                            <span className="text-xs text-muted-foreground">
                                {comment.length}/{MAX_COMMENT_LENGTH}
                            </span>
                        </div>
                        <Textarea
                            placeholder="O que você achou do produto? Conte sua experiência..."
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            className="resize-none"
                            rows={4}
                            maxLength={MAX_COMMENT_LENGTH}
                        />
                        {comment.length > 0 && comment.length < MIN_COMMENT_LENGTH && (
                            <p className="text-xs text-destructive">
                                Mínimo de {MIN_COMMENT_LENGTH} caracteres
                            </p>
                        )}
                    </div>

                    {/* Images */}
                    <div className="space-y-2">
                        <Label className="text-sm font-medium">
                            Adicionar Fotos ({images.length}/{MAX_IMAGES})
                        </Label>
                        <div className="flex flex-wrap gap-2">
                            {images.map((img, i) => (
                                <div key={i} className="relative w-20 h-20 rounded-lg overflow-hidden border group">
                                    <img
                                        src={URL.createObjectURL(img)}
                                        alt="Preview"
                                        className="w-full h-full object-cover"
                                    />
                                    <button
                                        onClick={() => removeImage(i)}
                                        className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                                    >
                                        <X className="h-5 w-5 text-white" />
                                    </button>
                                </div>
                            ))}
                            {images.length < MAX_IMAGES && (
                                <label className="w-20 h-20 flex flex-col items-center justify-center border-2 border-dashed rounded-lg cursor-pointer hover:bg-muted transition-colors">
                                    <ImagePlus className="h-6 w-6 text-muted-foreground" />
                                    <span className="text-[10px] text-muted-foreground mt-1">Foto</span>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        multiple
                                        className="hidden"
                                        onChange={handleImageChange}
                                    />
                                </label>
                            )}
                        </div>
                    </div>

                    <Button
                        onClick={handleSubmit}
                        className="w-full h-12 text-base"
                        disabled={uploading || productRating === 0 || sellerRating === 0}
                    >
                        {uploading ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Enviando...
                            </>
                        ) : (
                            <>
                                <ShieldCheck className="mr-2 h-4 w-4" />
                                Enviar Avaliação Verificada
                            </>
                        )}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
};
