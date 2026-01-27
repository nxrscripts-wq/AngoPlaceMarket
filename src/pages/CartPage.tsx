import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useCart } from '@/contexts/CartContext';
import { supabase } from '@/lib/supabase';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
    Trash2,
    ShoppingBag,
    ArrowRight,
    ShieldCheck,
    Truck,
    CreditCard
} from 'lucide-react';
import { toast } from 'sonner';
import { LoadingScreen } from '@/components/LoadingScreen';
import { MCXPaymentButton } from '@/components/MCXPaymentButton';
import { emailService } from '@/lib/emailService';

const CartPage = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const { cartItems, updateQuantity, removeFromCart, clearCart, validateStock, cartTotal, loading } = useCart();
    const [checkoutLoading, setCheckoutLoading] = useState(false);
    const [step, setStep] = useState<'CART' | 'PAYMENT'>('CART');
    const [currentOrder, setCurrentOrder] = useState<any>(null);

    const handleCheckout = async () => {
        if (!user) {
            navigate('/login?redirect=/cart');
            return;
        }

        setCheckoutLoading(true);
        try {
            // 1. Validate Stock
            const isValid = await validateStock();
            if (!isValid) {
                setCheckoutLoading(false);
                return;
            }

            // 2. Create order
            const { data: order, error: orderError } = await supabase
                .from('orders')
                .insert({
                    user_id: user.id,
                    total: cartTotal,
                    status: 'pendente'
                })
                .select()
                .single();

            if (orderError) throw orderError;

            // 3. Create order items
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

            // 4. Set state to show payment
            setCurrentOrder(order);
            setStep('PAYMENT');

            toast.success('Pedido criado! Proceda ao pagamento.');
        } catch (error) {
            console.error('Checkout error:', error);
            toast.error('Erro ao processar checkout.');
        } finally {
            setCheckoutLoading(false);
        }
    };

    const handlePaymentSuccess = async () => {
        try {
            // Notifications
            await supabase.from('notifications').insert({
                user_id: user?.id,
                title: 'Pagamento Confirmado',
                message: `O pagamento do seu pedido #${currentOrder.id.slice(0, 8)} foi confirmado!`,
                type: 'ORDER_STATUS'
            });

            // Seller notifications
            const sellers = new Set(cartItems.map(item => item.products.seller_id));
            for (const sellerId of sellers) {
                await supabase.from('notifications').insert({
                    user_id: sellerId,
                    title: 'Venda Confirmada!',
                    message: `O pagamento do pedido #${currentOrder.id.slice(0, 8)} foi realizado. Pode processar o envio.`,
                    type: 'SALE'
                });
            }

            // Enviar Email de Confirmação para o Comprador
            await emailService.sendEmail({
                userId: user?.id,
                recipient: user?.email || '',
                subject: `Pedido Confirmado! #${currentOrder.id.slice(0, 8)}`,
                template: 'order_confirmation',
                payload: {
                    order_id: currentOrder.id,
                    total_amount: currentOrder.total.toLocaleString('pt-AO')
                }
            });

            await clearCart();
            navigate('/order-success');
        } catch (err) {
            console.error('Finalization error:', err);
            navigate('/order-success'); // Still go to success as payment is done in DB
        }
    };

    if (loading) {
        return <LoadingScreen />;
    }

    return (
        <>
            <main className="container mx-auto px-4 py-8">
                <div className="flex items-center gap-3 mb-8">
                    <div className="w-12 h-12 bg-secondary/10 rounded-xl flex items-center justify-center">
                        {step === 'CART' ? <ShoppingBag className="h-6 w-6 text-secondary" /> : <CreditCard className="h-6 w-6 text-secondary" />}
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold">{step === 'CART' ? 'Meu Carrinho' : 'Pagamento'}</h1>
                        <p className="text-muted-foreground">
                            {step === 'CART' ? `${cartItems.length} itens prontos para serem seus` : `Finalize o pagamento do pedido #${currentOrder?.id.slice(0, 8)}`}
                        </p>
                    </div>
                </div>

                {step === 'CART' ? (
                    cartItems.length > 0 ? (
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                            {/* List ... existing content ... */}
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
                                                    <Button variant="ghost" size="icon" className="text-red-500 hover:bg-red-500/10 rounded-full" onClick={() => removeFromCart(item.id)}>
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
                                            <span>{cartTotal.toLocaleString('pt-AO')} Kz</span>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <span>Frete</span>
                                            <span className="text-green-300 font-bold underline decoration-dotted">Grátis</span>
                                        </div>
                                        <div className="border-t border-white/20 pt-3 flex justify-between">
                                            <span className="font-black text-lg">Total</span>
                                            <span className="font-black text-2xl">{cartTotal.toLocaleString('pt-AO')} Kz</span>
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
                    )
                ) : (
                    <div className="max-w-2xl mx-auto space-y-8 animate-in slide-in-from-bottom-4 duration-500">
                        <Card className="p-8 bg-card/60 border-border backdrop-blur-xl rounded-[2rem]">
                            <div className="mb-8 flex justify-between items-center">
                                <div>
                                    <h2 className="text-2xl font-black">Finalizar Pagamento</h2>
                                    <p className="text-muted-foreground">Escolha o seu método de pagamento preferido</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm text-muted-foreground font-bold uppercase tracking-widest mb-1">Total a Pagar</p>
                                    <p className="text-3xl font-black text-secondary">{cartTotal.toLocaleString('pt-AO')} Kz</p>
                                </div>
                            </div>

                            <MCXPaymentButton
                                orderId={currentOrder?.id}
                                amount={cartTotal}
                                onSuccess={handlePaymentSuccess}
                            />

                            <div className="mt-8 flex items-center gap-4 p-4 bg-muted/30 rounded-2xl">
                                <ShieldCheck className="h-6 w-6 text-green-500" />
                                <p className="text-xs text-muted-foreground italic">
                                    Sua transação está protegida por encriptação ponta-a-ponta.
                                    O vendedor só recebe o valor após a confirmação do sistema.
                                </p>
                            </div>
                        </Card>

                        <Button variant="ghost" onClick={() => setStep('CART')} className="w-full text-muted-foreground">
                            Voltar para o carrinho
                        </Button>
                    </div>
                )}
            </main>
        </>
    );
};

export default CartPage;
