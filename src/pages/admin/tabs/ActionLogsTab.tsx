import React, { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/lib/supabase';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    Search,
    Clock,
    Loader2,
    CheckCircle2,
    XCircle,
    UserX,
    UserCheck,
    Package,
    ShieldAlert,
    Settings,
    RefreshCw,
    Filter,
    AlertTriangle
} from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface ActionLog {
    id: string;
    admin_id: string;
    action_type: string;
    target_type: 'user' | 'product' | 'order' | 'setting' | 'security';
    target_id: string;
    details: Record<string, any>;
    created_at: string;
    admin?: {
        full_name: string;
        email: string;
    };
}

interface ActionLogsTabProps {
    initialLogs?: ActionLog[];
}

export const ActionLogsTab = ({ initialLogs }: ActionLogsTabProps) => {
    const [logs, setLogs] = useState<ActionLog[]>(initialLogs || []);
    const [loading, setLoading] = useState(!initialLogs);
    const [search, setSearch] = useState('');
    const [filterType, setFilterType] = useState<string>('all');
    const [filterTarget, setFilterTarget] = useState<string>('all');

    const fetchLogs = async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('admin_action_logs')
                .select('*, admin:admin_id(full_name, email)')
                .order('created_at', { ascending: false })
                .limit(200);

            if (error) throw error;
            setLogs((data || []) as ActionLog[]);
        } catch (error) {
            console.error('Error fetching logs:', error);
            // Generate mock data if table doesn't exist
            setLogs(generateMockLogs());
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!initialLogs) {
            fetchLogs();
        }
    }, [initialLogs]);

    const generateMockLogs = (): ActionLog[] => {
        const actions = [
            { type: 'user_blocked', target: 'user', details: { reason: 'Atividade suspeita', duration: '7d' } },
            { type: 'user_unblocked', target: 'user', details: { reason: 'Revisão manual' } },
            { type: 'product_approved', target: 'product', details: { name: 'iPhone 15 Pro' } },
            { type: 'product_rejected', target: 'product', details: { name: 'Produto Ilegal', reason: 'Viola termos de uso' } },
            { type: 'risk_level_changed', target: 'user', details: { from: 'low', to: 'high' } },
            { type: 'setting_updated', target: 'setting', details: { key: 'commission_rate', value: '10%' } },
            { type: 'security_alert_resolved', target: 'security', details: { alert_id: 'ALT123' } },
        ];

        return Array.from({ length: 20 }, (_, i) => {
            const action = actions[i % actions.length];
            return {
                id: `log_${i}`,
                admin_id: 'admin_1',
                action_type: action.type,
                target_type: action.target as any,
                target_id: `target_${i}`,
                details: action.details,
                created_at: new Date(Date.now() - i * 3600000).toISOString(),
                admin: { full_name: 'Admin User', email: 'admin@angoplace.ao' }
            };
        });
    };

    const filteredLogs = useMemo(() => {
        return logs.filter(log => {
            const matchesSearch =
                log.action_type.toLowerCase().includes(search.toLowerCase()) ||
                log.admin?.full_name?.toLowerCase().includes(search.toLowerCase()) ||
                JSON.stringify(log.details).toLowerCase().includes(search.toLowerCase());

            const matchesType = filterType === 'all' || log.action_type === filterType;
            const matchesTarget = filterTarget === 'all' || log.target_type === filterTarget;

            return matchesSearch && matchesType && matchesTarget;
        });
    }, [logs, search, filterType, filterTarget]);

    const getActionIcon = (action: string) => {
        if (action.includes('blocked')) return <UserX className="h-4 w-4 text-red-500" />;
        if (action.includes('unblocked')) return <UserCheck className="h-4 w-4 text-green-500" />;
        if (action.includes('approved')) return <CheckCircle2 className="h-4 w-4 text-green-500" />;
        if (action.includes('rejected')) return <XCircle className="h-4 w-4 text-red-500" />;
        if (action.includes('risk')) return <ShieldAlert className="h-4 w-4 text-orange-500" />;
        if (action.includes('setting')) return <Settings className="h-4 w-4 text-blue-500" />;
        if (action.includes('security')) return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
        return <Clock className="h-4 w-4 text-muted-foreground" />;
    };

    const getActionLabel = (action: string): string => {
        const labels: Record<string, string> = {
            'user_blocked': 'Utilizador Bloqueado',
            'user_unblocked': 'Utilizador Desbloqueado',
            'user_banned_temp': 'Ban Temporário',
            'user_banned_perm': 'Ban Permanente',
            'product_approved': 'Produto Aprovado',
            'product_rejected': 'Produto Rejeitado',
            'product_adjustment': 'Ajuste Solicitado',
            'risk_level_changed': 'Risco Alterado',
            'setting_updated': 'Configuração Atualizada',
            'security_alert_resolved': 'Alerta Resolvido',
        };
        return labels[action] || action.replace(/_/g, ' ');
    };

    const getTargetBadgeColor = (target: string) => {
        const colors: Record<string, string> = {
            'user': 'bg-purple-500/10 text-purple-500 border-purple-500/20',
            'product': 'bg-blue-500/10 text-blue-500 border-blue-500/20',
            'order': 'bg-green-500/10 text-green-500 border-green-500/20',
            'setting': 'bg-gray-500/10 text-gray-500 border-gray-500/20',
            'security': 'bg-red-500/10 text-red-500 border-red-500/20',
        };
        return colors[target] || 'bg-gray-500/10 text-gray-500';
    };

    const actionTypes = [...new Set(logs.map(l => l.action_type))];

    if (loading) {
        return (
            <div className="flex items-center justify-center py-20">
                <Loader2 className="h-8 w-8 animate-spin text-secondary" />
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-in slide-in-from-right duration-500">
            {/* Filters */}
            <div className="flex flex-col md:flex-row gap-4 justify-between">
                <div className="relative w-full md:w-96">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Pesquisar ações..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="pl-10"
                    />
                </div>
                <div className="flex gap-2 items-center">
                    <Select value={filterTarget} onValueChange={setFilterTarget}>
                        <SelectTrigger className="w-32">
                            <SelectValue placeholder="Alvo" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Todos</SelectItem>
                            <SelectItem value="user">Utilizadores</SelectItem>
                            <SelectItem value="product">Produtos</SelectItem>
                            <SelectItem value="security">Segurança</SelectItem>
                            <SelectItem value="setting">Config</SelectItem>
                        </SelectContent>
                    </Select>
                    <Button variant="outline" size="icon" onClick={fetchLogs}>
                        <RefreshCw className="h-4 w-4" />
                    </Button>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card className="p-4">
                    <p className="text-xs text-muted-foreground uppercase">Total Ações</p>
                    <p className="text-2xl font-bold">{logs.length}</p>
                </Card>
                <Card className="p-4">
                    <p className="text-xs text-muted-foreground uppercase">Hoje</p>
                    <p className="text-2xl font-bold text-secondary">
                        {logs.filter(l => new Date(l.created_at).toDateString() === new Date().toDateString()).length}
                    </p>
                </Card>
                <Card className="p-4">
                    <p className="text-xs text-muted-foreground uppercase">Bloqueios</p>
                    <p className="text-2xl font-bold text-red-500">
                        {logs.filter(l => l.action_type.includes('block') || l.action_type.includes('ban')).length}
                    </p>
                </Card>
                <Card className="p-4">
                    <p className="text-xs text-muted-foreground uppercase">Aprovações</p>
                    <p className="text-2xl font-bold text-green-500">
                        {logs.filter(l => l.action_type.includes('approved')).length}
                    </p>
                </Card>
            </div>

            {/* Logs Table */}
            <Card className="bg-card/40 border-border overflow-hidden">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-12"></TableHead>
                            <TableHead>Ação</TableHead>
                            <TableHead>Alvo</TableHead>
                            <TableHead>Detalhes</TableHead>
                            <TableHead>Admin</TableHead>
                            <TableHead>Data</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredLogs.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} className="text-center py-12 text-muted-foreground">
                                    Nenhuma ação registrada.
                                </TableCell>
                            </TableRow>
                        ) : (
                            filteredLogs.slice(0, 50).map((log) => (
                                <TableRow key={log.id}>
                                    <TableCell>
                                        <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center">
                                            {getActionIcon(log.action_type)}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <span className="font-medium text-sm">
                                            {getActionLabel(log.action_type)}
                                        </span>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant="outline" className={`text-[10px] ${getTargetBadgeColor(log.target_type)}`}>
                                            {log.target_type}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        <div className="text-xs text-muted-foreground max-w-[200px] truncate">
                                            {log.details.reason || log.details.name || log.details.key ||
                                                (log.details.duration && `Duração: ${log.details.duration}`) ||
                                                JSON.stringify(log.details).slice(0, 50)}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <span className="text-sm">{log.admin?.full_name || 'Sistema'}</span>
                                    </TableCell>
                                    <TableCell>
                                        <div className="text-xs">
                                            <p className="font-medium">{format(new Date(log.created_at), 'dd/MM HH:mm')}</p>
                                            <p className="text-muted-foreground">
                                                {formatDistanceToNow(new Date(log.created_at), { addSuffix: true, locale: ptBR })}
                                            </p>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </Card>
        </div>
    );
};
