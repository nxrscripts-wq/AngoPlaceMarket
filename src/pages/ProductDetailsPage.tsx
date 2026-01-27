import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import {
    ShoppingCart,
    ChevronLeft,
    Share2,
    Heart,
    ShieldCheck,
    Truck,
    Award,
    Star,
    MapPin,
    Package,
    ArrowRight,
    Loader2,
    MessageCircle
} from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { useCart } from '@/contexts/CartContext';
import { useChat } from '@/contexts/ChatContext';
import { LoadingScreen } from '@/components/LoadingScreen';
import { Product } from '@/types';
import { useCallback } from 'react';
import { ReviewList } from '@/components/reviews/ReviewList';


const ProductDetailsPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const { addToCart } = useCart();
    const { startChat } = useChat();
    const [product, setProduct] = useState<Product | null>(null);

    const handleStartChat = async () => {
        if (!user) {
            navigate('/login');
            return;
        }
        if (!product || !product.seller_id) return;

        try {
            const roomId = await startChat(product.seller_id, product.id);
            navigate('/chat');
        } catch (error) {
            console.error("Failed to start chat", error);
        }
    };
    const [loading, setLoading] = useState(true);
    const [quantity, setQuantity] = useState(1);

    const [error, setError] = useState<string | null>(null);

    const fetchProduct = useCallback(async () => {
        let attempts = 0;
        const maxAttempts = 3;

        while (attempts < maxAttempts) {
            try {
                if (attempts === 0) setLoading(true);
                setError(null);

                const { data, error: fetchError } = await supabase
                    .from('products')
                    .select('*, profiles(full_name, avatar_url)')
                    .eq('id', id)
                    .single();

                if (fetchError) throw fetchError;
                setProduct(data as Product);
                break; // Success
            } catch (error: any) {
                console.error(`Error fetching product (attempt ${attempts + 1}):`, error);

                // Retry only on AbortError or network error
                if (attempts < maxAttempts - 1 && (error.name === 'AbortError' || error.message?.includes('fetch'))) {
                    attempts++;
                    await new Promise(resolve => setTimeout(resolve, 1000 * attempts)); // Backoff
                    continue;
                }

                setError('Não foi possível carregar o produto. Verifique a sua conexão.');
                break;
            } finally {
                if (attempts === maxAttempts || attempts === 0) { // Only unset loading on final attempt or success
                    // actually handle finally block carefully
                }
            }
        }
        setLoading(false);
    }, [id]);

    useEffect(() => {
        fetchProduct();
    }, [fetchProduct]);

    const handleAddToCart = async () => {
        if (!product) return;
        await addToCart(product, quantity);
    };

    if (loading) {
        return <LoadingScreen />;
    }

    if (error) {
        return (
            <div className="container mx-auto px-4 py-20 flex flex-col items-center justify-center text-center">
                <div className="bg-destructive/10 p-6 rounded-full mb-6">
                    <Package className="h-12 w-12 text-destructive" />
                </div>
                <h1 className="text-2xl font-bold mb-2">Erro ao carregar produto</h1>
                <p className="text-muted-foreground mb-6 max-w-md">{error}</p>
                <div className="flex gap-4">
                    <Button onClick={fetchProduct} variant="default" size="lg">
                        Tentar Novamente
                    </Button>
                    <Button onClick={() => navigate('/')} variant="ghost" size="lg">
                        Voltar ao Início
                    </Button>
                </div>
            </div>
        );
    }

    if (!product) return null;

    return (
        <>
            <main className="container mx-auto px-4 py-8">
                {/* Breadcrumbs / Back button */}
                <Button
                    variant="ghost"
                    onClick={() => navigate(-1)}
                    className="mb-6 -ml-2 text-muted-foreground hover:text-secondary"
                >
                    <ChevronLeft className="mr-2 h-5 w-5" />
                    Voltar
                </Button>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                    {/* Left: Images */}
                    <div className="space-y-4">
                        <div className="aspect-square bg-white rounded-3xl overflow-hidden shadow-2xl border border-border group relative">
                            <img
                                src={product.image}
                                alt={product.name}
                                className="w-full h-full object-contain p-8 group-hover:scale-105 transition-transform duration-500"
                            />
                            <div className="absolute top-4 right-4 flex flex-col gap-2">
                                <Button size="icon" variant="secondary" className="rounded-full shadow-lg" aria-label="Adicionar aos favoritos">
                                    <Heart className="h-5 w-5" />
                                </Button>
                                <Button size="icon" variant="secondary" className="rounded-full shadow-lg" aria-label="Partilhar produto">
                                    <Share2 className="h-5 w-5" />
                                </Button>
                            </div>
                        </div>
                    </div>

                    {/* Right: Info */}
                    <div className="space-y-6">
                        <div>
                            <div className="flex items-center gap-2 mb-3">
                                <Badge className="bg-secondary text-secondary-foreground font-bold">
                                    {product.category}
                                </Badge>
                                {product.is_flash_deal && (
                                    <Badge variant="destructive" className="animate-pulse">Flash Deal</Badge>
                                )}
                            </div>
                            <h1 className="text-4xl md:text-5xl font-black tracking-tight mb-2 leading-tight">
                                {product.name}
                            </h1>
                            <div className="flex items-center gap-4 text-sm">
                                <div className="flex items-center text-yellow-500">
                                    {[...Array(5)].map((_, i) => (
                                        <Star key={i} className={`h-4 w-4 ${i < Math.floor(product.rating || 4.5) ? 'fill-current' : ''}`} />
                                    ))}
                                    <span className="ml-2 font-bold text-card-foreground">{product.rating || '4.5'}</span>
                                </div>
                                <span className="text-muted-foreground">({product.sales || 24} vendas)</span>
                                <Badge variant="outline" className="text-green-500 border-green-500/20 bg-green-500/5">
                                    Novo
                                </Badge>
                            </div>
                        </div>

                        <div className="p-6 bg-muted/30 rounded-3xl border border-border">
                            <div className="flex items-end gap-3 mb-2">
                                <span className="text-4xl font-black text-secondary">
                                    {Number(product.price).toLocaleString('pt-AO')} Kz
                                </span>
                                {product.old_price && (
                                    <span className="text-lg text-muted-foreground line-through mb-1">
                                        {Number(product.old_price).toLocaleString('pt-AO')} Kz
                                    </span>
                                )}
                            </div>
                            <p className="text-sm text-muted-foreground">Em até 12x sem juros no Cartão de Crédito</p>
                        </div>

                        <div className="space-y-4">
                            <div className="flex items-center gap-4">
                                <div className="flex items-center border border-border rounded-xl h-12">
                                    <button
                                        className="px-4 h-full hover:bg-muted transition-colors disabled:opacity-30"
                                        onClick={() => setQuantity(q => Math.max(1, q - 1))}
                                        disabled={quantity <= 1}
                                    >
                                        -
                                    </button>
                                    <span className="w-12 text-center font-bold">{quantity}</span>
                                    <button
                                        className="px-4 h-full hover:bg-muted transition-colors disabled:opacity-30"
                                        onClick={() => setQuantity(q => Math.min(product.stock, q + 1))}
                                        disabled={quantity >= product.stock}
                                    >
                                        +
                                    </button>
                                </div>
                                <span className="text-sm text-muted-foreground">
                                    {product.stock} unidades disponíveis
                                </span>
                            </div>

                            <div className="flex flex-col sm:flex-row gap-4">
                                <Button
                                    className="flex-1 h-16 bg-secondary hover:bg-secondary/90 text-secondary-foreground text-xl font-black rounded-2xl shadow-xl shadow-secondary/20"
                                    onClick={handleAddToCart}
                                >
                                    <ShoppingCart className="mr-3 h-6 w-6" />
                                    Adicionar ao Carrinho
                                </Button>
                                <Button
                                    variant="outline"
                                    className="h-16 px-8 text-lg font-bold border-2 rounded-2xl hover:bg-muted"
                                    onClick={handleStartChat}
                                >
                                    <MessageCircle className="h-6 w-6" />
                                </Button>
                            </div>
                        </div>

                        {/* Seller & Protection */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Card className="bg-card/50 border-border">
                                <CardContent className="p-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-secondary rounded-full flex items-center justify-center text-secondary-foreground font-bold">
                                            {product.profiles?.full_name?.charAt(0) || 'V'}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-xs text-muted-foreground">Vendido por</p>
                                            <p className="font-bold truncate">{product.profiles?.full_name || 'Vendedor Verificado'}</p>
                                        </div>
                                        <div className="flex gap-2 mt-2">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="flex-1 gap-2 text-xs h-8"
                                                onClick={handleStartChat}
                                            >
                                                <MessageCircle className="h-3 w-3" />
                                                Conversar
                                            </Button>
                                            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full" aria-label="Ver perfil do vendedor">
                                                <ArrowRight className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>
                                    <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
                                        <MapPin className="h-3 w-3" />
                                        {product.seller_province}, {product.seller_municipality}
                                    </div>
                                </CardContent>
                            </Card>

                            <div className="space-y-2 p-4 bg-primary/5 rounded-2xl border border-primary/10">
                                <div className="flex items-center gap-2 text-sm font-bold text-primary">
                                    <ShieldCheck className="h-4 w-4" />
                                    Compra Segura AngoPlace
                                </div>
                                <p className="text-[10px] text-muted-foreground">
                                    Seu dinheiro está protegido até que você receba o produto em perfeitas condições.
                                </p>
                            </div>
                        </div>

                        {/* Tags / Info */}
                        <div className="flex flex-wrap gap-2 pt-4">
                            <div className="flex items-center gap-2 px-3 py-1.5 bg-muted rounded-full text-xs font-medium">
                                <Truck className="h-3 w-3 text-secondary" /> Entrega em 48h
                            </div>
                            <div className="flex items-center gap-2 px-3 py-1.5 bg-muted rounded-full text-xs font-medium">
                                <Award className="h-3 w-3 text-secondary" /> Garantia Original
                            </div>
                            <div className="flex items-center gap-2 px-3 py-1.5 bg-muted rounded-full text-xs font-medium">
                                <Package className="h-3 w-3 text-secondary" /> Devolução Grátis
                            </div>
                        </div>
                    </div>
                </div>

                {/* Description and Tabs */}
                <div className="mt-16 bg-card/30 rounded-3xl p-8 border border-border">
                    <h2 className="text-2xl font-bold mb-6">Descrição do Produto</h2>
                    <div className="prose prose-invert max-w-none text-muted-foreground whitespace-pre-wrap">
                        {product.description}
                    </div>
                </div>

                {/* Reviews Section */}
                <div className="mt-8 bg-card/30 rounded-3xl p-8 border border-border">
                    <h2 className="text-2xl font-bold mb-6">Avaliações dos Compradores</h2>
                    <ReviewList productId={product.id} />
                </div>
            </main>
        </>
    );
};

export default ProductDetailsPage;
