import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ANGOLA_PROVINCES, getMunicipalitiesByProvince } from '@/lib/angolaLocations';
import { MARKETPLACE_CATEGORIES } from '@/lib/categories';
import { Upload, Package, MapPin, DollarSign, Info, Loader2, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';

const PublishPage = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);

    const [formData, setFormData] = useState({
        name: '',
        description: '',
        price: '',
        stock: '1',
        category: '',
        sub_category: '',
        province: user?.user_metadata?.province || '',
        municipality: user?.user_metadata?.municipality || '',
    });

    const municipalities = formData.province ? getMunicipalitiesByProvince(formData.province) : [];

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (!file.type.startsWith('image/')) {
            toast.error('Por favor, selecione uma imagem válida.');
            return;
        }

        setImageFile(file);
        const reader = new FileReader();
        reader.onloadend = () => {
            setImagePreview(reader.result as string);
        };
        reader.readAsDataURL(file);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) {
            toast.error('Você precisa estar logado para publicar.');
            return;
        }

        if (!imageFile) {
            toast.error('Por favor, adicione uma imagem do produto.');
            return;
        }

        setLoading(true);

        try {
            // 1. Upload image
            const fileExt = imageFile.name.split('.').pop();
            const fileName = `${Math.random()}.${fileExt}`;
            const filePath = `${user.id}/${fileName}`;

            const { error: uploadError } = await supabase.storage
                .from('products')
                .upload(filePath, imageFile);

            if (uploadError) throw uploadError;

            const { data: { publicUrl } } = supabase.storage
                .from('products')
                .getPublicUrl(filePath);

            // 2. Insert product
            const { error: insertError } = await supabase.from('products').insert({
                name: formData.name,
                description: formData.description,
                price: parseFloat(formData.price),
                stock: parseInt(formData.stock),
                category: formData.category,
                sub_category: formData.sub_category,
                image: publicUrl,
                seller_id: user.id,
                seller_province: formData.province,
                seller_municipality: formData.municipality,
                status: 'PENDENTE'
            });

            if (insertError) throw insertError;

            setSuccess(true);
            toast.success('Produto enviado para análise!');
        } catch (error) {
            console.error('Error publishing product:', error);
            toast.error('Erro ao publicar produto: ' + (error as { message: string }).message);
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <div className="min-h-screen bg-background flex flex-col">
                <Header />
                <main className="flex-1 flex items-center justify-center p-4">
                    <Card className="max-w-md w-full text-center p-8 animate-in zoom-in-95 duration-300">
                        <div className="flex justify-center mb-6">
                            <div className="w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center">
                                <CheckCircle className="h-10 w-10 text-green-500" />
                            </div>
                        </div>
                        <CardTitle className="text-2xl mb-2">Enviado com Sucesso!</CardTitle>
                        <CardDescription className="text-base mb-8">
                            Seu produto foi enviado para a nossa equipa de moderação.
                            Assim que for aprovado, ficará visível para todos os compradores.
                        </CardDescription>
                        <div className="flex flex-col gap-3">
                            <Button onClick={() => navigate('/seller')} className="bg-secondary hover:bg-secondary/90">
                                Ver Meus Produtos
                            </Button>
                            <Button variant="outline" onClick={() => setSuccess(false)}>
                                Publicar Outro Produto
                            </Button>
                        </div>
                    </Card>
                </main>
                <Footer />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background">
            <Header />
            <main className="container mx-auto px-4 py-8">
                <div className="max-w-3xl mx-auto">
                    <div className="flex items-center gap-3 mb-8">
                        <div className="w-12 h-12 bg-secondary/10 rounded-xl flex items-center justify-center">
                            <Package className="h-6 w-6 text-secondary" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold">Publicar Produto</h1>
                            <p className="text-muted-foreground">Venda o seu hardware para milhares de angolanos</p>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-8">
                        {/* Image Upload */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg flex items-center gap-2">
                                    <Upload className="h-5 w-5 text-secondary" />
                                    Imagem do Produto
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="flex flex-col items-center justify-center border-2 border-dashed border-border rounded-xl p-8 bg-muted/30 transition-colors hover:bg-muted/50 cursor-pointer relative group"
                                    onClick={() => document.getElementById('product-image-input')?.click()}>
                                    {imagePreview ? (
                                        <div className="relative w-full aspect-video max-h-[300px]">
                                            <img src={imagePreview} alt="Preview" className="w-full h-full object-contain rounded-lg" />
                                            <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-lg">
                                                <p className="text-white font-medium">Trocar Imagem</p>
                                            </div>
                                        </div>
                                    ) : (
                                        <>
                                            <div className="w-16 h-16 bg-background rounded-full flex items-center justify-center mb-4 shadow-sm">
                                                <Upload className="h-8 w-8 text-muted-foreground" />
                                            </div>
                                            <p className="font-semibold">Clique ou arraste para enviar</p>
                                            <p className="text-sm text-muted-foreground">PNG, JPG (Máx 5MB)</p>
                                        </>
                                    )}
                                    <input
                                        id="product-image-input"
                                        type="file"
                                        accept="image/*"
                                        className="hidden"
                                        onChange={handleImageChange}
                                    />
                                </div>
                            </CardContent>
                        </Card>

                        {/* Basic Info */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg flex items-center gap-2">
                                    <Info className="h-5 w-5 text-secondary" />
                                    Informações Básicas
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="name">Nome do Produto</Label>
                                    <Input
                                        id="name"
                                        placeholder="Ex: Teclado Mecânico RGB Switch Blue"
                                        required
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="category">Categoria</Label>
                                        <select
                                            id="category"
                                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                                            required
                                            value={formData.category}
                                            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                        >
                                            <option value="">Selecione uma categoria</option>
                                            {MARKETPLACE_CATEGORIES.map(cat => (
                                                <option key={cat.id} value={cat.id}>{cat.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="stock">Estoque Disponível</Label>
                                        <Input
                                            id="stock"
                                            type="number"
                                            min="1"
                                            required
                                            value={formData.stock}
                                            onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="description">Descrição Detalhada</Label>
                                    <Textarea
                                        id="description"
                                        placeholder="Descreva as especificações, estado (novo/usado) e outros detalhes..."
                                        className="min-h-[150px]"
                                        required
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    />
                                </div>
                            </CardContent>
                        </Card>

                        {/* Pricing & Location */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-lg flex items-center gap-2">
                                        <DollarSign className="h-5 w-5 text-secondary" />
                                        Preço
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-2">
                                        <Label htmlFor="price">Valor em Kwanzas (Kz)</Label>
                                        <div className="relative">
                                            <span className="absolute left-3 top-1/2 -translate-y-1/2 font-bold text-muted-foreground text-sm">Kz</span>
                                            <Input
                                                id="price"
                                                type="number"
                                                placeholder="0.00"
                                                className="pl-10"
                                                required
                                                value={formData.price}
                                                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                                            />
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-lg flex items-center gap-2">
                                        <MapPin className="h-5 w-5 text-secondary" />
                                        Localização de Venda
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="space-y-2">
                                        <Label>Província</Label>
                                        <select
                                            value={formData.province}
                                            onChange={(e) => setFormData({ ...formData, province: e.target.value, municipality: '' })}
                                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                                            required
                                        >
                                            <option value="">Selecione</option>
                                            {ANGOLA_PROVINCES.map(p => (
                                                <option key={p.id} value={p.id}>{p.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Município</Label>
                                        <select
                                            value={formData.municipality}
                                            onChange={(e) => setFormData({ ...formData, municipality: e.target.value })}
                                            disabled={!formData.province}
                                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:opacity-50"
                                            required
                                        >
                                            <option value="">Selecione</option>
                                            {municipalities.map(m => (
                                                <option key={m.id} value={m.id}>{m.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        <div className="flex gap-4">
                            <Button
                                type="button"
                                variant="outline"
                                className="flex-1 h-12"
                                onClick={() => navigate(-1)}
                                disabled={loading}
                            >
                                Cancelar
                            </Button>
                            <Button
                                type="submit"
                                className="flex-[2] h-12 bg-secondary hover:bg-secondary/90 text-secondary-foreground font-bold text-lg"
                                disabled={loading}
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                        Publicando...
                                    </>
                                ) : (
                                    'Publicar Agora'
                                )}
                            </Button>
                        </div>
                    </form>
                </div>
            </main>
            <Footer />
        </div>
    );
};

export default PublishPage;
