import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';

import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
    ShieldCheck,
    LayoutDashboard,
    Clock,
    Users,
    Package,
    ShieldAlert,
    Bell,
    Settings,
    Mail,
    MapPin,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription
} from "@/components/ui/dialog";
import { toast } from 'sonner';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { LoadingScreen } from '@/components/LoadingScreen';
import { Product, UserProfile, Order, FraudAlert, MarketplaceSetting } from '@/types';

// Tab Components
import { DashboardTab } from './admin/tabs/DashboardTab';
import { UsersTab } from './admin/tabs/UsersTab';
import { ProductsTab } from './admin/tabs/ProductsTab';
import { AntifraudTab } from './admin/tabs/AntifraudTab';
import { CommunicationsTab } from './admin/tabs/CommunicationsTab';
import { SettingsTab } from './admin/tabs/SettingsTab';

const AdminPage = () => {
    const [activeTab, setActiveTab] = useState('dashboard');
    const [loading, setLoading] = useState(true);
    const [processingId, setProcessingId] = useState<string | null>(null);
    const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);

    // Data States
    const [products, setProducts] = useState<Product[]>([]);
    const [allUsers, setAllUsers] = useState<UserProfile[]>([]);
    const [recentOrders, setRecentOrders] = useState<Order[]>([]);
    const [fraudAlerts, setFraudAlerts] = useState<FraudAlert[]>([]);
    const [settings, setSettings] = useState<MarketplaceSetting[]>([]);
    const [stats, setStats] = useState({
        totalProducts: 0,
        pendingProducts: 0,
        totalUsers: 0,
        totalOrders: 0,
        activeSellers: 0
    });

    const fetchAllData = useCallback(async () => {
        try {
            setLoading(true);

            // Fetch data in parallel but handle errors individually
            const fetchOperations = [
                {
                    name: 'products',
                    op: supabase.from('products').select('*, profiles(full_name, email)')
                },
                {
                    name: 'profiles',
                    op: supabase.from('profiles').select('*')
                },
                {
                    name: 'orders',
                    op: supabase.from('orders').select('*, profiles(full_name, id, email)').order('created_at', { ascending: false })
                },
                {
                    name: 'alerts',
                    op: supabase.from('fraud_alerts').select('*, profiles(full_name)').eq('status', 'pending').order('created_at', { ascending: false })
                },
                {
                    name: 'settings',
                    op: supabase.from('marketplace_settings').select('*')
                }
            ];

            const results = await Promise.allSettled(fetchOperations.map(f => f.op));

            let fetchedProducts: Product[] = [];
            let fetchedUsers: UserProfile[] = [];
            let fetchedOrders: Order[] = [];
            let fetchedAlerts: FraudAlert[] = [];
            let fetchedSettings: MarketplaceSetting[] = [];

            results.forEach((result, index) => {
                const name = fetchOperations[index].name;
                if (result.status === 'fulfilled') {
                    const { data, error } = result.value;
                    if (error) {
                        console.error(`Error fetching ${name}:`, error);
                        return;
                    }

                    switch (name) {
                        case 'products':
                            fetchedProducts = (data || []) as Product[];
                            setProducts(fetchedProducts);
                            break;
                        case 'profiles':
                            fetchedUsers = (data || []) as UserProfile[];
                            setAllUsers(fetchedUsers);
                            break;
                        case 'orders':
                            fetchedOrders = (data || []) as Order[];
                            setRecentOrders(fetchedOrders);
                            break;
                        case 'alerts':
                            fetchedAlerts = (data || []) as FraudAlert[];
                            setFraudAlerts(fetchedAlerts);
                            break;
                        case 'settings':
                            fetchedSettings = (data || []) as MarketplaceSetting[];
                            setSettings(fetchedSettings);
                            break;
                    }
                } else {
                    console.error(`Fetch ${name} failed:`, result.reason);
                }
            });

            // Update stats based on local variables to avoid stale state issues or circularity
            setStats({
                totalProducts: fetchedProducts.length,
                pendingProducts: fetchedProducts.filter(p => p.status === 'PENDENTE').length,
                totalUsers: fetchedUsers.length,
                totalOrders: fetchedOrders.length,
                activeSellers: fetchedUsers.filter(u => u.is_seller).length
            });

        } catch (error) {
            console.error('Error in fetchAllData:', error);
            toast.error('Ocorreu um erro inesperado ao carregar os dados.');
        } finally {
            setLoading(false);
        }
    }, []); // Empty dependencies because we use local variables for stats calculation

    useEffect(() => {
        fetchAllData();
    }, [fetchAllData]);

    // Product Actions
    const handleApproveProduct = async (id: string) => {
        setProcessingId(id);
        try {
            const { error } = await supabase.from('products').update({ status: 'PUBLICADO' }).eq('id', id);
            if (error) throw error;

            const product = products.find(p => p.id === id);
            if (product) {
                await supabase.from('notifications').insert({
                    user_id: product.seller_id,
                    title: 'Produto Aprovado! 🎉',
                    message: `O seu anúncio "${product.name}" foi aprovado.`,
                    type: 'SUCCESS'
                });
            }
            toast.success('Produto aprovado!');
            fetchAllData();
        } catch (error) {
            toast.error('Erro ao aprovar.');
        } finally {
            setProcessingId(null);
        }
    };

    const handleRejectProduct = async (id: string, reason: string) => {
        setProcessingId(id);
        try {
            const { error } = await supabase.from('products').update({
                status: 'REJEITADO',
                rejection_reason: reason
            }).eq('id', id);
            if (error) throw error;

            const product = products.find(p => p.id === id);
            if (product) {
                await supabase.from('notifications').insert({
                    user_id: product.seller_id,
                    title: 'Produto Rejeitado ⚠️',
                    message: `O seu anúncio "${product.name}" foi rejeitado. Motivo: ${reason}`,
                    type: 'ERROR'
                });
            }
            toast.success('Produto rejeitado.');
            fetchAllData();
        } catch (error) {
            toast.error('Erro ao rejeitar.');
        } finally {
            setProcessingId(null);
        }
    };

    const handleRequestAdjustment = async (id: string, notes: string) => {
        setProcessingId(id);
        try {
            const { error } = await supabase.from('products').update({
                status: 'PENDENTE',
                needs_adjustment: true,
                adjustment_notes: notes
            }).eq('id', id);
            if (error) throw error;

            const product = products.find(p => p.id === id);
            if (product) {
                await supabase.from('notifications').insert({
                    user_id: product.seller_id,
                    title: 'Ajustes Necessários 📝',
                    message: `O seu anúncio "${product.name}" precisa de ajustes: ${notes}`,
                    type: 'INFO'
                });
            }
            toast.success('Solicitação de ajuste enviada.');
            fetchAllData();
        } catch (error) {
            toast.error('Erro ao processar ajuste.');
        } finally {
            setProcessingId(null);
        }
    };

    // User Actions
    const handleBlockUser = async (id: string, blocked: boolean) => {
        try {
            const { error } = await supabase.from('profiles').update({ is_blocked: blocked }).eq('id', id);
            if (error) throw error;
            toast.success(blocked ? 'Utilizador bloqueado.' : 'Utilizador desbloqueado.');
            fetchAllData();
        } catch (error) {
            toast.error('Erro ao alterar status do utilizador.');
        }
    };

    const handleSetRisk = async (id: string, level: 'low' | 'medium' | 'high') => {
        try {
            const { error } = await supabase.from('profiles').update({ risk_level: level }).eq('id', id);
            if (error) throw error;
            toast.success('Nível de risco atualizado.');
            fetchAllData();
        } catch (error) {
            toast.error('Erro ao atualizar risco.');
        }
    };

    // Antifraud Actions
    const handleResolveAlert = async (id: string) => {
        try {
            const { error } = await supabase.from('fraud_alerts').update({ status: 'resolved' }).eq('id', id);
            if (error) throw error;
            toast.success('Alerta resolvido.');
            fetchAllData();
        } catch (error) {
            toast.error('Erro ao resolver alerta.');
        }
    };

    return (
        <>
            <main className="container mx-auto px-4 py-8 md:py-12">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
                    <div className="flex items-center gap-4">
                        <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center shadow-2xl shadow-primary/20">
                            <ShieldCheck className="h-10 w-10 text-primary-foreground" />
                        </div>
                        <div>
                            <h1 className="text-3xl md:text-4xl font-black tracking-tight">Admin Console</h1>
                            <p className="text-muted-foreground text-sm md:text-lg italic opacity-80">AngoPlace Marketplace Control Hub</p>
                        </div>
                    </div>
                </div>

                <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
                    <div className="pb-2 -mx-4 px-4 md:mx-0 md:px-0">
                        <TabsList className="bg-muted/50 p-1 rounded-2xl h-auto grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2 w-full">
                            <TabsTrigger value="dashboard" className="rounded-xl py-3 border border-transparent data-[state=active]:border-border data-[state=active]:bg-card text-xs md:text-sm">
                                <LayoutDashboard className="h-4 w-4 mr-2" />
                                Dash
                            </TabsTrigger>
                            <TabsTrigger value="products" className="rounded-xl py-3 border border-transparent data-[state=active]:border-border data-[state=active]:bg-card text-xs md:text-sm">
                                <Package className="h-4 w-4 mr-2" />
                                Catálogo
                            </TabsTrigger>
                            <TabsTrigger value="users" className="rounded-xl py-3 border border-transparent data-[state=active]:border-border data-[state=active]:bg-card text-xs md:text-sm">
                                <Users className="h-4 w-4 mr-2" />
                                Contas
                            </TabsTrigger>
                            <TabsTrigger value="antifraud" className="rounded-xl py-3 border border-transparent data-[state=active]:border-border data-[state=active]:bg-card text-xs md:text-sm">
                                <ShieldAlert className="h-4 w-4 mr-2" />
                                Risco
                            </TabsTrigger>
                            <TabsTrigger value="comms" className="rounded-xl py-3 border border-transparent data-[state=active]:border-border data-[state=active]:bg-card text-xs md:text-sm">
                                <Bell className="h-4 w-4 mr-2" />
                                Comms
                            </TabsTrigger>
                            <TabsTrigger value="settings" className="rounded-xl py-3 border border-transparent data-[state=active]:border-border data-[state=active]:bg-card text-xs md:text-sm">
                                <Settings className="h-4 w-4 mr-2" />
                                Config
                            </TabsTrigger>
                        </TabsList>
                    </div>

                    {loading ? (
                        <LoadingScreen />
                    ) : (
                        <div className="min-h-[500px]">
                            <TabsContent value="dashboard">
                                <DashboardTab
                                    stats={stats}
                                    pendingProducts={products.filter(p => p.status === 'PENDENTE')}
                                    recentOrders={recentOrders}
                                    fraudAlerts={fraudAlerts}
                                    onNavigate={setActiveTab}
                                />
                            </TabsContent>

                            <TabsContent value="products">
                                <ProductsTab
                                    products={products}
                                    processingId={processingId}
                                    onApprove={handleApproveProduct}
                                    onReject={handleRejectProduct}
                                    onRequestAdjustment={handleRequestAdjustment}
                                />
                            </TabsContent>

                            <TabsContent value="users">
                                <UsersTab
                                    users={allUsers}
                                    onBlockUser={handleBlockUser}
                                    onSetRisk={handleSetRisk}
                                    onViewProfile={setSelectedUser}
                                />
                            </TabsContent>

                            <TabsContent value="antifraud">
                                <AntifraudTab
                                    alerts={fraudAlerts}
                                    topRiskUsers={allUsers.filter(u => u.risk_level === 'high' || u.risk_level === 'medium')}
                                    onResolveAlert={handleResolveAlert}
                                    onViewUser={setSelectedUser}
                                />
                            </TabsContent>

                            <TabsContent value="comms">
                                <CommunicationsTab />
                            </TabsContent>

                            <TabsContent value="settings">
                                <SettingsTab settings={settings} onSaveSetting={() => { }} />
                            </TabsContent>
                        </div>
                    )}
                </Tabs>
            </main>

            {/* User Detail Modal */}
            <Dialog open={!!selectedUser} onOpenChange={() => setSelectedUser(null)}>
                <DialogContent className="sm:max-w-md bg-card border-border border shadow-2xl">
                    <DialogHeader>
                        <DialogTitle className="text-2xl font-black">Informações da Conta</DialogTitle>
                        <DialogDescription>Dados fundamentais de identificação do utilizador</DialogDescription>
                    </DialogHeader>
                    {selectedUser && (
                        <div className="space-y-6 py-4">
                            <div className="flex flex-col items-center gap-4 text-center">
                                <div className={`w-24 h-24 rounded-full flex items-center justify-center border-4 ${selectedUser.is_blocked ? 'border-red-500/50' : 'border-secondary/20'}`}>
                                    {selectedUser.avatar_url ? (
                                        <img src={selectedUser.avatar_url} alt="" className="w-full h-full rounded-full object-cover" />
                                    ) : (
                                        <Users className={`h-10 w-10 ${selectedUser.is_blocked ? 'text-red-500' : 'text-secondary'}`} />
                                    )}
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold">{selectedUser.full_name}</h3>
                                    <div className="flex gap-2 justify-center mt-1">
                                        <Badge variant="outline">{selectedUser.is_admin ? 'Admin' : 'Utilizador'}</Badge>
                                        {selectedUser.is_blocked && <Badge variant="destructive">BLOQUEADO</Badge>}
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 gap-4 bg-muted/30 p-4 rounded-2xl border border-border">
                                <div className="flex items-center gap-3">
                                    <Mail className="h-4 w-4 text-secondary" />
                                    <span className="text-sm font-medium">{selectedUser.email}</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <MapPin className="h-4 w-4 text-secondary" />
                                    <span className="text-sm font-medium">{selectedUser.province}, {selectedUser.municipality}</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <Clock className="h-4 w-4 text-secondary" />
                                    <span className="text-sm font-medium">Conta criada em {format(new Date(selectedUser.created_at || new Date()), "d 'de' MMMM, yyyy", { locale: ptBR })}</span>
                                </div>
                            </div>

                            <div className="flex gap-3">
                                <Button className="flex-1 bg-secondary text-secondary-foreground font-black" onClick={() => setSelectedUser(null)}>
                                    Fechar
                                </Button>
                                <Button
                                    variant="outline"
                                    className={selectedUser.is_blocked ? "border-green-500 text-green-500" : "border-red-500 text-red-500"}
                                    onClick={() => {
                                        handleBlockUser(selectedUser.id, !selectedUser.is_blocked);
                                        setSelectedUser(null);
                                    }}
                                >
                                    {selectedUser.is_blocked ? 'Desbloquear' : 'Bloquear'}
                                </Button>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>

        </>
    );
};

export default AdminPage;
