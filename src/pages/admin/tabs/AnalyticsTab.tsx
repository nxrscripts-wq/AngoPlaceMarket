import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
    BarChart3, TrendingUp, AlertTriangle, Clock, Users, ShoppingCart,
    Eye, Search, MessageCircle, Star, RefreshCcw, Loader2,
    Smartphone, Monitor, Tablet, CheckCircle, XCircle
} from 'lucide-react';

interface FunnelData {
    stage: string;
    count: number;
}

interface ErrorLog {
    id: string;
    error_type: string;
    error_message: string;
    component: string;
    severity: string;
    page_path: string;
    resolved: boolean;
    created_at: string;
}

interface PerformanceMetric {
    metric_type: string;
    avg_value: number;
    count: number;
}

export const AnalyticsTab = () => {
    const [loading, setLoading] = useState(true);
    const [period, setPeriod] = useState('7d');
    const [stats, setStats] = useState({
        totalEvents: 0,
        pageViews: 0,
        productViews: 0,
        addToCarts: 0,
        checkouts: 0,
        searches: 0,
        conversionRate: 0
    });
    const [funnelData, setFunnelData] = useState<FunnelData[]>([]);
    const [errors, setErrors] = useState<ErrorLog[]>([]);
    const [performance, setPerformance] = useState<PerformanceMetric[]>([]);
    const [deviceBreakdown, setDeviceBreakdown] = useState<Record<string, number>>({});

    const fetchAnalytics = async () => {
        setLoading(true);

        const days = period === '24h' ? 1 : period === '7d' ? 7 : 30;
        const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();

        try {
            // Fetch event counts
            const { data: events } = await supabase
                .from('analytics_events')
                .select('event_type, device_type')
                .gte('created_at', since);

            if (events) {
                const eventCounts = events.reduce((acc, e) => {
                    acc[e.event_type] = (acc[e.event_type] || 0) + 1;
                    return acc;
                }, {} as Record<string, number>);

                const deviceCounts = events.reduce((acc, e) => {
                    if (e.device_type) {
                        acc[e.device_type] = (acc[e.device_type] || 0) + 1;
                    }
                    return acc;
                }, {} as Record<string, number>);

                setDeviceBreakdown(deviceCounts);
                setStats({
                    totalEvents: events.length,
                    pageViews: eventCounts['page_view'] || 0,
                    productViews: eventCounts['product_view'] || 0,
                    addToCarts: eventCounts['add_to_cart'] || 0,
                    checkouts: eventCounts['checkout_complete'] || 0,
                    searches: eventCounts['search'] || 0,
                    conversionRate: eventCounts['page_view']
                        ? ((eventCounts['checkout_complete'] || 0) / eventCounts['page_view'] * 100)
                        : 0
                });
            }

            // Fetch funnel data
            const { data: funnel } = await supabase
                .from('funnel_events')
                .select('stage')
                .gte('created_at', since);

            if (funnel) {
                const stages = ['landing', 'browse', 'product_view', 'add_cart', 'cart_view',
                    'checkout_start', 'payment_init', 'payment_complete', 'order_confirm'];

                const funnelCounts = stages.map(stage => ({
                    stage,
                    count: funnel.filter(f => f.stage === stage).length
                }));
                setFunnelData(funnelCounts);
            }

            // Fetch errors
            const { data: errorLogs } = await supabase
                .from('error_logs')
                .select('*')
                .order('created_at', { ascending: false })
                .limit(20);

            setErrors(errorLogs || []);

            // Fetch performance averages
            const { data: perf } = await supabase
                .from('performance_metrics')
                .select('metric_type, value')
                .gte('created_at', since);

            if (perf) {
                const perfByType = perf.reduce((acc, p) => {
                    if (!acc[p.metric_type]) {
                        acc[p.metric_type] = { total: 0, count: 0 };
                    }
                    acc[p.metric_type].total += p.value;
                    acc[p.metric_type].count += 1;
                    return acc;
                }, {} as Record<string, { total: number; count: number }>);

                setPerformance(Object.entries(perfByType).map(([type, data]) => ({
                    metric_type: type,
                    avg_value: Math.round(data.total / data.count),
                    count: data.count
                })));
            }

        } catch (error) {
            console.error('Error fetching analytics:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAnalytics();
    }, [period]);

    const resolveError = async (id: string) => {
        await supabase.from('error_logs').update({ resolved: true }).eq('id', id);
        fetchAnalytics();
    };

    const stageLabels: Record<string, string> = {
        landing: 'Entrada',
        browse: 'Navegação',
        product_view: 'Ver Produto',
        add_cart: 'Adicionar',
        cart_view: 'Carrinho',
        checkout_start: 'Checkout',
        payment_init: 'Pagamento',
        payment_complete: 'Pago',
        order_confirm: 'Confirmado'
    };

    const maxFunnel = Math.max(...funnelData.map(f => f.count), 1);

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold">Analytics</h2>
                    <p className="text-muted-foreground">Monitoramento e métricas da plataforma</p>
                </div>
                <div className="flex items-center gap-3">
                    <Select value={period} onValueChange={setPeriod}>
                        <SelectTrigger className="w-32">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="24h">24 horas</SelectItem>
                            <SelectItem value="7d">7 dias</SelectItem>
                            <SelectItem value="30d">30 dias</SelectItem>
                        </SelectContent>
                    </Select>
                    <Button variant="outline" size="icon" onClick={fetchAnalytics} disabled={loading}>
                        <RefreshCcw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                    </Button>
                </div>
            </div>

            {loading ? (
                <div className="flex justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
            ) : (
                <Tabs defaultValue="overview" className="space-y-6">
                    <TabsList>
                        <TabsTrigger value="overview"><BarChart3 className="h-4 w-4 mr-2" />Visão Geral</TabsTrigger>
                        <TabsTrigger value="funnel"><TrendingUp className="h-4 w-4 mr-2" />Funil</TabsTrigger>
                        <TabsTrigger value="errors"><AlertTriangle className="h-4 w-4 mr-2" />Erros</TabsTrigger>
                        <TabsTrigger value="performance"><Clock className="h-4 w-4 mr-2" />Performance</TabsTrigger>
                    </TabsList>

                    {/* Overview Tab */}
                    <TabsContent value="overview" className="space-y-6">
                        {/* Stats Grid */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <Card className="p-4">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-blue-500/10 rounded-lg">
                                        <Eye className="h-5 w-5 text-blue-500" />
                                    </div>
                                    <div>
                                        <p className="text-2xl font-bold">{stats.pageViews}</p>
                                        <p className="text-xs text-muted-foreground">Page Views</p>
                                    </div>
                                </div>
                            </Card>
                            <Card className="p-4">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-purple-500/10 rounded-lg">
                                        <Search className="h-5 w-5 text-purple-500" />
                                    </div>
                                    <div>
                                        <p className="text-2xl font-bold">{stats.searches}</p>
                                        <p className="text-xs text-muted-foreground">Pesquisas</p>
                                    </div>
                                </div>
                            </Card>
                            <Card className="p-4">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-orange-500/10 rounded-lg">
                                        <ShoppingCart className="h-5 w-5 text-orange-500" />
                                    </div>
                                    <div>
                                        <p className="text-2xl font-bold">{stats.addToCarts}</p>
                                        <p className="text-xs text-muted-foreground">Add to Cart</p>
                                    </div>
                                </div>
                            </Card>
                            <Card className="p-4">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-green-500/10 rounded-lg">
                                        <TrendingUp className="h-5 w-5 text-green-500" />
                                    </div>
                                    <div>
                                        <p className="text-2xl font-bold">{stats.conversionRate.toFixed(1)}%</p>
                                        <p className="text-xs text-muted-foreground">Conversão</p>
                                    </div>
                                </div>
                            </Card>
                        </div>

                        {/* Device Breakdown */}
                        <Card className="p-6">
                            <h3 className="font-semibold mb-4">Dispositivos</h3>
                            <div className="flex gap-6">
                                {Object.entries(deviceBreakdown).map(([device, count]) => (
                                    <div key={device} className="flex items-center gap-3">
                                        {device === 'mobile' && <Smartphone className="h-5 w-5 text-muted-foreground" />}
                                        {device === 'tablet' && <Tablet className="h-5 w-5 text-muted-foreground" />}
                                        {device === 'desktop' && <Monitor className="h-5 w-5 text-muted-foreground" />}
                                        <div>
                                            <p className="font-medium capitalize">{device}</p>
                                            <p className="text-sm text-muted-foreground">{count} eventos</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </Card>
                    </TabsContent>

                    {/* Funnel Tab */}
                    <TabsContent value="funnel">
                        <Card className="p-6">
                            <h3 className="font-semibold mb-6">Funil de Compra</h3>
                            <div className="space-y-3">
                                {funnelData.map((stage, idx) => (
                                    <div key={stage.stage} className="flex items-center gap-4">
                                        <span className="w-24 text-sm text-muted-foreground">
                                            {stageLabels[stage.stage] || stage.stage}
                                        </span>
                                        <div className="flex-1 bg-muted rounded-full h-8 overflow-hidden">
                                            <div
                                                className="h-full bg-gradient-to-r from-secondary to-secondary/70 flex items-center px-3 transition-all"
                                                style={{ width: `${(stage.count / maxFunnel) * 100}%` }}
                                            >
                                                <span className="text-sm font-medium text-secondary-foreground">
                                                    {stage.count}
                                                </span>
                                            </div>
                                        </div>
                                        {idx > 0 && funnelData[idx - 1].count > 0 && (
                                            <Badge variant="outline" className="text-xs">
                                                {((stage.count / funnelData[idx - 1].count) * 100).toFixed(0)}%
                                            </Badge>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </Card>
                    </TabsContent>

                    {/* Errors Tab */}
                    <TabsContent value="errors">
                        <Card className="p-6">
                            <h3 className="font-semibold mb-4">Últimos Erros</h3>
                            <div className="space-y-3">
                                {errors.length === 0 ? (
                                    <p className="text-center text-muted-foreground py-8">
                                        Nenhum erro registado 🎉
                                    </p>
                                ) : (
                                    errors.map(error => (
                                        <div key={error.id} className="flex items-start gap-4 p-3 bg-muted/50 rounded-lg">
                                            <div className={`p-2 rounded-lg ${error.severity === 'critical' ? 'bg-red-500/10' :
                                                    error.severity === 'error' ? 'bg-orange-500/10' : 'bg-yellow-500/10'
                                                }`}>
                                                <AlertTriangle className={`h-4 w-4 ${error.severity === 'critical' ? 'text-red-500' :
                                                        error.severity === 'error' ? 'text-orange-500' : 'text-yellow-500'
                                                    }`} />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="font-medium text-sm truncate">{error.error_message}</p>
                                                <p className="text-xs text-muted-foreground">
                                                    {error.component} • {error.page_path}
                                                </p>
                                            </div>
                                            {error.resolved ? (
                                                <Badge variant="secondary" className="shrink-0">
                                                    <CheckCircle className="h-3 w-3 mr-1" />
                                                    Resolvido
                                                </Badge>
                                            ) : (
                                                <Button size="sm" variant="outline" onClick={() => resolveError(error.id)}>
                                                    Resolver
                                                </Button>
                                            )}
                                        </div>
                                    ))
                                )}
                            </div>
                        </Card>
                    </TabsContent>

                    {/* Performance Tab */}
                    <TabsContent value="performance">
                        <Card className="p-6">
                            <h3 className="font-semibold mb-4">Web Vitals</h3>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                {performance.map(metric => (
                                    <div key={metric.metric_type} className="p-4 bg-muted/50 rounded-lg">
                                        <p className="text-xs text-muted-foreground uppercase">
                                            {metric.metric_type.replace('_', ' ')}
                                        </p>
                                        <p className="text-2xl font-bold">
                                            {metric.metric_type === 'page_load' || metric.metric_type.includes('cp')
                                                ? `${(metric.avg_value / 1000).toFixed(2)}s`
                                                : metric.avg_value.toFixed(2)}
                                        </p>
                                        <p className="text-xs text-muted-foreground">
                                            {metric.count} amostras
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </Card>
                    </TabsContent>
                </Tabs>
            )}
        </div>
    );
};
