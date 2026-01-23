
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Search,
    HelpCircle,
    Truck,
    RotateCcw,
    CreditCard,
    User,
    ShieldCheck,
    MessageCircle,
    ChevronRight
} from 'lucide-react';

const HelpCenterPage = () => {
    const categories = [
        { icon: User, title: 'Minha Conta', count: 12 },
        { icon: Truck, title: 'Entregas e Frete', count: 8 },
        { icon: RotateCcw, title: 'Devoluções e Reembolsos', count: 15 },
        { icon: CreditCard, title: 'Pagamentos', count: 6 },
        { icon: ShieldCheck, title: 'Segurança', count: 10 },
        { icon: MessageCircle, title: 'Comunicação', count: 5 },
    ];

    const popularQuestions = [
        'Como rastreio o meu pedido?',
        'Quais são os métodos de pagamento aceites?',
        'Como posso vender os meus produtos?',
        'O que fazer se o produto chegar com defeito?',
        'Como altero os dados da minha conta?'
    ];

    return (
        <>

            <main>
                {/* Search Bar Hero */}
                <section className="bg-secondary/10 py-16 border-b border-border">
                    <div className="container mx-auto px-4 text-center space-y-8 max-w-3xl flex flex-col items-center">
                        <img src="/logo.png" alt="AngoPlaceMarket" className="h-24 w-auto object-contain mb-2 animate-in slide-in-from-top duration-500" />
                        <h1 className="text-4xl md:text-5xl font-black">Como podemos ajudar?</h1>
                        <div className="relative group">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-6 w-6 text-muted-foreground group-focus-within:text-secondary transition-colors" />
                            <Input
                                placeholder="Pesquise por temas, perguntas ou palavras-chave..."
                                className="h-16 pl-12 pr-6 rounded-2xl bg-card border-2 border-border focus:border-secondary shadow-xl text-lg transition-all"
                            />
                        </div>
                        <div className="flex flex-wrap justify-center gap-2">
                            <span className="text-sm font-bold text-muted-foreground">Sugestões:</span>
                            {['Entrega', 'Devolução', 'Vender', 'Pagamento'].map(tag => (
                                <button key={tag} className="text-sm font-bold text-secondary hover:underline">#{tag}</button>
                            ))}
                        </div>
                    </div>
                </section>

                <div className="container mx-auto px-4 py-16">
                    {/* Categories Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 mb-20">
                        {categories.map((cat, i) => (
                            <Card key={i} className="bg-card/40 border-border p-8 hover:border-secondary/50 hover:shadow-2xl hover:shadow-secondary/5 transition-all group flex items-start gap-6 cursor-pointer">
                                <div className="p-4 bg-secondary/10 rounded-2xl group-hover:bg-secondary group-hover:text-secondary-foreground transition-colors">
                                    <cat.icon className="h-8 w-8" />
                                </div>
                                <div className="space-y-1">
                                    <h3 className="text-xl font-bold">{cat.title}</h3>
                                    <p className="text-sm text-muted-foreground">{cat.count} artigos disponíveis</p>
                                </div>
                            </Card>
                        ))}
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-16">
                        {/* Popular Questions */}
                        <div className="lg:col-span-2 space-y-8">
                            <h2 className="text-3xl font-black flex items-center gap-3">
                                <HelpCircle className="h-8 w-8 text-secondary" />
                                Perguntas Frequentes
                            </h2>
                            <div className="space-y-4">
                                {popularQuestions.map((q, i) => (
                                    <button key={i} className="w-full text-left p-6 bg-card/40 border border-border rounded-2xl hover:bg-muted/50 transition-colors flex items-center justify-between group">
                                        <span className="font-bold text-lg">{q}</span>
                                        <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-secondary group-hover:translate-x-1 transition-all" />
                                    </button>
                                ))}
                            </div>
                            <Button variant="link" className="text-secondary font-black text-lg p-0">Ver todas as perguntas</Button>
                        </div>

                        {/* Contact Card */}
                        <div className="space-y-6">
                            <Card className="bg-secondary text-secondary-foreground p-8 rounded-3xl border-none shadow-2xl relative overflow-hidden group">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 group-hover:scale-110 transition-transform duration-700" />
                                <h3 className="text-2xl font-black mb-4">Ainda com dúvidas?</h3>
                                <p className="opacity-80 mb-8 leading-relaxed">
                                    A nossa equipa de suporte está pronta para o ajudar em qualquer questão através dos nossos canais oficiais.
                                </p>
                                <Button
                                    className="w-full bg-white text-secondary hover:bg-white/90 rounded-xl h-12 font-bold"
                                    onClick={() => window.location.href = '/contact'}
                                >
                                    Fale Conosco
                                </Button>
                            </Card>

                            <Card className="bg-card/40 border-border p-8 rounded-3xl space-y-4 text-center">
                                <MessageCircle className="h-10 w-10 text-secondary mx-auto mb-2" />
                                <h4 className="font-bold text-xl">Atendimento via WhatsApp</h4>
                                <p className="text-sm text-muted-foreground">Disponível de Segunda a Sábado, das 8h às 18h.</p>
                                <Button variant="outline" className="w-full border-green-500 text-green-500 hover:bg-green-500/10 rounded-xl h-12 font-bold">
                                    Iniciar Chat
                                </Button>
                            </Card>
                        </div>
                    </div>
                </div>
            </main>

        </>
    );
};

export default HelpCenterPage;
