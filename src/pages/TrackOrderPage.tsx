import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { TrackingData, TrackingStep } from '@/types';

import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
    Package,
    Truck,
    CheckCircle2,
    MapPin,
    Clock,
    Search,
    ChevronRight,
    SearchX
} from 'lucide-react';

const TrackOrderPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [searchId, setSearchId] = useState(id || '');
    const [trackingData, setTrackingData] = useState<TrackingData | null>(id ? {
        id: id,
        status: 'shipped',
        last_update: '21 Jan, 14:30',
        steps: [
            { title: 'Pedido Recebido', date: '20 Jan, 09:00', completed: true, icon: CheckCircle2 },
            { title: 'Em Processamento', date: '21 Jan, 10:45', completed: true, icon: Package },
            { title: 'Em Caminho', date: '21 Jan, 14:30', completed: true, current: true, icon: Truck },
            { title: 'Entregue', date: 'Previsão: 22 Jan', completed: false, icon: CheckCircle2 },
        ]
    } : null);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (searchId.length > 5) {
            setTrackingData({
                id: searchId,
                status: 'shipped',
                last_update: 'Hoje, 14:30',
                steps: [
                    { title: 'Pedido Recebido', date: '20 Jan, 09:00', completed: true, icon: CheckCircle2 },
                    { title: 'Em Processamento', date: '21 Jan, 10:45', completed: true, icon: Package },
                    { title: 'Em Caminho', date: '21 Jan, 14:30', completed: true, current: true, icon: Truck },
                    { title: 'Entregue', date: 'Previsão: 22 Jan', completed: false, icon: CheckCircle2 },
                ]
            });
        }
    };

    return (
        <div className="min-h-screen bg-background text-card-foreground">
            <Header />

            <main className="container mx-auto px-4 py-16">
                <div className="max-w-4xl mx-auto space-y-12">
                    {/* Search Header */}
                    <div className="text-center space-y-4">
                        <h1 className="text-5xl font-black">Onde está o seu hardware?</h1>
                        <p className="text-xl text-muted-foreground">Insira o número do pedido para rastrear a sua entrega em tempo real.</p>

                        <form onSubmit={handleSearch} className="max-w-2xl mx-auto flex gap-4 mt-8">
                            <div className="relative flex-1 group">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-6 w-6 text-muted-foreground group-focus-within:text-secondary transition-colors" />
                                <Input
                                    value={searchId}
                                    onChange={(e) => setSearchId(e.target.value)}
                                    placeholder="Ex: #872349"
                                    className="h-16 pl-12 pr-6 rounded-2xl bg-card border-2 border-border focus:border-secondary shadow-xl text-lg transition-all"
                                />
                            </div>
                            <Button type="submit" className="h-16 px-12 bg-secondary text-secondary-foreground font-black text-xl rounded-2xl shadow-xl shadow-secondary/20 hover:scale-105 active:scale-95 transition-all">
                                Rastrear
                            </Button>
                        </form>
                    </div>

                    {trackingData ? (
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-in fade-in slide-in-from-bottom-5 duration-700">
                            {/* Status Card */}
                            <Card className="lg:col-span-2 border-border shadow-2xl rounded-[2.5rem] overflow-hidden">
                                <CardHeader className="bg-secondary/5 border-b border-border p-8">
                                    <div className="flex flex-col sm:flex-row justify-between gap-4">
                                        <div className="space-y-1">
                                            <CardTitle className="text-2xl font-black">Pedido #{trackingData.id.slice(0, 8).toUpperCase()}</CardTitle>
                                            <CardDescription>Última atualização: {trackingData.last_update}</CardDescription>
                                        </div>
                                        <Badge className="w-fit bg-secondary text-secondary-foreground text-sm py-2 px-4 rounded-full font-bold">
                                            Em Trânsito
                                        </Badge>
                                    </div>
                                </CardHeader>
                                <CardContent className="p-10 space-y-12">
                                    {/* Timeline */}
                                    <div className="relative space-y-8">
                                        <div className="absolute left-7 top-2 bottom-2 w-1 bg-border" />
                                        {trackingData.steps.map((step: TrackingStep, i: number) => (
                                            <div key={i} className="relative flex items-center gap-8 group">
                                                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center z-10 transition-all ${step.completed ? 'bg-secondary text-secondary-foreground' : 'bg-muted text-muted-foreground'}`}>
                                                    <step.icon className={`h-7 w-7 ${step.current ? 'animate-pulse' : ''}`} />
                                                </div>
                                                <div className="space-y-1">
                                                    <h4 className={`text-xl font-bold ${step.completed ? 'text-foreground' : 'text-muted-foreground'}`}>
                                                        {step.title}
                                                    </h4>
                                                    <p className="text-base text-muted-foreground">{step.date}</p>
                                                </div>
                                                {step.current && (
                                                    <div className="ml-auto">
                                                        <Badge variant="outline" className="text-secondary border-secondary animate-pulse">Status Atual</Badge>
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>

                                    <div className="bg-muted/30 p-8 rounded-3xl space-y-6">
                                        <div className="flex gap-4">
                                            <MapPin className="h-6 w-6 text-secondary" />
                                            <div>
                                                <h5 className="font-bold">Endereço de Entrega</h5>
                                                <p className="text-muted-foreground text-sm">Talatona, Condomínio das Palmeiras, Luanda</p>
                                            </div>
                                        </div>
                                        <div className="flex gap-4">
                                            <Truck className="h-6 w-6 text-secondary" />
                                            <div>
                                                <h5 className="font-bold">Método de Envio</h5>
                                                <p className="text-muted-foreground text-sm">Entrega Padrão (24-48h)</p>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Sidebar Info */}
                            <div className="space-y-6">
                                <Card className="bg-card/40 border-border p-8 rounded-[2rem] space-y-6">
                                    <h3 className="font-black text-xl">Dúvidas?</h3>
                                    <div className="space-y-4">
                                        <button className="w-full text-left p-4 hover:bg-muted rounded-xl transition-colors flex items-center justify-between group">
                                            <span className="font-bold">Onde está meu item?</span>
                                            <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-secondary" />
                                        </button>
                                        <button className="w-full text-left p-4 hover:bg-muted rounded-xl transition-colors flex items-center justify-between group">
                                            <span className="font-bold">Prazo de entrega</span>
                                            <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-secondary" />
                                        </button>
                                    </div>
                                    <Button variant="outline" className="w-full h-12 rounded-xl font-bold border-secondary text-secondary hover:bg-secondary hover:text-secondary-foreground" onClick={() => navigate('/help')}>
                                        Central de Ajuda
                                    </Button>
                                </Card>

                                <Card className="bg-secondary text-secondary-foreground p-8 rounded-[2rem] space-y-4 text-center">
                                    <h4 className="font-black text-xl">Precisa de suporte?</h4>
                                    <p className="text-sm opacity-80">A nossa equipa de logística está pronta para o ajudar.</p>
                                    <Button className="w-full bg-white text-secondary hover:bg-white/90 font-bold h-12 rounded-xl" onClick={() => navigate('/contact')}>
                                        Entrar em Contacto
                                    </Button>
                                </Card>
                            </div>
                        </div>
                    ) : (
                        <div className="text-center py-20 bg-muted/20 border-border border-dashed border-2 rounded-3xl space-y-6">
                            <SearchX className="h-24 w-24 text-muted-foreground/20 mx-auto" />
                            <div className="space-y-2">
                                <h3 className="text-2xl font-black">Nenhum pedido selecionado</h3>
                                <p className="text-muted-foreground max-w-sm mx-auto">
                                    Insira o código do seu pedido acima ou aceda aos seus pedidos para ver o status.
                                </p>
                            </div>
                            <Button variant="outline" onClick={() => navigate('/orders')} className="rounded-xl font-bold h-12">
                                Ver Meus Pedidos
                            </Button>
                        </div>
                    )}
                </div>
            </main>

            <Footer />
        </div>
    );
};

export default TrackOrderPage;
