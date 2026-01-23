
import { Card, CardContent } from '@/components/ui/card';
import { Users, Target, Shield, Rocket, Heart, Award } from 'lucide-react';

const AboutPage = () => {
    return (
        <>

            <main>
                {/* Hero Section */}
                <section className="relative h-[50vh] flex items-center justify-center overflow-hidden bg-secondary">
                    <div className="absolute inset-0 bg-grid-white/10 [mask-image:radial-gradient(white,transparent)]" />
                    <div className="container mx-auto px-4 relative z-10 text-center text-secondary-foreground flex flex-col items-center">
                        <img src="/logo.png" alt="AngoPlaceMarket" className="h-32 md:h-48 w-auto object-contain mb-8 animate-in zoom-in duration-700" />
                        <h1 className="text-5xl md:text-7xl font-black mb-6 animate-in fade-in slide-in-from-bottom-5 duration-700">
                            Nossa História
                        </h1>
                        <p className="text-xl md:text-2xl max-w-2xl mx-auto opacity-90 font-medium">
                            Conectando o futuro tecnológico de Angola, um hardware de cada vez.
                        </p>
                    </div>
                </section>

                <div className="container mx-auto px-4 py-16 -mt-20">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
                        <Card className="bg-card/80 backdrop-blur-md border-border shadow-2xl p-8 hover:scale-105 transition-transform">
                            <Users className="h-12 w-12 text-secondary mb-6" />
                            <h3 className="text-2xl font-bold mb-4">Quem Somos</h3>
                            <p className="text-muted-foreground leading-relaxed">
                                Fundada em 2024, a AngoPlaceMarket nasceu da necessidade de criar um ecossistema seguro e eficiente para a compra e venda de hardware em Angola.
                            </p>
                        </Card>
                        <Card className="bg-card/80 backdrop-blur-md border-border shadow-2xl p-8 hover:scale-105 transition-transform">
                            <Target className="h-12 w-12 text-secondary mb-6" />
                            <h3 className="text-2xl font-bold mb-4">Nossa Missão</h3>
                            <p className="text-muted-foreground leading-relaxed">
                                Democratizar o acesso à tecnologia de ponta, permitindo que cada angolano tenha as ferramentas necessárias para inovar e crescer.
                            </p>
                        </Card>
                        <Card className="bg-card/80 backdrop-blur-md border-border shadow-2xl p-8 hover:scale-105 transition-transform">
                            <Rocket className="h-12 w-12 text-secondary mb-6" />
                            <h3 className="text-2xl font-bold mb-4">Nossa Visão</h3>
                            <p className="text-muted-foreground leading-relaxed">
                                Ser a maior e mais confiável plataforma de comércio eletrónico especializada em hardware e tecnologia em toda a África Austral.
                            </p>
                        </Card>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center py-16">
                        <div className="space-y-8">
                            <h2 className="text-4xl font-black text-secondary">Porquê a AngoPlace?</h2>
                            <p className="text-lg text-muted-foreground leading-relaxed">
                                Diferente dos marketplaces genéricos, nós focamos exclusivamente em tecnologia. Nossa plataforma é otimizada para listar especificações técnicas, garantir a compatibilidade e facilitar a vida de quem entende de hardware.
                            </p>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                <div className="flex gap-4 items-start">
                                    <div className="w-10 h-10 bg-secondary/10 rounded-full flex items-center justify-center shrink-0">
                                        <Shield className="h-5 w-5 text-secondary" />
                                    </div>
                                    <div>
                                        <h4 className="font-bold">Segurança Total</h4>
                                        <p className="text-sm text-muted-foreground">Verificação rigorosa de vendedores e proteção de dados.</p>
                                    </div>
                                </div>
                                <div className="flex gap-4 items-start">
                                    <div className="w-10 h-10 bg-secondary/10 rounded-full flex items-center justify-center shrink-0">
                                        <Award className="h-5 w-5 text-secondary" />
                                    </div>
                                    <div>
                                        <h4 className="font-bold">Qualidade Garantida</h4>
                                        <p className="text-sm text-muted-foreground">Sistema de avaliações transparente e moderação ativa.</p>
                                    </div>
                                </div>
                                <div className="flex gap-4 items-start">
                                    <div className="w-10 h-10 bg-secondary/10 rounded-full flex items-center justify-center shrink-0">
                                        <Heart className="h-5 w-5 text-secondary" />
                                    </div>
                                    <div>
                                        <h4 className="font-bold">Suporte Angolano</h4>
                                        <p className="text-sm text-muted-foreground">Atendimento local que entende a nossa realidade.</p>
                                    </div>
                                </div>
                                <div className="flex gap-4 items-start">
                                    <div className="w-10 h-10 bg-secondary/10 rounded-full flex items-center justify-center shrink-0">
                                        <Users className="h-5 w-5 text-secondary" />
                                    </div>
                                    <div>
                                        <h4 className="font-bold">Comunidade Viva</h4>
                                        <p className="text-sm text-muted-foreground">Milhares de entusiastas trocando experiências diariamente.</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="relative">
                            <div className="absolute -inset-4 bg-secondary/20 rounded-3xl blur-3xl" />
                            <Card className="relative overflow-hidden border-border bg-card shadow-2xl rounded-3xl">
                                <CardContent className="p-12 text-center space-y-8">
                                    <div className="text-6xl font-black text-secondary">10k+</div>
                                    <p className="text-xl font-bold">Membros Ativos</p>
                                    <div className="h-px bg-border w-1/2 mx-auto" />
                                    <div className="text-6xl font-black text-secondary">50k+</div>
                                    <p className="text-xl font-bold">Produtos Vendidos</p>
                                    <div className="h-px bg-border w-1/2 mx-auto" />
                                    <div className="text-6xl font-black text-secondary">18</div>
                                    <p className="text-xl font-bold">Províncias Atendidas</p>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </div>

                {/* Call to Action */}
                <section className="bg-secondary text-secondary-foreground py-20">
                    <div className="container mx-auto px-4 text-center">
                        <h2 className="text-4xl md:text-5xl font-black mb-8">Faça parte da revolução tecnológica</h2>
                        <p className="text-xl mb-12 opacity-80 max-w-2xl mx-auto">
                            Junte-se a milhares de angolanos que já estão comprando e vendendo o melhor hardware do país.
                        </p>
                        <button className="bg-white text-secondary px-12 h-16 rounded-2xl font-black text-xl hover:scale-105 transition-transform shadow-xl shadow-black/20" onClick={() => window.location.href = '/register'}>
                            Começar Agora
                        </button>
                    </div>
                </section>
            </main>

        </>
    );
};

export default AboutPage;
