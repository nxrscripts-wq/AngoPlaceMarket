import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
    Plus,
    Package,
    Clock,
    CheckCircle,
    XCircle,
    AlertCircle,
    ExternalLink,
    Loader2,
    LayoutDashboard
} from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { LoadingScreen } from '@/components/LoadingScreen';
import { Product } from '@/types';


const SellerPage = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchUserProducts = useCallback(async () => {
        try {
            const { data, error } = await supabase
                .from('products')
                .select('*')
                .eq('seller_id', user?.id)
                .order('created_at', { ascending: false });

            if (error) throw error;
            setProducts((data || []) as Product[]);
        } catch (error) {
            console.error('Error fetching products:', error);
        } finally {
            setLoading(false);
        }
    }, [user]);

    useEffect(() => {
        if (user) {
            fetchUserProducts();
        } else {
            setLoading(false);
        }
    }, [user, fetchUserProducts]);

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'PUBLICADO':
                return <Badge className="bg-green-500 hover:bg-green-600">Publicado</Badge>;
            case 'PENDENTE':
                return <Badge variant="secondary" className="bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500/20 border-yellow-500/20">Pendente</Badge>;
            case 'REJEITADO':
                return <Badge variant="destructive">Rejeitado</Badge>;
            default:
                return <Badge variant="outline">{status}</Badge>;
        }
    };

    if (loading) {
        return <LoadingScreen />;
    }

    const stats = {
        total: products.length,
        published: products.filter(p => p.status === 'PUBLICADO').length,
        pending: products.filter(p => p.status === 'PENDENTE').length,
        rejected: products.filter(p => p.status === 'REJEITADO').length,
    };

    return (
        <div className="min-h-screen bg-background">
            <Header />
            <main className="container mx-auto px-4 py-8">
                <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8 mb-12 border-b border-border pb-12">
                    <div className="flex items-center gap-4">
                        <div className="w-16 h-16 bg-secondary rounded-[2rem] flex items-center justify-center shadow-xl shadow-secondary/20">
                            <LayoutDashboard className="h-8 w-8 text-secondary-foreground" />
                        </div>
                        <div>
                            <h1 className="text-4xl font-black">Vendedor de Produtos</h1>
                            <p className="text-muted-foreground text-lg">Seu hardware, suas vendas, seu sucesso.</p>
                        </div>
                    </div>
                    <Button
                        onClick={() => navigate('/publish')}
                        className="bg-secondary hover:bg-secondary/90 text-secondary-foreground font-black h-16 px-10 rounded-2xl shadow-2xl shadow-secondary/30 transition-all hover:scale-[1.02] active:scale-95 text-lg"
                    >
                        <Plus className="mr-3 h-6 w-6" />
                        Criar Novo Anúncio
                    </Button>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                    {[
                        { label: 'Total de Anúncios', value: stats.total, icon: Package, color: 'text-secondary', bg: 'bg-secondary/10' },
                        { label: 'Publicados', value: stats.published, icon: CheckCircle, color: 'text-green-500', bg: 'bg-green-500/10' },
                        { label: 'Em Análise', value: stats.pending, icon: Clock, color: 'text-yellow-500', bg: 'bg-yellow-500/10' },
                        { label: 'Rejeitados', value: stats.rejected, icon: XCircle, color: 'text-red-500', bg: 'bg-red-500/10' },
                    ].map((stat, i) => (
                        <Card key={i} className="bg-card/40 border-border p-8 rounded-3xl hover:border-secondary transition-all group">
                            <div className="flex items-center justify-between">
                                <div className="space-y-1">
                                    <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest">{stat.label}</p>
                                    <h3 className={`text-4xl font-black ${stat.color}`}>{stat.value}</h3>
                                </div>
                                <div className={`p-4 ${stat.bg} rounded-2xl transition-transform group-hover:scale-110`}>
                                    <stat.icon className={`h-8 w-8 ${stat.color}`} />
                                </div>
                            </div>
                        </Card>
                    ))}
                </div>

                <Tabs defaultValue="all" className="w-full">
                    <TabsList className="bg-muted/50 p-1 mb-6">
                        <TabsTrigger value="all">Todos</TabsTrigger>
                        <TabsTrigger value="published">Publicados</TabsTrigger>
                        <TabsTrigger value="pending">Em Análise</TabsTrigger>
                        <TabsTrigger value="rejected">Rejeitados</TabsTrigger>
                    </TabsList>

                    <TabsContent value="all" className="mt-0">
                        {products.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {products.map((product) => (
                                    <ProductCardSeller key={product.id} product={product} />
                                ))}
                            </div>
                        ) : (
                            <EmptyState />
                        )}
                    </TabsContent>

                    <TabsContent value="published" className="mt-0">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {products.filter(p => p.status === 'PUBLICADO').map((product) => (
                                <ProductCardSeller key={product.id} product={product} />
                            ))}
                        </div>
                    </TabsContent>

                    <TabsContent value="pending" className="mt-0">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {products.filter(p => p.status === 'PENDENTE').map((product) => (
                                <ProductCardSeller key={product.id} product={product} />
                            ))}
                        </div>
                    </TabsContent>

                    <TabsContent value="rejected" className="mt-0">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {products.filter(p => p.status === 'REJEITADO').map((product) => (
                                <ProductCardSeller key={product.id} product={product} />
                            ))}
                        </div>
                    </TabsContent>
                </Tabs>
            </main>
            <Footer />
        </div>
    );
};

