import { useState } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Eye, EyeOff, Loader2, Lock, Mail, AlertTriangle } from 'lucide-react';
import { validatePassword } from '@/lib/security';

const LoginPage = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const redirectTo = searchParams.get('redirect') || '/';

    const { signIn, isLocked, lockTimeRemaining, loginAttempts } = useAuth();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const remainingAttempts = 3 - loginAttempts.count;
    const lockSeconds = Math.ceil(lockTimeRemaining / 1000);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (isLocked) return;

        const passwordValidation = validatePassword(password);
        if (!passwordValidation.isValid) {
            setError(passwordValidation.error || 'Palavra-passe inválida.');
            setLoading(false);
            return;
        }

        const { error } = await signIn(email, password);

        if (error) {
            // Error is already generic from AuthContext.signIn
            setError(error.message);
        } else {
            navigate(redirectTo);
        }

        setLoading(false);
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
                    <CardHeader className="space-y-1 text-center">
                        <CardTitle className="text-2xl font-bold">Iniciar Sessão</CardTitle>
                        <CardDescription>
                            Entre na sua conta para continuar
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            {error && (
                                <Alert variant="destructive" className="animate-in fade-in slide-in-from-top-2">
                                    <AlertTriangle className="h-4 w-4" />
                                    <AlertDescription>{error}</AlertDescription>
                                </Alert>
                            )}

                            {isLocked && (
                                <Alert className="border-orange-500/50 bg-orange-500/10">
                                    <Lock className="h-4 w-4 text-orange-500" />
                                    <AlertDescription className="text-orange-600">
                                        <p className="mb-2">Conta bloqueada. Tente novamente em <strong>{lockSeconds}</strong> segundos.</p>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="w-full border-orange-500 text-orange-600 hover:bg-orange-500/20"
                                            onClick={() => navigate('/forgot-password')}
                                        >
                                            Esqueceu a sua palavra-passe? Redefinir agora
                                        </Button>
                                    </AlertDescription>
                                </Alert>
                            )}

                            <div className="space-y-2">
                                <Label htmlFor="email">Email</Label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        id="email"
                                        type="email"
                                        autoComplete="email"
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
                                    <Link
                                        to="/forgot-password"
                                        className="text-sm text-secondary hover:underline"
                                    >
                                        Esqueceu a senha?
                                    </Link>
                                </div>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        id="password"
                                        type={showPassword ? 'text' : 'password'}
                                        autoComplete="current-password"
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
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                                    >
                                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                    </button>
                                </div>
                            </div>

                            <Button
                                type="submit"
                                className="w-full bg-secondary hover:bg-secondary/90 text-secondary-foreground font-semibold h-11 transition-all duration-200"
                                disabled={loading || isLocked}
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Entrando...
                                    </>
                                ) : isLocked ? (
                                    <>
                                        <Lock className="mr-2 h-4 w-4" />
                                        Bloqueado ({lockSeconds}s)
                                    </>
                                ) : (
                                    'Entrar'
                                )}
                            </Button>

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
                        </form>
                    </CardContent>
                </Card>
            </div>
        </div >
    );
};

export default LoginPage;
