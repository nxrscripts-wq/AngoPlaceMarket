import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { supabase } from '@/lib/supabase';
import {
    CreditCard,
    CheckCircle2,
    XCircle,
    Clock,
    AlertTriangle,
    Loader2,
    Search,
    RefreshCcw,
    TrendingUp,
    TrendingDown,
    DollarSign
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface Payment {
    id: string;
    order_id: string;
    amount: number;
    phone: string;
    reference: string;
    status: 'PENDENTE' | 'CONFIRMADO' | 'FALHADO' | 'EXPIRADO';
    environment: string;
    created_at: string;
    confirmed_at: string | null;
    error_message: string | null;
}

export const PaymentsTab = () => {
    const [payments, setPayments] = useState<Payment[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [stats, setStats] = useState({
        total: 0,
        confirmed: 0,
        failed: 0,
        pending: 0,
        totalAmount: 0
    });

    const fetchPayments = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('payments')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(100);

        if (!error && data) {
            setPayments(data as Payment[]);

            // Calculate stats
            const confirmed = data.filter(p => p.status === 'CONFIRMADO');
            setStats({
                total: data.length,
                confirmed: confirmed.length,
                failed: data.filter(p => p.status === 'FALHADO').length,
                pending: data.filter(p => p.status === 'PENDENTE').length,
                totalAmount: confirmed.reduce((sum, p) => sum + Number(p.amount), 0)
            });
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchPayments();

        // Realtime subscription
        const channel = supabase
            .channel('admin_payments')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'payments' }, () => {
                fetchPayments();
            })
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, []);

    const filteredPayments = payments.filter(p => {
        const matchesSearch = p.reference?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            p.phone?.includes(searchTerm) ||
            p.order_id?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === 'all' || p.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'CONFIRMADO': return <CheckCircle2 className="h-4 w-4 text-green-500" />;
            case 'FALHADO': return <XCircle className="h-4 w-4 text-red-500" />;
            case 'EXPIRADO': return <Clock className="h-4 w-4 text-yellow-500" />;
            default: return <Loader2 className="h-4 w-4 animate-spin text-blue-500" />;
        }
    };

    const getStatusBadge = (status: string) => {
        const variants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
            'CONFIRMADO': 'default',
            'FALHADO': 'destructive',
            'EXPIRADO': 'secondary',
            'PENDENTE': 'outline'
        };
        return <Badge variant={variants[status] || 'outline'}>{status}</Badge>;
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card className="bg-card/40">
                    <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-blue-500/10 rounded-lg">
                                <CreditCard className="h-5 w-5 text-blue-500" />
                            </div>
                            <div>
                                <p className="text-2xl font-black">{stats.total}</p>
                                <p className="text-[10px] uppercase text-muted-foreground font-bold">Total</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-green-500/5 border-green-500/20">
                    <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-green-500/10 rounded-lg">
                                <TrendingUp className="h-5 w-5 text-green-500" />
                            </div>
                            <div>
                                <p className="text-2xl font-black text-green-600">{stats.confirmed}</p>
                                <p className="text-[10px] uppercase text-muted-foreground font-bold">Confirmados</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-red-500/5 border-red-500/20">
                    <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-red-500/10 rounded-lg">
                                <TrendingDown className="h-5 w-5 text-red-500" />
                            </div>
                            <div>
                                <p className="text-2xl font-black text-red-600">{stats.failed}</p>
                                <p className="text-[10px] uppercase text-muted-foreground font-bold">Falhados</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-secondary/5 border-secondary/20">
                    <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-secondary/10 rounded-lg">
                                <DollarSign className="h-5 w-5 text-secondary" />
                            </div>
                            <div>
                                <p className="text-lg font-black text-secondary">{stats.totalAmount.toLocaleString('pt-AO')} Kz</p>
                                <p className="text-[10px] uppercase text-muted-foreground font-bold">Volume</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Pesquisar por referência, telefone ou pedido..."
                        className="pl-10"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="flex gap-2">
                    {['all', 'CONFIRMADO', 'PENDENTE', 'FALHADO', 'EXPIRADO'].map(s => (
                        <Button
                            key={s}
                            variant={statusFilter === s ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => setStatusFilter(s)}
                            className="text-xs"
                        >
                            {s === 'all' ? 'Todos' : s}
                        </Button>
                    ))}
                    <Button variant="ghost" size="icon" onClick={fetchPayments} disabled={loading}>
                        <RefreshCcw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                    </Button>
                </div>
            </div>

            {/* Payments Table */}
            <Card className="bg-card/40 border-border">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <CreditCard className="h-5 w-5 text-secondary" />
                        Transações MCX Express
                    </CardTitle>
                    <CardDescription>Histórico de pagamentos em tempo real</CardDescription>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="flex justify-center py-12">
                            <Loader2 className="h-8 w-8 animate-spin text-secondary" />
                        </div>
                    ) : filteredPayments.length === 0 ? (
                        <p className="text-center py-12 text-muted-foreground">Nenhum pagamento encontrado.</p>
                    ) : (
                        <div className="space-y-2">
                            {filteredPayments.map((payment) => (
                                <div
                                    key={payment.id}
                                    className="flex items-center justify-between p-4 rounded-xl bg-background border border-border hover:border-secondary/20 transition-all"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className={`p-2 rounded-lg ${payment.status === 'CONFIRMADO' ? 'bg-green-500/10' :
                                                payment.status === 'FALHADO' ? 'bg-red-500/10' :
                                                    payment.status === 'EXPIRADO' ? 'bg-yellow-500/10' : 'bg-blue-500/10'
                                            }`}>
                                            {getStatusIcon(payment.status)}
                                        </div>
                                        <div>
                                            <p className="font-mono font-bold text-sm">{payment.reference || 'N/A'}</p>
                                            <p className="text-xs text-muted-foreground">
                                                +244 {payment.phone} · Pedido #{payment.order_id?.slice(0, 8)}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-bold">{Number(payment.amount).toLocaleString('pt-AO')} Kz</p>
                                        <div className="flex items-center gap-2 justify-end mt-1">
                                            {getStatusBadge(payment.status)}
                                            <Badge variant="outline" className="text-[10px]">{payment.environment}</Badge>
                                        </div>
                                        <p className="text-[10px] text-muted-foreground mt-1">
                                            {formatDistanceToNow(new Date(payment.created_at), { addSuffix: true, locale: ptBR })}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
};
