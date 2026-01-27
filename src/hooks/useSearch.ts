import { useState, useEffect, useCallback, useMemo } from 'react';
import { supabase } from '@/lib/supabase';

// Common typo corrections
const TYPO_CORRECTIONS: Record<string, string> = {
    'celular': 'celular',
    'celullar': 'celular',
    'celelar': 'celular',
    'iphone': 'iphone',
    'ifone': 'iphone',
    'aifone': 'iphone',
    'samgung': 'samsung',
    'samsug': 'samsung',
    'sansung': 'samsung',
    'notbook': 'notebook',
    'notebuk': 'notebook',
    'laptoop': 'laptop',
    'computadro': 'computador',
    'computadror': 'computador',
    'cumputador': 'computador',
    'televisao': 'televisão',
    'tv': 'televisão',
    'geladeria': 'geladeira',
    'fridger': 'geladeira',
    'carro': 'carro',
    'veiculo': 'veículo',
    'veiculo': 'veículo',
    'moradia': 'moradia',
    'apartmento': 'apartamento',
    'apratamento': 'apartamento',
    'fone': 'fone',
    'audiofone': 'fone',
    'relogio': 'relógio',
    'reloigo': 'relógio',
};

// Popular search terms
const POPULAR_SEARCHES = [
    'iPhone 15',
    'Samsung Galaxy',
    'Notebook',
    'Televisão',
    'Apartamento Luanda',
    'Toyota Hilux',
    'PlayStation 5',
    'MacBook',
    'Ar Condicionado',
    'Geladeira'
];

interface SearchSuggestion {
    text: string;
    type: 'product' | 'category' | 'correction' | 'popular' | 'recent';
    count?: number;
    productId?: string;
    image?: string;
}

interface UseSearchSuggestionsResult {
    suggestions: SearchSuggestion[];
    correction: string | null;
    loading: boolean;
    popularSearches: string[];
    recentSearches: string[];
    addToRecent: (term: string) => void;
    clearRecent: () => void;
}

/**
 * Hook for smart search suggestions with debounce and typo correction
 */
export const useSearchSuggestions = (query: string, debounceMs: number = 300): UseSearchSuggestionsResult => {
    const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
    const [loading, setLoading] = useState(false);
    const [recentSearches, setRecentSearches] = useState<string[]>([]);

    // Load recent searches from localStorage
    useEffect(() => {
        const stored = localStorage.getItem('recent_searches');
        if (stored) {
            try {
                setRecentSearches(JSON.parse(stored));
            } catch {
                setRecentSearches([]);
            }
        }
    }, []);

    const addToRecent = useCallback((term: string) => {
        const normalized = term.toLowerCase().trim();
        if (!normalized) return;

        setRecentSearches(prev => {
            const updated = [normalized, ...prev.filter(t => t !== normalized)].slice(0, 5);
            localStorage.setItem('recent_searches', JSON.stringify(updated));
            return updated;
        });
    }, []);

    const clearRecent = useCallback(() => {
        setRecentSearches([]);
        localStorage.removeItem('recent_searches');
    }, []);

    // Check for typo correction
    const correction = useMemo(() => {
        if (!query || query.length < 3) return null;
        const lowerQuery = query.toLowerCase();

        // Direct match
        if (TYPO_CORRECTIONS[lowerQuery]) {
            return TYPO_CORRECTIONS[lowerQuery] !== lowerQuery ? TYPO_CORRECTIONS[lowerQuery] : null;
        }

        // Partial match
        for (const [typo, correct] of Object.entries(TYPO_CORRECTIONS)) {
            if (lowerQuery.includes(typo) && typo !== correct) {
                return lowerQuery.replace(typo, correct);
            }
        }

        return null;
    }, [query]);

    // Fetch suggestions with debounce
    useEffect(() => {
        if (!query || query.length < 2) {
            setSuggestions([]);
            return;
        }

        const timeoutId = setTimeout(async () => {
            setLoading(true);
            try {
                // Search products
                const { data: products } = await supabase
                    .from('products')
                    .select('id, name, image')
                    .eq('status', 'PUBLICADO')
                    .ilike('name', `%${query}%`)
                    .limit(5);

                // Get category matches
                const { data: categories } = await supabase
                    .from('products')
                    .select('category')
                    .eq('status', 'PUBLICADO')
                    .ilike('category', `%${query}%`)
                    .limit(3);

                const results: SearchSuggestion[] = [];

                // Add correction if exists
                if (correction) {
                    results.push({
                        text: correction,
                        type: 'correction'
                    });
                }

                // Add product suggestions
                if (products) {
                    products.forEach(p => {
                        results.push({
                            text: p.name,
                            type: 'product',
                            productId: p.id,
                            image: p.image
                        });
                    });
                }

                // Add category suggestions
                if (categories) {
                    const uniqueCategories = [...new Set(categories.map(c => c.category))];
                    uniqueCategories.forEach(cat => {
                        results.push({
                            text: `Categoria: ${cat}`,
                            type: 'category'
                        });
                    });
                }

                setSuggestions(results);
            } catch (error) {
                console.error('Error fetching suggestions:', error);
            } finally {
                setLoading(false);
            }
        }, debounceMs);

        return () => clearTimeout(timeoutId);
    }, [query, debounceMs, correction]);

    return {
        suggestions,
        correction,
        loading,
        popularSearches: POPULAR_SEARCHES,
        recentSearches,
        addToRecent,
        clearRecent
    };
};

