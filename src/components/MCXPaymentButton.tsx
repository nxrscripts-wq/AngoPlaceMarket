import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/lib/supabase';
import { Smartphone, Loader2, CheckCircle, Copy, XCircle, Clock, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';
import { usePaymentProtection } from '@/hooks/usePayment';

interface MCXPaymentButtonProps {
    orderId: string;
    amount: number;
    onSuccess: () => void;
}

type PaymentStep = 'IDLE' | 'PROCESSING' | 'WAITING' | 'CONFIRMED' | 'FAILED' | 'EXPIRED';

export const MCXPaymentButton = ({ orderId, amount, onSuccess }: MCXPaymentButtonProps) => {
    const [loading, setLoading] = useState(false);
    const [phone, setPhone] = useState('');
    const [step, setStep] = useState<PaymentStep>('IDLE');
    const [reference, setReference] = useState<string | null>(null);
    const [paymentId, setPaymentId] = useState<string | null>(null);
    const [expiresAt, setExpiresAt] = useState<Date | null>(null);
    const [timeRemaining, setTimeRemaining] = useState<number>(0);

    const { canPay, registerAttempt, updateStatus } = usePaymentProtection();

    // Expiration timer
    useEffect(() => {
        if (!expiresAt || step !== 'WAITING') return;

        const interval = setInterval(() => {
            const remaining = Math.max(0, Math.floor((expiresAt.getTime() - Date.now()) / 1000));
            setTimeRemaining(remaining);

            if (remaining <= 0) {
                setStep('EXPIRED');
                updateStatus(orderId, 'failed');
                toast.error('Tempo de pagamento expirado.');
                clearInterval(interval);
            }
        }, 1000);

        return () => clearInterval(interval);
    }, [expiresAt, step, orderId, updateStatus]);

    // Realtime subscription for payment updates
    useEffect(() => {
        if (!paymentId || step !== 'WAITING') return;

        const channel = supabase
            .channel(`payment_${paymentId}`)
            .on(
                'postgres_changes',
                {
                    event: 'UPDATE',
                    schema: 'public',
                    table: 'payments',
                    filter: `id=eq.${paymentId}`,
                },
                (payload) => {
                    const newStatus = payload.new.status;
                    if (newStatus === 'CONFIRMADO') {
                        setStep('CONFIRMED');
                        updateStatus(orderId, 'completed');
                        toast.success('Pagamento confirmado com sucesso!');
                        setTimeout(onSuccess, 1500);
                    } else if (newStatus === 'FALHADO') {
                        setStep('FAILED');
                        updateStatus(orderId, 'failed');
                        toast.error('Pagamento falhou ou foi cancelado.');
                    } else if (newStatus === 'EXPIRADO') {
                        setStep('EXPIRED');
                        updateStatus(orderId, 'failed');
                    }
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [paymentId, step, orderId, updateStatus, onSuccess]);

    const handleInitiate = async () => {
        if (!phone || phone.length < 9) {
            toast.error('Insira um número de telefone válido associado ao MCX Express.');
            return;
        }

        // Check payment protection
        const check = canPay(orderId);
        if (!check.allowed) {
            toast.error(check.reason || 'Pagamento não permitido');
            return;
        }

        // Register attempt
        if (!registerAttempt(orderId)) return;

        setLoading(true);
        setStep('PROCESSING');

        try {
            const idempotencyKey = `${orderId}-${Date.now()}`;

            const { data, error } = await supabase.functions.invoke('mcx-initiate', {
                body: { order_id: orderId, amount, phone, idempotency_key: idempotencyKey },
            });

            if (error) throw error;
            if (data.error) throw new Error(data.error);

            setReference(data.reference);
            setPaymentId(data.payment_id);
            setExpiresAt(new Date(Date.now() + (data.expires_in_seconds || 900) * 1000));
            setTimeRemaining(data.expires_in_seconds || 900);
            setStep('WAITING');
            updateStatus(orderId, 'processing');
            toast.success('Pedido de pagamento enviado!');
        } catch (error: any) {
            console.error('Payment error:', error);
            toast.error('Erro ao iniciar pagamento: ' + error.message);
            updateStatus(orderId, 'failed');
            setStep('IDLE');
        } finally {
            setLoading(false);
        }
    };

    const copyReference = () => {
        if (reference) {
            navigator.clipboard.writeText(reference);
            toast.success('Referência copiada!');
        }
    };

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    // Success state
    if (step === 'CONFIRMED') {
        return (
            <Card className="p-6 border-green-500/20 bg-green-500/5 animate-in zoom-in-95 duration-300">
                <div className="flex flex-col items-center text-center space-y-4">
                    <div className="h-16 w-16 bg-green-500/20 rounded-full flex items-center justify-center">
                        <CheckCircle className="h-8 w-8 text-green-500" />
                    </div>
                    <div>
                        <h4 className="font-bold text-lg text-green-600">Pagamento Confirmado!</h4>
                        <p className="text-sm text-muted-foreground">Obrigado pela sua compra.</p>
                    </div>
                </div>
            </Card>
        );
    }

    // Failed state
    if (step === 'FAILED') {
        return (
            <Card className="p-6 border-red-500/20 bg-red-500/5 animate-in zoom-in-95 duration-300">
                <div className="flex flex-col items-center text-center space-y-4">
                    <div className="h-16 w-16 bg-red-500/20 rounded-full flex items-center justify-center">
                        <XCircle className="h-8 w-8 text-red-500" />
                    </div>
                    <div>
                        <h4 className="font-bold text-lg text-red-600">Pagamento Falhou</h4>
                        <p className="text-sm text-muted-foreground">Tente novamente ou use outro método.</p>
                    </div>
                    <Button variant="outline" onClick={() => setStep('IDLE')} className="border-red-500/50 text-red-600">
                        Tentar Novamente
                    </Button>
                </div>
            </Card>
        );
    }

    // Expired state
    if (step === 'EXPIRED') {
        return (
            <Card className="p-6 border-yellow-500/20 bg-yellow-500/5 animate-in zoom-in-95 duration-300">
                <div className="flex flex-col items-center text-center space-y-4">
                    <div className="h-16 w-16 bg-yellow-500/20 rounded-full flex items-center justify-center">
                        <Clock className="h-8 w-8 text-yellow-600" />
                    </div>
                    <div>
                        <h4 className="font-bold text-lg text-yellow-700">Tempo Expirado</h4>
                        <p className="text-sm text-muted-foreground">O pagamento não foi confirmado a tempo.</p>
                    </div>
                    <Button variant="outline" onClick={() => setStep('IDLE')} className="border-yellow-500/50 text-yellow-700">
                        Iniciar Novo Pagamento
                    </Button>
                </div>
            </Card>
        );
    }

    // Waiting state
    if (step === 'WAITING') {
        return (
            <Card className="p-6 border-secondary/20 bg-secondary/5 animate-in zoom-in-95 duration-300">
                <div className="flex flex-col items-center text-center space-y-4">
                    <div className="h-16 w-16 bg-secondary/10 rounded-full flex items-center justify-center animate-pulse">
                        <Smartphone className="h-8 w-8 text-secondary" />
                    </div>
                    <div>
                        <h4 className="font-bold text-lg">Aguardando Aprovação</h4>
                        <p className="text-sm text-muted-foreground">
                            Confirme no seu app Multicaixa Express
                        </p>
                    </div>

                    {/* Timer */}
                    <Badge variant="outline" className={`text-sm font-mono ${timeRemaining < 60 ? 'border-red-500 text-red-500 animate-pulse' : ''}`}>
                        <Clock className="h-3 w-3 mr-1" />
                        Expira em {formatTime(timeRemaining)}
                    </Badge>

                    {/* Reference */}
                    <div className="w-full p-4 bg-background border border-border rounded-xl flex justify-between items-center">
                        <div className="text-left">
                            <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold">Referência</p>
                            <p className="text-xl font-mono font-black text-secondary">{reference}</p>
                        </div>
                        <Button variant="ghost" size="icon" onClick={copyReference} className="hover:bg-secondary/10">
                            <Copy className="h-4 w-4" />
                        </Button>
                    </div>

                    <div className="flex items-center gap-2 text-xs text-muted-foreground italic">
                        <Loader2 className="h-3 w-3 animate-spin" />
                        Verificando status em tempo real...
                    </div>
                </div>
            </Card>
        );
    }

    // Idle state (default)
    return (
        <Card className="p-6 border-border shadow-md">
            <div className="space-y-4">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-secondary/10 rounded-lg">
                        <Smartphone className="h-5 w-5 text-secondary" />
                    </div>
                    <div>
                        <h4 className="font-bold">Multicaixa Express</h4>
                        <p className="text-xs text-muted-foreground">Pagamento instantâneo e seguro</p>
                    </div>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="mcx-phone">Telemóvel MCX</Label>
                    <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-medium">+244</span>
                        <Input
                            id="mcx-phone"
                            placeholder="9xx xxx xxx"
                            className="pl-14 h-12 rounded-xl"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 9))}
                            disabled={loading}
                        />
                    </div>
                </div>

                <Button
                    className="w-full h-12 bg-secondary hover:bg-secondary/90 text-secondary-foreground font-bold rounded-xl shadow-lg shadow-secondary/10 transition-all hover:scale-[1.02]"
                    onClick={handleInitiate}
                    disabled={loading || phone.length < 9}
                >
                    {loading ? (
                        <>
                            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                            Iniciando...
                        </>
                    ) : (
                        `Pagar ${amount.toLocaleString('pt-AO')} Kz`
                    )}
                </Button>
            </div>
        </Card>
    );
};
