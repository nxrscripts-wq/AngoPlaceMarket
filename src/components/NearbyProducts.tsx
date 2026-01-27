import { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { ProductCard } from './ProductCard';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MapPin, Loader2, Navigation, ChevronRight } from 'lucide-react';
import { ANGOLA_PROVINCES } from '@/lib/angolaLocations';
import { Link } from 'react-router-dom';
import { Product } from '@/types';

interface NearbyProductsProps {
    maxProducts?: number;
}

export const NearbyProducts = ({ maxProducts = 8 }: NearbyProductsProps) => {
    const { user } = useAuth();
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [userProvince, setUserProvince] = useState<string | null>(null);
    const [selectedProvince, setSelectedProvince] = useState<string>('');

    // Try to get user's province from profile
    useEffect(() => {
        const getUserProvince = async () => {
            if (user) {
                // First try from profile
                const { data } = await supabase
                    .from('profiles')
                    .select('province')
                    .eq('id', user.id)
                    .single();

                if (data?.province) {
                    setUserProvince(data.province);
                    setSelectedProvince(data.province);
                    return;
                }
            }

            // Fallback - try to detect from localStorage or default to Luanda
            const savedProvince = localStorage.getItem('user_province');
            if (savedProvince) {
                setUserProvince(savedProvince);
                setSelectedProvince(savedProvince);
            } else {
                // Default to Luanda as most popular
                setSelectedProvince('luanda');
            }
        };

        getUserProvince();
    }, [user]);

    // Fetch products from selected province
    useEffect(() => {
        const fetchNearbyProducts = async () => {
            if (!selectedProvince) return;

            setLoading(true);
            try {
                const { data, error } = await supabase
                    .from('products')
                    .select('*')
                    .eq('status', 'PUBLICADO')
                    .eq('seller_province', selectedProvince)
                    .order('created_at', { ascending: false })
                    .limit(maxProducts);

                if (error) throw error;
                setProducts((data || []) as Product[]);
            } catch (error) {
                console.error('Error fetching nearby products:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchNearbyProducts();
    }, [selectedProvince, maxProducts]);

    // Save province preference
    const handleProvinceChange = (province: string) => {
        setSelectedProvince(province);
        localStorage.setItem('user_province', province);
    };

    // Get province display name
    const provinceName = useMemo(() => {
        const province = ANGOLA_PROVINCES.find(p => p.id === selectedProvince);
        return province?.name || selectedProvince;
    }, [selectedProvince]);

    // Format product for card
    const formatProductForCard = (product: Product) => ({
        ...product,
        rating: 4.5,
        reviews: Math.floor(Math.random() * 100) + 10,
        originalPrice: product.price * 1.15,
        freeShipping: product.price > 50000,
        seller_province: provinceName
    });

    if (loading && products.length === 0) {
        return (
            <section className="py-8">
                <div className="flex items-center justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-secondary" />
                </div>
            </section>
        );
    }

    return (
        <section className="py-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-secondary/10 rounded-xl flex items-center justify-center">
                        <Navigation className="h-5 w-5 text-secondary" />
                    </div>
                    <div>
                        <h2 className="text-xl md:text-2xl font-bold flex items-center gap-2">
                            Perto de Você
                            {userProvince && (
                                <Badge variant="secondary" className="text-xs font-normal">
                                    <MapPin className="h-3 w-3 mr-1" />
                                    {provinceName}
                                </Badge>
                            )}
                        </h2>
                        <p className="text-sm text-muted-foreground">
                            Produtos disponíveis na sua região
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <Select value={selectedProvince} onValueChange={handleProvinceChange}>
                        <SelectTrigger className="w-44 h-10 rounded-xl">
                            <MapPin className="h-4 w-4 mr-2 text-muted-foreground" />
                            <SelectValue placeholder="Selecione" />
                        </SelectTrigger>
                        <SelectContent>
                            {ANGOLA_PROVINCES.map(p => (
                                <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <Link to={`/search?province=${selectedProvince}`}>
                        <Button variant="ghost" size="sm" className="text-secondary">
                            Ver Todos
                            <ChevronRight className="h-4 w-4 ml-1" />
                        </Button>
                    </Link>
                </div>
            </div>

            {/* Products Grid */}
            {products.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {products.map(product => (
                        <ProductCard
                            key={product.id}
                            product={formatProductForCard(product)}
                        />
                    ))}
                </div>
            ) : (
                <div className="text-center py-12 bg-muted/30 rounded-2xl border border-border">
                    <MapPin className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold mb-2">
                        Nenhum produto em {provinceName}
                    </h3>
                    <p className="text-muted-foreground mb-4">
                        Ainda não há produtos publicados nesta região.
                    </p>
                    <Link to="/search">
                        <Button variant="secondary">
                            Ver Todos os Produtos
                        </Button>
                    </Link>
                </div>
            )}
        </section>
    );
};
