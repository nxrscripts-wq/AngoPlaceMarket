import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
    Mail,
    Send,
    Bell,
    Users,
    MessageSquare,
    CheckCircle2,
    Clock,
    UserPlus,
    AlertCircle,
    Loader2
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export const CommunicationsTab = () => {
    const [template, setTemplate] = useState('welcome');
    const [emailLogs, setEmailLogs] = React.useState<any[]>([]);
    const [loading, setLoading] = React.useState(true);

    React.useEffect(() => {
        const fetchLogs = async () => {
            const { data, error } = await supabase
                .from('email_logs')
                .select('*')
                .order('created_at', { ascending: false })
                .limit(10);

            if (!error && data) {
                setEmailLogs(data);
            }
            setLoading(false);
        };

        fetchLogs();
    }, []);

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* ... composer ... */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <Card className="lg:col-span-2 bg-card/40 border-border">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Bell className="h-5 w-5 text-secondary" />
                            Nova Notificação Global
                        </CardTitle>
                        <CardDescription>Envie avisos para todos os utilizadores ou grupos específicos</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-sm font-bold">Título do Alerta</label>
                            <Input placeholder="Ex: Manutenção Programada" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-bold">Mensagem</label>
                            <Textarea
                                placeholder="Escreva o conteúdo da notificação..."
                                className="min-h-[150px]"
                            />
                        </div>
                        <div className="flex gap-4">
                            <Button className="flex-1 bg-secondary text-secondary-foreground font-bold">
                                <Users className="mr-2 h-4 w-4" /> Enviar para Todos
                            </Button>
                            <Button variant="outline" className="flex-1 border-secondary text-secondary">
                                <UserPlus className="mr-2 h-4 w-4" /> Apenas Vendedores
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                <div className="space-y-6">
                    <Card className="bg-card/40 border-border">
                        <CardHeader>
                            <CardTitle className="text-sm font-bold uppercase">Templates Recentes</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            {['welcome', 'password_reset', 'order_confirmation', 'product_approved'].map((t) => (
                                <Button key={t} variant="ghost" className="w-full justify-start text-xs h-auto py-2 px-3 border border-transparent hover:border-border">
                                    <MessageSquare className="mr-2 h-3 w-3 text-secondary" />
                                    {t.replace('_', ' ').toUpperCase()}
                                </Button>
                            ))}
                        </CardContent>
                    </Card>

                    <Card className="bg-secondary/10 border-secondary/20">
                        <CardContent className="p-4">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-secondary rounded-xl text-secondary-foreground">
                                    <Send className="h-6 w-6" />
                                </div>
                                <div>
                                    <p className="text-2xl font-black">{emailLogs.length}</p>
                                    <p className="text-[10px] text-muted-foreground uppercase font-bold">Emails Enviados (Recentes)</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Recent Email Log */}
            <Card className="bg-card/40 border-border">
                <CardHeader>
                    <CardTitle className="text-lg font-bold">Histórico de Emails Transacionais</CardTitle>
                    <CardDescription>Logs de envios automáticos do sistema</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-1">
                        {loading ? (
                            <div className="flex justify-center py-8">
                                <Loader2 className="h-6 w-6 animate-spin text-secondary" />
                            </div>
                        ) : emailLogs.length === 0 ? (
                            <p className="text-center py-8 text-muted-foreground text-sm">Nenhum email enviado recentemente.</p>
                        ) : (
                            emailLogs.map((log) => (
                                <div key={log.id} className="flex items-center justify-between p-3 hover:bg-muted/20 transition-colors rounded-lg text-sm border-b last:border-0 border-border">
                                    <div className="flex items-center gap-4">
                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${log.status === 'sent' ? 'bg-green-500/10 text-green-500' :
                                            log.status === 'failed' ? 'bg-red-500/10 text-red-500' : 'bg-muted text-muted-foreground'
                                            }`}>
                                            {log.status === 'sent' ? <CheckCircle2 className="h-4 w-4" /> :
                                                log.status === 'failed' ? <AlertCircle className="h-4 w-4" /> :
                                                    <Clock className="h-4 w-4" />}
                                        </div>
                                        <div>
                                            <p className="font-bold truncate max-w-[200px]">{log.subject}</p>
                                            <p className="text-[10px] text-muted-foreground">{log.recipient}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <Badge variant={log.status === 'sent' ? 'outline' : log.status === 'failed' ? 'destructive' : 'secondary'} className="text-[10px] uppercase">
                                            {log.status}
                                        </Badge>
                                        <p className="text-[10px] text-muted-foreground mt-1">
                                            {formatDistanceToNow(new Date(log.created_at), { addSuffix: true, locale: ptBR })}
                                        </p>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};
