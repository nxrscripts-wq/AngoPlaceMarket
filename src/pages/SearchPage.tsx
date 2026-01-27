import { useState, useEffect, useCallback, useMemo, memo } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { ProductCard } from '@/components/ProductCard';
import { SmartSearchInput } from '@/components/search/SmartSearchInput';
import { useProductSearch, SearchFilters } from '@/hooks/useSearch';
import {
    Loader2,
    Search as SearchIcon,
    XCircle,
    Zap,
    TrendingUp,
    Sparkles,
    Filter,
    MapPin,
    SlidersHorizontal,
    ChevronDown
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetClose } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { MARKETPLACE_CATEGORIES } from '@/lib/categories';
import { Product } from '@/types';
import { cn } from '@/lib/utils';

// Angola provinces
const PROVINCES = [
    'Bengo', 'Benguela', 'Bié', 'Cabinda', 'Cuando Cubango', 'Cuanza Norte',
    'Cuanza Sul', 'Cunene', 'Huambo', 'Huíla', 'Icolo e Bengo', 'Luanda',
    'Lunda Norte', 'Lunda Sul', 'Malanje', 'Moxico', 'Namibe', 'Uíge', 'Zaire'
];

const SORT_OPTIONS = [
    { value: 'relevance', label: 'Mais relevantes' },
    { value: 'newest', label: 'Mais recentes' },
    { value: 'price_asc', label: 'Menor preço' },
    { value: 'price_desc', label: 'Maior preço' },
];

