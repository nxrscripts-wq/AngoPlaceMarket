import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { supabase } from '@/lib/supabase';
import { Smartphone, Loader2, CheckCircle, CreditCard, Copy, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';

interface MCXPaymentButtonProps {
    orderId: string;
    amount: number;
    onSuccess: () => void;
}

export const MCXPaymentButton = ({ orderId, amount, onSuccess }: MCXPaymentButtonProps) => {
    const [loading, setLoading] = useState(false);
    const [phone, setPhone] = useState('');
    const [step, setStep] = useState<'IDLE' | 'PROCESSING' | 'WAITING'>('IDLE');
    const [reference, setReference] = useState<string | null>(null);

    const handleInitiate = async () => {
        if (!phone || phone.length < 9) {
            toast.error('Insira um número de telefone válido associado ao MCX Express.');
            return;
        }

        setLoading(true);
        setStep('PROCESSING');

        try {
            const { data, error } = await supabase.functions.invoke('initiate-mcx-payment', {
                body: { order_id: orderId, amount, phone },
            });

            if (error) throw error;

            setReference(data.reference);
            setStep('WAITING');
            toast.success('Pedido de pagamento enviado para o seu telemóvel!');

            // Iniciar Realtime para escutar a confirmação
            setupRealtime();
        } catch (error: any) {
            console.error('Payment error:', error);
            toast.error('Erro ao iniciar pagamento: ' + error.message);
            setStep('IDLE');
        } finally {
            setLoading(false);
        }
    };

    const setupRealtime = () => {
        const channel = supabase
            .channel('payment_updates')
            .on(
                'postgres_changes',
                {
                    event: 'UPDATE',
                    schema: 'public',
                    table: 'payments',
                    filter: `order_id=eq.${orderId}`,
                },
                (payload) => {
                    if (payload.new.status === 'CONFIRMADO') {
                        toast.success('Pagamento confirmado com sucesso!');
                        onSuccess();
                    } else if (payload.new.status === 'FALHADO') {
                        toast.error('Pagamento falhou ou foi cancelado.');
                        setStep('IDLE');
                    }
                }
            )
            .subscribe();

        return () => supabase.removeChannel(channel);
    };

    const copyReference = () => {
        if (reference) {
            navigator.clipboard.writeText(reference);
            toast.success('Referência copiada!');
        }
    };

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
                            Por favor, verifique o seu aplicativo **Multicaixa Express** e confirme o pagamento.
                        </p>
                    </div>

                    <div className="w-full p-4 bg-background border border-border rounded-xl flex justify-between items-center group">
                        <div className="text-left">
                            <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold">Referência MCX</p>
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
