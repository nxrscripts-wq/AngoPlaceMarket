import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
    Bell,
    Check,
    CheckCheck,
    Package,
    X,
    AlertCircle,
    MessageCircle,
    ShoppingBag,
    Truck,
    Loader2,
    Trash2,
    Filter
} from 'lucide-react';
import { formatDistanceToNow, format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { toast } from 'sonner';

interface Notification {
    id: string;
    type: 'product_approved' | 'product_rejected' | 'order_update' | 'order_placed' | 'chat_message' | 'status_update' | 'system' | 'SECURITY_ALERT' | 'SUCCESS' | 'ERROR' | 'INFO';
    title: string;
    message: string;
    product_id?: string;
    order_id?: string;
    read: boolean;
    created_at: string;
    metadata?: Record<string, unknown>;
}

const NotificationsPage = () => {
    const { user } = useAuth();
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('all');

    useEffect(() => {
        if (!user) return;
        fetchNotifications();
    }, [user]);

    const fetchNotifications = async () => {
        if (!user) return;

        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('notifications')
                .select('*')
                .eq('user_id', user.id)
                .order('created_at', { ascending: false })
                .limit(100);

            if (error) throw error;
            setNotifications((data || []) as Notification[]);
        } catch (error) {
            console.error('Error fetching notifications:', error);
            toast.error('Erro ao carregar notificações');
        } finally {
            setLoading(false);
        }
    };

    const markAsRead = async (id: string) => {
        try {
            await supabase.from('notifications').update({ read: true }).eq('id', id);
            setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
        } catch (error) {
            console.error('Error marking as read:', error);
        }
    };

    const markAllAsRead = async () => {
        if (!user) return;

        try {
            await supabase
                .from('notifications')
                .update({ read: true })
                .eq('user_id', user.id)
                .eq('read', false);

            setNotifications(prev => prev.map(n => ({ ...n, read: true })));
            toast.success('Todas marcadas como lidas');
        } catch (error) {
            toast.error('Erro ao marcar notificações');
        }
    };

    const deleteNotification = async (id: string) => {
        try {
            await supabase.from('notifications').delete().eq('id', id);
            setNotifications(prev => prev.filter(n => n.id !== id));
            toast.success('Notificação removida');
        } catch (error) {
            toast.error('Erro ao remover notificação');
        }
    };

    const clearAllRead = async () => {
        if (!user) return;

        try {
            await supabase
                .from('notifications')
                .delete()
                .eq('user_id', user.id)
                .eq('read', true);

            setNotifications(prev => prev.filter(n => !n.read));
            toast.success('Notificações lidas removidas');
        } catch (error) {
            toast.error('Erro ao limpar notificações');
        }
    };

    const getNotificationIcon = (type: string) => {
        const icons: Record<string, JSX.Element> = {
            'product_approved': <Check className="h-5 w-5 text-green-500" />,
            'product_rejected': <X className="h-5 w-5 text-red-500" />,
            'order_update': <Truck className="h-5 w-5 text-blue-500" />,
            'order_placed': <ShoppingBag className="h-5 w-5 text-purple-500" />,
            'chat_message': <MessageCircle className="h-5 w-5 text-secondary" />,
            'status_update': <Package className="h-5 w-5 text-orange-500" />,
            'SUCCESS': <Check className="h-5 w-5 text-green-500" />,
            'ERROR': <X className="h-5 w-5 text-red-500" />,
            'INFO': <AlertCircle className="h-5 w-5 text-blue-500" />,
            'SECURITY_ALERT': <AlertCircle className="h-5 w-5 text-red-500" />,
        };
        return icons[type] || <Bell className="h-5 w-5 text-muted-foreground" />;
    };

    const getNotificationColor = (type: string, read: boolean) => {
        if (read) return 'bg-muted/30';
        const colors: Record<string, string> = {
            'product_approved': 'bg-green-500/10 border-l-4 border-green-500',
            'product_rejected': 'bg-red-500/10 border-l-4 border-red-500',
            'order_update': 'bg-blue-500/10 border-l-4 border-blue-500',
            'order_placed': 'bg-purple-500/10 border-l-4 border-purple-500',
            'chat_message': 'bg-secondary/10 border-l-4 border-secondary',
            'SUCCESS': 'bg-green-500/10 border-l-4 border-green-500',
            'ERROR': 'bg-red-500/10 border-l-4 border-red-500',
        };
        return colors[type] || 'bg-primary/5 border-l-4 border-primary';
    };

    const getTypeLabel = (type: string) => {
        const labels: Record<string, string> = {
            'product_approved': 'Aprovado',
            'product_rejected': 'Rejeitado',
            'order_update': 'Pedido',
            'order_placed': 'Novo Pedido',
            'chat_message': 'Mensagem',
            'status_update': 'Status',
            'SUCCESS': 'Sucesso',
            'ERROR': 'Erro',
            'INFO': 'Info',
        };
        return labels[type] || 'Sistema';
    };

    const filteredNotifications = useMemo(() => {
        if (activeTab === 'all') return notifications;
        if (activeTab === 'unread') return notifications.filter(n => !n.read);
        if (activeTab === 'orders') return notifications.filter(n =>
            ['order_update', 'order_placed', 'status_update'].includes(n.type)
        );
        if (activeTab === 'products') return notifications.filter(n =>
            ['product_approved', 'product_rejected'].includes(n.type)
        );
        if (activeTab === 'messages') return notifications.filter(n => n.type === 'chat_message');
        return notifications;
    }, [notifications, activeTab]);

    const unreadCount = notifications.filter(n => !n.read).length;

    if (loading) {
        return (
            <main className="container mx-auto px-4 py-8">
                <div className="flex items-center justify-center py-20">
                    <Loader2 className="h-8 w-8 animate-spin text-secondary" />
                </div>
            </main>
        );
    }

    return (
        <main className="container mx-auto px-4 py-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-secondary/10 rounded-2xl flex items-center justify-center">
                        <Bell className="h-7 w-7 text-secondary" />
                    </div>
                    <div>
                        <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-3">
                            Notificações
                            {unreadCount > 0 && (
                                <Badge className="bg-primary text-primary-foreground">
                                    {unreadCount} nova{unreadCount !== 1 ? 's' : ''}
                                </Badge>
                            )}
                        </h1>
                        <p className="text-muted-foreground">
                            {notifications.length} notificações no total
                        </p>
                    </div>
                </div>

                <div className="flex gap-2">
                    {unreadCount > 0 && (
                        <Button variant="outline" onClick={markAllAsRead}>
                            <CheckCheck className="h-4 w-4 mr-2" />
                            Marcar Todas Lidas
                        </Button>
                    )}
                    <Button variant="ghost" onClick={clearAllRead} className="text-muted-foreground">
                        <Trash2 className="h-4 w-4 mr-2" />
                        Limpar Lidas
                    </Button>
                </div>
            </div>

            {/* Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
                <TabsList className="bg-muted/50 p-1 rounded-xl h-auto flex flex-wrap gap-2">
                    <TabsTrigger value="all" className="rounded-lg">
                        Todas
                    </TabsTrigger>
                    <TabsTrigger value="unread" className="rounded-lg">
                        Não Lidas
                        {unreadCount > 0 && (
                            <Badge variant="secondary" className="ml-2 scale-90">{unreadCount}</Badge>
                        )}
                    </TabsTrigger>
                    <TabsTrigger value="orders" className="rounded-lg">
                        <ShoppingBag className="h-4 w-4 mr-1" />
                        Pedidos
                    </TabsTrigger>
                    <TabsTrigger value="products" className="rounded-lg">
                        <Package className="h-4 w-4 mr-1" />
                        Produtos
                    </TabsTrigger>
                    <TabsTrigger value="messages" className="rounded-lg">
                        <MessageCircle className="h-4 w-4 mr-1" />
                        Mensagens
                    </TabsTrigger>
                </TabsList>

                <TabsContent value={activeTab} className="mt-0">
                    {filteredNotifications.length === 0 ? (
                        <Card className="p-12 text-center">
                            <Bell className="h-12 w-12 mx-auto text-muted-foreground mb-4 opacity-50" />
                            <h3 className="text-lg font-semibold mb-2">Nenhuma notificação</h3>
                            <p className="text-muted-foreground">
                                {activeTab === 'unread' ? 'Todas as notificações foram lidas!' : 'Não há notificações nesta categoria.'}
                            </p>
                        </Card>
                    ) : (
                        <div className="space-y-3">
                            {filteredNotifications.map(notification => (
                                <Card
                                    key={notification.id}
                                    className={`p-4 transition-all hover:shadow-md cursor-pointer ${getNotificationColor(notification.type, notification.read)}`}
                                    onClick={() => markAsRead(notification.id)}
                                >
                                    <div className="flex items-start gap-4">
                                        <div className="w-10 h-10 rounded-full bg-card flex items-center justify-center shrink-0 shadow-sm">
                                            {getNotificationIcon(notification.type)}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-1">
                                                <h4 className={`font-semibold ${notification.read ? 'text-muted-foreground' : 'text-foreground'}`}>
                                                    {notification.title}
                                                </h4>
                                                <Badge variant="outline" className="text-[10px] shrink-0">
                                                    {getTypeLabel(notification.type)}
                                                </Badge>
                                                {!notification.read && (
                                                    <span className="h-2 w-2 bg-secondary rounded-full shrink-0" />
                                                )}
                                            </div>
                                            <p className="text-sm text-muted-foreground line-clamp-2">
                                                {notification.message}
                                            </p>
                                            <p className="text-xs text-muted-foreground mt-2">
                                                {formatDistanceToNow(new Date(notification.created_at), {
                                                    addSuffix: true,
                                                    locale: ptBR
                                                })} • {format(new Date(notification.created_at), 'dd/MM HH:mm')}
                                            </p>
                                        </div>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="shrink-0 h-8 w-8 text-muted-foreground hover:text-red-500"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                deleteNotification(notification.id);
                                            }}
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </Card>
                            ))}
                        </div>
                    )}
                </TabsContent>
            </Tabs>
        </main>
    );
};

export default NotificationsPage;
