import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { ProductCard } from '@/components/ProductCard';
import { MARKETPLACE_CATEGORIES } from '@/lib/categories';
import { Filter, SlidersHorizontal, PackageX, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { LoadingScreen } from '@/components/LoadingScreen';
import { Product } from '@/types';


const CategoryPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);

    const category = MARKETPLACE_CATEGORIES.find(c => c.id === id);
    const categoryName = category?.name || id;

    const fetchCategoryProducts = useCallback(async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('products')
                .select('*')
                .eq('category', id)
                .eq('status', 'PUBLICADO')
                .order('created_at', { ascending: false });

            if (error) throw error;
            setProducts((data || []) as Product[]);
        } catch (error) {
            console.error('Error fetching category products:', error);
        } finally {
            setLoading(false);
        }
    }, [id]);

    useEffect(() => {
        fetchCategoryProducts();
    }, [fetchCategoryProducts]);

    const formatProductForCard = (product: Product) => ({
        ...product,
        price: Number(product.price),
        originalPrice: product.old_price ? Number(product.old_price) : undefined,
        rating: Number(product.rating) || 4.5,
        reviews: Math.floor(Number(product.sales) * 0.3) || 100,
        sold: product.sales,
        freeShipping: product.is_international || product.sales > 1000,
    });

    return (
        <div className="min-h-screen bg-background text-card-foreground">
            <main className="container mx-auto px-4 py-8">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-12">
                    <div className="flex items-center gap-4">
                        {category && (
                            <div className={`p-4 rounded-2xl ${category.color.split(' ')[0]} shadow-lg`}>
                                <category.icon className="h-8 w-8" />
                            </div>
                        )}
                        <div>
                            <h1 className="text-4xl font-black mb-1 tracking-tight">{categoryName}</h1>
                            <p className="text-muted-foreground font-medium">Os melhores produtos de {categoryName} em Angola</p>
                        </div>
                    </div>

                    <div className="flex gap-2 w-full md:w-auto">
                        <Button variant="outline" className="flex-1 md:flex-initial gap-2 border-border h-12 rounded-xl font-bold">
                            <Filter className="h-4 w-4" />
                            Preço
                        </Button>
                        <Button variant="outline" className="flex-1 md:flex-initial gap-2 border-border h-12 rounded-xl font-bold">
                            <SlidersHorizontal className="h-4 w-4" />
                            Filtrar
                        </Button>
                    </div>
                </div>

                {loading ? (
                    <LoadingScreen fullScreen={false} />
                ) : products.length > 0 ? (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6 animate-in fade-in duration-500">
                        {products.map((product) => (
                            <ProductCard key={product.id} product={formatProductForCard(product)} />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-24 bg-card/40 rounded-[3rem] border border-dashed border-border max-w-3xl mx-auto shadow-2xl shadow-black/5">
                        <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mx-auto mb-6">
                            <PackageX className="h-10 w-10 text-muted-foreground/50" />
                        </div>
                        <h3 className="text-3xl font-black mb-4">Nenhum produto publicado</h3>
                        <p className="text-muted-foreground mb-10 max-w-sm mx-auto text-lg">
                            Esta categoria ainda não tem anúncios ativos. Seja o primeiro a vender {categoryName}!
                        </p>
                        <Button
                            onClick={() => navigate('/publish')}
                            className="bg-secondary hover:bg-secondary/90 text-secondary-foreground font-black px-10 h-14 rounded-2xl text-lg shadow-xl shadow-secondary/20 transition-all hover:scale-105"
                        >
                            <Plus className="mr-2 h-6 w-6" />
                            Publicar Agora
                        </Button>
                    </div>
                )}
            </main>
        </div>
    );
};

export default CategoryPage;
