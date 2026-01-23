import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { ProductCard } from '@/components/ProductCard';
import { Loader2, Search as SearchIcon, XCircle, Zap, TrendingUp, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { LoadingScreen } from '@/components/LoadingScreen';
import { Product } from '@/types';


const SearchPage = () => {
    const [searchParams] = useSearchParams();
    const query = searchParams.get('q') || '';
    const filter = searchParams.get('filter') || '';
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);

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
            } else if (filter === 'discounts') {
                supabaseQuery = supabaseQuery.not('old_price', 'is', null);
            } else if (filter === 'new') {
                supabaseQuery = supabaseQuery.order('created_at', { ascending: false });
            } else {
                supabaseQuery = supabaseQuery.order('created_at', { ascending: false });
            }

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
    }, [handleSearch]);

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
                <div className="mb-8">
                    <h1 className="text-3xl font-black mb-2 flex items-center gap-3">
                        {getIcon()}
                        {getTitle()}
                    </h1>
                    <p className="text-muted-foreground font-medium">
                        {products.length} {products.length === 1 ? 'produto encontrado' : 'produtos encontrados'}
                    </p>
                </div>

                {loading ? (
                    <div className="flex items-center justify-center h-[50vh]">
                        <LoadingScreen />
                    </div>
                ) : products.length > 0 ? (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
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
                            className="bg-card border-border hover:bg-secondary hover:text-secondary-foreground"
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
