import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Briefcase, MapPin, Clock, Coffee, Sparkles, Zap } from 'lucide-react';

const CareersPage = () => {
    const jobs = [
        {
            title: 'Desenvolvedor Frontend Senior',
            department: 'Engenharia',
            location: 'Luanda (Híbrido)',
            type: 'Full-time',
        },
        {
            title: 'Especialista em Suporte ao Cliente',
            department: 'Suporte',
            location: 'Remoto',
            type: 'Full-time',
        },
        {
            title: 'Gestor de Marketplace',
            department: 'Operações',
            location: 'Luanda',
            type: 'Full-time',
        },
    ];

    return (
        <div className="min-h-screen bg-background text-card-foreground">
            <Header />

            <main>
                {/* Hero */}
                <section className="py-24 bg-gradient-to-b from-secondary/20 to-background border-b border-border overflow-hidden relative">
                    <div className="absolute top-0 right-0 w-1/2 h-full bg-secondary/5 -skew-x-12 transform translate-x-1/2" />
                    <div className="container mx-auto px-4 relative z-10 flex flex-col md:flex-row items-center gap-12">
                        <div className="shrink-0 animate-in slide-in-from-left duration-700">
                            <img src="/logo.png" alt="AngoPlaceMarket" className="h-40 md:h-56 w-auto object-contain" />
                        </div>
                        <div className="max-w-3xl">
                            <Badge className="bg-secondary text-secondary-foreground mb-6 h-8 px-4 text-sm font-bold rounded-full">Trabalhe Conosco</Badge>
                            <h1 className="text-5xl md:text-7xl font-black mb-8 leading-tight">
                                Ajude-nos a construir o futuro do <span className="text-secondary">E-commerce</span> em Angola.
                            </h1>
                            <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
                                Estamos à procura de mentes brilhantes e apaixonadas por tecnologia para se juntarem à nossa equipa e transformarem a forma como os angolanos compram e vendem hardware.
                            </p>
                            <Button className="bg-secondary text-secondary-foreground h-14 px-8 rounded-2xl font-bold text-lg shadow-xl shadow-secondary/20 transition-transform active:scale-95">
                                Ver Vagas Abertas
                            </Button>
                        </div>
                    </div>
                </section>

                <div className="container mx-auto px-4 py-20">
                    {/* Benefits */}
                    <div className="mb-24">
                        <h2 className="text-3xl font-bold text-center mb-16 underline decoration-secondary decoration-4 underline-offset-8">Vantagens de trabalhar connosco</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                            {[
                                { icon: Clock, title: 'Flexibilidade', desc: 'Trabalho híbrido ou remoto conforme a função.' },
                                { icon: Coffee, title: 'Cultura Única', desc: 'Ambiente jovem, dinâmico e focado em resultados.' },
                                { icon: Sparkles, title: 'Inovação', desc: 'Trabalhe com as tecnologias mais recentes do mercado.' },
                                { icon: Zap, title: 'Crescimento', desc: 'Plano de carreira claro e apoio em certificações.' },
                            ].map((benefit, i) => (
                                <Card key={i} className="bg-card/40 border-border p-8 hover:bg-card/60 transition-colors">
                                    <benefit.icon className="h-10 w-10 text-secondary mb-6" />
                                    <h4 className="text-xl font-bold mb-2">{benefit.title}</h4>
                                    <p className="text-muted-foreground text-sm">{benefit.desc}</p>
                                </Card>
                            ))}
                        </div>
                    </div>

                    {/* Open Positions */}
                    <div id="jobs">
                        <div className="flex items-center justify-between mb-12">
                            <h2 className="text-3xl font-bold">Vagas Abertas</h2>
                            <p className="text-muted-foreground font-medium">{jobs.length} posições disponíveis</p>
                        </div>
                        <div className="space-y-4">
                            {jobs.map((job, i) => (
                                <Card key={i} className="p-6 bg-card/40 border-border hover:border-secondary/50 transition-all group flex flex-col md:flex-row md:items-center justify-between gap-6 cursor-pointer">
                                    <div className="space-y-2">
                                        <h3 className="text-xl font-bold group-hover:text-secondary transition-colors">{job.title}</h3>
                                        <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                                            <div className="flex items-center gap-1">
                                                <Briefcase className="h-4 w-4" />
                                                {job.department}
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <MapPin className="h-4 w-4" />
                                                {job.location}
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <Clock className="h-4 w-4" />
                                                {job.type}
                                            </div>
                                        </div>
                                    </div>
                                    <Button variant="outline" className="border-secondary text-secondary hover:bg-secondary hover:text-secondary-foreground rounded-xl px-8 h-12 font-bold group-hover:bg-secondary group-hover:text-secondary-foreground">
                                        Candidatar-se
                                    </Button>
                                </Card>
                            ))}
                        </div>
                    </div>

                    {/* Talent Pool */}
                    <Card className="mt-20 bg-secondary text-secondary-foreground p-12 rounded-3xl border-none shadow-2xl relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2 group-hover:scale-110 transition-transform duration-700" />
                        <div className="relative z-10 text-center max-w-2xl mx-auto space-y-8">
                            <h2 className="text-4xl font-black">Não encontrou a sua vaga?</h2>
                            <p className="text-xl opacity-80">
                                Envie-nos o seu CV espontâneo. Estamos sempre à procura de talentos excepcionais para reforçar as nossas fileiras.
                            </p>
                            <Button className="bg-white text-secondary hover:bg-white/90 px-12 h-16 rounded-2xl font-black text-xl">
                                Enviar CV Espontâneo
                            </Button>
                        </div>
                    </Card>
                </div>
            </main>

            <Footer />
        </div>
    );
};

export default CareersPage;
