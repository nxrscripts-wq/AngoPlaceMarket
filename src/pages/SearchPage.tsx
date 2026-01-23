import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { ProductCard } from '@/components/ProductCard';
import { Loader2, Search as SearchIcon, XCircle, Zap, TrendingUp, Sparkles, Filter, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { MARKETPLACE_CATEGORIES } from '@/lib/categories';
import { LoadingScreen } from '@/components/LoadingScreen';
import { Product } from '@/types';


const SearchPage = () => {
    const [searchParams] = useSearchParams();
    const query = searchParams.get('q') || '';
    const filter = searchParams.get('filter') || '';
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

    const handleSearch = useCallback(async () => {
        setLoading(true);
        try {
            let supabaseQuery = supabase
                .from('products')
                .select('*')
                .eq('status', 'PUBLICADO');

            if (query) {
                supabaseQuery = supabaseQuery.ilike('name', `%${query}%`);
            }

            if (filter === 'flash') {
                supabaseQuery = supabaseQuery.eq('is_flash_deal', true);
            } else if (filter === 'new') {
                supabaseQuery = supabaseQuery.order('created_at', { ascending: false });
            }

            if (selectedCategory) {
                supabaseQuery = supabaseQuery.eq('category', selectedCategory);
            }

            supabaseQuery = supabaseQuery.order('created_at', { ascending: false });

            const { data, error } = await supabaseQuery;

            if (error) throw error;
            setProducts((data || []) as Product[]);
        } catch (error) {
            console.error('Error searching products:', error);
        } finally {
            setLoading(false);
        }
    }, [query, filter]);

    useEffect(() => {
        handleSearch();
    }, [handleSearch, selectedCategory]);

    const getTitle = () => {
        if (query) return `Resultados para: "${query}"`;
        if (filter === 'flash') return 'Ofertas do Dia';
        if (filter === 'discounts') return 'Super Descontos';
        if (filter === 'new') return 'Novidades';
        return 'Todos os Produtos';
    };

    const getIcon = () => {
        if (filter === 'flash') return <Zap className="h-8 w-8 text-secondary fill-secondary animate-pulse" />;
        if (filter === 'discounts') return <TrendingUp className="h-8 w-8 text-secondary" />;
        if (filter === 'new') return <Sparkles className="h-8 w-8 text-secondary" />;
        return <SearchIcon className="h-8 w-8 text-secondary" />;
    };

    return (
        <div className="min-h-screen bg-background text-card-foreground">
            <main className="container mx-auto px-4 py-8">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl md:text-3xl font-black mb-1 flex items-center gap-3">
                            {getIcon()}
                            {getTitle()}
                        </h1>
                        <p className="text-muted-foreground font-medium text-sm">
                            {products.length} {products.length === 1 ? 'produto encontrado' : 'produtos encontrados'}
                        </p>
                    </div>

                    {/* Mobile Filters Trigger */}
                    <div className="flex gap-2 items-center">
                        <Sheet>
                            <SheetTrigger asChild>
                                <Button variant="outline" className="flex-1 md:flex-none gap-2 h-11 rounded-xl bg-card border-border">
                                    <Filter className="h-4 w-4" />
                                    Filtrar
                                    {selectedCategory && (
                                        <Badge variant="secondary" className="ml-1 h-5 px-1.5 text-[10px]">1</Badge>
                                    )}
                                </Button>
                            </SheetTrigger>
                            <SheetContent side="bottom" className="rounded-t-[32px] h-[80vh] px-6">
                                <SheetHeader className="mb-6">
                                    <SheetTitle className="text-left text-2xl font-black">Filtros</SheetTitle>
                                </SheetHeader>
                                <div className="space-y-8 overflow-y-auto pb-10">
                                    <div>
                                        <h3 className="text-sm font-black uppercase tracking-widest text-secondary mb-4">Escolha a Categoria</h3>
                                        <div className="grid grid-cols-2 gap-2">
                                            <Button
                                                variant={selectedCategory === null ? "secondary" : "ghost"}
                                                className="justify-start h-12 rounded-xl"
                                                onClick={() => setSelectedCategory(null)}
                                            >
                                                Todas
                                            </Button>
                                            {MARKETPLACE_CATEGORIES.map(cat => (
                                                <Button
                                                    key={cat.id}
                                                    variant={selectedCategory === cat.id ? "secondary" : "ghost"}
                                                    className="justify-start h-12 rounded-xl truncate"
                                                    onClick={() => setSelectedCategory(cat.id)}
                                                >
                                                    {cat.name}
                                                </Button>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="pt-6 border-t border-border">
                                        <Button
                                            className="w-full h-14 bg-secondary text-secondary-foreground font-black text-lg rounded-2xl"
                                            onClick={() => {
                                                // Sheet closes automatically on outer click or we could use state
                                                // but for now, the effect handles trigger
                                            }}
                                        >
                                            Aplicar Filtros
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            className="w-full mt-2 h-12 text-muted-foreground font-bold"
                                            onClick={() => setSelectedCategory(null)}
                                        >
                                            Limpar Tudo
                                        </Button>
                                    </div>
                                </div>
                            </SheetContent>
                        </Sheet>
                    </div>
                </div>

                {loading ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
                        {[...Array(10)].map((_, i) => (
                            <div key={i} className="aspect-[3/4] bg-muted animate-pulse rounded-xl" />
                        ))}
                    </div>
                ) : products.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6 text-card-foreground">
                        {products.map((product: Product) => (
                            <ProductCard
                                key={product.id}
                                product={{
                                    ...product,
                                    price: Number(product.price),
                                    originalPrice: product.old_price ? Number(product.old_price) : undefined,
                                    rating: Number(product.rating) || 4.5,
                                    reviews: Math.floor(Number(product.sales) * 0.3) || 100,
                                    sold: product.sales,
                                    freeShipping: product.is_international || product.sales > 1000,
                                }}
                                variant={filter === 'flash' ? 'flash' : 'default'}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-20 bg-muted/20 rounded-3xl border border-dashed border-border max-w-2xl mx-auto">
                        <XCircle className="h-16 w-16 text-muted-foreground/30 mx-auto mb-4" />
                        <h3 className="text-2xl font-bold mb-2">Ops! Nada encontrado</h3>
                        <p className="text-muted-foreground mb-8 px-8">
                            Não encontramos nenhum produto que combine com os critérios selecionados.
                            Tente pesquisar por termos mais genéricos ou verifique se escreveu corretamente.
                        </p>
                        <Button
                            variant="outline"
                            className="bg-card border-border hover:bg-secondary hover:text-secondary-foreground text-sm h-11 px-6 rounded-xl"
                            onClick={() => window.location.href = '/'}
                        >
                            Voltar para o Início
                        </Button>
                    </div>
                )}
            </main>
        </div>
    );
};

export default SearchPage;
