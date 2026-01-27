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
import { Eye, EyeOff, Loader2, Lock, Mail, AlertTriangle, Smartphone, ArrowRight, ShieldAlert, Timer } from 'lucide-react';
import { validatePassword } from '@/lib/security';
import { cn } from '@/lib/utils';

const LoginPage = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const redirectTo = searchParams.get('redirect') || '/';

    const {
        signIn,
        signInWithOtp,
        verifyOtp,
        signInWithGoogle,
        isLocked,
        lockTimeRemaining,
        loginAttempts,
        isOtpLocked,
        otpLockTimeRemaining,
        otpAttempts,
        resetOtpAttempts
    } = useAuth();

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
    const [otpShake, setOtpShake] = useState(false);

    const lockSeconds = Math.ceil(lockTimeRemaining / 1000);
    const otpLockSeconds = Math.ceil(otpLockTimeRemaining / 1000);
    const remainingLoginAttempts = 3 - loginAttempts.count;
    const remainingOtpAttempts = 3 - otpAttempts.count;

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
        if (otp.length !== 6 || isOtpLocked) return;

        setLoading(true);
        setError(null);

        const identifier = otpType === 'email' ? email : (phone.startsWith('+') ? phone : '+244' + phone.replace(/\s/g, ''));
        const { error } = await verifyOtp(identifier, otp, otpType);

        if (error) {
            setError(error.message);
            setOtp('');
            // Trigger shake animation
            setOtpShake(true);
            setTimeout(() => setOtpShake(false), 500);
        } else {
            navigate(redirectTo);
        }
        setLoading(false);
    };

    const handleGoogleLogin = async () => {
        setLoading(true);
        setError(null);
        const { error } = await signInWithGoogle();
        if (error) {
            setError(error.message);
            setLoading(false);
        }
    };

    const handleBackToRequest = () => {
        setOtpStep('request');
        setOtp('');
        setError(null);
        resetOtpAttempts();
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
                                <div className="flex items-center gap-3">
                                    <div className="relative">
                                        <Lock className="h-5 w-5 text-orange-500" />
                                        <div className="absolute -top-1 -right-1 h-2 w-2 bg-orange-500 rounded-full animate-pulse" />
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-orange-600 font-medium text-sm">Conta bloqueada temporariamente</p>
                                        <p className="text-orange-500/80 text-xs mt-0.5">
                                            Aguarde <span className="font-mono font-bold">{lockSeconds}s</span> para tentar novamente
                                        </p>
                                    </div>
                                    <div className="flex items-center justify-center w-10 h-10 rounded-full border-2 border-orange-500/50 bg-orange-500/20">
                                        <span className="text-orange-600 font-bold text-sm font-mono">{lockSeconds}</span>
                                    </div>
                                </div>
                            </Alert>
                        )}

                        {/* Attempts remaining indicator */}
                        {!isLocked && loginAttempts.count > 0 && activeTab === 'password' && (
                            <div className={cn(
                                "mb-4 flex items-center gap-2 text-xs p-2 rounded-lg",
                                remainingLoginAttempts === 2 && "bg-yellow-500/10 text-yellow-600",
                                remainingLoginAttempts === 1 && "bg-red-500/10 text-red-600"
                            )}>
                                <ShieldAlert className="h-4 w-4" />
                                <span>
                                    {remainingLoginAttempts === 1
                                        ? 'Última tentativa! A conta será bloqueada após esta tentativa.'
                                        : `${remainingLoginAttempts} tentativas restantes`
                                    }
                                </span>
                            </div>
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

                                        {/* OTP Lock Alert */}
                                        {isOtpLocked && (
                                            <Alert className="border-orange-500/50 bg-orange-500/10">
                                                <div className="flex items-center gap-3">
                                                    <Timer className="h-5 w-5 text-orange-500" />
                                                    <div className="flex-1">
                                                        <p className="text-orange-600 font-medium text-sm">Verificação bloqueada</p>
                                                        <p className="text-orange-500/80 text-xs">
                                                            Aguarde <span className="font-mono font-bold">{otpLockSeconds}s</span>
                                                        </p>
                                                    </div>
                                                </div>
                                            </Alert>
                                        )}

                                        {/* OTP Attempts remaining */}
                                        {!isOtpLocked && otpAttempts.count > 0 && (
                                            <div className={cn(
                                                "flex items-center gap-2 text-xs p-2 rounded-lg",
                                                remainingOtpAttempts === 2 && "bg-yellow-500/10 text-yellow-600",
                                                remainingOtpAttempts === 1 && "bg-red-500/10 text-red-600"
                                            )}>
                                                <ShieldAlert className="h-4 w-4" />
                                                <span>
                                                    {remainingOtpAttempts === 1
                                                        ? 'Última tentativa!'
                                                        : `${remainingOtpAttempts} tentativas restantes`
                                                    }
                                                </span>
                                            </div>
                                        )}

                                        <div className={cn(
                                            "flex justify-center transition-transform",
                                            otpShake && "animate-[shake_0.5s_ease-in-out]"
                                        )}>
                                            <InputOTP maxLength={6} value={otp} onChange={setOtp} disabled={isOtpLocked}>
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

                                        <Button type="submit" className="w-full" disabled={loading || otp.length !== 6 || isOtpLocked}>
                                            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Verificar e Entrar'}
                                        </Button>

                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            className="w-full text-xs"
                                            onClick={handleBackToRequest}
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
                                <span className="bg-card px-2 text-muted-foreground">Ou continuar com</span>
                            </div>
                        </div>

                        <Button
                            type="button"
                            variant="outline"
                            className="w-full gap-2 mb-4 hover:bg-muted/50 transition-colors"
                            onClick={handleGoogleLogin}
                            disabled={loading || isLocked}
                        >
                            {loading ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                                <>
                                    <svg className="h-4 w-4" viewBox="0 0 24 24">
                                        <path
                                            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                                            fill="#4285F4"
                                        />
                                        <path
                                            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                            fill="#34A853"
                                        />
                                        <path
                                            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                                            fill="#FBBC05"
                                        />
                                        <path
                                            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                                            fill="#EA4335"
                                        />
                                    </svg>
                                    Google
                                </>
                            )}
                        </Button>

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
