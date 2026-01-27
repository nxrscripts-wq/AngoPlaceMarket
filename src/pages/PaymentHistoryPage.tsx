import { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { format, formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import {
    CreditCard,
    Loader2,
    CheckCircle2,
    Clock,
    XCircle,
    AlertTriangle,
    ShieldCheck,
    Receipt,
    ArrowRight,
    Copy,
    ExternalLink,
    RefreshCw,
    Eye,
    EyeOff,
    Lock,
    Banknote,
    Smartphone,
    Building2,
    TrendingUp,
    AlertCircle
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

// Payment types
interface Payment {
    id: string;
    order_id: string;
    amount: number;
    status: 'pending' | 'processing' | 'completed' | 'failed' | 'refunded';
    payment_method: 'multicaixa' | 'unitel_money' | 'bank_transfer' | 'reference';
    reference?: string;
    transaction_id?: string;
    created_at: string;
    updated_at: string;
    metadata?: {
        phone?: string;
        bank?: string;
        account?: string;
    };
    order?: {
        id: string;
        total: number;
        status: string;
        items_count: number;
    };
}

// Double payment protection - prevent paying same order within 5 minutes
const PAYMENT_COOLDOWN_MS = 5 * 60 * 1000;
const pendingPayments = new Map<string, number>();

export const canInitiatePayment = (orderId: string): { allowed: boolean; remainingSeconds: number } => {
    const lastPaymentTime = pendingPayments.get(orderId);
    if (!lastPaymentTime) return { allowed: true, remainingSeconds: 0 };

    const elapsed = Date.now() - lastPaymentTime;
    if (elapsed >= PAYMENT_COOLDOWN_MS) {
        pendingPayments.delete(orderId);
        return { allowed: true, remainingSeconds: 0 };
    }

    return { allowed: false, remainingSeconds: Math.ceil((PAYMENT_COOLDOWN_MS - elapsed) / 1000) };
};

export const registerPaymentAttempt = (orderId: string) => {
    pendingPayments.set(orderId, Date.now());
};

const PaymentHistoryPage = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [payments, setPayments] = useState<Payment[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('all');
    const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
    const [showSensitive, setShowSensitive] = useState(false);

    const fetchPayments = useCallback(async () => {
        if (!user) return;

        try {
            // Fetch payments with order info
            const { data, error } = await supabase
                .from('payments')
                .select(`
                    *,
                    order:order_id(id, total, status)
                `)
                .eq('user_id', user.id)
                .order('created_at', { ascending: false });

            if (error) throw error;
            setPayments((data || []) as Payment[]);
        } catch (error) {
            console.error('Error fetching payments:', error);
            // Fallback: generate mock data from orders if payments table doesn't exist
            try {
                const { data: orders } = await supabase
                    .from('orders')
                    .select('id, total, status, created_at, payment_method')
                    .eq('user_id', user.id)
                    .order('created_at', { ascending: false });

                if (orders) {
                    const mockPayments: Payment[] = orders.map(order => ({
                        id: `pay_${order.id.slice(0, 8)}`,
                        order_id: order.id,
                        amount: order.total,
                        status: order.status === 'paid' || order.status === 'delivered' ? 'completed' :
                            order.status === 'cancelled' ? 'failed' : 'pending',
                        payment_method: (order.payment_method as any) || 'multicaixa',
                        reference: `REF${Math.random().toString(36).substring(2, 10).toUpperCase()}`,
                        transaction_id: order.status === 'paid' ? `TXN${Date.now()}` : undefined,
                        created_at: order.created_at,
                        updated_at: order.created_at,
                        order: {
                            id: order.id,
                            total: order.total,
                            status: order.status,
                            items_count: 1
                        }
                    }));
                    setPayments(mockPayments);
                }
            } catch {
                // Ignore fallback error
            }
        } finally {
            setLoading(false);
        }
    }, [user]);

    useEffect(() => {
        fetchPayments();
    }, [fetchPayments]);

    // Calculate statistics
    const stats = useMemo(() => {
        const completed = payments.filter(p => p.status === 'completed');
        const pending = payments.filter(p => p.status === 'pending' || p.status === 'processing');
        const failed = payments.filter(p => p.status === 'failed');

        return {
            total: payments.length,
            completed: completed.length,
            pending: pending.length,
            failed: failed.length,
            totalSpent: completed.reduce((sum, p) => sum + p.amount, 0),
            pendingAmount: pending.reduce((sum, p) => sum + p.amount, 0)
        };
    }, [payments]);

    // Filter payments by tab
    const filteredPayments = useMemo(() => {
        switch (activeTab) {
            case 'completed':
                return payments.filter(p => p.status === 'completed');
            case 'pending':
                return payments.filter(p => p.status === 'pending' || p.status === 'processing');
            case 'failed':
                return payments.filter(p => p.status === 'failed' || p.status === 'refunded');
            default:
                return payments;
        }
    }, [payments, activeTab]);

    const getStatusBadge = (status: string) => {
        const statusConfig: Record<string, { icon: any; className: string; label: string }> = {
            'completed': { icon: CheckCircle2, className: 'bg-green-500/10 text-green-500 border-green-500/20', label: 'Concluído' },
            'pending': { icon: Clock, className: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20', label: 'Pendente' },
            'processing': { icon: RefreshCw, className: 'bg-blue-500/10 text-blue-500 border-blue-500/20', label: 'Processando' },
            'failed': { icon: XCircle, className: 'bg-red-500/10 text-red-500 border-red-500/20', label: 'Falhou' },
            'refunded': { icon: RefreshCw, className: 'bg-purple-500/10 text-purple-500 border-purple-500/20', label: 'Reembolsado' },
        };
        const config = statusConfig[status] || statusConfig['pending'];
        const Icon = config.icon;

        return (
            <Badge className={cn("gap-1", config.className)}>
                <Icon className="h-3 w-3" />
                {config.label}
            </Badge>
        );
    };

    const getPaymentMethodIcon = (method: string) => {
        switch (method) {
            case 'multicaixa': return <CreditCard className="h-4 w-4" />;
            case 'unitel_money': return <Smartphone className="h-4 w-4" />;
            case 'bank_transfer': return <Building2 className="h-4 w-4" />;
            default: return <Receipt className="h-4 w-4" />;
        }
    };

    const getPaymentMethodLabel = (method: string) => {
        switch (method) {
            case 'multicaixa': return 'Multicaixa Express';
            case 'unitel_money': return 'Unitel Money';
            case 'bank_transfer': return 'Transferência Bancária';
            case 'reference': return 'Referência de Pagamento';
            default: return method;
        }
    };

    const maskSensitiveData = (data: string) => {
        if (showSensitive) return data;
        if (data.length <= 4) return '****';
        return `****${data.slice(-4)}`;
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        toast.success('Copiado para a área de transferência');
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-secondary" />
            </div>
        );
    }

    return (
        <main className="container mx-auto px-4 py-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-secondary/10 rounded-2xl flex items-center justify-center">
                        <CreditCard className="h-7 w-7 text-secondary" />
                    </div>
                    <div>
                        <h1 className="text-2xl md:text-3xl font-bold">Histórico de Pagamentos</h1>
                        <p className="text-muted-foreground text-sm">Acompanhe todas as suas transações</p>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setShowSensitive(!showSensitive)}
                        className="gap-2"
                    >
                        {showSensitive ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        {showSensitive ? 'Ocultar dados' : 'Mostrar dados'}
                    </Button>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                <Card className="p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-xs text-muted-foreground uppercase tracking-wider">Total Gasto</p>
                            <p className="text-xl font-bold text-secondary">
                                {stats.totalSpent.toLocaleString('pt-AO')} <span className="text-sm font-normal">Kz</span>
                            </p>
                        </div>
                        <div className="p-3 bg-green-500/10 rounded-xl">
                            <TrendingUp className="h-5 w-5 text-green-500" />
                        </div>
                    </div>
                </Card>
                <Card className="p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-xs text-muted-foreground uppercase tracking-wider">Concluídos</p>
                            <p className="text-xl font-bold text-green-500">{stats.completed}</p>
                        </div>
                        <div className="p-3 bg-green-500/10 rounded-xl">
                            <CheckCircle2 className="h-5 w-5 text-green-500" />
                        </div>
                    </div>
                </Card>
                <Card className="p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-xs text-muted-foreground uppercase tracking-wider">Pendentes</p>
                            <p className="text-xl font-bold text-yellow-500">{stats.pending}</p>
                        </div>
                        <div className="p-3 bg-yellow-500/10 rounded-xl">
                            <Clock className="h-5 w-5 text-yellow-500" />
                        </div>
                    </div>
                </Card>
                <Card className="p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-xs text-muted-foreground uppercase tracking-wider">Por Pagar</p>
                            <p className="text-xl font-bold text-yellow-500">
                                {stats.pendingAmount.toLocaleString('pt-AO')} <span className="text-sm font-normal">Kz</span>
                            </p>
                        </div>
                        <div className="p-3 bg-yellow-500/10 rounded-xl">
                            <Banknote className="h-5 w-5 text-yellow-500" />
                        </div>
                    </div>
                </Card>
            </div>

            {/* Security Alert */}
            <Alert className="mb-6 border-secondary/30 bg-secondary/5">
                <ShieldCheck className="h-4 w-4 text-secondary" />
                <AlertDescription className="text-sm">
                    Todas as transações são protegidas com criptografia. Nunca compartilhe seus dados de pagamento.
                </AlertDescription>
            </Alert>

            {/* Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="w-full justify-start bg-muted/50 p-1 mb-6 rounded-xl overflow-x-auto">
                    <TabsTrigger value="all" className="gap-2 data-[state=active]:bg-background">
                        Todas ({stats.total})
                    </TabsTrigger>
                    <TabsTrigger value="completed" className="gap-2 data-[state=active]:bg-background">
                        <CheckCircle2 className="h-3 w-3" />
                        Concluídas ({stats.completed})
                    </TabsTrigger>
                    <TabsTrigger value="pending" className="gap-2 data-[state=active]:bg-background">
                        <Clock className="h-3 w-3" />
                        Pendentes ({stats.pending})
                    </TabsTrigger>
                    <TabsTrigger value="failed" className="gap-2 data-[state=active]:bg-background">
                        <XCircle className="h-3 w-3" />
                        Falhadas ({stats.failed})
                    </TabsTrigger>
                </TabsList>

                <TabsContent value={activeTab} className="mt-0">
                    {filteredPayments.length > 0 ? (
                        <div className="space-y-4">
                            {filteredPayments.map((payment) => (
                                <Card key={payment.id} className="overflow-hidden hover:border-secondary/30 transition-colors">
                                    <CardContent className="p-4 md:p-6">
                                        <div className="flex items-center gap-4">
                                            {/* Payment method icon */}
                                            <div className="w-12 h-12 bg-muted rounded-xl flex items-center justify-center shrink-0">
                                                {getPaymentMethodIcon(payment.payment_method)}
                                            </div>

                                            {/* Main info */}
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <span className="font-semibold">{getPaymentMethodLabel(payment.payment_method)}</span>
                                                    {getStatusBadge(payment.status)}
                                                </div>
                                                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                                                    <span>Pedido #{payment.order_id.slice(0, 8).toUpperCase()}</span>
                                                    <span>•</span>
                                                    <span>{formatDistanceToNow(new Date(payment.created_at), { addSuffix: true, locale: ptBR })}</span>
                                                </div>
                                                {payment.reference && (
                                                    <div className="flex items-center gap-2 mt-2">
                                                        <span className="text-xs text-muted-foreground">Ref:</span>
                                                        <code className="text-xs bg-muted px-2 py-0.5 rounded font-mono">
                                                            {maskSensitiveData(payment.reference)}
                                                        </code>
                                                        <button onClick={() => copyToClipboard(payment.reference!)}>
                                                            <Copy className="h-3 w-3 text-muted-foreground hover:text-foreground" />
                                                        </button>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Amount and actions */}
                                            <div className="text-right space-y-2">
                                                <p className="text-xl font-bold">
                                                    {payment.amount.toLocaleString('pt-AO')} <span className="text-sm font-normal text-muted-foreground">Kz</span>
                                                </p>
                                                <Dialog>
                                                    <DialogTrigger asChild>
                                                        <Button variant="outline" size="sm" onClick={() => setSelectedPayment(payment)}>
                                                            Detalhes
                                                        </Button>
                                                    </DialogTrigger>
                                                    <DialogContent className="sm:max-w-md">
                                                        <DialogHeader>
                                                            <DialogTitle className="flex items-center gap-2">
                                                                <Receipt className="h-5 w-5" />
                                                                Detalhes da Transação
                                                            </DialogTitle>
                                                            <DialogDescription>
                                                                Informações completas do pagamento
                                                            </DialogDescription>
                                                        </DialogHeader>

                                                        {selectedPayment && (
                                                            <div className="space-y-4">
                                                                {/* Status */}
                                                                <div className="flex justify-center py-4">
                                                                    {getStatusBadge(selectedPayment.status)}
                                                                </div>

                                                                <Separator />

                                                                {/* Details */}
                                                                <div className="space-y-3">
                                                                    <div className="flex justify-between text-sm">
                                                                        <span className="text-muted-foreground">ID da Transação</span>
                                                                        <code className="font-mono">{selectedPayment.transaction_id || 'Pendente'}</code>
                                                                    </div>
                                                                    <div className="flex justify-between text-sm">
                                                                        <span className="text-muted-foreground">Referência</span>
                                                                        <div className="flex items-center gap-1">
                                                                            <code className="font-mono">{selectedPayment.reference || 'N/A'}</code>
                                                                            {selectedPayment.reference && (
                                                                                <button onClick={() => copyToClipboard(selectedPayment.reference!)}>
                                                                                    <Copy className="h-3 w-3" />
                                                                                </button>
                                                                            )}
                                                                        </div>
                                                                    </div>
                                                                    <div className="flex justify-between text-sm">
                                                                        <span className="text-muted-foreground">Método</span>
                                                                        <span>{getPaymentMethodLabel(selectedPayment.payment_method)}</span>
                                                                    </div>
                                                                    <div className="flex justify-between text-sm">
                                                                        <span className="text-muted-foreground">Valor</span>
                                                                        <span className="font-bold">{selectedPayment.amount.toLocaleString('pt-AO')} Kz</span>
                                                                    </div>
                                                                    <div className="flex justify-between text-sm">
                                                                        <span className="text-muted-foreground">Data</span>
                                                                        <span>{format(new Date(selectedPayment.created_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}</span>
                                                                    </div>
                                                                </div>

                                                                <Separator />

                                                                {/* Security info */}
                                                                <div className="flex items-center gap-2 text-xs text-muted-foreground bg-muted p-3 rounded-lg">
                                                                    <Lock className="h-4 w-4" />
                                                                    <span>Transação protegida por criptografia SSL</span>
                                                                </div>

                                                                <DialogFooter>
                                                                    <Button variant="outline" className="w-full" onClick={() => navigate(`/orders`)}>
                                                                        <ExternalLink className="h-4 w-4 mr-2" />
                                                                        Ver Pedido
                                                                    </Button>
                                                                </DialogFooter>
                                                            </div>
                                                        )}
                                                    </DialogContent>
                                                </Dialog>
                                            </div>
                                        </div>

                                        {/* Pending payment warning */}
                                        {payment.status === 'pending' && (
                                            <div className="mt-4 p-3 bg-yellow-500/10 rounded-lg border border-yellow-500/20">
                                                <div className="flex items-start gap-2">
                                                    <AlertTriangle className="h-4 w-4 text-yellow-500 mt-0.5" />
                                                    <div className="text-sm">
                                                        <p className="font-medium text-yellow-600 dark:text-yellow-400">Pagamento pendente</p>
                                                        <p className="text-muted-foreground text-xs mt-0.5">
                                                            Complete o pagamento para processar seu pedido. Prazo: 48 horas.
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    ) : (
                        <Card className="p-12 text-center bg-muted/20">
                            <Receipt className="h-12 w-12 mx-auto text-muted-foreground/30 mb-4" />
                            <h3 className="font-bold text-lg mb-2">Nenhuma transação encontrada</h3>
                            <p className="text-sm text-muted-foreground mb-6">
                                {activeTab === 'all'
                                    ? 'Você ainda não realizou nenhum pagamento.'
                                    : 'Não há transações nesta categoria.'}
                            </p>
                            <Button onClick={() => navigate('/')}>
                                Explorar Produtos
                            </Button>
                        </Card>
                    )}
                </TabsContent>
            </Tabs>
        </main>
    );
};

export default PaymentHistoryPage;