const ProductCardSeller = ({ product }: { product: Product }) => {
    const navigate = useNavigate();

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'PUBLICADO':
                return <Badge className="bg-green-500 hover:bg-green-600">Publicado</Badge>;
            case 'PENDENTE':
                return <Badge variant="secondary" className="bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500/20 border-yellow-500/20">Em Análise</Badge>;
            case 'REJEITADO':
                return <Badge variant="destructive">Rejeitado</Badge>;
            default:
                return <Badge variant="outline">{status}</Badge>;
        }
    };

    return (
        <Card className="overflow-hidden border-border bg-card/50 hover:border-secondary/50 transition-colors">
            <div className="relative aspect-video">
                <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                <div className="absolute top-2 right-2">
                    {getStatusBadge(product.status)}
                </div>
            </div>
            <CardHeader className="p-4">
                <CardTitle className="text-lg truncate">{product.name}</CardTitle>
                <CardDescription className="flex items-center gap-1">
                    Publicado em {format(new Date(product.created_at), "d 'de' MMMM", { locale: ptBR })}
                </CardDescription>
            </CardHeader>
            <CardContent className="p-4 pt-0">
                <div className="flex items-center justify-between">
                    <p className="text-xl font-bold text-secondary">{Number(product.price).toLocaleString('pt-AO')} Kz</p>
                    <div className="flex gap-2">
                        {product.status === 'PUBLICADO' && (
                            <Button variant="ghost" size="icon" onClick={() => navigate(`/product/${product.id}`)}>
                                <ExternalLink className="h-5 w-5" />
                            </Button>
                        )}
                        <Button variant="outline" size="sm">Editar</Button>
                    </div>
                </div>
                {product.status === 'REJEITADO' && (
                    <div className="mt-3 p-3 bg-red-500/10 rounded-lg flex items-start gap-2 border border-red-500/20">
                        <AlertCircle className="h-4 w-4 text-red-500 mt-0.5" />
                        <p className="text-xs text-red-600">Motivo da rejeição disponível nas suas notificações.</p>
                    </div>
                )}
            </CardContent>
        </Card>
    );
};

const EmptyState = () => {
    const navigate = useNavigate();
    return (
        <Card className="p-12 text-center bg-muted/20 border-border">
            <div className="flex justify-center mb-6">
                <Package className="h-16 w-16 text-muted-foreground/30" />
            </div>
            <h3 className="text-xl font-bold mb-2">Sem produtos publicados</h3>
            <p className="text-muted-foreground mb-8 max-w-sm mx-auto">
                Você ainda não tem nenhum hardware anunciado. Comece a vender agora mesmo!
            </p>
            <Button onClick={() => navigate('/publish')} className="bg-secondary hover:bg-secondary/90">
                <Plus className="mr-2 h-5 w-5" />
                Criar Primeiro Anúncio
            </Button>
        </Card>
    );
};

export default SellerPage;
