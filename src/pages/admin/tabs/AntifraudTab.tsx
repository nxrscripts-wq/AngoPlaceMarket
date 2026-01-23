import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    ShieldAlert,
    AlertTriangle,
    CheckCircle2,
    Users,
    Trash2,
    ArrowRight,
    Flag
} from 'lucide-react';
import { FraudAlert, UserProfile } from '@/types';
import { format } from 'date-fns';

interface AntifraudTabProps {
    alerts: FraudAlert[];
    topRiskUsers: UserProfile[];
    onResolveAlert: (id: string) => void;
    onViewUser: (user: UserProfile) => void;
}

export const AntifraudTab = ({ alerts, topRiskUsers, onResolveAlert, onViewUser }: AntifraudTabProps) => {
    return (
        <div className="space-y-8 animate-in zoom-in-95 duration-500">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Active Alerts */}
                <Card className="bg-card/40 border-border">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <ShieldAlert className="h-5 w-5 text-red-500" />
                            Alertas Ativos
                        </CardTitle>
                        <CardDescription>Incidentes de segurança detectados automaticamente</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {alerts.length === 0 ? (
                                <div className="text-center py-8 text-muted-foreground italic">
                                    Nenhum alerta pendente.
                                </div>
                            ) : (
                                alerts.map((alert) => (
                                    <div key={alert.id} className={`p-4 rounded-xl border flex justify-between items-start gap-4 ${alert.severity === 'high' ? 'bg-red-500/5 border-red-500/20' :
                                            alert.severity === 'medium' ? 'bg-orange-500/5 border-orange-500/20' :
                                                'bg-blue-500/5 border-blue-500/20'
                                        }`}>
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-2">
                                                <Badge variant={alert.severity === 'high' ? 'destructive' : 'secondary'} className="h-4 pb-0 text-[10px]">
                                                    {alert.severity.toUpperCase()}
                                                </Badge>
                                                <span className="text-[10px] text-muted-foreground">{format(new Date(alert.created_at), 'HH:mm - dd/MM')}</span>
                                            </div>
                                            <p className="text-sm font-bold">{alert.description}</p>
                                            <p className="text-xs text-muted-foreground">Utilizador: {alert.profiles?.full_name || 'Desconhecido'}</p>
                                        </div>
                                        <Button variant="ghost" size="icon" onClick={() => onResolveAlert(alert.id)} className="h-8 w-8 text-green-600 hover:bg-green-500/10">
                                            <CheckCircle2 className="h-5 w-5" />
                                        </Button>
                                    </div>
                                ))
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Top Risk Users */}
                <Card className="bg-card/40 border-border">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Flag className="h-5 w-5 text-orange-500" />
                            Utilizadores em Vigilância
                        </CardTitle>
                        <CardDescription>Contas com nível de risco médio/alto</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {topRiskUsers.length === 0 ? (
                                <div className="text-center py-8 text-muted-foreground italic">
                                    Nenhum utilizador em vigilância.
                                </div>
                            ) : (
                                topRiskUsers.map((user) => (
                                    <div key={user.id} className="flex items-center justify-between p-3 bg-muted/20 border border-border rounded-xl">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-orange-500/10 flex items-center justify-center">
                                                <AlertTriangle className="h-5 w-5 text-orange-600" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold">{user.full_name}</p>
                                                <p className="text-[10px] text-muted-foreground uppercase">{user.risk_level} Risk</p>
                                            </div>
                                        </div>
                                        <Button variant="ghost" size="sm" className="text-xs" onClick={() => onViewUser(user)}>
                                            Analisar <ArrowRight className="ml-1 h-3 w-3" />
                                        </Button>
                                    </div>
                                ))
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Antifraud Guidelines */}
            <Card className="bg-primary/5 border-primary/20">
                <CardHeader>
                    <CardTitle className="text-sm uppercase tracking-tighter text-primary">Diretrizes de Moderação</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs">
                    <div className="space-y-2">
                        <p className="font-bold text-primary flex items-center gap-2">
                            <AlertTriangle className="h-3 w-3" /> Padrões Suspeitos
                        </p>
                        <p className="text-muted-foreground">Múltiplas tentativas de login de IPs diferentes ou alteração rápida de dados bancários.</p>
                    </div>
                    <div className="space-y-2">
                        <p className="font-bold text-primary flex items-center gap-2">
                            <ShieldAlert className="h-3 w-3" /> Ações Recomendas
                        </p>
                        <p className="text-muted-foreground">Bloqueie a conta preventivamente e solicite verificação de identidade adicional via suporte.</p>
                    </div>
                    <div className="space-y-2">
                        <p className="font-bold text-primary flex items-center gap-2">
                            <CheckCircle2 className="h-3 w-3" /> Falsos Positivos
                        </p>
                        <p className="text-muted-foreground">Utilizadores em viagem ou com conexões instáveis podem gerar alertas. Verifique o histórico histórico.</p>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};
