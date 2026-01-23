import { useState, useMemo } from "react";
import { MARKETPLACE_CATEGORIES } from "@/lib/categories";
import { ChevronRight, ChevronDown, ChevronUp } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

export const Categories = () => {
  const [isExpanded, setIsExpanded] = useState(false);

  // Dynamic calculation for a single row across breakpoints
  // We'll use a fixed number of 6 for large screens, 5 for lg, 4 for md, 3 for sm, 2 for xs
  // But to keep it simple and strictly "one line", we can show 6 and let the grid handle it,
  // OR we can make it even more explicit by using a flex container with overflow hidden.

  const INITIAL_ITEMS = 6;

  const visibleCategories = useMemo(() => {
    return isExpanded
      ? MARKETPLACE_CATEGORIES
      : MARKETPLACE_CATEGORIES.slice(0, INITIAL_ITEMS);
  }, [isExpanded]);

  const toggleExpand = () => {
    setIsExpanded(prev => !prev);
  };

  return (
    <section className="py-12 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-black text-card-foreground">Categorias</h2>
            <p className="text-muted-foreground">Encontre exatamente o que procura nas nossas diversas seções.</p>
          </div>
          <Link to="/search" className="text-secondary font-bold flex items-center gap-2 hover:underline">
            Pesquisa Avançada <ChevronRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 transition-all duration-500 ease-in-out overflow-hidden">
          {visibleCategories.map((category) => (
            <Link
              key={category.id}
              to={`/category/${category.id}`}
              className="flex items-center gap-4 p-4 rounded-2xl bg-card border border-border hover:border-secondary hover:shadow-xl hover:shadow-secondary/5 transition-all group animate-in fade-in zoom-in-95 duration-300"
            >
              <div className={`p-3 rounded-xl ${category.color} transition-all duration-300 group-hover:scale-110 shrink-0`}>
                <category.icon className="h-6 w-6" />
              </div>
              <span className="text-sm font-bold text-card-foreground group-hover:text-secondary transition-colors line-clamp-2">
                {category.name}
              </span>
            </Link>
          ))}
        </div>

        {MARKETPLACE_CATEGORIES.length > INITIAL_ITEMS && (
          <div className="mt-10 flex justify-center">
            <Button
              variant="outline"
              onClick={toggleExpand}
              className="bg-card border-none text-secondary hover:bg-secondary hover:text-secondary-foreground font-black px-10 h-16 rounded-2xl transition-all flex items-center gap-3 shadow-xl hover:shadow-secondary/20 group"
            >
              <div className="bg-secondary/10 group-hover:bg-white/20 p-2 rounded-lg mr-1">
                {isExpanded ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
              </div>
              {isExpanded ? (
                "Ver Menos"
              ) : (
                `Mostrar Todas as Categorias (${MARKETPLACE_CATEGORIES.length})`
              )}
            </Button>
          </div>
        )}
      </div>
    </section>
  );
};
