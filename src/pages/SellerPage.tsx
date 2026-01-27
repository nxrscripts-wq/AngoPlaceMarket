import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import {
    Plus,
    Package,
    Clock,
    CheckCircle,
    XCircle,
    AlertCircle,
    ExternalLink,
    Loader2,
    LayoutDashboard,
    TrendingUp,
    ShoppingBag,
    Bell,
    Star,
    Eye,
    Edit,
    BarChart3,
    DollarSign,
    Users,
    Calendar
} from 'lucide-react';
import { format, formatDistanceToNow, subDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { LoadingScreen } from '@/components/LoadingScreen';
import { Product } from '@/types';
import { cn } from '@/lib/utils';

interface Order {
    id: string;
    total: number;
    status: string;
    created_at: string;
    buyer: {
        full_name: string;
        avatar_url: string;
    };
    items: {
        product_id: string;
        quantity: number;
        price: number;
        product: {
            name: string;
            image: string;
        };
    }[];
}

interface Notification {
    id: string;
    type: 'APPROVED' | 'REJECTED' | 'SOLD';
    title: string;
    message: string;
    created_at: string;
    read: boolean;
    product_id?: string;
    product?: {
        name: string;
        image: string;
    };
}

const SellerPage = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [products, setProducts] = useState<Product[]>([]);
    const [orders, setOrders] = useState<Order[]>([]);
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('products');
    const [orderFilter, setOrderFilter] = useState('all');
    const [periodFilter, setPeriodFilter] = useState('30');

    const fetchData = useCallback(async () => {
        if (!user) return;

        try {
            // Fetch products
            const { data: productsData } = await supabase
                .from('products')
                .select('*')
                .eq('seller_id', user.id)
                .order('created_at', { ascending: false });

            setProducts((productsData || []) as Product[]);

            // Fetch orders for seller's products
            const productIds = (productsData || []).map(p => p.id);
            if (productIds.length > 0) {
                const { data: ordersData } = await supabase
                    .from('orders')
                    .select(`
                        id,
                        total,
                        status,
                        created_at,
                        buyer:user_id(full_name, avatar_url),
                        items:order_items(
                            product_id,
                            quantity,
                            price,
                            product:product_id(name, image)
                        )
                    `)
                    .in('order_items.product_id', productIds)
                    .order('created_at', { ascending: false })
                    .limit(50);

                setOrders((ordersData || []) as Order[]);
            }

            // Fetch notifications
            const { data: notificationsData } = await supabase
                .from('notifications')
                .select(`
                    *,
                    product:product_id(name, image)
                `)
                .eq('user_id', user.id)
                .in('type', ['APPROVED', 'REJECTED', 'SOLD'])
                .order('created_at', { ascending: false })
                .limit(30);

            setNotifications((notificationsData || []) as Notification[]);
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setLoading(false);
        }
    }, [user]);

    useEffect(() => {
        if (user) {
            fetchData();
        } else {
            setLoading(false);
        }
    }, [user, fetchData]);

    // Calculate statistics
    const stats = {
        totalProducts: products.length,
        publishedProducts: products.filter(p => p.status === 'PUBLICADO').length,
        pendingProducts: products.filter(p => p.status === 'PENDENTE').length,
        rejectedProducts: products.filter(p => p.status === 'REJEITADO').length,
        totalOrders: orders.length,
        totalRevenue: orders.reduce((sum, o) => sum + (o.total || 0), 0),
        completedOrders: orders.filter(o => o.status === 'delivered').length,
        averageRating: 4.5, // TODO: calculate from reviews
        totalViews: products.reduce((sum, p: any) => sum + (p.views || 0), 0),
    };

    const unreadNotifications = notifications.filter(n => !n.read).length;

    const filteredOrders = orders.filter(order => {
        if (orderFilter === 'all') return true;
        return order.status === orderFilter;
    });

    if (loading) {
        return <LoadingScreen />;
    }

    return (
        <main className="container mx-auto px-4 py-8">
            {/* Header */}
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 mb-8">
                <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-secondary rounded-2xl flex items-center justify-center shadow-lg shadow-secondary/20">
                        <LayoutDashboard className="h-7 w-7 text-secondary-foreground" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-black">Painel do Vendedor</h1>
                        <p className="text-muted-foreground">Gerencie seus produtos e acompanhe suas vendas</p>
                    </div>
                </div>
                <Button
                    onClick={() => navigate('/publish')}
                    className="bg-secondary hover:bg-secondary/90 text-secondary-foreground font-bold h-12 px-6 rounded-xl shadow-lg shadow-secondary/20"
                >
                    <Plus className="mr-2 h-5 w-5" />
                    Novo Anúncio
                </Button>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                <StatCard
                    label="Produtos"
                    value={stats.totalProducts}
                    icon={Package}
                    color="text-secondary"
                    bg="bg-secondary/10"
                />
                <StatCard
                    label="Vendas"
                    value={stats.totalOrders}
                    icon={ShoppingBag}
                    color="text-green-500"
                    bg="bg-green-500/10"
                />
                <StatCard
                    label="Faturamento"
                    value={`${(stats.totalRevenue / 1000).toFixed(0)}k`}
                    icon={DollarSign}
                    color="text-blue-500"
                    bg="bg-blue-500/10"
                    suffix="Kz"
                />
                <StatCard
                    label="Rating"
                    value={stats.averageRating.toFixed(1)}
                    icon={Star}
                    color="text-yellow-500"
                    bg="bg-yellow-500/10"
                    suffix="/5"
                />
            </div>

            {/* Main Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="w-full justify-start bg-muted/50 p-1 mb-6 rounded-xl overflow-x-auto flex-nowrap">
                    <TabsTrigger value="products" className="gap-2 data-[state=active]:bg-background">
                        <Package className="h-4 w-4" />
                        <span className="hidden sm:inline">Produtos</span>
                    </TabsTrigger>
                    <TabsTrigger value="sales" className="gap-2 data-[state=active]:bg-background">
                        <ShoppingBag className="h-4 w-4" />
                        <span className="hidden sm:inline">Vendas</span>
                    </TabsTrigger>
                    <TabsTrigger value="stats" className="gap-2 data-[state=active]:bg-background">
                        <BarChart3 className="h-4 w-4" />
                        <span className="hidden sm:inline">Estatísticas</span>
                    </TabsTrigger>
                    <TabsTrigger value="notifications" className="gap-2 data-[state=active]:bg-background relative">
                        <Bell className="h-4 w-4" />
                        <span className="hidden sm:inline">Notificações</span>
                        {unreadNotifications > 0 && (
                            <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-secondary text-[9px] font-bold text-secondary-foreground">
                                {unreadNotifications}
                            </span>
                        )}
                    </TabsTrigger>
                </TabsList>

                {/* Products Tab */}
                <TabsContent value="products" className="mt-0">
                    <ProductsTab products={products} />
                </TabsContent>

                {/* Sales Tab */}
                <TabsContent value="sales" className="mt-0">
                    <SalesTab orders={filteredOrders} filter={orderFilter} setFilter={setOrderFilter} />
                </TabsContent>

                {/* Statistics Tab */}
                <TabsContent value="stats" className="mt-0">
                    <StatsTab stats={stats} products={products} orders={orders} period={periodFilter} setPeriod={setPeriodFilter} />
                </TabsContent>

                {/* Notifications Tab */}
                <TabsContent value="notifications" className="mt-0">
                    <NotificationsTab notifications={notifications} />
                </TabsContent>
            </Tabs>
        </main>
    );
};

