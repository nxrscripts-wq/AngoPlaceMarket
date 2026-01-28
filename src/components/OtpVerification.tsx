import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import { Loader2, Smartphone, Mail, Clock, AlertTriangle, CheckCircle, RefreshCcw } from 'lucide-react';
import { toast } from 'sonner';
import { smsService } from '@/lib/smsService';

interface OtpVerificationProps {
    phone: string;
    email?: string;
    userId?: string;
    purpose: 'login' | 'action_confirm' | 'account_alert' | 'payment_confirm';
    onSuccess: (result: { userId?: string; purpose: string }) => void;
    onCancel?: () => void;
}

export const OtpVerification = ({ phone, email, userId, purpose, onSuccess, onCancel }: OtpVerificationProps) => {
    const [codeId, setCodeId] = useState<string | null>(null);
    const [channel, setChannel] = useState<'sms' | 'email'>('sms');
    const [otp, setOtp] = useState('');
    const [loading, setLoading] = useState(false);
    const [verifying, setVerifying] = useState(false);
    const [timeRemaining, setTimeRemaining] = useState(300);
    const [attemptsRemaining, setAttemptsRemaining] = useState(3);
    const [phoneMasked, setPhoneMasked] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    // Send OTP on mount
    useEffect(() => {
        sendOtp();
    }, []);

    // Countdown timer
    useEffect(() => {
        if (timeRemaining <= 0 || !codeId) return;

        const interval = setInterval(() => {
            setTimeRemaining(prev => {
                if (prev <= 1) {
                    clearInterval(interval);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(interval);
    }, [codeId, timeRemaining]);

    const sendOtp = async () => {
        setLoading(true);
        setError(null);

        try {
            const result = await smsService.sendOtp(phone, purpose, { userId, email });
            setCodeId(result.codeId);
            setChannel(result.channel);
            setTimeRemaining(result.expiresIn);
            setPhoneMasked(result.phoneMasked);
            setAttemptsRemaining(3);
            toast.success(result.channel === 'sms' ? 'Código enviado via SMS!' : 'Código enviado para o seu email!');
        } catch (err: any) {
            setError(err.message);
            toast.error('Erro ao enviar código: ' + err.message);
        } finally {
            setLoading(false);
        }
    };

    const verifyOtp = async () => {
        if (otp.length !== 6 || !codeId) return;

        setVerifying(true);
        setError(null);

        try {
            const result = await smsService.verifyOtp(codeId, otp);

            if (result.valid) {
                setSuccess(true);
                toast.success('Código verificado com sucesso!');
                setTimeout(() => onSuccess({ userId: result.userId, purpose: result.purpose || purpose }), 1000);
            } else {
                setError(result.error || 'Código inválido');
                if (result.attemptsRemaining !== undefined) {
                    setAttemptsRemaining(result.attemptsRemaining);
                }
                if (result.locked) {
                    toast.error('Máximo de tentativas excedido. Solicite um novo código.');
                }
                setOtp('');
            }
        } catch (err: any) {
            setError(err.message);
        } finally {
            setVerifying(false);
        }
    };

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    if (success) {
        return (
            <Card className="p-6 border-green-500/20 bg-green-500/5 animate-in zoom-in-95">
                <div className="flex flex-col items-center text-center space-y-4">
                    <div className="h-16 w-16 bg-green-500/20 rounded-full flex items-center justify-center">
                        <CheckCircle className="h-8 w-8 text-green-500" />
                    </div>
                    <h4 className="font-bold text-lg text-green-600">Verificado!</h4>
                </div>
            </Card>
        );
    }

    return (
        <Card className="p-6 border-secondary/20 bg-secondary/5 animate-in fade-in">
            <div className="flex flex-col items-center text-center space-y-6">
                {/* Header */}
                <div className="flex items-center gap-3">
                    <div className={`p-3 rounded-full ${channel === 'sms' ? 'bg-blue-500/10' : 'bg-purple-500/10'}`}>
                        {channel === 'sms' ? (
                            <Smartphone className="h-6 w-6 text-blue-500" />
                        ) : (
                            <Mail className="h-6 w-6 text-purple-500" />
                        )}
                    </div>
                    <div className="text-left">
                        <h4 className="font-bold">Verificação de Código</h4>
                        <p className="text-xs text-muted-foreground">
                            {channel === 'sms' ? `Enviado para ${phoneMasked}` : 'Enviado para o seu email'}
                        </p>
                    </div>
                </div>

                {/* Timer */}
                <Badge variant="outline" className={`font-mono ${timeRemaining < 60 ? 'border-red-500 text-red-500 animate-pulse' : ''}`}>
                    <Clock className="h-3 w-3 mr-1" />
                    {timeRemaining > 0 ? `Expira em ${formatTime(timeRemaining)}` : 'Código expirado'}
                </Badge>

                {/* OTP Input */}
                <div className="space-y-3">
                    <InputOTP
                        value={otp}
                        onChange={setOtp}
                        maxLength={6}
                        disabled={loading || verifying || timeRemaining === 0 || attemptsRemaining === 0}
                    >
                        <InputOTPGroup>
                            <InputOTPSlot index={0} />
                            <InputOTPSlot index={1} />
                            <InputOTPSlot index={2} />
                            <InputOTPSlot index={3} />
                            <InputOTPSlot index={4} />
                            <InputOTPSlot index={5} />
                        </InputOTPGroup>
                    </InputOTP>

                    {error && (
                        <div className="flex items-center gap-2 text-red-500 text-sm">
                            <AlertTriangle className="h-4 w-4" />
                            {error}
                        </div>
                    )}

                    {attemptsRemaining < 3 && attemptsRemaining > 0 && (
                        <p className="text-xs text-yellow-600">
                            {attemptsRemaining} tentativa(s) restante(s)
                        </p>
                    )}
                </div>

                {/* Actions */}
                <div className="flex flex-col w-full gap-2">
                    <Button
                        onClick={verifyOtp}
                        disabled={otp.length !== 6 || verifying || timeRemaining === 0 || attemptsRemaining === 0}
                        className="w-full bg-secondary hover:bg-secondary/90 text-secondary-foreground font-bold"
                    >
                        {verifying ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Verificando...
                            </>
                        ) : (
                            'Verificar Código'
                        )}
                    </Button>

                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={sendOtp}
                        disabled={loading || timeRemaining > 240}
                        className="text-muted-foreground"
                    >
                        <RefreshCcw className="mr-2 h-4 w-4" />
                        {loading ? 'Enviando...' : 'Reenviar código'}
                    </Button>

                    {onCancel && (
                        <Button variant="outline" size="sm" onClick={onCancel}>
                            Cancelar
                        </Button>
                    )}
                </div>
            </div>
        </Card>
    );
};
