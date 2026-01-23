import { useState } from 'react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
    RotateCcw,
    ChevronRight,
    ShieldCheck,
    AlertCircle,
    FileText,
    Truck,
    CheckCircle2,
    Loader2
} from 'lucide-react';
import { toast } from 'sonner';

const ReturnsPage = () => {
    const [loading, setLoading] = useState(false);
    const [submitted, setSubmitted] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        await new Promise(resolve => setTimeout(resolve, 1500));
        setLoading(false);
        setSubmitted(true);
        toast.success('Pedido de devolução registado!');
    };

    if (submitted) {
        return (
            <div className="min-h-screen bg-background">
                <Header />
                <main className="container mx-auto px-4 py-24 flex items-center justify-center">
                    <Card className="max-w-md w-full p-12 text-center space-y-8 animate-in zoom-in-95 duration-500">
                        <div className="w-24 h-24 bg-secondary/10 rounded-full flex items-center justify-center mx-auto">
                            <CheckCircle2 className="h-12 w-12 text-secondary" />
                        </div>
                        <h2 className="text-3xl font-black">Pedido Registado</h2>
                        <p className="text-muted-foreground leading-relaxed">
                            O seu pedido de devolução foi recebido. Iremos analisar as fotos e a descrição e entraremos em contacto num prazo de 48 horas úteis com as instruções para a recolha.
                        </p>
                        <Button onClick={() => setSubmitted(false)} className="w-full bg-secondary text-secondary-foreground h-14 rounded-2xl font-bold">
                            Devolução concluída
                        </Button>
                    </Card>
                </main>
                <Footer />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background text-card-foreground">
            <Header />

            <main className="container mx-auto px-4 py-16">
                <div className="max-w-5xl mx-auto space-y-12">
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-border pb-12">
                        <div className="space-y-4">
                            <h1 className="text-5xl font-black flex items-center gap-4">
                                <RotateCcw className="h-12 w-12 text-secondary" />
                                Devolução
                            </h1>
                            <p className="text-xl text-muted-foreground max-w-2xl">
                                Mudou de ideia ou o produto não era o que esperava? Não se preocupe, o nosso processo de devolução é simples e transparente.
                            </p>
                        </div>
                        <div className="flex items-center gap-2 text-green-500 font-bold bg-green-500/10 px-6 py-3 rounded-full">
                            <ShieldCheck className="h-5 w-5" />
                            Garantia de 7 dias
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                        {/* Process Info */}
                        <div className="lg:col-span-1 space-y-8">
                            <h2 className="text-2xl font-bold">Como funciona?</h2>
                            <div className="space-y-6">
                                {[
                                    { step: '01', title: 'Solicite a Devolução', desc: 'Preencha o formulário ao lado com os dados do pedido.' },
                                    { step: '02', title: 'Análise de Estado', desc: 'Avaliamos o motivo e o estado do produto via foto.' },
                                    { step: '03', title: 'Recolha Grátis', desc: 'Agendamos a recolha no local da entrega original.' },
                                    { step: '04', title: 'Reembolso', desc: 'O valor é devolvido via Multicaixa ou créditos.' },
                                ].map((item, i) => (
                                    <div key={i} className="flex gap-4">
                                        <span className="text-2xl font-black text-secondary/40">{item.step}</span>
                                        <div>
                                            <h4 className="font-bold">{item.title}</h4>
                                            <p className="text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <Card className="bg-muted/30 border-border p-6 rounded-2xl">
                                <AlertCircle className="h-6 w-6 text-secondary mb-4" />
                                <h4 className="font-bold mb-2">Importante</h4>
                                <ul className="text-xs text-muted-foreground space-y-2 list-disc pl-4">
                                    <li>O produto deve estar na embalagem original.</li>
                                    <li>Não pode haver marcas de uso indevido.</li>
                                    <li>Todos os cabos e acessórios devem ser incluídos.</li>
                                </ul>
                            </Card>
                        </div>

                        {/* Form */}
                        <Card className="lg:col-span-2 border-border shadow-2xl rounded-3xl overflow-hidden">
                            <CardHeader className="bg-secondary/5 border-b border-border p-8">
                                <CardTitle className="text-2xl font-bold flex items-center gap-2">
                                    <FileText className="h-6 w-6 text-secondary" />
                                    Iniciar Solicitação
                                </CardTitle>
                                <CardDescription>Informe os dados do produto que deseja devolver.</CardDescription>
                            </CardHeader>
                            <CardContent className="p-8">
                                <form onSubmit={handleSubmit} className="space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <Label htmlFor="orderId">Número do Pedido</Label>
                                            <Input id="orderId" placeholder="Ex: #872349" required className="h-12 bg-muted/20" />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="reason">Motivo da Devolução</Label>
                                            <select
                                                id="reason"
                                                required
                                                className="flex h-12 w-full rounded-md border border-input bg-muted/20 px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring transition-all"
                                            >
                                                <option value="">Selecione um motivo</option>
                                                <option value="defeito">Produto com defeito</option>
                                                <option value="errado">Produto errado</option>
                                                <option value="desistencia">Desistência (7 dias)</option>
                                                <option value="danificado">Embalagem danificada</option>
                                            </select>
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="details">Detalhes Adicionais</Label>
                                        <Textarea id="details" placeholder="Descreva o estado do produto e o motivo detalhado..." required className="min-h-[120px] bg-muted/20 p-4" />
                                    </div>
                                    <div className="border-2 border-dashed border-border rounded-2xl p-8 text-center bg-muted/10 space-y-2 cursor-pointer hover:bg-muted/20 transition-all">
                                        <Truck className="h-10 w-10 text-muted-foreground mx-auto mb-2" />
                                        <p className="font-bold">Anexar Fotos do Produto</p>
                                        <p className="text-xs text-muted-foreground">Obrigatório para devoluções por defeito ou danos.</p>
                                    </div>
                                    <Button
                                        type="submit"
                                        className="w-full h-16 bg-secondary text-secondary-foreground text-xl font-black rounded-2xl shadow-xl shadow-secondary/20 hover:scale-[1.01] active:scale-95 transition-all"
                                        disabled={loading}
                                    >
                                        {loading ? <Loader2 className="animate-spin h-6 w-6" /> : 'Enviar Solicitação de Devolução'}
                                    </Button>
                                </form>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
};

export default ReturnsPage;
