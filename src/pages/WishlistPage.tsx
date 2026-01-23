import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';

import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    Heart,
    Trash2,
    ShoppingCart,
    ArrowRight,
    Loader2,
    ShoppingBag,
    Star
} from 'lucide-react';
import { toast } from 'sonner';
import { WishlistItem, Product } from '@/types';


const WishlistPage = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [items, setItems] = useState<WishlistItem[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchWishlist = useCallback(async () => {
        try {
            const { data, error } = await supabase
                .from('wishlist')
                .select('*, products(*)')
                .eq('user_id', user?.id);

            if (error) {
                setItems([]);
            } else {
                setItems(data || []);
            }
        } catch (error) {
            console.error('Error fetching wishlist:', error);
        } finally {
            setLoading(false);
        }
    }, [user]);

    useEffect(() => {
        if (user) {
            fetchWishlist();
        } else {
            setLoading(false);
        }
    }, [user, fetchWishlist]);

    const removeItem = async (id: string) => {
        try {
            const { error } = await supabase
                .from('wishlist')
                .delete()
                .eq('id', id);

            if (error) throw error;
            setItems(items.filter(item => item.id !== id));
            toast.success('Removido dos favoritos');
        } catch (error) {
            toast.error('Erro ao remover item');
        }
    };

    const addToCart = async (product: Product) => {
        if (!user) {
            toast.error('Faça login para adicionar ao carrinho');
            return;
        }

        try {
            const { error } = await supabase.from('cart_items').insert({
                user_id: user.id,
                product_id: product.id,
                quantity: 1
            });

            if (error) throw error;
            toast.success('Adicionado ao carrinho!');
            navigate('/cart');
        } catch (error) {
            toast.error('Erro ao adicionar ao carrinho');
        }
    };

    return (
        <>

            <main className="container mx-auto px-4 py-12">
                <div className="max-w-6xl mx-auto space-y-12">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                        <div className="space-y-2">
                            <h1 className="text-4xl font-black flex items-center gap-3">
                                <Heart className="h-10 w-10 text-red-500 fill-red-500" />
                                Lista de Desejos
                            </h1>
                            <p className="text-muted-foreground">Hardware que você amou e salvou para depois.</p>
                        </div>
                        <Button variant="outline" onClick={() => navigate('/')} className="rounded-xl font-bold h-12 flex items-center gap-2">
                            Continuar Comprando
                            <ArrowRight className="h-4 w-4" />
                        </Button>
                    </div>

                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-20 space-y-4">
                            <Loader2 className="h-12 w-12 animate-spin text-secondary" />
                            <p className="text-muted-foreground font-bold">A carregar os seus favoritos...</p>
                        </div>
                    ) : items.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {items.map((item) => (
                                <Card key={item.id} className="bg-card/40 border-border overflow-hidden group hover:border-secondary/30 transition-all shadow-lg hover:shadow-2xl">
                                    <div className="relative aspect-square bg-white p-6 overflow-hidden">
                                        <img
                                            src={item.products.image}
                                            alt={item.products.name}
                                            className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-500"
                                        />
                                        <button
                                            onClick={() => removeItem(item.id)}
                                            className="absolute top-4 right-4 p-3 bg-white/80 backdrop-blur-sm rounded-full text-red-500 hover:bg-red-500 hover:text-white transition-all shadow-lg"
                                        >
                                            <Trash2 className="h-5 w-5" />
                                        </button>
                                        <Badge className="absolute top-4 left-4 bg-secondary text-secondary-foreground font-bold">
                                            {item.products.category}
                                        </Badge>
                                    </div>
                                    <CardContent className="p-6 space-y-4">
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-1 text-yellow-500">
                                                <Star className="w-3 h-3 fill-yellow-500" />
                                                <Star className="w-3 h-3 fill-yellow-500" />
                                                <Star className="w-3 h-3 fill-yellow-500" />
                                                <Star className="w-3 h-3 fill-yellow-500" />
                                                <Star className="w-3 h-3 fill-yellow-500" />
                                                <span className="text-[10px] text-muted-foreground ml-1">(5.0)</span>
                                            </div>
                                            <h3 className="font-bold text-lg line-clamp-1">{item.products.name}</h3>
                                            <p className="text-2xl font-black text-secondary">{Number(item.products.price).toLocaleString('pt-AO')} Kz</p>
                                        </div>
                                        <div className="flex gap-3">
                                            <Button
                                                className="flex-1 bg-secondary text-secondary-foreground font-bold h-12 rounded-xl group-hover:shadow-lg group-hover:shadow-secondary/20 transition-all"
                                                onClick={() => addToCart(item.products)}
                                            >
                                                <ShoppingCart className="h-4 w-4 mr-2" />
                                                🛒 Carrinho
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-12 w-12 rounded-xl hover:bg-secondary/10 hover:text-secondary border border-border"
                                                onClick={() => navigate(`/product/${item.products.id}`)}
                                            >
                                                <ArrowRight className="h-5 w-5" />
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    ) : (
                        <Card className="text-center py-20 bg-muted/20 border-border border-dashed border-2 rounded-3xl">
                            <Heart className="h-24 w-24 text-red-500/10 mx-auto mb-6" />
                            <h3 className="text-2xl font-black mb-2">Sua lista está vazia</h3>
                            <p className="text-muted-foreground mb-10 max-w-sm mx-auto">
                                Você ainda não salvou nenhum hardware. Clique no ícone de coração nos produtos para salvá-los aqui.
                            </p>
                            <Button onClick={() => navigate('/')} className="bg-secondary text-secondary-foreground font-black px-12 h-16 rounded-2xl shadow-xl shadow-secondary/20 transition-transform active:scale-95 text-lg">
                                Explorar Hardware
                            </Button>
                        </Card>
                    )}
                </div>
            </main>

        </>
    );
};

export default WishlistPage;