// Stat Card Component
const StatCard = ({ label, value, icon: Icon, color, bg, suffix }: {
    label: string;
    value: number | string;
    icon: any;
    color: string;
    bg: string;
    suffix?: string;
}) => (
    <Card className="bg-card/50 border-border p-4 rounded-xl hover:border-secondary/50 transition-colors">
        <div className="flex items-center justify-between">
            <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{label}</p>
                <h3 className={`text-2xl font-black ${color}`}>
                    {value}{suffix && <span className="text-base font-medium ml-0.5">{suffix}</span>}
                </h3>
            </div>
            <div className={`p-3 ${bg} rounded-xl`}>
                <Icon className={`h-5 w-5 ${color}`} />
            </div>
        </div>
    </Card>
);

// Products Tab
const ProductsTab = ({ products }: { products: Product[] }) => {
    const navigate = useNavigate();
    const [statusFilter, setStatusFilter] = useState('all');

    const filteredProducts = products.filter(p => {
        if (statusFilter === 'all') return true;
        return p.status === statusFilter;
    });

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'PUBLICADO':
                return <Badge className="bg-green-500/10 text-green-500 border-green-500/20">Publicado</Badge>;
            case 'PENDENTE':
                return <Badge className="bg-yellow-500/10 text-yellow-500 border-yellow-500/20">Em Análise</Badge>;
            case 'REJEITADO':
                return <Badge variant="destructive">Rejeitado</Badge>;
            default:
                return <Badge variant="outline">{status}</Badge>;
        }
    };

    return (
        <div className="space-y-6">
            {/* Filter */}
            <div className="flex items-center justify-between">
                <div className="flex gap-2">
                    {['all', 'PUBLICADO', 'PENDENTE', 'REJEITADO'].map((status) => (
                        <Button
                            key={status}
                            variant={statusFilter === status ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => setStatusFilter(status)}
                            className={cn(
                                "rounded-full",
                                statusFilter === status && "bg-secondary hover:bg-secondary/90"
                            )}
                        >
                            {status === 'all' ? 'Todos' : status === 'PUBLICADO' ? 'Publicados' : status === 'PENDENTE' ? 'Pendentes' : 'Rejeitados'}
                            <span className="ml-1.5 text-xs opacity-70">
                                ({status === 'all' ? products.length : products.filter(p => p.status === status).length})
                            </span>
                        </Button>
                    ))}
                </div>
            </div>

            {/* Products Grid */}
            {filteredProducts.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {filteredProducts.map((product) => (
                        <Card key={product.id} className="overflow-hidden border-border bg-card/50 hover:border-secondary/50 transition-all group">
                            <div className="relative aspect-[4/3]">
                                <img src={product.image} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                                <div className="absolute top-2 right-2">
                                    {getStatusBadge(product.status)}
                                </div>
                            </div>
                            <CardContent className="p-4">
                                <h4 className="font-semibold truncate mb-1">{product.name}</h4>
                                <p className="text-lg font-bold text-secondary mb-3">
                                    {Number(product.price).toLocaleString('pt-AO')} Kz
                                </p>
                                <div className="flex items-center justify-between text-xs text-muted-foreground mb-3">
                                    <span className="flex items-center gap-1">
                                        <Eye className="h-3 w-3" />
                                        {(product as any).views || 0} views
                                    </span>
                                    <span>{format(new Date(product.created_at), "dd/MM/yy")}</span>
                                </div>
                                <div className="flex gap-2">
                                    {product.status === 'PUBLICADO' && (
                                        <Button variant="ghost" size="sm" className="flex-1" onClick={() => navigate(`/produto/${product.id}`)}>
                                            <ExternalLink className="h-4 w-4 mr-1" />
                                            Ver
                                        </Button>
                                    )}
                                    <Button variant="outline" size="sm" className="flex-1">
                                        <Edit className="h-4 w-4 mr-1" />
                                        Editar
                                    </Button>
                                </div>
                                {product.status === 'REJEITADO' && (
                                    <div className="mt-3 p-2 bg-red-500/10 rounded-lg flex items-center gap-2 border border-red-500/20">
                                        <AlertCircle className="h-3 w-3 text-red-500" />
                                        <p className="text-[10px] text-red-500">Veja o motivo nas notificações</p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    ))}
                </div>
            ) : (
                <EmptyState />
            )}
        </div>
    );
};

