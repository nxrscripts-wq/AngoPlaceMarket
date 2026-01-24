import { useState } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import { Eye, EyeOff, Loader2, Lock, Mail, AlertTriangle, Smartphone, ArrowRight } from 'lucide-react';
import { validatePassword } from '@/lib/security';

const LoginPage = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const redirectTo = searchParams.get('redirect') || '/';

    const { signIn, signInWithOtp, verifyOtp, isLocked, lockTimeRemaining, loginAttempts } = useAuth();

    // Login Mode
    const [activeTab, setActiveTab] = useState<'password' | 'otp'>('password');
    const [otpStep, setOtpStep] = useState<'request' | 'verify'>('request');

    // Form States
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [phone, setPhone] = useState('');
    const [otp, setOtp] = useState('');
    const [otpType, setOtpType] = useState<'email' | 'phone'>('email');

    // UI States
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const lockSeconds = Math.ceil(lockTimeRemaining / 1000);

    const handlePasswordLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        if (isLocked) return;

        setLoading(true);
        setError(null);

        const { error } = await signIn(email, password);

        if (error) {
            setError(error.message);
        } else {
            navigate(redirectTo);
        }

        setLoading(false);
    };

    const handleRequestOtp = async (e: React.FormEvent) => {
        e.preventDefault();
        if (isLocked) return;

        const identifier = otpType === 'email' ? email : phone;
        if (!identifier) {
            setError('Por favor, preencha o campo.');
            return;
        }

        setLoading(true);
        setError(null);

        // For phone, we might want to ensure it has country code if not provided
        // Simplistic check for Angola +244
        let finalIdentifier = identifier;
        if (otpType === 'phone' && !identifier.startsWith('+')) {
            finalIdentifier = '+244' + identifier.replace(/\s/g, '');
        }

        const { error } = await signInWithOtp(finalIdentifier, otpType);

        if (error) {
            setError(error.message);
        } else {
            setOtpStep('verify');
        }
        setLoading(false);
    };

    const handleVerifyOtp = async (e: React.FormEvent) => {
        e.preventDefault();
        if (otp.length !== 6) return;

        setLoading(true);
        setError(null);

        const identifier = otpType === 'email' ? email : (phone.startsWith('+') ? phone : '+244' + phone.replace(/\s/g, ''));
        const { error } = await verifyOtp(identifier, otp, otpType);

        if (error) {
            setError('Código inválido ou expirado.');
        } else {
            navigate(redirectTo);
        }
        setLoading(false);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                <div className="text-center mb-8">
                    <Link to="/" className="inline-flex items-center hover:opacity-90 transition-opacity">
                        <img src="/logo.png" alt="AngoPlaceMarket" className="h-20 w-auto object-contain" />
                    </Link>
                </div>

                <Card className="border-border/50 shadow-2xl">
                    <CardHeader className="space-y-1 text-center">
                        <CardTitle className="text-2xl font-bold">Boas-vindas</CardTitle>
                        <CardDescription>
                            Entre na sua conta para continuar
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {error && (
                            <Alert variant="destructive" className="mb-4 animate-in fade-in slide-in-from-top-2">
                                <AlertTriangle className="h-4 w-4" />
                                <AlertDescription>{error}</AlertDescription>
                            </Alert>
                        )}

                        {isLocked && (
                            <Alert className="mb-4 border-orange-500/50 bg-orange-500/10">
                                <Lock className="h-4 w-4 text-orange-500" />
                                <AlertDescription className="text-orange-600">
                                    Conta bloqueada. Tente novamente em <strong>{lockSeconds}</strong> segundos.
                                </AlertDescription>
                            </Alert>
                        )}

                        <Tabs value={activeTab} onValueChange={(v: any) => setActiveTab(v)} className="space-y-4">
                            <TabsList className="grid w-full grid-cols-2">
                                <TabsTrigger value="password">Senha</TabsTrigger>
                                <TabsTrigger value="otp">Acesso Rápido</TabsTrigger>
                            </TabsList>

                            <TabsContent value="password">
                                <form onSubmit={handlePasswordLogin} className="space-y-4">
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
                                                disabled={isLocked}
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <div className="flex items-center justify-between">
                                            <Label htmlFor="password">Palavra-passe</Label>
                                            <Link to="/forgot-password" className="text-sm text-secondary hover:underline">
                                                Esqueceu?
                                            </Link>
                                        </div>
                                        <div className="relative">
                                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                            <Input
                                                id="password"
                                                type={showPassword ? 'text' : 'password'}
                                                placeholder="••••••••"
                                                value={password}
                                                onChange={(e) => setPassword(e.target.value)}
                                                className="pl-10 pr-10"
                                                required
                                                disabled={isLocked}
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

                                    <Button type="submit" className="w-full bg-secondary hover:bg-secondary/90" disabled={loading || isLocked}>
                                        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Entrar com Senha'}
                                    </Button>
                                </form>
                            </TabsContent>

                            <TabsContent value="otp">
                                {otpStep === 'request' ? (
                                    <form onSubmit={handleRequestOtp} className="space-y-4">
                                        <div className="grid grid-cols-2 gap-2 mb-4">
                                            <Button
                                                type="button"
                                                variant={otpType === 'email' ? 'outline' : 'ghost'}
                                                className={otpType === 'email' ? 'border-primary' : ''}
                                                onClick={() => setOtpType('email')}
                                            >
                                                <Mail className="mr-2 h-4 w-4" /> Email
                                            </Button>
                                            <Button
                                                type="button"
                                                variant={otpType === 'phone' ? 'outline' : 'ghost'}
                                                className={otpType === 'phone' ? 'border-primary' : ''}
                                                onClick={() => setOtpType('phone')}
                                            >
                                                <Smartphone className="mr-2 h-4 w-4" /> SMS
                                            </Button>
                                        </div>

                                        {otpType === 'email' ? (
                                            <div className="space-y-2">
                                                <Label>Email</Label>
                                                <Input
                                                    type="email"
                                                    placeholder="seu@email.com"
                                                    value={email}
                                                    onChange={(e) => setEmail(e.target.value)}
                                                    required
                                                    disabled={isLocked}
                                                />
                                            </div>
                                        ) : (
                                            <div className="space-y-2">
                                                <Label>Telefone (Angola)</Label>
                                                <div className="flex gap-2">
                                                    <div className="flex items-center justify-center px-3 border rounded-md bg-muted text-sm font-medium">
                                                        🇦🇴 +244
                                                    </div>
                                                    <Input
                                                        type="tel"
                                                        placeholder="9XX XXX XXX"
                                                        value={phone}
                                                        onChange={(e) => setPhone(e.target.value.replace(/[^0-9]/g, ''))} // Simple number mask
                                                        required
                                                        disabled={isLocked}
                                                    />
                                                </div>
                                            </div>
                                        )}

                                        <Button type="submit" className="w-full" disabled={loading || isLocked}>
                                            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Enviar Código'}
                                        </Button>
                                    </form>
                                ) : (
                                    <form onSubmit={handleVerifyOtp} className="space-y-4">
                                        <div className="text-center mb-4">
                                            <h3 className="text-sm font-medium">Código enviado para</h3>
                                            <p className="text-muted-foreground">{otpType === 'email' ? email : `+244 ${phone}`}</p>
                                        </div>

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

                                        <Button type="submit" className="w-full" disabled={loading || otp.length !== 6}>
                                            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Verificar e Entrar'}
                                        </Button>

                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            className="w-full text-xs"
                                            onClick={() => setOtpStep('request')}
                                        >
                                            Voltar / Alterar contacto
                                        </Button>
                                    </form>
                                )}
                            </TabsContent>
                        </Tabs>

                        <div className="relative my-6">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-border" />
                            </div>
                            <div className="relative flex justify-center text-xs uppercase">
                                <span className="bg-card px-2 text-muted-foreground">Ou</span>
                            </div>
                        </div>

                        <p className="text-center text-sm text-muted-foreground">
                            Não tem uma conta?{' '}
                            <Link to="/register" className="text-secondary font-medium hover:underline">
                                Criar conta
                            </Link>
                        </p>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default LoginPage;
