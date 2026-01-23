import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { validatePassword } from '@/lib/security';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import { Loader2, Mail, Lock, ArrowLeft, CheckCircle, AlertTriangle, Eye, EyeOff } from 'lucide-react';

type Step = 'email' | 'otp' | 'newPassword' | 'success';

const ForgotPasswordPage = () => {
    const navigate = useNavigate();
    const { resetPassword, verifyOtp, updatePassword } = useAuth();

    const [step, setStep] = useState<Step>('email');
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSendOtp = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        const { error } = await resetPassword(email);

        if (error) {
            // Generic error message for security
            setError('Se a conta existir, um código será enviado. Verifique também a pasta de spam.');
            // Even if it fails, we can move to OTP step to avoid enumeration, 
            // but for real UX we usually show success message even if email doesn't exist.
            setStep('otp');
        } else {
            setStep('otp');
        }

        setLoading(false);
    };

    const handleVerifyOtp = async (e: React.FormEvent) => {
        e.preventDefault();
        if (otp.length !== 6) {
            setError('Insira o código de 6 dígitos.');
            return;
        }

        setLoading(true);
        setError(null);

        const { error } = await verifyOtp(email, otp);

        if (error) {
            setError('Código inválido ou expirado.');
        } else {
            setStep('newPassword');
        }

        setLoading(false);
    };

    const handleUpdatePassword = async (e: React.FormEvent) => {
        e.preventDefault();

        const passwordValidation = validatePassword(newPassword);
        if (!passwordValidation.isValid) {
            setError(passwordValidation.error || 'Palavra-passe inválida.');
            return;
        }

        if (newPassword !== confirmPassword) {
            setError('As palavras-passe não coincidem.');
            return;
        }

        setLoading(true);
        setError(null);

        const { error } = await updatePassword(newPassword);

        if (error) {
            setError('Erro ao atualizar palavra-passe. Tente novamente.');
        } else {
            setStep('success');

            // Security Notification for Password Reset
            // We need to find the user ID from the email
            const { data: userData } = await supabase.from('profiles').select('id').eq('email', email).single();
            if (userData) {
                await supabase.from('notifications').insert({
                    user_id: userData.id,
                    title: 'Segurança: Recuperação de Conta',
                    message: 'A sua palavra-passe foi redefinida com sucesso através do código de recuperação.',
                    type: 'SECURITY'
                });
            }
        }

        setLoading(false);
    };

    const renderStep = () => {
        switch (step) {
            case 'email':
                return (
                    <form onSubmit={handleSendOtp} className="space-y-4">
                        <div className="text-center mb-6">
                            <div className="w-16 h-16 bg-secondary/20 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Mail className="h-8 w-8 text-secondary" />
                            </div>
                            <p className="text-sm text-muted-foreground">
                                Insira o seu email e enviaremos um código de verificação.
                            </p>
                        </div>

                        {error && (
                            <Alert variant="destructive">
                                <AlertTriangle className="h-4 w-4" />
                                <AlertDescription>{error}</AlertDescription>
                            </Alert>
                        )}

                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="seu@email.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="pl-10"
                                    required
                                />
                            </div>
                        </div>

                        <Button
                            type="submit"
                            className="w-full bg-secondary hover:bg-secondary/90"
                            disabled={loading}
                        >
                            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Enviar Código'}
                        </Button>
                    </form>
                );

            case 'otp':
                return (
                    <form onSubmit={handleVerifyOtp} className="space-y-4">
                        <div className="text-center mb-6">
                            <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Lock className="h-8 w-8 text-primary" />
                            </div>
                            <p className="text-sm text-muted-foreground">
                                Insira o código de 6 dígitos enviado para <strong>{email}</strong>
                            </p>
                        </div>

                        {error && (
                            <Alert variant="destructive">
                                <AlertTriangle className="h-4 w-4" />
                                <AlertDescription>{error}</AlertDescription>
                            </Alert>
                        )}

                        <div className="flex justify-center">
                            <InputOTP maxLength={6} value={otp} onChange={setOtp}>
                                <InputOTPGroup>
                                    <InputOTPSlot index={0} />
                                    <InputOTPSlot index={1} />
                                    <InputOTPSlot index={2} />
                                    <InputOTPSlot index={3} />
                                    <InputOTPSlot index={4} />
                                    <InputOTPSlot index={5} />
                                </InputOTPGroup>
                            </InputOTP>
                        </div>

                        <Button
                            type="submit"
                            className="w-full bg-secondary hover:bg-secondary/90"
                            disabled={loading || otp.length !== 6}
                        >
                            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Verificar Código'}
                        </Button>

                        <button
                            type="button"
                            onClick={() => setStep('email')}
                            className="w-full text-sm text-muted-foreground hover:text-secondary"
                        >
                            Reenviar código
                        </button>
                    </form>
                );

            case 'newPassword':
                return (
                    <form onSubmit={handleUpdatePassword} className="space-y-4">
                        <div className="text-center mb-6">
                            <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Lock className="h-8 w-8 text-green-500" />
                            </div>
                            <p className="text-sm text-muted-foreground">
                                Crie uma nova palavra-passe para a sua conta.
                            </p>
                        </div>

                        {error && (
                            <Alert variant="destructive">
                                <AlertTriangle className="h-4 w-4" />
                                <AlertDescription>{error}</AlertDescription>
                            </Alert>
                        )}

                        <div className="space-y-2">
                            <Label htmlFor="newPassword">Nova Palavra-passe</Label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                    id="newPassword"
                                    type={showPassword ? 'text' : 'password'}
                                    placeholder="Mínimo 6 caracteres"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    className="pl-10 pr-10"
                                    required
                                    minLength={6}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                                >
                                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                </button>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="confirmPassword">Confirmar Palavra-passe</Label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                    id="confirmPassword"
                                    type={showPassword ? 'text' : 'password'}
                                    placeholder="Confirme a palavra-passe"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    className="pl-10"
                                    required
                                />
                            </div>
                        </div>

                        <Button
                            type="submit"
                            className="w-full bg-secondary hover:bg-secondary/90"
                            disabled={loading}
                        >
                            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Atualizar Palavra-passe'}
                        </Button>
                    </form>
                );

            case 'success':
                return (
                    <div className="text-center py-4">
                        <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                            <CheckCircle className="h-8 w-8 text-green-500" />
                        </div>
                        <h3 className="text-lg font-semibold mb-2">Palavra-passe Atualizada!</h3>
                        <p className="text-sm text-muted-foreground mb-6">
                            A sua palavra-passe foi alterada com sucesso.
                        </p>
                        <Button
                            onClick={() => navigate('/login')}
                            className="bg-secondary hover:bg-secondary/90"
                        >
                            Ir para Login
                        </Button>
                    </div>
                );
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                {/* Logo */}
                <div className="text-center mb-8">
                    <Link to="/" className="inline-flex items-center hover:opacity-90 transition-opacity">
                        <img src="/logo.png" alt="AngoPlaceMarket" className="h-20 w-auto object-contain" />
                    </Link>
                </div>
                <Card className="border-border/50 shadow-2xl">
                    <CardHeader className="space-y-1">
                        <div className="flex items-center gap-2">
                            {step !== 'success' && (
                                <Link
                                    to="/login"
                                    className="p-1 rounded-lg hover:bg-muted transition-colors"
                                >
                                    <ArrowLeft className="h-5 w-5" />
                                </Link>
                            )}
                            <div>
                                <CardTitle className="text-xl font-bold">Recuperar Conta</CardTitle>
                                <CardDescription>
                                    {step === 'email' && 'Redefinir palavra-passe'}
                                    {step === 'otp' && 'Verificar código'}
                                    {step === 'newPassword' && 'Nova palavra-passe'}
                                    {step === 'success' && 'Concluído'}
                                </CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        {renderStep()}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default ForgotPasswordPage;
