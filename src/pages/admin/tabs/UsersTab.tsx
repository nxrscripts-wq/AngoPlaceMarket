import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
    Search,
    UserX,
    UserCheck,
    Shield,
    MoreVertical,
    Mail,
    MapPin,
    AlertTriangle,
    Users
} from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuSeparator
} from '@/components/ui/dropdown-menu';
import { UserProfile } from '@/types';
import { format } from 'date-fns';

interface UsersTabProps {
    users: UserProfile[];
    onBlockUser: (id: string, blocked: boolean, duration?: string) => void;
    onSetRisk: (id: string, level: 'low' | 'medium' | 'high') => void;
    onViewProfile: (user: UserProfile) => void;
}

export const UsersTab = ({ users, onBlockUser, onSetRisk, onViewProfile }: UsersTabProps) => {
    const [search, setSearch] = useState('');
    const [filterType, setFilterType] = useState<'all' | 'buyer' | 'seller'>('all');
    const [filterRisk, setFilterRisk] = useState<'all' | 'low' | 'medium' | 'high'>('all');

    const filteredUsers = users.filter(u => {
        const matchesSearch = u.full_name?.toLowerCase().includes(search.toLowerCase()) ||
            u.email?.toLowerCase().includes(search.toLowerCase());
        const matchesType = filterType === 'all' ||
            (filterType === 'seller' && u.is_seller) ||
            (filterType === 'buyer' && !u.is_seller);
        const matchesRisk = filterRisk === 'all' || u.risk_level === filterRisk;
        return matchesSearch && matchesType && matchesRisk;
    });

    const getRiskColor = (level?: string) => {
        switch (level) {
            case 'high': return 'bg-red-500/10 text-red-500 border-red-500/20';
            case 'medium': return 'bg-orange-500/10 text-orange-500 border-orange-500/20';
            default: return 'bg-green-500/10 text-green-500 border-green-500/20';
        }
    };

    return (
        <div className="space-y-6 animate-in slide-in-from-right duration-500">
            <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
                <div className="relative w-full md:w-96">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Pesquisar por nome ou email..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="pl-10"
                    />
                </div>
                <div className="flex gap-2 w-full md:w-auto overflow-x-auto pb-2 md:pb-0">
                    <Button
                        variant={filterType === 'all' ? 'secondary' : 'outline'}
                        size="sm"
                        onClick={() => setFilterType('all')}
                    >Todos</Button>
                    <Button
                        variant={filterType === 'seller' ? 'secondary' : 'outline'}
                        size="sm"
                        onClick={() => setFilterType('seller')}
                    >Vendedores</Button>
                    <Button
                        variant={filterRisk === 'high' ? 'destructive' : 'outline'}
                        size="sm"
                        onClick={() => setFilterRisk(filterRisk === 'high' ? 'all' : 'high')}
                    >Alto Risco</Button>
                </div>
            </div>

            <Card className="bg-card/40 border-border overflow-hidden">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Utilizador</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Localização</TableHead>
                            <TableHead>Risco</TableHead>
                            <TableHead className="text-right">Ações</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredUsers.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} className="text-center py-12 text-muted-foreground">
                                    Nenhum utilizador encontrado.
                                </TableCell>
                            </TableRow>
                        ) : (
                            filteredUsers.map((u) => (
                                <TableRow key={u.id}>
                                    <TableCell>
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-secondary/10 flex items-center justify-center">
                                                {u.avatar_url ? (
                                                    <img src={u.avatar_url} className="w-full h-full rounded-full object-cover" />
                                                ) : (
                                                    <Users className="h-4 w-4 text-secondary" />
                                                )}
                                            </div>
                                            <div>
                                                <p className="font-bold text-sm">{u.full_name}</p>
                                                <p className="text-xs text-muted-foreground truncate max-w-[150px]">{u.email}</p>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant={u.is_blocked ? 'destructive' : 'secondary'} className="scale-90 origin-left">
                                            {u.is_blocked ? 'Bloqueado' : u.is_seller ? 'Vendedor' : 'Comprador'}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-sm font-medium">
                                        {u.province || 'N/A'}
                                    </TableCell>
                                    <TableCell>
                                        <Badge
                                            variant="outline"
                                            className={`capitalize text-[10px] ${getRiskColor(u.risk_level)}`}
                                        >
                                            {u.risk_level || 'low'}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                                    <MoreVertical className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end" className="bg-card border-border border shadow-2xl w-56">
                                                <DropdownMenuItem onClick={() => onViewProfile(u)}>
                                                    Ver Detalhes
                                                </DropdownMenuItem>
                                                <DropdownMenuSeparator />
                                                {u.is_blocked ? (
                                                    <DropdownMenuItem
                                                        onClick={() => onBlockUser(u.id, false)}
                                                        className="text-green-500"
                                                    >
                                                        <UserCheck className="mr-2 h-4 w-4" /> Desbloquear
                                                    </DropdownMenuItem>
                                                ) : (
                                                    <>
                                                        <DropdownMenuItem
                                                            onClick={() => onBlockUser(u.id, true, '24h')}
                                                            className="text-orange-500"
                                                        >
                                                            <UserX className="mr-2 h-4 w-4" /> Ban 24 horas
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem
                                                            onClick={() => onBlockUser(u.id, true, '7d')}
                                                            className="text-orange-600"
                                                        >
                                                            <UserX className="mr-2 h-4 w-4" /> Ban 7 dias
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem
                                                            onClick={() => onBlockUser(u.id, true, '30d')}
                                                            className="text-red-500"
                                                        >
                                                            <UserX className="mr-2 h-4 w-4" /> Ban 30 dias
                                                        </DropdownMenuItem>
                                                        <DropdownMenuSeparator />
                                                        <DropdownMenuItem
                                                            onClick={() => onBlockUser(u.id, true, 'permanent')}
                                                            className="text-red-600 font-semibold"
                                                        >
                                                            <UserX className="mr-2 h-4 w-4" /> Ban Permanente
                                                        </DropdownMenuItem>
                                                    </>
                                                )}
                                                <DropdownMenuSeparator />
                                                <DropdownMenuItem onClick={() => onSetRisk(u.id, 'high')} className="text-orange-500">
                                                    <AlertTriangle className="mr-2 h-4 w-4" /> Marcar Alto Risco
                                                </DropdownMenuItem>
                                                <DropdownMenuItem onClick={() => onSetRisk(u.id, 'low')} className="text-green-500">
                                                    <Shield className="mr-2 h-4 w-4" /> Remover Risco
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
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
