import { useState, useEffect } from "react";
import { Zap, Loader2 } from "lucide-react";
import { ProductCard } from "./ProductCard";
import { supabase, type Product } from "@/lib/supabase";

export const FlashDeals = () => {
  const [flashProducts, setFlashProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeLeft, setTimeLeft] = useState({
    hours: 5,
    minutes: 32,
    seconds: 47,
  });

  useEffect(() => {
    const fetchFlashDeals = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .eq('status', 'PUBLICADO')
          .eq('is_flash_deal', true)
          .order('sales', { ascending: false })
          .limit(5);

        if (error) throw error;
        setFlashProducts(data || []);
      } catch (err) {
        console.error('Error fetching flash deals:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchFlashDeals();
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        let { hours, minutes, seconds } = prev;
        seconds--;
        if (seconds < 0) {
          seconds = 59;
          minutes--;
        }
        if (minutes < 0) {
          minutes = 59;
          hours--;
        }
        if (hours < 0) {
          hours = 23;
        }
        return { hours, minutes, seconds };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const pad = (n: number) => n.toString().padStart(2, "0");

  const formatProductForCard = (product: Product) => ({
    id: product.id,
    name: product.name,
    image: product.image,
    price: Number(product.price),
    originalPrice: product.old_price ? Number(product.old_price) : Number(product.price) * 1.5,
    rating: Number(product.rating) || 4.8,
    reviews: Math.floor(Number(product.sales) * 0.3) || 500,
    sold: product.sales,
    freeShipping: true,
  });

  // Don't render if no flash deals
  if (!loading && flashProducts.length === 0) {
    return null;
  }

  return (
    <section className="py-6 bg-gradient-to-r from-primary/20 via-background to-primary/10 border-y border-primary/30">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary rounded-lg">
              <Zap className="h-5 w-5 text-primary-foreground fill-primary-foreground animate-pulse" />
            </div>
            <h2 className="text-xl md:text-2xl font-bold text-card-foreground">
              Ofertas <span className="text-primary">Relâmpago</span>
            </h2>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground text-sm hidden md:block">Termina em:</span>
            <div className="flex gap-1">
              <span className="bg-primary text-primary-foreground px-2 py-1 rounded font-mono font-bold text-sm">
                {pad(timeLeft.hours)}
              </span>
              <span className="text-primary font-bold">:</span>
              <span className="bg-primary text-primary-foreground px-2 py-1 rounded font-mono font-bold text-sm">
                {pad(timeLeft.minutes)}
              </span>
              <span className="text-primary font-bold">:</span>
              <span className="bg-primary text-primary-foreground px-2 py-1 rounded font-mono font-bold text-sm">
                {pad(timeLeft.seconds)}
              </span>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {flashProducts.map((product) => (
              <ProductCard key={product.id} product={formatProductForCard(product)} variant="flash" />
            ))}
          </div>
        )}
      </div>
    </section>
  );
};
