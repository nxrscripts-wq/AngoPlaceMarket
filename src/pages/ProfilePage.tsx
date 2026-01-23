import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
    Camera,
    User,
    Lock as LockIcon,
    Loader2,
    CheckCircle,
    AlertTriangle,
    Eye,
    EyeOff,
    Upload,
    MapPin,
    ShoppingBag,
    Heart,
    RotateCcw,
    Truck,
    LayoutDashboard,
    ChevronRight,
} from 'lucide-react';
import { ANGOLA_PROVINCES, getMunicipalitiesByProvince } from '@/lib/angolaLocations';
import { toast } from 'sonner';
import { validatePassword } from '@/lib/security';
import { LoadingScreen } from '@/components/LoadingScreen';


const ProfilePage = () => {
    const navigate = useNavigate();
    const { user, updatePassword, loading: authLoading } = useAuth();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [profileData, setProfileData] = useState({
        full_name: user?.user_metadata?.full_name || '',
        phone: user?.user_metadata?.phone || '',
        province: user?.user_metadata?.province || '',
        municipality: user?.user_metadata?.municipality || '',
    });
    const [avatarUrl, setAvatarUrl] = useState<string | null>(user?.user_metadata?.avatar_url || null);

    useEffect(() => {
        if (user) {
            setProfileData({
                full_name: user.user_metadata?.full_name || '',
                phone: user.user_metadata?.phone || '',
                province: user.user_metadata?.province || '',
                municipality: user.user_metadata?.municipality || '',
            });
            setAvatarUrl(user.user_metadata?.avatar_url || null);
        }
    }, [user]);

    const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
    const [avatarFile, setAvatarFile] = useState<File | null>(null);
    const [savingProfile, setSavingProfile] = useState(false);

    const [passwords, setPasswords] = useState({
        current: '',
        new: '',
        confirm: '',
    });
    const [showPasswords, setShowPasswords] = useState(false);
    const [changingPassword, setChangingPassword] = useState(false);
    const [passwordError, setPasswordError] = useState<string | null>(null);
    const [passwordSuccess, setPasswordSuccess] = useState(false);

    const municipalities = profileData.province
        ? getMunicipalitiesByProvince(profileData.province)
        : [];

    const getInitials = () => {
        const name = profileData.full_name || user?.email || '';
        return name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);
    };

    const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (!file.type.startsWith('image/')) {
            toast.error('Por favor, selecione uma imagem válida.');
            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            toast.error('A imagem deve ter menos de 5MB.');
            return;
        }

        setAvatarFile(file);
        const reader = new FileReader();
        reader.onloadend = () => {
            setAvatarPreview(reader.result as string);
        };
        reader.readAsDataURL(file);
    };

    const handleSaveProfile = async () => {
        setSavingProfile(true);

        try {
            let newAvatarUrl = avatarUrl;

            // Upload avatar if changed
            if (avatarFile && user) {
                const fileExt = avatarFile.name.split('.').pop();
                const filePath = `${user.id}/avatar.${fileExt}`;

                const { error: uploadError } = await supabase.storage
                    .from('avatars')
                    .upload(filePath, avatarFile, { upsert: true });

                if (uploadError) throw uploadError;

                const { data: { publicUrl } } = supabase.storage
                    .from('avatars')
                    .getPublicUrl(filePath);

                newAvatarUrl = publicUrl;
            }

            // Update user metadata
            const { error } = await supabase.auth.updateUser({
                data: {
                    full_name: profileData.full_name,
                    phone: profileData.phone,
                    province: profileData.province,
                    municipality: profileData.municipality,
                    avatar_url: newAvatarUrl,
                },
            });

            if (error) throw error;

            setAvatarUrl(newAvatarUrl);
            setAvatarFile(null);
            setAvatarPreview(null);
            toast.success('Perfil atualizado com sucesso!');
        } catch (err) {
            console.error('Error updating profile:', err);
            toast.error('Erro ao atualizar perfil. Tente novamente.');
        } finally {
            setSavingProfile(false);
        }
    };

    const handleChangePassword = async (e: React.FormEvent) => {
        e.preventDefault();
        setPasswordError(null);
        setPasswordSuccess(false);

        const passwordValidation = validatePassword(passwords.new);
        if (!passwordValidation.isValid) {
            setPasswordError(passwordValidation.error || 'Palavra-passe inválida.');
            return;
        }

        if (passwords.new !== passwords.confirm) {
            setPasswordError('As palavras-passe não coincidem.');
            return;
        }

        setChangingPassword(true);

        // 1. Verify current password by attempting a re-authentication
        const { error: reAuthError } = await supabase.auth.signInWithPassword({
            email: user.email!,
            password: passwords.current,
        });

        if (reAuthError) {
            setPasswordError('A palavra-passe atual está incorreta.');
            setChangingPassword(false);
            return;
        }

        // 2. If re-auth successful, update to new password
        const { error } = await updatePassword(passwords.new);

        if (error) {
            setPasswordError('Erro ao alterar palavra-passe. Tente novamente.');
        } else {
            setPasswordSuccess(true);
            setPasswords({ current: '', new: '', confirm: '' });
            toast.success('Palavra-passe alterada com sucesso!');

            // 3. Trigger Security Notification
            await supabase.from('notifications').insert({
                user_id: user.id,
                title: 'Segurança: Palavra-passe Alterada',
                message: 'A sua palavra-passe foi alterada com sucesso. Se não foi você, contacte o suporte imediatamente.',
                type: 'SECURITY'
            });
        }

        setChangingPassword(false);
    };

    if (authLoading) {
        return <LoadingScreen />;
    }

    if (!user) {
        navigate('/login');
        return null;
    }

    return (
        <>

            <main className="container mx-auto px-4 py-8">
                <div className="max-w-2xl mx-auto">
                    <h1 className="text-2xl font-bold mb-6">Meu Perfil</h1>

                    <Tabs defaultValue="dashboard" className="space-y-6">
                        <TabsList className="grid w-full grid-cols-3">
                            <TabsTrigger value="dashboard" className="flex items-center gap-2">
                                <LayoutDashboard className="h-4 w-4" />
                                Visão Geral
                            </TabsTrigger>
                            <TabsTrigger value="profile" className="flex items-center gap-2">
                                <User className="h-4 w-4" />
                                Perfil
                            </TabsTrigger>
                            <TabsTrigger value="security" className="flex items-center gap-2">
                                <LockIcon className="h-4 w-4" />
                                Segurança
                            </TabsTrigger>
                        </TabsList>

                        <TabsContent value="dashboard" className="space-y-6">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <Card className="bg-card/40 border-border p-6 cursor-pointer hover:border-secondary transition-all group" onClick={() => navigate('/orders')}>
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-4">
                                            <div className="p-3 bg-secondary/10 rounded-xl text-secondary">
                                                <ShoppingBag className="h-6 w-6" />
                                            </div>
                                            <div>
                                                <h4 className="font-bold">Meus Pedidos</h4>
                                                <p className="text-sm text-muted-foreground">Veja seu histórico</p>
                                            </div>
                                        </div>
                                        <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:translate-x-1 transition-transform" />
                                    </div>
                                </Card>
                                <Card className="bg-card/40 border-border p-6 cursor-pointer hover:border-secondary transition-all group" onClick={() => navigate('/wishlist')}>
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-4">
                                            <div className="p-3 bg-red-500/10 rounded-xl text-red-500">
                                                <Heart className="h-6 w-6" />
                                            </div>
                                            <div>
                                                <h4 className="font-bold">Favoritos</h4>
                                                <p className="text-sm text-muted-foreground">Itens que você amou</p>
                                            </div>
                                        </div>
                                        <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:translate-x-1 transition-transform" />
                                    </div>
                                </Card>
                                <Card className="bg-card/40 border-border p-6 cursor-pointer hover:border-secondary transition-all group" onClick={() => navigate('/returns')}>
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-4">
                                            <div className="p-3 bg-blue-500/10 rounded-xl text-blue-500">
                                                <RotateCcw className="h-6 w-6" />
                                            </div>
                                            <div>
                                                <h4 className="font-bold">Devoluções</h4>
                                                <p className="text-sm text-muted-foreground">Gerencie trocas</p>
                                            </div>
                                        </div>
                                        <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:translate-x-1 transition-transform" />
                                    </div>
                                </Card>
                                <Card className="bg-card/40 border-border p-6 cursor-pointer hover:border-secondary transition-all group" onClick={() => navigate('/track')}>
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-4">
                                            <div className="p-3 bg-orange-500/10 rounded-xl text-orange-500">
                                                <Truck className="h-6 w-6" />
                                            </div>
                                            <div>
                                                <h4 className="font-bold">Rastreio</h4>
                                                <p className="text-sm text-muted-foreground">Onde está seu item</p>
                                            </div>
                                        </div>
                                        <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:translate-x-1 transition-transform" />
                                    </div>
                                </Card>
                            </div>

                            <Card className="bg-secondary text-secondary-foreground p-8 rounded-3xl border-none shadow-2xl relative overflow-hidden group">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 group-hover:scale-110 transition-transform duration-700" />
                                <div className="flex flex-col md:flex-row items-center justify-between gap-6 relative z-10">
                                    <div className="space-y-2 text-center md:text-left">
                                        <h3 className="text-2xl font-black">Venda seu Hardware</h3>
                                        <p className="opacity-80">Transforme suas peças usadas em dinheiro rápido.</p>
                                    </div>
                                    <Button className="bg-white text-secondary hover:bg-white/90 font-black h-12 px-8 rounded-xl" onClick={() => navigate('/publish')}>
                                        Começar a Vender
                                    </Button>
                                </div>
                            </Card>
                        </TabsContent>

                        <TabsContent value="profile">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Informações Pessoais</CardTitle>
                                    <CardDescription>
                                        Atualize seus dados de perfil e foto
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    {/* Avatar Upload */}
                                    <div className="flex flex-col items-center gap-4">
                                        <div className="relative group">
                                            <Avatar className="h-24 w-24 border-4 border-border">
                                                <AvatarImage src={avatarPreview || avatarUrl || undefined} />
                                                <AvatarFallback className="text-xl bg-secondary text-secondary-foreground">
                                                    {getInitials()}
                                                </AvatarFallback>
                                            </Avatar>
                                            <button
                                                onClick={() => fileInputRef.current?.click()}
                                                className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                            >
                                                <Camera className="h-6 w-6 text-white" />
                                            </button>
                                            <input
                                                ref={fileInputRef}
                                                type="file"
                                                accept="image/*"
                                                onChange={handleAvatarChange}
                                                className="hidden"
                                            />
                                        </div>
                                        <p className="text-xs text-muted-foreground">
                                            Clique para alterar a foto (JPG, PNG até 5MB)
                                        </p>
                                    </div>

                                    <div className="space-y-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="fullName">Nome Completo</Label>
                                            <div className="relative">
                                                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                                <Input
                                                    id="fullName"
                                                    value={profileData.full_name}
                                                    onChange={(e) => setProfileData({ ...profileData, full_name: e.target.value })}
                                                    className="pl-10"
                                                    placeholder="Seu nome completo"
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <Label>Email</Label>
                                            <Input value={user.email || ''} disabled className="bg-muted" />
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label className="flex items-center gap-1">
                                                    <MapPin className="h-3 w-3" />
                                                    Província
                                                </Label>
                                                <select
                                                    value={profileData.province}
                                                    onChange={(e) => setProfileData({ ...profileData, province: e.target.value, municipality: '' })}
                                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                                >
                                                    <option value="">Selecione</option>
                                                    {ANGOLA_PROVINCES.map((p) => (
                                                        <option key={p.id} value={p.id}>{p.name}</option>
                                                    ))}
                                                </select>
                                            </div>

                                            <div className="space-y-2">
                                                <Label>Município</Label>
                                                <select
                                                    value={profileData.municipality}
                                                    onChange={(e) => setProfileData({ ...profileData, municipality: e.target.value })}
                                                    disabled={!profileData.province}
                                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                                >
                                                    <option value="">Selecione</option>
                                                    {municipalities.map((m) => (
                                                        <option key={m.id} value={m.id}>{m.name}</option>
                                                    ))}
                                                </select>
                                            </div>
                                        </div>
                                    </div>

                                    <Button
                                        onClick={handleSaveProfile}
                                        className="w-full bg-secondary hover:bg-secondary/90"
                                        disabled={savingProfile}
                                    >
                                        {savingProfile ? (
                                            <>
                                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                Salvando...
                                            </>
                                        ) : (
                                            <>
                                                <Upload className="mr-2 h-4 w-4" />
                                                Salvar Alterações
                                            </>
                                        )}
                                    </Button>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        <TabsContent value="security">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Alterar Palavra-passe</CardTitle>
                                    <CardDescription>
                                        Mantenha sua conta segura com uma senha forte
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <form onSubmit={handleChangePassword} className="space-y-4">
                                        {passwordError && (
                                            <Alert variant="destructive">
                                                <AlertTriangle className="h-4 w-4" />
                                                <AlertDescription>{passwordError}</AlertDescription>
                                            </Alert>
                                        )}

                                        {passwordSuccess && (
                                            <Alert className="border-green-500/50 bg-green-500/10">
                                                <CheckCircle className="h-4 w-4 text-green-500" />
                                                <AlertDescription className="text-green-600">
                                                    Palavra-passe alterada com sucesso!
                                                </AlertDescription>
                                            </Alert>
                                        )}

                                        <div className="space-y-2">
                                            <Label htmlFor="currentPassword">Palavra-passe Atual</Label>
                                            <div className="relative">
                                                <LockIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                                <Input
                                                    id="currentPassword"
                                                    type={showPasswords ? 'text' : 'password'}
                                                    value={passwords.current}
                                                    onChange={(e) => setPasswords({ ...passwords, current: e.target.value })}
                                                    className="pl-10 pr-10"
                                                    required
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => setShowPasswords(!showPasswords)}
                                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                                                >
                                                    {showPasswords ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                                </button>
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="newPassword">Nova Palavra-passe</Label>
                                            <div className="relative">
                                                <LockIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                                <Input
                                                    id="newPassword"
                                                    type={showPasswords ? 'text' : 'password'}
                                                    value={passwords.new}
                                                    onChange={(e) => setPasswords({ ...passwords, new: e.target.value })}
                                                    className="pl-10"
                                                    placeholder="Mínimo 6 caracteres"
                                                    required
                                                    minLength={6}
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="confirmPassword">Confirmar Nova Palavra-passe</Label>
                                            <div className="relative">
                                                <LockIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                                <Input
                                                    id="confirmPassword"
                                                    type={showPasswords ? 'text' : 'password'}
                                                    value={passwords.confirm}
                                                    onChange={(e) => setPasswords({ ...passwords, confirm: e.target.value })}
                                                    className="pl-10"
                                                    required
                                                />
                                            </div>
                                        </div>

                                        <Button
                                            type="submit"
                                            className="w-full bg-secondary hover:bg-secondary/90"
                                            disabled={changingPassword}
                                        >
                                            {changingPassword ? (
                                                <>
                                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                    Alterando...
                                                </>
                                            ) : (
                                                'Alterar Palavra-passe'
                                            )}
                                        </Button>
                                    </form>
                                </CardContent>
                            </Card>
                        </TabsContent>
                    </Tabs>
                </div>
            </main>

        </>
    );
};

export default ProfilePage;
