import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
    Check,
    X,
    MessageSquare,
    Eye,
    Clock,
    ThumbsUp,
    ThumbsDown,
    AlertCircle,
    Package,
    Users,
    Mail,
    MapPin,
    Loader2
} from 'lucide-react';
import { Product } from '@/types';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface ProductsTabProps {
    products: Product[];
    processingId: string | null;
    onApprove: (id: string) => void;
    onReject: (id: string, reason: string) => void;
    onRequestAdjustment: (id: string, notes: string) => void;
}

export const ProductsTab = ({ products, processingId, onApprove, onReject, onRequestAdjustment }: ProductsTabProps) => {
    const [activeSubTab, setActiveSubTab] = useState('pending');

    const pending = products.filter(p => p.status === 'PENDENTE');
    const approved = products.filter(p => p.status === 'PUBLICADO');
    const rejected = products.filter(p => p.status === 'REJEITADO');

    const renderProductCard = (product: Product, isActionable: boolean = false) => (
        <Card key={product.id} className="overflow-hidden bg-card/40 border-border group hover:border-secondary transition-all">
            <div className="flex flex-col md:flex-row">
                <div className="w-full md:w-64 h-48 md:h-auto relative">
                    <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                    <Badge
                        className={`absolute top-2 left-2 ${product.status === 'PUBLICADO' ? 'bg-green-500' :
                                product.status === 'REJEITADO' ? 'bg-red-500' : 'bg-yellow-500'
                            } text-white`}
                    >
                        {product.status}
                    </Badge>
                </div>
                <div className="flex-1 p-6 flex flex-col justify-between">
                    <div>
                        <div className="flex justify-between items-start mb-2">
                            <div>
                                <h3 className="text-xl font-bold line-clamp-1">{product.name}</h3>
                                <p className="text-secondary font-black text-lg mt-1">
                                    {(Number(product.price) || 0).toLocaleString('pt-AO')} Kz
                                </p>
                            </div>
                            <Badge variant="outline" className="text-[10px] uppercase">
                                {product.category}
                            </Badge>
                        </div>
                        <p className="text-muted-foreground text-sm line-clamp-2 mb-4">
                            {product.description}
                        </p>

                        {product.rejection_reason && (
                            <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-xs flex items-start gap-2">
                                <AlertCircle className="h-4 w-4 text-red-500 shrink-0" />
                                <div>
                                    <span className="font-bold text-red-600">Motivo da Rejeição:</span> {product.rejection_reason}
                                </div>
                            </div>
                        )}

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2 text-[11px] p-3 bg-muted/20 rounded-lg">
                            <div className="flex items-center gap-2">
                                <Users className="h-3 w-3 text-secondary" />
                                <span className="font-medium truncate">{product.profiles?.full_name}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <MapPin className="h-3 w-3 text-secondary" />
                                <span>{product.seller_province || 'Desconhecido'}</span>
                            </div>
                        </div>
                    </div>

                    {isActionable && (
                        <div className="flex gap-2 mt-6">
                            <Button
                                onClick={() => onApprove(product.id)}
                                className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold h-9 text-xs"
                                disabled={!!processingId}
                            >
                                {processingId === product.id ? <Loader2 className="animate-spin h-4 w-4" /> : <ThumbsUp className="mr-2 h-4 w-4" />}
                                Aprovar
                            </Button>
                            <Button
                                variant="outline"
                                onClick={() => {
                                    const notes = window.prompt('Notas para ajuste (será enviado ao vendedor):');
                                    if (notes) onRequestAdjustment(product.id, notes);
                                }}
                                className="flex-1 border-secondary text-secondary hover:bg-secondary/10 font-bold h-9 text-xs"
                                disabled={!!processingId}
                            >
                                <MessageSquare className="mr-2 h-4 w-4" />
                                Ajustes
                            </Button>
                            <Button
                                variant="outline"
                                onClick={() => {
                                    const reason = window.prompt('Motivo da rejeição:');
                                    if (reason) onReject(product.id, reason);
                                }}
                                className="flex-1 border-red-500 text-red-500 hover:bg-red-500/10 font-bold h-9 text-xs"
                                disabled={!!processingId}
                            >
                                <ThumbsDown className="mr-2 h-4 w-4" />
                                Rejeitar
                            </Button>
                        </div>
                    )}
                </div>
            </div>
        </Card>
    );

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-black">Moderação de Catálogo</h2>
                <Badge variant="outline" className="font-mono">{products.length} total</Badge>
            </div>

            <Tabs value={activeSubTab} onValueChange={setActiveSubTab} className="w-full">
                <TabsList className="bg-muted/30 grid grid-cols-3 w-full max-w-md h-12 rounded-2xl p-1 mb-8">
                    <TabsTrigger value="pending" className="rounded-xl data-[state=active]:bg-card">
                        Pendentes
                        {pending.length > 0 && <Badge className="ml-2 bg-yellow-500 h-5 w-5 p-0 flex items-center justify-center text-[10px]">{pending.length}</Badge>}
                    </TabsTrigger>
                    <TabsTrigger value="approved" className="rounded-xl data-[state=active]:bg-card text-green-600">Aprovados</TabsTrigger>
                    <TabsTrigger value="rejected" className="rounded-xl data-[state=active]:bg-card text-red-600">Rejeitados</TabsTrigger>
                </TabsList>

                <TabsContent value="pending" className="space-y-4">
                    {pending.length === 0 ? (
                        <div className="text-center py-20 bg-muted/10 rounded-3xl border-2 border-dashed border-border">
                            <Check className="h-12 w-12 text-green-500 mx-auto mb-4 opacity-30" />
                            <p className="text-muted-foreground font-medium">Tudo em dia! Sem pendências.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 gap-4">
                            {pending.map(p => renderProductCard(p, true))}
                        </div>
                    )}
                </TabsContent>

                <TabsContent value="approved" className="space-y-4">
                    <div className="grid grid-cols-1 gap-4">
                        {approved.map(p => renderProductCard(p))}
                    </div>
                </TabsContent>

                <TabsContent value="rejected" className="space-y-4">
                    <div className="grid grid-cols-1 gap-4">
                        {rejected.map(p => renderProductCard(p))}
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
};
