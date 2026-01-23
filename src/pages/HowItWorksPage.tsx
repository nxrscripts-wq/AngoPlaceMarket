import React from 'react';
import {
    ShoppingBag,
    ShieldCheck,
    Truck,
    Store,
    CheckCircle2,
    ArrowRight,
    Search,
    UserPlus,
    PackageCheck,
    CreditCard
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

interface StepCardProps {
    number: string;
    title: string;
    description: string;
    icon: React.ElementType;
}

const StepCard = ({ number, title, description, icon: Icon }: StepCardProps) => (
    <div className="relative p-8 rounded-3xl bg-card border border-border hover:border-secondary transition-all group">
        <div className="absolute -top-4 -left-4 w-12 h-12 bg-secondary text-secondary-foreground rounded-2xl flex items-center justify-center font-black text-xl shadow-xl">
            {number}
        </div>
        <div className="mb-6 p-4 bg-muted rounded-2xl w-fit group-hover:scale-110 transition-transform">
            <Icon className="h-8 w-8 text-secondary" />
        </div>
        <h3 className="text-xl font-bold mb-3">{title}</h3>
        <p className="text-muted-foreground leading-relaxed">{description}</p>
    </div>
);

const HowItWorksPage = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-background text-card-foreground">
            {/* Hero Section */}
            <section className="relative py-20 overflow-hidden bg-muted/20">
                <div className="container mx-auto px-4 relative z-10 text-center">
                    <Badge className="mb-6 bg-secondary/10 text-secondary border-secondary/20 px-4 py-1.5 rounded-full font-bold uppercase tracking-widest">
                        A sua porta para o comércio em Angola
                    </Badge>
                    <h1 className="text-5xl md:text-7xl font-black mb-6 tracking-tighter">
                        Como funciona a <span className="text-secondary">AngoPlace</span>?
                    </h1>
                    <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-10 font-medium">
                        Conectamos compradores e vendedores em toda Angola com segurança, rapidez e simplicidade.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Button size="lg" className="h-14 px-8 rounded-2xl bg-secondary text-secondary-foreground font-black text-lg" onClick={() => navigate('/search')}>
                            Começar a Comprar <ShoppingBag className="ml-2 h-5 w-5" />
                        </Button>
                        <Button size="lg" variant="outline" className="h-14 px-8 rounded-2xl border-secondary text-secondary font-black text-lg" onClick={() => navigate('/publish')}>
                            Quero Vender <Store className="ml-2 h-5 w-5" />
                        </Button>
                    </div>
                </div>
            </section>

            {/* For Buyers */}
            <section className="py-24 border-t border-border">
                <div className="container mx-auto px-4">
                    <div className="flex items-center gap-4 mb-12">
                        <ShoppingBag className="h-10 w-10 text-secondary" />
                        <h2 className="text-4xl font-black">Para Compradores</h2>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                        <StepCard
                            number="1"
                            title="Explore o Catálogo"
                            description="Navegue por milhares de produtos em diversas categorias, desde eletrónica a imóveis, tudo verificado pela nossa equipa."
                            icon={Search}
                        />
                        <StepCard
                            number="2"
                            title="Pagamento Seguro"
                            description="Pague com total tranquilidade via Multicaixa Express ou transferência bancária. O vendedor só recebe após a entrega."
                            icon={CreditCard}
                        />
                        <StepCard
                            number="3"
                            title="Receba onde estiver"
                            description="A nossa rede de logística parceira entrega em todas as províncias de Angola com rastreio em tempo real."
                            icon={Truck}
                        />
                    </div>
                </div>
            </section>

            {/* For Sellers */}
            <section className="py-24 bg-muted/10">
                <div className="container mx-auto px-4">
                    <div className="flex items-center gap-4 mb-12">
                        <Store className="h-10 w-10 text-secondary" />
                        <h2 className="text-4xl font-black">Para Vendedores</h2>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                        <StepCard
                            number="1"
                            title="Crie a sua Loja"
                            description="Registe-se em minutos e comece a publicar os seus produtos. É totalmente gratuito começar a vender."
                            icon={UserPlus}
                        />
                        <StepCard
                            number="2"
                            title="Aprovação Rápida"
                            description="A nossa equipa valida o seu anúncio em menos de 24h para garantir a melhor qualidade no marketplace."
                            icon={PackageCheck}
                        />
                        <StepCard
                            number="3"
                            title="Receba os lucros"
                            description="Após a entrega confirmada, o valor é libertado diretamente para a sua conta bancária sem complicações."
                            icon={ShieldCheck}
                        />
                    </div>
                </div>
            </section>

            {/* Trust Banner */}
            <section className="py-20 bg-secondary text-secondary-foreground">
                <div className="container mx-auto px-4 text-center">
                    <h2 className="text-4xl font-black mb-8">Pronto para a melhor experiência de compras em Angola?</h2>
                    <div className="flex flex-wrap justify-center gap-8 md:gap-16">
                        <div className="flex items-center gap-3 font-bold text-xl">
                            <CheckCircle2 className="h-8 w-8" /> 100% Angolano
                        </div>
                        <div className="flex items-center gap-3 font-bold text-xl">
                            <CheckCircle2 className="h-8 w-8" /> Suporte 24/7
                        </div>
                        <div className="flex items-center gap-3 font-bold text-xl">
                            <CheckCircle2 className="h-8 w-8" /> Pagamentos Seguros
                        </div>
                    </div>
                    <Button size="lg" className="mt-12 h-16 px-12 rounded-2xl bg-primary text-primary-foreground font-black text-xl hover:scale-105 transition-all shadow-2xl" onClick={() => navigate('/register')}>
                        Criar Conta Agora <ArrowRight className="ml-2 h-6 w-6" />
                    </Button>
                </div>
            </section>
        </div>
    );
};

// Internal Badge component for this page
interface BadgeProps {
    children: React.ReactNode;
    className?: string;
}

const Badge = ({ children, className }: BadgeProps) => (
    <span className={`inline-block border rounded-full px-3 py-1 text-xs font-bold leading-none ${className}`}>
        {children}
    </span>
);

export default HowItWorksPage;