// Sales Tab
const SalesTab = ({ orders, filter, setFilter }: { orders: Order[]; filter: string; setFilter: (f: string) => void }) => {
    const getStatusBadge = (status: string) => {
        const statusMap: Record<string, { label: string; className: string }> = {
            'pending': { label: 'Pendente', className: 'bg-yellow-500/10 text-yellow-500' },
            'paid': { label: 'Pago', className: 'bg-blue-500/10 text-blue-500' },
            'shipped': { label: 'Enviado', className: 'bg-purple-500/10 text-purple-500' },
            'delivered': { label: 'Entregue', className: 'bg-green-500/10 text-green-500' },
            'cancelled': { label: 'Cancelado', className: 'bg-red-500/10 text-red-500' },
        };
        const s = statusMap[status] || { label: status, className: 'bg-muted' };
        return <Badge className={s.className}>{s.label}</Badge>;
    };

    return (
        <div className="space-y-6">
            {/* Filter */}
            <div className="flex items-center gap-4">
                <Select value={filter} onValueChange={setFilter}>
                    <SelectTrigger className="w-48">
                        <SelectValue placeholder="Filtrar por status" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">Todos os pedidos</SelectItem>
                        <SelectItem value="pending">Pendentes</SelectItem>
                        <SelectItem value="paid">Pagos</SelectItem>
                        <SelectItem value="shipped">Enviados</SelectItem>
                        <SelectItem value="delivered">Entregues</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            {/* Orders List */}
            {orders.length > 0 ? (
                <div className="space-y-4">
                    {orders.map((order) => (
                        <Card key={order.id} className="p-4">
                            <div className="flex items-start gap-4">
                                <Avatar className="h-10 w-10">
                                    <AvatarImage src={order.buyer?.avatar_url} />
                                    <AvatarFallback>{order.buyer?.full_name?.substring(0, 2).toUpperCase()}</AvatarFallback>
                                </Avatar>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between gap-2 mb-1">
                                        <h4 className="font-semibold">{order.buyer?.full_name || 'Comprador'}</h4>
                                        {getStatusBadge(order.status)}
                                    </div>
                                    <div className="flex items-center gap-4 text-sm text-muted-foreground mb-2">
                                        <span>Pedido #{order.id.substring(0, 8)}</span>
                                        <span>{formatDistanceToNow(new Date(order.created_at), { addSuffix: true, locale: ptBR })}</span>
                                    </div>
                                    {order.items && order.items.length > 0 && (
                                        <div className="flex gap-2 overflow-x-auto pb-2">
                                            {order.items.map((item, i) => (
                                                <div key={i} className="flex items-center gap-2 bg-muted/50 rounded-lg p-2 shrink-0">
                                                    <img src={item.product?.image} alt="" className="w-8 h-8 rounded object-cover" />
                                                    <div className="text-xs">
                                                        <p className="font-medium truncate max-w-[120px]">{item.product?.name}</p>
                                                        <p className="text-muted-foreground">{item.quantity}x {Number(item.price).toLocaleString()} Kz</p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                                <div className="text-right">
                                    <p className="text-lg font-bold text-secondary">{Number(order.total).toLocaleString()} Kz</p>
                                </div>
                            </div>
                        </Card>
                    ))}
                </div>
            ) : (
                <Card className="p-12 text-center bg-muted/20">
                    <ShoppingBag className="h-12 w-12 mx-auto text-muted-foreground/30 mb-4" />
                    <h3 className="font-bold mb-2">Nenhuma venda encontrada</h3>
                    <p className="text-sm text-muted-foreground">Suas vendas aparecerão aqui</p>
                </Card>
            )}
        </div>
    );
};

// Statistics Tab
const StatsTab = ({ stats, products, orders, period, setPeriod }: {
    stats: any;
    products: Product[];
    orders: Order[];
    period: string;
    setPeriod: (p: string) => void;
}) => {
    const topProducts = products
        .filter(p => p.status === 'PUBLICADO')
        .sort((a: any, b: any) => (b.views || 0) - (a.views || 0))
        .slice(0, 5);

    return (
        <div className="space-y-6">
            {/* Period Filter */}
            <div className="flex items-center gap-4">
                <Select value={period} onValueChange={setPeriod}>
                    <SelectTrigger className="w-48">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="7">Últimos 7 dias</SelectItem>
                        <SelectItem value="30">Últimos 30 dias</SelectItem>
                        <SelectItem value="90">Últimos 90 dias</SelectItem>
                        <SelectItem value="365">Último ano</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Revenue Card */}
                <Card className="p-6 col-span-1 md:col-span-2 lg:col-span-1">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-3 bg-green-500/10 rounded-xl">
                            <DollarSign className="h-6 w-6 text-green-500" />
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">Faturamento Total</p>
                            <h3 className="text-2xl font-black text-green-500">
                                {stats.totalRevenue.toLocaleString('pt-AO')} Kz
                            </h3>
                        </div>
                    </div>
                    <Separator className="my-4" />
                    <div className="grid grid-cols-2 gap-4 text-center">
                        <div>
                            <p className="text-2xl font-bold">{stats.totalOrders}</p>
                            <p className="text-xs text-muted-foreground">Pedidos</p>
                        </div>
                        <div>
                            <p className="text-2xl font-bold">{stats.completedOrders}</p>
                            <p className="text-xs text-muted-foreground">Entregues</p>
                        </div>
                    </div>
                </Card>

                {/* Products Performance */}
                <Card className="p-6">
                    <h4 className="font-bold mb-4 flex items-center gap-2">
                        <Package className="h-4 w-4 text-secondary" />
                        Desempenho de Produtos
                    </h4>
                    <div className="space-y-3">
                        <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Total de produtos</span>
                            <span className="font-bold">{stats.totalProducts}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Publicados</span>
                            <span className="font-bold text-green-500">{stats.publishedProducts}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Em análise</span>
                            <span className="font-bold text-yellow-500">{stats.pendingProducts}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Visualizações totais</span>
                            <span className="font-bold">{stats.totalViews}</span>
                        </div>
                    </div>
                </Card>

                {/* Rating Card */}
                <Card className="p-6">
                    <h4 className="font-bold mb-4 flex items-center gap-2">
                        <Star className="h-4 w-4 text-yellow-500" />
                        Sua Reputação
                    </h4>
                    <div className="text-center py-4">
                        <div className="text-4xl font-black text-yellow-500 mb-2">
                            {stats.averageRating.toFixed(1)}
                        </div>
                        <div className="flex justify-center gap-1 mb-2">
                            {[1, 2, 3, 4, 5].map((i) => (
                                <Star key={i} className={cn("h-5 w-5", i <= Math.round(stats.averageRating) ? "fill-yellow-400 text-yellow-500" : "text-muted")} />
                            ))}
                        </div>
                        <p className="text-sm text-muted-foreground">baseado em {stats.completedOrders} avaliações</p>
                    </div>
                </Card>
            </div>

            {/* Top Products */}
            <Card className="p-6">
                <h4 className="font-bold mb-4 flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-secondary" />
                    Produtos Mais Visualizados
                </h4>
                {topProducts.length > 0 ? (
                    <div className="space-y-3">
                        {topProducts.map((product, i) => (
                            <div key={product.id} className="flex items-center gap-3">
                                <span className="text-lg font-bold text-muted-foreground w-6">{i + 1}</span>
                                <img src={product.image} alt="" className="w-10 h-10 rounded-lg object-cover" />
                                <div className="flex-1 min-w-0">
                                    <p className="font-medium truncate">{product.name}</p>
                                    <p className="text-sm text-muted-foreground">{Number(product.price).toLocaleString()} Kz</p>
                                </div>
                                <div className="text-right">
                                    <p className="font-bold">{(product as any).views || 0}</p>
                                    <p className="text-xs text-muted-foreground">views</p>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-center text-muted-foreground py-8">Nenhum produto publicado ainda</p>
                )}
            </Card>
        </div>
    );
};

// Notifications Tab
const NotificationsTab = ({ notifications }: { notifications: Notification[] }) => {
    const navigate = useNavigate();

    const getNotificationIcon = (type: string) => {
        switch (type) {
            case 'APPROVED':
                return <CheckCircle className="h-5 w-5 text-green-500" />;
            case 'REJECTED':
                return <XCircle className="h-5 w-5 text-red-500" />;
            case 'SOLD':
                return <ShoppingBag className="h-5 w-5 text-blue-500" />;
            default:
                return <Bell className="h-5 w-5 text-muted-foreground" />;
        }
    };

    const getNotificationBg = (type: string) => {
        switch (type) {
            case 'APPROVED':
                return 'bg-green-500/10 border-green-500/20';
            case 'REJECTED':
                return 'bg-red-500/10 border-red-500/20';
            case 'SOLD':
                return 'bg-blue-500/10 border-blue-500/20';
            default:
                return 'bg-muted/50';
        }
    };

    return (
        <div className="space-y-4">
            {notifications.length > 0 ? (
                notifications.map((notification) => (
                    <Card
                        key={notification.id}
                        className={cn(
                            "p-4 border transition-colors",
                            getNotificationBg(notification.type),
                            !notification.read && "ring-2 ring-secondary/20"
                        )}
                    >
                        <div className="flex items-start gap-4">
                            <div className="p-2 bg-background rounded-lg">
                                {getNotificationIcon(notification.type)}
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between gap-2 mb-1">
                                    <h4 className="font-semibold">{notification.title}</h4>
                                    <span className="text-xs text-muted-foreground shrink-0">
                                        {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true, locale: ptBR })}
                                    </span>
                                </div>
                                <p className="text-sm text-muted-foreground mb-3">{notification.message}</p>

                                {notification.product && (
                                    <div className="flex items-center gap-3 p-2 bg-background/50 rounded-lg">
                                        <img src={notification.product.image} alt="" className="w-10 h-10 rounded object-cover" />
                                        <span className="text-sm font-medium truncate">{notification.product.name}</span>
                                        {notification.type === 'REJECTED' && (
                                            <Button size="sm" variant="outline" className="ml-auto shrink-0">
                                                <Edit className="h-3 w-3 mr-1" />
                                                Editar
                                            </Button>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    </Card>
                ))
            ) : (
                <Card className="p-12 text-center bg-muted/20">
                    <Bell className="h-12 w-12 mx-auto text-muted-foreground/30 mb-4" />
                    <h3 className="font-bold mb-2">Nenhuma notificação</h3>
                    <p className="text-sm text-muted-foreground">Suas notificações de aprovação e vendas aparecerão aqui</p>
                </Card>
            )}
        </div>
    );
};

// Empty State Component
const EmptyState = () => {
    const navigate = useNavigate();
    return (
        <Card className="p-12 text-center bg-muted/20 border-border">
            <div className="flex justify-center mb-6">
                <Package className="h-16 w-16 text-muted-foreground/30" />
            </div>
            <h3 className="text-xl font-bold mb-2">Sem produtos publicados</h3>
            <p className="text-muted-foreground mb-8 max-w-sm mx-auto">
                Você ainda não tem nenhum produto anunciado. Comece a vender agora!
            </p>
            <Button onClick={() => navigate('/publish')} className="bg-secondary hover:bg-secondary/90">
                <Plus className="mr-2 h-5 w-5" />
                Criar Primeiro Anúncio
            </Button>
        </Card>
    );
};

export default SellerPage;
