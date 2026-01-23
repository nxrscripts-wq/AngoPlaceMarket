import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ShieldCheck, FileText, Lock, Scale } from 'lucide-react';

const TermsPage = () => {
    return (
        <div className="min-h-screen bg-background text-card-foreground">
            <Header />

            <main className="container mx-auto px-4 py-12">
                <div className="max-w-4xl mx-auto">
                    <div className="text-center mb-12">
                        <img src="/logo.png" alt="AngoPlaceMarket" className="h-20 w-auto object-contain mx-auto mb-6" />
                        <h1 className="text-4xl font-black mb-4">Políticas e Termos</h1>
                        <p className="text-muted-foreground">Transparência e segurança para todos os nossos utilizadores.</p>
                    </div>

                    <Tabs defaultValue="terms" className="space-y-8">
                        <TabsList className="grid w-full grid-cols-1 md:grid-cols-3 h-auto p-1 bg-muted rounded-2xl">
                            <TabsTrigger value="terms" className="py-3 rounded-xl data-[state=active]:bg-secondary data-[state=active]:text-secondary-foreground">
                                <FileText className="h-4 w-4 mr-2" />
                                Termos de Uso
                            </TabsTrigger>
                            <TabsTrigger value="privacy" className="py-3 rounded-xl data-[state=active]:bg-secondary data-[state=active]:text-secondary-foreground">
                                <Lock className="h-4 w-4 mr-2" />
                                Privacidade
                            </TabsTrigger>
                            <TabsTrigger value="individual" className="py-3 rounded-xl data-[state=active]:bg-secondary data-[state=active]:text-secondary-foreground">
                                <ShieldCheck className="h-4 w-4 mr-2" />
                                Uso Individual
                            </TabsTrigger>
                        </TabsList>

                        <TabsContent value="terms">
                            <Card className="border-border shadow-xl rounded-3xl overflow-hidden">
                                <CardHeader className="bg-secondary/5 border-b border-border p-8">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-secondary/10 rounded-xl flex items-center justify-center">
                                            <Scale className="h-6 w-6 text-secondary" />
                                        </div>
                                        <CardTitle className="text-2xl">Termos e Condições de Uso</CardTitle>
                                    </div>
                                </CardHeader>
                                <CardContent className="p-8 prose prose-invert max-w-none">
                                    <div className="space-y-6 text-muted-foreground leading-relaxed">
                                        <section>
                                            <h3 className="text-xl font-bold text-foreground mb-3">1. Aceitação dos Termos</h3>
                                            <p>Ao aceder e utilizar a plataforma AngoPlaceMarket, o utilizador concorda em cumprir e vincular-se aos presentes Termos de Uso. Se não concordar com qualquer parte destes termos, não deverá utilizar os nossos serviços.</p>
                                        </section>
                                        <section>
                                            <h3 className="text-xl font-bold text-foreground mb-3">2. Elegibilidade</h3>
                                            <p>O serviço está disponível para indivíduos com idade igual ou superior a 18 anos e empresas legalmente constituídas em Angola. Ao criar uma conta, o utilizador garante que possui capacidade jurídica para celebrar contratos.</p>
                                        </section>
                                        <section>
                                            <h3 className="text-xl font-bold text-foreground mb-3">3. Responsabilidades do Vendedor</h3>
                                            <p>Os vendedores são os únicos responsáveis pela veracidade das informações dos produtos, estado de conservação e cumprimento dos prazos de entrega acordados. É proibida a venda de produtos contrafeitos ou ilegais.</p>
                                        </section>
                                        <section>
                                            <h3 className="text-xl font-bold text-foreground mb-3">4. Transações e Pagamentos</h3>
                                            <p>A AngoPlaceMarket atua como mediadora. Os pagamentos devem ser realizados preferencialmente através dos métodos seguros disponibilizados na plataforma para garantir a proteção de ambas as partes.</p>
                                        </section>
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        <TabsContent value="privacy">
                            <Card className="border-border shadow-xl rounded-3xl overflow-hidden">
                                <CardHeader className="bg-secondary/5 border-b border-border p-8">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-secondary/10 rounded-xl flex items-center justify-center">
                                            <Lock className="h-6 w-6 text-secondary" />
                                        </div>
                                        <CardTitle className="text-2xl">Política de Privacidade</CardTitle>
                                    </div>
                                </CardHeader>
                                <CardContent className="p-8 prose prose-invert max-w-none">
                                    <div className="space-y-6 text-muted-foreground leading-relaxed">
                                        <section>
                                            <h3 className="text-xl font-bold text-foreground mb-3">Coleta de Dados</h3>
                                            <p>Coletamos informações básicas como nome, email, telefone e localização para processar os seus pedidos e melhorar a sua experiência na plataforma.</p>
                                        </section>
                                        <section>
                                            <h3 className="text-xl font-bold text-foreground mb-3">Uso das Informações</h3>
                                            <p>Os seus dados são utilizados exclusivamente para fins de autenticação, comunicação sobre pedidos e segurança da conta. Nunca vendemos os seus dados a terceiros.</p>
                                        </section>
                                        <section>
                                            <h3 className="text-xl font-bold text-foreground mb-3">Segurança</h3>
                                            <p>Utilizamos criptografia de ponta e infraestrutura segura (Supabase/PostgreSQL) para garantir que as suas informações sensíveis permaneçam protegidas contra acessos não autorizados.</p>
                                        </section>
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        <TabsContent value="individual">
                            <Card className="border-border shadow-xl rounded-3xl overflow-hidden">
                                <CardHeader className="bg-secondary/5 border-b border-border p-8">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-secondary/10 rounded-xl flex items-center justify-center">
                                            <ShieldCheck className="h-6 w-6 text-secondary" />
                                        </div>
                                        <CardTitle className="text-2xl">Política de Uso Individual</CardTitle>
                                    </div>
                                </CardHeader>
                                <CardContent className="p-8 prose prose-invert max-w-none">
                                    <div className="space-y-6 text-muted-foreground leading-relaxed">
                                        <p className="italic">Esta política define as regras para utilizadores que utilizam a plataforma para fins pessoais e não comerciais em larga escala.</p>
                                        <section>
                                            <h3 className="text-xl font-bold text-foreground mb-3">Boas Práticas</h3>
                                            <ul className="list-disc pl-5 space-y-2">
                                                <li>Não utilizar bots ou scripts para extração de dados.</li>
                                                <li>Manter uma comunicação respeitosa entre compradores e vendedores.</li>
                                                <li>Não compartilhar dados de contacto externos fora do sistema de chat nas fases iniciais de negociação.</li>
                                            </ul>
                                        </section>
                                        <section>
                                            <h3 className="text-xl font-bold text-foreground mb-3">Limites de Conta</h3>
                                            <p>Cada utilizador individual deve manter apenas uma conta ativa. Contas duplicadas ou criadas com o intuito de manipular avaliações serão permanentemente banidas.</p>
                                        </section>
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>
                    </Tabs>
                </div>
            </main>

            <Footer />
        </div>
    );
};

export default TermsPage;
