import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    Package,
    Truck,
    CheckCircle2,
    Clock,
    ExternalLink,
    Loader2,
    ShoppingBag,
    Search
} from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Order, OrderItem } from '@/types';


const OrdersPage = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchOrders = useCallback(async () => {
        try {
            const { data, error } = await supabase
                .from('orders')
                .select('*, order_items(*)')
                .eq('user_id', user?.id)
                .order('created_at', { ascending: false });

            if (error) throw error;
            setOrders((data || []) as Order[]);
        } catch (error) {
            console.error('Error fetching orders:', error);
        } finally {
            setLoading(false);
        }
    }, [user]);

    useEffect(() => {
        if (user) {
            fetchOrders();
        } else {
            setLoading(false);
        }
    }, [user, fetchOrders]);

    const getStatusBadge = (status: string) => {
        switch (status.toLowerCase()) {
            case 'completed':
            case 'entregue':
                return <Badge className="bg-green-500 hover:bg-green-600 text-white"><CheckCircle2 className="w-3 h-3 mr-1" /> Entregue</Badge>;
            case 'pending':
            case 'pendente':
                return <Badge className="bg-yellow-500 hover:bg-yellow-600 text-white"><Clock className="w-3 h-3 mr-1" /> Pendente</Badge>;
            case 'shipped':
            case 'enviado':
                return <Badge className="bg-blue-500 hover:bg-blue-600 text-white"><Truck className="w-3 h-3 mr-1" /> Em Caminho</Badge>;
            default:
                return <Badge variant="secondary">{status}</Badge>;
        }
    };

    return (
        <div className="min-h-screen bg-background text-card-foreground">
            <Header />

            <main className="container mx-auto px-4 py-12">
                <div className="max-w-4xl mx-auto space-y-8">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                        <div className="space-y-2">
                            <h1 className="text-4xl font-black flex items-center gap-3">
                                <Package className="h-10 w-10 text-secondary" />
                                Meus Pedidos
                            </h1>
                            <p className="text-muted-foreground">Acompanhe o histórico de todas as suas compras na AngoPlace.</p>
                        </div>
                        <div className="relative group min-w-[300px]">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <input
                                placeholder="Pesquisar pedido..."
                                className="w-full h-12 pl-10 pr-4 rounded-xl bg-card border border-border focus:border-secondary transition-all outline-none"
                            />
                        </div>
                    </div>

                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-20 space-y-4">
                            <Loader2 className="h-12 w-12 animate-spin text-secondary" />
                            <p className="text-muted-foreground font-bold">Carregando seus pedidos...</p>
                        </div>
                    ) : orders.length > 0 ? (
                        <div className="space-y-6">
                            {orders.map((order) => (
                                <Card key={order.id} className="bg-card/40 border-border overflow-hidden group hover:border-secondary/30 transition-all shadow-lg hover:shadow-2xl hover:shadow-secondary/5">
                                    <div className="p-6 md:p-8 space-y-6">
                                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border pb-6">
                                            <div className="space-y-1">
                                                <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Número do Pedido</p>
                                                <p className="font-mono text-lg font-bold">#{order.id.slice(0, 8).toUpperCase()}</p>
                                            </div>
                                            <div className="space-y-1">
                                                <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Data da Compra</p>
                                                <p className="font-bold">
                                                    {order.created_at ? format(new Date(order.created_at), "d 'de' MMMM, yyyy", { locale: ptBR }) : 'N/A'}
                                                </p>
                                            </div>
                                            <div className="space-y-1">
                                                <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Total</p>
                                                <p className="font-black text-secondary text-xl font-mono">{Number(order.total || 0).toLocaleString('pt-AO')} Kz</p>
                                            </div>
                                            <div className="flex items-center gap-4">
                                                {getStatusBadge(order.status || 'pending')}
                                                <Button size="icon" variant="ghost" className="rounded-full hover:bg-secondary/10 hover:text-secondary">
                                                    <ExternalLink className="h-5 w-5" />
                                                </Button>
                                            </div>
                                        </div>

                                        <div className="space-y-4">
                                            {(order.order_items || []).map((item: OrderItem, i: number) => (
                                                <div key={i} className="flex items-center gap-4 py-2">
                                                    <div className="w-16 h-16 bg-white rounded-xl flex items-center justify-center shrink-0 border border-border">
                                                        <ShoppingBag className="h-6 w-6 text-muted-foreground" />
                                                    </div>
                                                    <div className="flex-1">
                                                        <h4 className="font-bold line-clamp-1">{item.product_name || 'Produto sem nome'}</h4>
                                                        <p className="text-sm text-muted-foreground">Quantidade: {item.quantity}</p>
                                                    </div>
                                                    <p className="font-bold">{Number(item.product_price || 0).toLocaleString('pt-AO')} Kz</p>
                                                </div>
                                            ))}
                                        </div>

                                        <div className="flex justify-end pt-4 gap-4">
                                            <Button variant="outline" className="rounded-xl font-bold h-12" onClick={() => order.order_items?.[0]?.product_id && navigate(`/product/${order.order_items[0].product_id}`)}>
                                                Comprar Novamente
                                            </Button>
                                            <Button className="bg-secondary text-secondary-foreground rounded-xl font-bold h-12 px-8" onClick={() => navigate(`/track/${order.id}`)}>
                                                Rastrear Entrega
                                            </Button>
                                        </div>
                                    </div>
                                </Card>
                            ))}
                        </div>
                    ) : (
                        <Card className="text-center py-20 bg-muted/20 border-border border-dashed border-2 rounded-3xl">
                            <ShoppingBag className="h-24 w-24 text-muted-foreground/20 mx-auto mb-6" />
                            <h3 className="text-2xl font-black mb-2">Ainda não tem pedidos</h3>
                            <p className="text-muted-foreground mb-10 max-w-sm mx-auto">
                                Você ainda não realizou nenhuma compra. Explore os nossos produtos e encontre o hardware perfeito para você.
                            </p>
                            <Button onClick={() => navigate('/')} className="bg-secondary text-secondary-foreground font-black px-12 h-16 rounded-2xl shadow-xl shadow-secondary/20 transition-transform active:scale-95 text-lg">
                                Começar a Comprar
                            </Button>
                        </Card>
                    )}
                </div>
            </main>

            <Footer />
        </div>
    );
};

export default OrdersPage;