const SearchPage = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const navigate = useNavigate();
    const query = searchParams.get('q') || '';
    const specialFilter = searchParams.get('filter') || '';

    const { products, loading, totalCount, search } = useProductSearch();

    // Filters state
    const [filters, setFilters] = useState<SearchFilters>({
        category: searchParams.get('category') || null,
        minPrice: searchParams.get('minPrice') ? Number(searchParams.get('minPrice')) : undefined,
        maxPrice: searchParams.get('maxPrice') ? Number(searchParams.get('maxPrice')) : undefined,
        province: searchParams.get('province') || undefined,
        condition: (searchParams.get('condition') as 'new' | 'used' | 'all') || 'all',
        sortBy: (searchParams.get('sortBy') as any) || 'relevance'
    });

    // Count active filters
    const activeFilterCount = useMemo(() => {
        let count = 0;
        if (filters.category) count++;
        if (filters.minPrice || filters.maxPrice) count++;
        if (filters.province) count++;
        if (filters.condition && filters.condition !== 'all') count++;
        return count;
    }, [filters]);

    // Update search when query or filters change
    useEffect(() => {
        search(query, filters);
    }, [query, filters, search]);

    // Handle search from SmartSearchInput
    const handleSearch = useCallback((newQuery: string) => {
        setSearchParams(prev => {
            prev.set('q', newQuery);
            return prev;
        });
    }, [setSearchParams]);

    // Apply filters
    const applyFilters = useCallback((newFilters: Partial<SearchFilters>) => {
        setFilters(prev => ({ ...prev, ...newFilters }));
    }, []);

    // Clear all filters
    const clearFilters = useCallback(() => {
        setFilters({
            category: null,
            minPrice: undefined,
            maxPrice: undefined,
            province: undefined,
            condition: 'all',
            sortBy: 'relevance'
        });
    }, []);

    const getTitle = () => {
        if (query) return `Resultados para "${query}"`;
        if (specialFilter === 'flash') return 'Ofertas do Dia';
        if (specialFilter === 'discounts') return 'Super Descontos';
        if (specialFilter === 'new') return 'Novidades';
        return 'Todos os Produtos';
    };

    const getIcon = () => {
        if (specialFilter === 'flash') return <Zap className="h-6 w-6 text-secondary fill-secondary" />;
        if (specialFilter === 'discounts') return <TrendingUp className="h-6 w-6 text-secondary" />;
        if (specialFilter === 'new') return <Sparkles className="h-6 w-6 text-secondary" />;
        return <SearchIcon className="h-6 w-6 text-secondary" />;
    };

    return (
        <div className="min-h-screen bg-background">
            {/* Search Header - Sticky on Mobile */}
            <div className="sticky top-0 z-40 bg-background/95 backdrop-blur-md border-b border-border py-3 md:py-4">
                <div className="container mx-auto px-4">
                    <SmartSearchInput
                        onSearch={handleSearch}
                        className="max-w-2xl mx-auto"
                    />
                </div>
            </div>

            <main className="container mx-auto px-4 py-6">
                {/* Title and filters row */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                    <div>
                        <h1 className="text-xl md:text-2xl font-bold flex items-center gap-2">
                            {getIcon()}
                            {getTitle()}
                        </h1>
                        <p className="text-sm text-muted-foreground mt-1">
                            {totalCount} {totalCount === 1 ? 'produto encontrado' : 'produtos encontrados'}
                        </p>
                    </div>

                    <div className="flex items-center gap-2">
                        {/* Sort dropdown - desktop */}
                        <div className="hidden md:block">
                            <Select
                                value={filters.sortBy}
                                onValueChange={(v) => applyFilters({ sortBy: v as any })}
                            >
                                <SelectTrigger className="w-44 h-10">
                                    <SelectValue placeholder="Ordenar por" />
                                </SelectTrigger>
                                <SelectContent>
                                    {SORT_OPTIONS.map(opt => (
                                        <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Filter button */}
                        <Sheet>
                            <SheetTrigger asChild>
                                <Button variant="outline" className="gap-2 h-10 rounded-xl">
                                    <SlidersHorizontal className="h-4 w-4" />
                                    <span className="hidden sm:inline">Filtros</span>
                                    {activeFilterCount > 0 && (
                                        <Badge className="bg-secondary text-secondary-foreground h-5 w-5 p-0 flex items-center justify-center text-[10px]">
                                            {activeFilterCount}
                                        </Badge>
                                    )}
                                </Button>
                            </SheetTrigger>
                            <SheetContent side="bottom" className="rounded-t-3xl h-[85vh] md:h-auto md:max-h-[80vh]">
                                <SheetHeader className="mb-6">
                                    <SheetTitle className="text-xl font-bold text-left">Filtros</SheetTitle>
                                </SheetHeader>

                                <div className="space-y-6 overflow-y-auto pb-24 md:pb-6">
                                    {/* Sort - Mobile only */}
                                    <div className="md:hidden">
                                        <Label className="text-sm font-semibold mb-3 block">Ordenar por</Label>
                                        <Select
                                            value={filters.sortBy}
                                            onValueChange={(v) => applyFilters({ sortBy: v as any })}
                                        >
                                            <SelectTrigger className="w-full h-12">
                                                <SelectValue placeholder="Ordenar por" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {SORT_OPTIONS.map(opt => (
                                                    <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <Separator className="md:hidden" />

                                    {/* Category */}
                                    <div>
                                        <Label className="text-sm font-semibold mb-3 block">Categoria</Label>
                                        <div className="grid grid-cols-2 gap-2">
                                            <Button
                                                variant={!filters.category ? "secondary" : "outline"}
                                                className="h-11 justify-start rounded-xl"
                                                onClick={() => applyFilters({ category: null })}
                                            >
                                                Todas
                                            </Button>
                                            {MARKETPLACE_CATEGORIES.map(cat => (
                                                <Button
                                                    key={cat.id}
                                                    variant={filters.category === cat.id ? "secondary" : "outline"}
                                                    className="h-11 justify-start rounded-xl truncate"
                                                    onClick={() => applyFilters({ category: cat.id })}
                                                >
                                                    {cat.name}
                                                </Button>
                                            ))}
                                        </div>
                                    </div>

                                    <Separator />

                                    {/* Price Range */}
                                    <div>
                                        <Label className="text-sm font-semibold mb-3 block">Faixa de Preço (Kz)</Label>
                                        <div className="flex items-center gap-3">
                                            <Input
                                                type="number"
                                                placeholder="Mínimo"
                                                value={filters.minPrice || ''}
                                                onChange={(e) => applyFilters({ minPrice: e.target.value ? Number(e.target.value) : undefined })}
                                                className="h-12 rounded-xl"
                                            />
                                            <span className="text-muted-foreground">até</span>
                                            <Input
                                                type="number"
                                                placeholder="Máximo"
                                                value={filters.maxPrice || ''}
                                                onChange={(e) => applyFilters({ maxPrice: e.target.value ? Number(e.target.value) : undefined })}
                                                className="h-12 rounded-xl"
                                            />
                                        </div>
                                        {/* Quick price buttons */}
                                        <div className="flex gap-2 mt-3 overflow-x-auto pb-1">
                                            {[
                                                { label: 'Até 10k', max: 10000 },
                                                { label: '10k - 50k', min: 10000, max: 50000 },
                                                { label: '50k - 200k', min: 50000, max: 200000 },
                                                { label: '200k+', min: 200000 },
                                            ].map(range => (
                                                <Button
                                                    key={range.label}
                                                    variant="outline"
                                                    size="sm"
                                                    className="shrink-0 rounded-full"
                                                    onClick={() => applyFilters({ minPrice: range.min, maxPrice: range.max })}
                                                >
                                                    {range.label}
                                                </Button>
                                            ))}
                                        </div>
                                    </div>

                                    <Separator />

                                    {/* Province */}
                                    <div>
                                        <Label className="text-sm font-semibold mb-3 block flex items-center gap-1.5">
                                            <MapPin className="h-4 w-4" />
                                            Localização
                                        </Label>
                                        <Select
                                            value={filters.province || 'all'}
                                            onValueChange={(v) => applyFilters({ province: v === 'all' ? undefined : v })}
                                        >
                                            <SelectTrigger className="w-full h-12 rounded-xl">
                                                <SelectValue placeholder="Todas as províncias" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="all">Todas as províncias</SelectItem>
                                                {PROVINCES.map(p => (
                                                    <SelectItem key={p} value={p}>{p}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <Separator />

                                    {/* Condition */}
                                    <div>
                                        <Label className="text-sm font-semibold mb-3 block">Condição</Label>
                                        <div className="flex gap-2">
                                            {[
                                                { value: 'all', label: 'Todos' },
                                                { value: 'new', label: 'Novo' },
                                                { value: 'used', label: 'Usado' },
                                            ].map(opt => (
                                                <Button
                                                    key={opt.value}
                                                    variant={filters.condition === opt.value ? "secondary" : "outline"}
                                                    className="flex-1 h-11 rounded-xl"
                                                    onClick={() => applyFilters({ condition: opt.value as any })}
                                                >
                                                    {opt.label}
                                                </Button>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                {/* Fixed bottom actions */}
                                <div className="absolute bottom-0 left-0 right-0 p-4 bg-background border-t border-border">
                                    <div className="flex gap-3">
                                        <Button
                                            variant="outline"
                                            className="flex-1 h-12 rounded-xl"
                                            onClick={clearFilters}
                                        >
                                            Limpar
                                        </Button>
                                        <SheetClose asChild>
                                            <Button className="flex-1 h-12 rounded-xl bg-secondary text-secondary-foreground">
                                                Ver {totalCount} resultados
                                            </Button>
                                        </SheetClose>
                                    </div>
                                </div>
                            </SheetContent>
                        </Sheet>
                    </div>
                </div>

                {/* Active filters pills */}
                {activeFilterCount > 0 && (
                    <div className="flex flex-wrap gap-2 mb-4">
                        {filters.category && (
                            <Badge variant="secondary" className="gap-1 px-3 py-1.5 rounded-full">
                                {MARKETPLACE_CATEGORIES.find(c => c.id === filters.category)?.name}
                                <button onClick={() => applyFilters({ category: null })}>
                                    <XCircle className="h-3 w-3 ml-1" />
                                </button>
                            </Badge>
                        )}
                        {(filters.minPrice || filters.maxPrice) && (
                            <Badge variant="secondary" className="gap-1 px-3 py-1.5 rounded-full">
                                {filters.minPrice ? `${(filters.minPrice / 1000).toFixed(0)}k` : '0'} - {filters.maxPrice ? `${(filters.maxPrice / 1000).toFixed(0)}k` : '∞'} Kz
                                <button onClick={() => applyFilters({ minPrice: undefined, maxPrice: undefined })}>
                                    <XCircle className="h-3 w-3 ml-1" />
                                </button>
                            </Badge>
                        )}
                        {filters.province && (
                            <Badge variant="secondary" className="gap-1 px-3 py-1.5 rounded-full">
                                <MapPin className="h-3 w-3" />
                                {filters.province}
                                <button onClick={() => applyFilters({ province: undefined })}>
                                    <XCircle className="h-3 w-3 ml-1" />
                                </button>
                            </Badge>
                        )}
                        {filters.condition && filters.condition !== 'all' && (
                            <Badge variant="secondary" className="gap-1 px-3 py-1.5 rounded-full">
                                {filters.condition === 'new' ? 'Novo' : 'Usado'}
                                <button onClick={() => applyFilters({ condition: 'all' })}>
                                    <XCircle className="h-3 w-3 ml-1" />
                                </button>
                            </Badge>
                        )}
                        <button
                            onClick={clearFilters}
                            className="text-xs text-secondary hover:underline px-2"
                        >
                            Limpar tudo
                        </button>
                    </div>
                )}

                {/* Results */}
                {loading ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 md:gap-4">
                        {[...Array(10)].map((_, i) => (
                            <div key={i} className="aspect-[3/4] bg-muted animate-pulse rounded-xl" />
                        ))}
                    </div>
                ) : products.length > 0 ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 md:gap-4">
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
                                variant={specialFilter === 'flash' ? 'flash' : 'default'}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-16 bg-muted/20 rounded-2xl border border-dashed border-border max-w-xl mx-auto">
                        <XCircle className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
                        <h3 className="text-xl font-bold mb-2">Nenhum resultado</h3>
                        <p className="text-muted-foreground text-sm mb-6 px-6">
                            Não encontramos produtos com esses critérios. Tente ajustar os filtros ou pesquisar outros termos.
                        </p>
                        <div className="flex gap-3 justify-center">
                            <Button variant="outline" onClick={clearFilters}>
                                Limpar filtros
                            </Button>
                            <Button onClick={() => navigate('/')}>
                                Ver todos
                            </Button>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
};

export default SearchPage;
