import { useState, useRef, useEffect, memo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useSearchSuggestions } from '@/hooks/useSearch';
import {
    Search,
    X,
    Clock,
    TrendingUp,
    Loader2,
    ArrowRight,
    Sparkles,
    Package
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface SmartSearchInputProps {
    placeholder?: string;
    className?: string;
    variant?: 'default' | 'hero';
    onSearch?: (query: string) => void;
    autoFocus?: boolean;
}

export const SmartSearchInput = memo(({
    placeholder = "Buscar produtos, marcas e muito mais...",
    className,
    variant = 'default',
    onSearch,
    autoFocus = false
}: SmartSearchInputProps) => {
    const navigate = useNavigate();
    const [query, setQuery] = useState('');
    const [isFocused, setIsFocused] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    const {
        suggestions,
        correction,
        loading,
        popularSearches,
        recentSearches,
        addToRecent,
        clearRecent
    } = useSearchSuggestions(query);

    // Handle click outside to close dropdown
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsFocused(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleSubmit = (e?: React.FormEvent, searchQuery?: string) => {
        e?.preventDefault();
        const finalQuery = searchQuery || query;
        if (!finalQuery.trim()) return;

        addToRecent(finalQuery);
        setIsFocused(false);

        if (onSearch) {
            onSearch(finalQuery);
        } else {
            navigate(`/search?q=${encodeURIComponent(finalQuery.trim())}`);
        }
    };

    const handleSuggestionClick = (suggestion: string, productId?: string) => {
        if (productId) {
            navigate(`/produto/${productId}`);
        } else {
            handleSubmit(undefined, suggestion);
        }
    };

    const showDropdown = isFocused && (
        query.length >= 2 ||
        recentSearches.length > 0 ||
        popularSearches.length > 0
    );

    const isHero = variant === 'hero';

    return (
        <div ref={containerRef} className={cn("relative w-full", className)}>
            <form onSubmit={handleSubmit} className="relative">
                <div className="relative">
                    <Input
                        ref={inputRef}
                        type="text"
                        placeholder={placeholder}
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        onFocus={() => setIsFocused(true)}
                        autoFocus={autoFocus}
                        className={cn(
                            "w-full transition-all duration-200",
                            isHero
                                ? "h-14 md:h-16 pr-14 pl-5 text-base md:text-lg rounded-2xl border-2 border-border bg-card shadow-lg focus:border-secondary focus:ring-4 focus:ring-secondary/20"
                                : "h-11 pr-12 rounded-full border-2 border-border bg-card focus:border-secondary"
                        )}
                    />

                    {/* Clear button */}
                    {query && (
                        <button
                            type="button"
                            onClick={() => {
                                setQuery('');
                                inputRef.current?.focus();
                            }}
                            className={cn(
                                "absolute top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors",
                                isHero ? "right-14" : "right-12"
                            )}
                        >
                            <X className="h-4 w-4" />
                        </button>
                    )}

                    {/* Search button */}
                    <Button
                        type="submit"
                        size="icon"
                        className={cn(
                            "absolute top-1/2 -translate-y-1/2 bg-secondary text-secondary-foreground hover:bg-secondary/90",
                            isHero
                                ? "right-2 h-10 w-10 md:h-12 md:w-12 rounded-xl"
                                : "right-1 h-9 w-9 rounded-full"
                        )}
                    >
                        {loading ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                            <Search className={cn(isHero ? "h-5 w-5" : "h-4 w-4")} />
                        )}
                    </Button>
                </div>
            </form>

            {/* Dropdown */}
            {showDropdown && (
                <div className={cn(
                    "absolute top-full left-0 right-0 mt-2 bg-card border border-border rounded-xl shadow-2xl overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200",
                    isHero && "rounded-2xl"
                )}>
                    {/* Correction suggestion */}
                    {correction && query.length >= 3 && (
                        <div className="px-4 py-3 bg-secondary/10 border-b border-border">
                            <button
                                onClick={() => handleSubmit(undefined, correction)}
                                className="flex items-center gap-2 text-sm w-full text-left hover:opacity-80"
                            >
                                <Sparkles className="h-4 w-4 text-secondary" />
                                <span className="text-muted-foreground">Você quis dizer:</span>
                                <span className="font-semibold text-secondary">{correction}</span>
                            </button>
                        </div>
                    )}

                    {/* Suggestions from search */}
                    {suggestions.length > 0 && query.length >= 2 && (
                        <div className="py-2">
                            {suggestions.map((suggestion, i) => (
                                <button
                                    key={i}
                                    onClick={() => handleSuggestionClick(
                                        suggestion.type === 'product' ? suggestion.text : suggestion.text.replace('Categoria: ', ''),
                                        suggestion.productId
                                    )}
                                    className="w-full flex items-center gap-3 px-4 py-2.5 text-left hover:bg-muted transition-colors"
                                >
                                    {suggestion.type === 'product' && suggestion.image ? (
                                        <img src={suggestion.image} alt="" className="w-8 h-8 rounded-lg object-cover" />
                                    ) : suggestion.type === 'category' ? (
                                        <div className="w-8 h-8 rounded-lg bg-secondary/10 flex items-center justify-center">
                                            <Package className="h-4 w-4 text-secondary" />
                                        </div>
                                    ) : (
                                        <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center">
                                            <Search className="h-4 w-4 text-muted-foreground" />
                                        </div>
                                    )}
                                    <span className="flex-1 text-sm truncate">{suggestion.text}</span>
                                    <ArrowRight className="h-4 w-4 text-muted-foreground" />
                                </button>
                            ))}
                        </div>
                    )}

                    {/* Recent searches */}
                    {!query && recentSearches.length > 0 && (
                        <div className="py-2 border-b border-border">
                            <div className="flex items-center justify-between px-4 py-1">
                                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                                    <Clock className="h-3 w-3" />
                                    Recentes
                                </span>
                                <button
                                    onClick={clearRecent}
                                    className="text-xs text-secondary hover:underline"
                                >
                                    Limpar
                                </button>
                            </div>
                            <div className="flex flex-wrap gap-2 px-4 py-2">
                                {recentSearches.map((term, i) => (
                                    <button
                                        key={i}
                                        onClick={() => handleSubmit(undefined, term)}
                                        className="px-3 py-1.5 bg-muted text-sm rounded-full hover:bg-secondary hover:text-secondary-foreground transition-colors"
                                    >
                                        {term}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Popular searches */}
                    {!query && (
                        <div className="py-3">
                            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5 px-4 mb-2">
                                <TrendingUp className="h-3 w-3" />
                                Popular em Angola
                            </span>
                            <div className="space-y-0.5">
                                {popularSearches.slice(0, 6).map((term, i) => (
                                    <button
                                        key={i}
                                        onClick={() => handleSubmit(undefined, term)}
                                        className="w-full text-left px-4 py-2 text-sm hover:bg-muted transition-colors flex items-center justify-between"
                                    >
                                        <span>{term}</span>
                                        <ArrowRight className="h-3 w-3 text-muted-foreground" />
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
});

SmartSearchInput.displayName = 'SmartSearchInput';
