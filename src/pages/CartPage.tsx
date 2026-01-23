import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
    Trash2,
    Plus,
    Minus,
    ShoppingBag,
    ArrowRight,
    ShieldCheck,
    Truck,
    CreditCard
} from 'lucide-react';
import { toast } from 'sonner';
import { LoadingScreen } from '@/components/LoadingScreen';
import { CartItem } from '@/types';


const CartPage = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [cartItems, setCartItems] = useState<CartItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [checkoutLoading, setCheckoutLoading] = useState(false);

    const fetchCart = useCallback(async () => {
        try {
            const { data, error } = await supabase
                .from('cart_items')
                .select('*, products(*)')
                .eq('user_id', user?.id);

            if (error) throw error;
            setCartItems(data || []);
        } catch (error) {
            console.error('Error fetching cart:', error);
        } finally {
            setLoading(false);
        }
    }, [user]);

    useEffect(() => {
        if (user) {
            fetchCart();
        } else {
            setLoading(false);
        }
    }, [user, fetchCart]);

    const updateQuantity = async (id: string, newQty: number) => {
        if (newQty < 1) return;

        try {
            const { error } = await supabase
                .from('cart_items')
                .update({ quantity: newQty })
                .eq('id', id);

            if (error) throw error;
            setCartItems(items => items.map(item =>
                item.id === id ? { ...item, quantity: newQty } : item
            ));
        } catch (error) {
            toast.error('Erro ao atualizar quantidade.');
        }
    };

    const removeItem = async (id: string) => {
        try {
            const { error } = await supabase
                .from('cart_items')
                .delete()
                .eq('id', id);

            if (error) throw error;
            setCartItems(items => items.filter(item => item.id !== id));
            toast.success('Item removido do carrinho.');
        } catch (error) {
            toast.error('Erro ao remover item.');
        }
    };

    const calculateTotal = () => {
        return cartItems.reduce((acc, item) => acc + (item.products.price * item.quantity), 0);
    };

    const handleCheckout = async () => {
        setCheckoutLoading(true);
        try {
            // 1. Create order
            const { data: order, error: orderError } = await supabase
                .from('orders')
                .insert({
                    user_id: user?.id,
                    total: calculateTotal(),
                    status: 'pending'
                })
                .select()
                .single();

            if (orderError) throw orderError;

            // 2. Create order items
            const orderItems = cartItems.map(item => ({
                order_id: order.id,
                product_id: item.product_id,
                product_name: item.products.name,
                product_price: item.products.price,
                quantity: item.quantity
            }));

            const { error: itemsError } = await supabase
                .from('order_items')
                .insert(orderItems);

            if (itemsError) throw itemsError;

            // 3. Clear cart
            await supabase.from('cart_items').delete().eq('user_id', user?.id);

            toast.success('Compra realizada com sucesso!');
            navigate('/orders');
        } catch (error) {
            console.error('Checkout error:', error);
            toast.error('Erro ao processar checkout.');
        } finally {
            setCheckoutLoading(false);
        }
    };

    if (loading) {
        return <LoadingScreen />;
    }

    return (
        <div className="min-h-screen bg-background text-card-foreground">
            <Header />
            <main className="container mx-auto px-4 py-8">
                <div className="flex items-center gap-3 mb-8">
                    <div className="w-12 h-12 bg-secondary/10 rounded-xl flex items-center justify-center">
                        <ShoppingBag className="h-6 w-6 text-secondary" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold">Meu Carrinho</h1>
                        <p className="text-muted-foreground">{cartItems.length} itens prontos para serem seus</p>
                    </div>
                </div>

                {cartItems.length > 0 ? (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                        {/* List */}
                        <div className="lg:col-span-2 space-y-4">
                            {cartItems.map((item) => (
                                <Card key={item.id} className="bg-card/40 border-border backdrop-blur-sm overflow-hidden">
                                    <div className="flex flex-col sm:flex-row p-4 gap-6">
                                        <div className="w-full sm:w-32 h-32 bg-white rounded-2xl overflow-hidden shrink-0">
                                            <img src={item.products.image} alt={item.products.name} className="w-full h-full object-contain p-2" />
                                        </div>
                                        <div className="flex-1 flex flex-col justify-between">
                                            <div className="flex justify-between items-start gap-4">
                                                <div>
                                                    <h3 className="font-bold text-lg leading-tight lg:line-clamp-2">{item.products.name}</h3>
                                                    <p className="text-xs text-muted-foreground mt-1 uppercase tracking-wider">{item.products.category}</p>
                                                </div>
                                                <Button variant="ghost" size="icon" className="text-red-500 hover:bg-red-500/10 rounded-full" onClick={() => removeItem(item.id)}>
                                                    <Trash2 className="h-5 w-5" />
                                                </Button>
                                            </div>

                                            <div className="flex items-end justify-between mt-4">
                                                <div className="flex items-center border border-border rounded-lg h-9">
                                                    <button className="px-3 h-full hover:bg-muted" onClick={() => updateQuantity(item.id, item.quantity - 1)}>-</button>
                                                    <span className="w-8 text-center text-sm font-bold">{item.quantity}</span>
                                                    <button className="px-3 h-full hover:bg-muted" onClick={() => updateQuantity(item.id, item.quantity + 1)}>+</button>
                                                </div>
                                                <p className="text-xl font-black text-secondary">
                                                    {(item.products.price * item.quantity).toLocaleString('pt-AO')} Kz
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </Card>
                            ))}
                        </div>

                        {/* Summary */}
                        <div className="space-y-6">
                            <Card className="bg-secondary text-secondary-foreground p-6 rounded-3xl border-none shadow-2xl shadow-secondary/20 overflow-hidden relative group">
                                <div className="absolute -top-12 -right-12 w-32 h-32 bg-white/10 rounded-full group-hover:scale-150 transition-transform duration-700" />
                                <h3 className="text-xl font-black mb-4 flex items-center gap-2">
                                    Resumo do Pedido
                                </h3>
                                <div className="space-y-3 mb-6">
                                    <div className="flex justify-between text-sm">
                                        <span>Subtotal</span>
                                        <span>{calculateTotal().toLocaleString('pt-AO')} Kz</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span>Frete</span>
                                        <span className="text-green-300 font-bold underline decoration-dotted">Grátis</span>
                                    </div>
                                    <div className="border-t border-white/20 pt-3 flex justify-between">
                                        <span className="font-black text-lg">Total</span>
                                        <span className="font-black text-2xl">{calculateTotal().toLocaleString('pt-AO')} Kz</span>
                                    </div>
                                </div>
                                <Button
                                    className="w-full h-14 bg-white text-secondary hover:bg-white/90 text-lg font-black rounded-2xl flex items-center justify-center gap-2"
                                    onClick={handleCheckout}
                                    disabled={checkoutLoading}
                                >
                                    {checkoutLoading ? <div className="animate-spin h-5 w-5 border-2 border-secondary border-t-transparent rounded-full" /> : (
                                        <>
                                            Finalizar Compra
                                            <ArrowRight className="h-5 w-5" />
                                        </>
                                    )}
                                </Button>
                            </Card>

                            <div className="space-y-4">
                                <Card className="bg-card/40 border-border p-4">
                                    <div className="flex gap-4 items-start">
                                        <div className="p-2 bg-secondary/10 rounded-lg">
                                            <Truck className="h-5 w-5 text-secondary" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold">Entrega Segura</p>
                                            <p className="text-[10px] text-muted-foreground">Receba seus produtos em até 48h úteis em Luanda.</p>
                                        </div>
                                    </div>
                                </Card>
                                <Card className="bg-card/40 border-border p-4">
                                    <div className="flex gap-4 items-start">
                                        <div className="p-2 bg-secondary/10 rounded-lg">
                                            <CreditCard className="h-5 w-5 text-secondary" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold">Pagamento Facilitado</p>
                                            <p className="text-[10px] text-muted-foreground">Pague via MULTICAIXA Express ou transferência no ato.</p>
                                        </div>
                                    </div>
                                </Card>
                                <div className="flex items-center justify-center gap-2 py-4 grayscale opacity-50">
                                    <ShieldCheck className="h-5 w-5" />
                                    <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Plataforma 100% Protegida</span>
                                </div>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="text-center py-20 bg-muted/20 rounded-3xl border border-dashed border-border">
                        <ShoppingBag className="h-20 w-20 text-muted-foreground/20 mx-auto mb-6" />
                        <h3 className="text-2xl font-bold mb-2">Seu carrinho está vazio</h3>
                        <p className="text-muted-foreground mb-8">Parece que você ainda não adicionou nenhum hardware potente.</p>
                        <Button onClick={() => navigate('/')} className="bg-secondary text-secondary-foreground font-black px-12 h-14 rounded-2xl shadow-xl shadow-secondary/10 transition-transform active:scale-95">
                            Começar a Comprar
                        </Button>
                    </div>
                )}
            </main>
            <Footer />
        </div>
    );
};

export default CartPage;