/**
 * Hook for filtering products with multiple criteria
 */
export interface SearchFilters {
    category?: string | null;
    minPrice?: number;
    maxPrice?: number;
    province?: string;
    condition?: 'new' | 'used' | 'all';
    sortBy?: 'relevance' | 'price_asc' | 'price_desc' | 'newest';
}

interface UseProductSearchResult {
    products: any[];
    loading: boolean;
    totalCount: number;
    search: (query: string, filters: SearchFilters) => void;
}

export const useProductSearch = (): UseProductSearchResult => {
    const [products, setProducts] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [totalCount, setTotalCount] = useState(0);

    const search = useCallback(async (query: string, filters: SearchFilters) => {
        setLoading(true);
        try {
            let supabaseQuery = supabase
                .from('products')
                .select('*', { count: 'exact' })
                .eq('status', 'PUBLICADO');

            // Text search
            if (query) {
                supabaseQuery = supabaseQuery.or(`name.ilike.%${query}%,description.ilike.%${query}%`);
            }

            // Category filter
            if (filters.category) {
                supabaseQuery = supabaseQuery.eq('category', filters.category);
            }

            // Price filters
            if (filters.minPrice !== undefined) {
                supabaseQuery = supabaseQuery.gte('price', filters.minPrice);
            }
            if (filters.maxPrice !== undefined) {
                supabaseQuery = supabaseQuery.lte('price', filters.maxPrice);
            }

            // Province filter
            if (filters.province) {
                supabaseQuery = supabaseQuery.eq('province', filters.province);
            }

            // Condition filter
            if (filters.condition && filters.condition !== 'all') {
                supabaseQuery = supabaseQuery.eq('condition', filters.condition === 'new' ? 'Novo' : 'Usado');
            }

            // Sorting
            switch (filters.sortBy) {
                case 'price_asc':
                    supabaseQuery = supabaseQuery.order('price', { ascending: true });
                    break;
                case 'price_desc':
                    supabaseQuery = supabaseQuery.order('price', { ascending: false });
                    break;
                case 'newest':
                    supabaseQuery = supabaseQuery.order('created_at', { ascending: false });
                    break;
                default:
                    supabaseQuery = supabaseQuery.order('created_at', { ascending: false });
            }

            const { data, count, error } = await supabaseQuery.limit(50);

            if (error) throw error;

            setProducts(data || []);
            setTotalCount(count || 0);
        } catch (error) {
            console.error('Error searching products:', error);
            setProducts([]);
        } finally {
            setLoading(false);
        }
    }, []);

    return { products, loading, totalCount, search };
};
