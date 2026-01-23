import { useState } from 'react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import {
    Mail,
    Phone,
    MapPin,
    MessageSquare,
    Send,
    Clock,
    CheckCircle2,
    Loader2
} from 'lucide-react';
import { toast } from 'sonner';

const ContactPage = () => {
    const [loading, setLoading] = useState(false);
    const [submitted, setSubmitted] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1500));

        setLoading(false);
        setSubmitted(true);
        toast.success('Mensagem enviada com sucesso!');
    };

    if (submitted) {
        return (
            <>
                <main className="container mx-auto px-4 py-24 flex items-center justify-center">
                    <Card className="max-w-md w-full p-12 text-center space-y-8 animate-in zoom-in-95 duration-500">
                        <div className="w-24 h-24 bg-green-500/10 rounded-full flex items-center justify-center mx-auto">
                            <CheckCircle2 className="h-12 w-12 text-green-500" />
                        </div>
                        <h2 className="text-3xl font-black">Mensagem Enviada!</h2>
                        <p className="text-muted-foreground leading-relaxed">
                            Obrigado por nos contactar. Recebemos a sua mensagem e a nossa equipa irá responder-lhe o mais brevemente possível (normalmente em menos de 24h).
                        </p>
                        <Button onClick={() => setSubmitted(false)} className="w-full bg-secondary text-secondary-foreground h-14 rounded-2xl font-bold">
                            Enviar outra mensagem
                        </Button>
                    </Card>
                </main>
            </>
        );
    }

    return (
        <>

            <main className="container mx-auto px-4 py-16">
                <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
                    {/* Info Side */}
                    <div className="space-y-12">
                        <div className="space-y-4">
                            <h1 className="text-5xl font-black leading-tight">Vamos Conversar?</h1>
                            <p className="text-xl text-muted-foreground leading-relaxed">
                                Tem uma dúvida, sugestão ou encontrou um problema? Estamos aqui para ouvir e ajudar a tornar a sua experiência na AngoPlace perfeita.
                            </p>
                        </div>

                        <div className="space-y-6">
                            {[
                                { icon: Mail, title: 'Email', value: 'suporte@angoplace.ao', desc: 'Para dúvidas gerais e suporte técnico.' },
                                { icon: Phone, title: 'Telefone / WhatsApp', value: '+244 9XX XXX XXX', desc: 'Atendimento directo de Segunda a Sábado.' },
                                { icon: MapPin, title: 'Localização', value: 'Talatona, Luanda', desc: 'Sede administrativa da AngoPlace.' },
                                { icon: Clock, title: 'Horário', value: '08:00 - 18:00', desc: 'Horário de atendimento comercial.' },
                            ].map((info, i) => (
                                <div key={i} className="flex gap-6 items-start group">
                                    <div className="w-14 h-14 bg-secondary/10 rounded-2xl flex items-center justify-center group-hover:bg-secondary group-hover:text-secondary-foreground transition-colors shrink-0">
                                        <info.icon className="h-6 w-6" />
                                    </div>
                                    <div className="space-y-1">
                                        <h4 className="font-bold text-lg">{info.title}</h4>
                                        <p className="text-secondary font-black text-xl">{info.value}</p>
                                        <p className="text-sm text-muted-foreground">{info.desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Form Side */}
                    <Card className="border-border shadow-2xl rounded-[2.5rem] overflow-hidden">
                        <CardHeader className="bg-secondary/5 p-10 border-b border-border">
                            <div className="flex items-center gap-4 mb-2">
                                <div className="p-3 bg-secondary/10 rounded-xl text-secondary">
                                    <MessageSquare className="h-6 w-6" />
                                </div>
                                <CardTitle className="text-2xl font-black">Envie um Formulário</CardTitle>
                            </div>
                            <p className="text-muted-foreground">Preencha os campos abaixo e entraremos em contacto.</p>
                        </CardHeader>
                        <CardContent className="p-10">
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <Label htmlFor="name">Nome Completo</Label>
                                        <Input id="name" placeholder="Ex: João Manuel" required className="h-12 bg-muted/30 rounded-xl focus:border-secondary transition-all" />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="email">Email de Contacto</Label>
                                        <Input id="email" type="email" placeholder="nome@exemplo.com" required className="h-12 bg-muted/30 rounded-xl focus:border-secondary transition-all" />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="subject">Assunto</Label>
                                    <Input id="subject" placeholder="Em que podemos ajudar?" required className="h-12 bg-muted/30 rounded-xl focus:border-secondary transition-all" />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="message">Mensagem Detalhada</Label>
                                    <Textarea id="message" placeholder="Escreva aqui a sua dúvida ou sugestão..." required className="min-h-[150px] bg-muted/30 rounded-2xl focus:border-secondary transition-all p-4" />
                                </div>
                                <Button
                                    type="submit"
                                    className="w-full h-16 bg-secondary text-secondary-foreground text-xl font-black rounded-2xl shadow-xl shadow-secondary/20 transition-all hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-3"
                                    disabled={loading}
                                >
                                    {loading ? <Loader2 className="animate-spin h-6 w-6" /> : (
                                        <>
                                            Enviar Mensagem
                                            <Send className="h-5 w-5" />
                                        </>
                                    )}
                                </Button>
                            </form>
                        </CardContent>
                    </Card>
                </div>
            </main>

        </>
    );
};

export default ContactPage;
