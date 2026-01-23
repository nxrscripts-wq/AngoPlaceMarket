import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    Users,
    Clock,
    Package,
    TrendingUp,
    Check,
    ArrowRight,
    AlertTriangle,
    ShieldAlert
} from 'lucide-react';
import { Product, Order, FraudAlert } from '@/types';

interface DashboardTabProps {
    stats: {
        totalUsers: number;
        pendingProducts: number;
        totalOrders: number;
        totalProducts: number;
        activeSellers: number;
    };
    pendingProducts: Product[];
    recentOrders: Order[];
    fraudAlerts: FraudAlert[];
    onNavigate: (tab: string) => void;
}

export const DashboardTab = ({ stats, pendingProducts, recentOrders, fraudAlerts, onNavigate }: DashboardTabProps) => {
    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Critical Alertas */}
            {fraudAlerts.length > 0 && (
                <Card className="border-red-500/50 bg-red-500/5">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <div className="flex items-center gap-2 text-red-600">
                            <ShieldAlert className="h-5 w-5" />
                            <CardTitle className="text-lg font-bold">Alertas de Risco Urgentes</CardTitle>
                        </div>
                        <Button variant="outline" size="sm" onClick={() => onNavigate('antifraud')}>Ver Todos</Button>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            {fraudAlerts.slice(0, 2).map((alert) => (
                                <div key={alert.id} className="flex items-center justify-between bg-background/50 p-3 rounded-lg border border-red-200">
                                    <div className="flex items-center gap-3">
                                        <AlertTriangle className="h-4 w-4 text-red-500" />
                                        <span className="text-sm font-medium">{alert.description}</span>
                                    </div>
                                    <Badge variant="destructive">{alert.severity}</Badge>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                    { label: 'Usuários Totais', value: stats.totalUsers, icon: Users, color: 'text-blue-500', bg: 'bg-blue-500/10' },
                    { label: 'Vendedores Ativos', value: stats.activeSellers, icon: ShieldAlert, color: 'text-orange-500', bg: 'bg-orange-500/10' },
                    { label: 'Produtos Pendentes', value: stats.pendingProducts, icon: Clock, color: 'text-yellow-500', bg: 'bg-yellow-500/10' },
                    { label: 'Total de Encomendas', value: stats.totalOrders, icon: Package, color: 'text-green-500', bg: 'bg-green-500/10' },
                ].map((stat, i) => (
                    <Card key={i} className="bg-card/40 border-border hover:border-secondary transition-colors">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">{stat.label}</p>
                                    <h3 className="text-3xl font-black mt-1">{stat.value}</h3>
                                </div>
                                <div className={`p-3 ${stat.bg} rounded-xl`}>
                                    <stat.icon className={`h-6 w-6 ${stat.color}`} />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Pending Moderation */}
                <Card className="bg-card/40 border-border">
                    <CardHeader>
                        <CardTitle className="text-xl font-bold flex items-center gap-2">
                            <Clock className="h-5 w-5 text-yellow-500" />
                            Aguardando Moderação
                        </CardTitle>
                        <CardDescription>Produtos submetidos recentemente</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {pendingProducts.length === 0 ? (
                            <div className="text-center py-8 text-muted-foreground">
                                <Check className="h-12 w-12 mx-auto mb-2 opacity-20" />
                                <p>Sem produtos pendentes</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {pendingProducts.slice(0, 4).map((product) => (
                                    <div key={product.id} className="flex items-center gap-4 p-3 rounded-lg hover:bg-muted/30 transition-colors cursor-pointer" onClick={() => onNavigate('products')}>
                                        <img src={product.image} className="w-12 h-12 rounded-lg object-cover" />
                                        <div className="flex-1 min-w-0">
                                            <p className="font-bold truncate">{product.name}</p>
                                            <p className="text-xs text-muted-foreground">{product.profiles?.full_name}</p>
                                        </div>
                                        <ArrowRight className="h-4 w-4 text-muted-foreground" />
                                    </div>
                                ))}
                                <Button variant="ghost" className="w-full text-secondary" onClick={() => onNavigate('products')}>
                                    Ver Todos <ArrowRight className="ml-2 h-4 w-4" />
                                </Button>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Recent Sales Activity */}
                <Card className="bg-card/40 border-border">
                    <CardHeader>
                        <CardTitle className="text-xl font-bold flex items-center gap-2">
                            <Package className="h-5 w-5 text-green-500" />
                            Vendas Recentes
                        </CardTitle>
                        <CardDescription>Atividade de mercado nas últimas 24h</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {recentOrders.length === 0 ? (
                            <div className="text-center py-8 text-muted-foreground">
                                <p>Nenhuma venda registada</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {recentOrders.slice(0, 4).map((order) => (
                                    <div key={order.id} className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/30 transition-colors">
                                        <div className="flex gap-3 items-center">
                                            <div className="w-10 h-10 rounded-full bg-secondary/10 flex items-center justify-center">
                                                <Users className="h-5 w-5 text-secondary" />
                                            </div>
                                            <div>
                                                <p className="font-bold text-sm">#{order.id.slice(0, 8)}</p>
                                                <p className="text-xs text-muted-foreground">{order.profiles?.full_name}</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-bold text-secondary text-sm">{(Number(order.total) || 0).toLocaleString('pt-AO')} Kz</p>
                                            <Badge variant="outline" className="text-[10px] h-4">
                                                {order.status}
                                            </Badge>
                                        </div>
                                    </div>
                                ))}
                                <Button variant="ghost" className="w-full text-secondary" onClick={() => onNavigate('orders')}>
                                    Ver Todas <ArrowRight className="ml-2 h-4 w-4" />
                                </Button>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};
