import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Eye, EyeOff, Loader2, Lock, Mail, User, CheckCircle, AlertTriangle, MapPin } from 'lucide-react';
import { ANGOLA_PROVINCES, getMunicipalitiesByProvince } from '@/lib/angolaLocations';
import { validatePassword } from '@/lib/security';

const RegisterPage = () => {
    const navigate = useNavigate();
    const { signUp } = useAuth();

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        password: '',
        confirmPassword: '',
        province: '',
        municipality: '',
    });
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    const municipalities = formData.province ? getMunicipalitiesByProvince(formData.province) : [];

    const handleChange = (field: string, value: string) => {
        setFormData((prev) => ({
            ...prev,
            [field]: value,
            ...(field === 'province' ? { municipality: '' } : {}),
        }));
    };

    const validateForm = () => {
        const passwordValidation = validatePassword(formData.password);
        if (!passwordValidation.isValid) {
            setError(passwordValidation.error || 'Palavra-passe inválida.');
            return false;
        }
        if (formData.password !== formData.confirmPassword) {
            setError('As palavras-passe não coincidem.');
            return false;
        }
        if (!formData.province || !formData.municipality) {
            setError('Selecione a sua localização.');
            return false;
        }
        return true;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        if (!validateForm()) return;

        setLoading(true);

        const { error } = await signUp(formData.email, formData.password, {
            full_name: formData.name,
            phone: formData.phone,
            province: formData.province,
            municipality: formData.municipality,
        });

        if (error) {
            setError(error.message || 'Erro ao criar conta. Tente novamente.');
        } else {
            setSuccess(true);
        }

        setLoading(false);
    };

    if (success) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 flex items-center justify-center p-4">
                <Card className="w-full max-w-md border-green-500/50 shadow-2xl">
                    <CardContent className="pt-6 text-center">
                        <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                            <CheckCircle className="h-8 w-8 text-green-500" />
                        </div>
                        <h2 className="text-xl font-bold mb-2">Conta Criada com Sucesso!</h2>
                        <p className="text-muted-foreground mb-6">
                            Verifique o seu email para confirmar a conta.
                        </p>
                        <Button
                            onClick={() => navigate('/login')}
                            className="bg-secondary hover:bg-secondary/90"
                        >
                            Ir para Login
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 flex items-center justify-center p-4 py-8">
            <div className="w-full max-w-md">
                {/* Logo */}
                <div className="text-center mb-6">
                    <Link to="/" className="inline-flex items-center hover:opacity-90 transition-opacity">
                        <img src="/logo.png" alt="AngoPlaceMarket" className="h-20 w-auto object-contain" />
                    </Link>
                </div>

                <Card className="border-border/50 shadow-2xl">
                    <CardHeader className="space-y-1 text-center">
                        <CardTitle className="text-2xl font-bold">Criar Conta</CardTitle>
                        <CardDescription>
                            Junte-se ao maior marketplace de Angola
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

                            <div className="space-y-2">
                                <Label htmlFor="name">Nome Completo</Label>
                                <div className="relative">
                                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        id="name"
                                        type="text"
                                        autoComplete="name"
                                        placeholder="Seu nome completo"
                                        value={formData.name}
                                        onChange={(e) => handleChange('name', e.target.value)}
                                        className="pl-10"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="email">Email</Label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        id="email"
                                        type="email"
                                        autoComplete="email"
                                        placeholder="seu@email.com"
                                        value={formData.email}
                                        onChange={(e) => handleChange('email', e.target.value)}
                                        className="pl-10"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-2">
                                    <Label className="flex items-center gap-1">
                                        <MapPin className="h-3 w-3" />
                                        Província
                                    </Label>
                                    <select
                                        value={formData.province}
                                        onChange={(e) => handleChange('province', e.target.value)}
                                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                    >
                                        <option value="">Selecione</option>
                                        {ANGOLA_PROVINCES.map((province) => (
                                            <option key={province.id} value={province.id}>
                                                {province.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="space-y-2">
                                    <Label>Município</Label>
                                    <select
                                        value={formData.municipality}
                                        onChange={(e) => handleChange('municipality', e.target.value)}
                                        disabled={!formData.province}
                                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                    >
                                        <option value="">Selecione</option>
                                        {municipalities.map((mun) => (
                                            <option key={mun.id} value={mun.id}>
                                                {mun.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="password">Palavra-passe</Label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        id="password"
                                        type={showPassword ? 'text' : 'password'}
                                        autoComplete="new-password"
                                        placeholder="Mínimo 6 caracteres"
                                        value={formData.password}
                                        onChange={(e) => handleChange('password', e.target.value)}
                                        className="pl-10 pr-10"
                                        required
                                        minLength={6}
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

                            <div className="space-y-2">
                                <Label htmlFor="confirmPassword">Confirmar Palavra-passe</Label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        id="confirmPassword"
                                        type={showPassword ? 'text' : 'password'}
                                        autoComplete="new-password"
                                        placeholder="Confirme a palavra-passe"
                                        value={formData.confirmPassword}
                                        onChange={(e) => handleChange('confirmPassword', e.target.value)}
                                        className="pl-10"
                                        required
                                    />
                                </div>
                            </div>

                            <Button
                                type="submit"
                                className="w-full bg-secondary hover:bg-secondary/90 text-secondary-foreground font-semibold h-11 transition-all duration-200"
                                disabled={loading}
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Criando conta...
                                    </>
                                ) : (
                                    'Criar Conta'
                                )}
                            </Button>

                            <p className="text-center text-sm text-muted-foreground">
                                Já tem uma conta?{' '}
                                <Link to="/login" className="text-secondary font-medium hover:underline">
                                    Iniciar sessão
                                </Link>
                            </p>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default RegisterPage;
