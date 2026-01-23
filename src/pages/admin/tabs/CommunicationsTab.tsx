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
    UserPlus
} from 'lucide-react';

export const CommunicationsTab = () => {
    const [template, setTemplate] = useState('welcome');

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Notification Composer */}
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

                {/* Templates & Stats */}
                <div className="space-y-6">
                    <Card className="bg-card/40 border-border">
                        <CardHeader>
                            <CardTitle className="text-sm font-bold uppercase">Templates Recentes</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            {['Promoção de Fim de Semana', 'Aviso de Segurança', 'Novas Funcionalidades'].map((t) => (
                                <Button key={t} variant="ghost" className="w-full justify-start text-xs h-auto py-2 px-3 border border-transparent hover:border-border">
                                    <MessageSquare className="mr-2 h-3 w-3 text-secondary" />
                                    {t}
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
                                    <p className="text-2xl font-black">1.4k</p>
                                    <p className="text-[10px] text-muted-foreground uppercase font-bold">Notificações este mês</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Recent Communication Log */}
            <Card className="bg-card/40 border-border">
                <CardHeader>
                    <CardTitle className="text-lg font-bold">Histórico de Mensagens Automáticas</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-1">
                        {[
                            { target: 'Vendedor: João Silva', type: 'Aprovação de Produto', status: 'Enviado', time: '10 min atrás' },
                            { target: 'Comprador: Maria Santos', type: 'Alerta de Login Suspeito', status: 'Lido', time: '45 min atrás' },
                            { target: 'Todos os Utilizadores', type: 'Atualização de Termos', status: 'Enviado', time: '2 horas atrás' }
                        ].map((log, i) => (
                            <div key={i} className="flex items-center justify-between p-3 hover:bg-muted/20 transition-colors rounded-lg text-sm border-b last:border-0 border-border">
                                <div className="flex items-center gap-4">
                                    <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                                        <Clock className="h-4 w-4 text-muted-foreground" />
                                    </div>
                                    <div>
                                        <p className="font-bold">{log.type}</p>
                                        <p className="text-xs text-muted-foreground">{log.target}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <Badge variant={log.status === 'Enviado' ? 'outline' : 'secondary'} className="text-[10px]">
                                        {log.status}
                                    </Badge>
                                    <p className="text-[10px] text-muted-foreground mt-1">{log.time}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};
