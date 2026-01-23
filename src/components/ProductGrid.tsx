import { useState, useEffect } from "react";
import { ProductCard } from "./ProductCard";
import { supabase, type Product } from "@/lib/supabase";
import { Loader2, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { ProductCardSkeleton } from "@/components/skeletons/ProductCardSkeleton";

interface ProductGridProps {
  title: string;
  subtitle?: string;
  limit?: number;
  filterType?: "best_sellers" | "new_arrivals" | "super_discounts";
  viewAllLink?: string;
  className?: string;
}

export const ProductGrid = ({
  title,
  subtitle,
  limit = 12,
  filterType = "best_sellers",
  viewAllLink = "#",
  className = ""
}: ProductGridProps) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        let query = supabase
          .from('products')
          .select('*')
          .eq('status', 'PUBLICADO')
          .eq('is_flash_deal', false);

        if (filterType === "new_arrivals") {
          query = query.order('created_at', { ascending: false });
        } else if (filterType === "super_discounts") {
          query = query.not('old_price', 'is', null).order('price', { ascending: true });
        } else {
          // best_sellers (default)
          query = query.order('sales', { ascending: false });
        }

        const { data, error: fetchError } = await query.limit(limit);

        if (fetchError) throw fetchError;
        setProducts(data || []);
      } catch (err) {
        console.error('Error fetching products:', err);
        setError('Erro ao carregar produtos');
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [filterType, limit]);

  const formatProductForCard = (product: Product) => ({
    id: product.id,
    name: product.name,
    image: product.image,
    price: Number(product.price),
    originalPrice: product.old_price ? Number(product.old_price) : undefined,
    rating: Number(product.rating) || 4.5,
    reviews: Math.floor(Number(product.sales) * 0.3) || 100,
    sold: product.sales,
    freeShipping: product.is_international || product.sales > 1000,
  });

  if (loading) {
    return (
      <section className={`py-8 ${className}`}>
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-black text-card-foreground">{title}</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3 sm:gap-4 md:gap-6">
            {[...Array(limit)].map((_, i) => (
              <ProductCardSkeleton key={i} />
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (error || products.length === 0) {
    if (filterType !== "best_sellers") return null;
    return (
      <section className={`py-8 ${className}`}>
        <div className="container mx-auto px-4 text-center py-12">
          <p className="text-muted-foreground">{error || "Nenhum produto disponível no momento"}</p>
        </div>
      </section>
    );
  }

  return (
    <section className={`py-8 ${className}`}>
      <div className="container mx-auto px-4">
        <div className="flex items-end justify-between mb-6">
          <div>
            <h2 className="text-2xl md:text-3xl font-black text-card-foreground tracking-tight">{title}</h2>
            {subtitle && <p className="text-muted-foreground text-sm mt-1">{subtitle}</p>}
          </div>
          <Link
            to={viewAllLink}
            className="group flex items-center gap-2 text-secondary text-sm font-bold hover:gap-3 transition-all"
          >
            Ver todos
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3 sm:gap-4 md:gap-6">
          {products.map((product) => (
            <ProductCard key={product.id} product={formatProductForCard(product)} />
          ))}
        </div>
      </div>
    </section>
  );
};
