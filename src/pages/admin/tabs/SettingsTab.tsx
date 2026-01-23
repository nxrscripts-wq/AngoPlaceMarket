import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
    Settings,
    Shield,
    Database,
    Bell,
    Plus,
    X,
    Save,
    LayoutGrid,
    Lock
} from 'lucide-react';
import { MarketplaceSetting } from '@/types';

interface SettingsTabProps {
    settings: MarketplaceSetting[];
    onSaveSetting: (key: string, value: string | number | boolean) => void;
}

export const SettingsTab = ({ settings, onSaveSetting }: SettingsTabProps) => {
    // Local state for categories (simulated if from settings)
    const [newCategory, setNewCategory] = useState('');
    const categories = ['Electrónica', 'Moda', 'Casa & Jardim', 'Saúde & Beleza', 'Desporto', 'Hardware'];

    return (
        <div className="space-y-8 animate-in slide-in-from-bottom duration-500">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Security Settings */}
                <Card className="bg-card/40 border-border">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Lock className="h-5 w-5 text-secondary" />
                            Segurança & Antifraude
                        </CardTitle>
                        <CardDescription>Configure limites de acesso e parâmetros de risco</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="flex items-center justify-between p-4 bg-muted/20 rounded-xl">
                            <div className="space-y-0.5">
                                <Label className="text-sm font-bold">Bloqueio Automático</Label>
                                <p className="text-xs text-muted-foreground">Bloquear conta após falhas de login</p>
                            </div>
                            <Switch defaultChecked />
                        </div>

                        <div className="space-y-2">
                            <Label className="text-xs font-bold uppercase text-muted-foreground">Tentativas Máximas</Label>
                            <div className="flex gap-2">
                                <Input type="number" defaultValue={5} className="w-20" />
                                <Button variant="secondary" size="sm">Definir</Button>
                            </div>
                        </div>

                        <div className="flex items-center justify-between p-4 bg-muted/20 rounded-xl">
                            <div className="space-y-0.5">
                                <Label className="text-sm font-bold">Verificação de Vendedores</Label>
                                <p className="text-xs text-muted-foreground">Exigir aprovação manual para novos vendedores</p>
                            </div>
                            <Switch defaultChecked />
                        </div>
                    </CardContent>
                </Card>

                {/* Categories Management */}
                <Card className="bg-card/40 border-border">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <LayoutGrid className="h-5 w-5 text-secondary" />
                            Gestão de Categorias
                        </CardTitle>
                        <CardDescription>Adicionar ou remover categorias do marketplace</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="flex gap-2">
                            <Input
                                placeholder="Nova categoria..."
                                value={newCategory}
                                onChange={(e) => setNewCategory(e.target.value)}
                            />
                            <Button size="icon" className="bg-secondary text-secondary-foreground">
                                <Plus className="h-5 w-5" />
                            </Button>
                        </div>

                        <div className="flex flex-wrap gap-2">
                            {categories.map((cat) => (
                                <Badge key={cat} variant="secondary" className="pl-3 pr-1 py-1 flex items-center gap-2 rounded-lg group">
                                    {cat}
                                    <button className="text-muted-foreground hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <X className="h-3 w-3" />
                                    </button>
                                </Badge>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* System Info */}
            <Card className="bg-card/40 border-border">
                <CardHeader>
                    <CardTitle className="text-sm font-bold flex items-center gap-2">
                        <Database className="h-4 w-4" /> Status do Sistema
                    </CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center p-4 bg-muted/10 rounded-2xl border border-border">
                        <p className="text-[10px] uppercase font-bold text-muted-foreground">DB Version</p>
                        <p className="font-mono text-sm">PostgreSQL 15.1</p>
                    </div>
                    <div className="text-center p-4 bg-muted/10 rounded-2xl border border-border">
                        <p className="text-[10px] uppercase font-bold text-muted-foreground">Storage</p>
                        <p className="font-mono text-sm">34% Utilizado</p>
                    </div>
                    <div className="text-center p-4 bg-muted/10 rounded-2xl border border-border">
                        <p className="text-[10px] uppercase font-bold text-muted-foreground">API Latency</p>
                        <p className="font-mono text-sm text-green-500">42ms</p>
                    </div>
                    <div className="text-center p-4 bg-muted/10 rounded-2xl border border-border">
                        <p className="text-[10px] uppercase font-bold text-muted-foreground">Last Backup</p>
                        <p className="font-mono text-sm">Há 2h</p>
                    </div>
                </CardContent>
            </Card>

            <div className="flex justify-end gap-3">
                <Button variant="ghost">Descartar</Button>
                <Button className="bg-secondary text-secondary-foreground font-black px-8">
                    <Save className="mr-2 h-4 w-4" /> Salvar Configurações
                </Button>
            </div>
        </div>
    );
};
