import { Star, Truck, Heart, ShoppingCart } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

import { Product } from "@/types";

interface ProductCardProps {
  product: Partial<Product> & { price: number; originalPrice?: number; rating: number; reviews: number; sold?: number; freeShipping?: boolean };
  variant?: "default" | "flash";
}

const formatPrice = (price: number) => {
  return price.toLocaleString("pt-AO") + " Kz";
};

export const ProductCard = ({ product, variant = "default" }: ProductCardProps) => {
  const navigate = useNavigate();
  const discount = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  return (
    <div
      onClick={() => navigate(`/product/${product.id}`)}
      className="group bg-card rounded-xl overflow-hidden border border-border hover:border-secondary transition-all duration-300 cursor-pointer"
    >
      {/* Image */}
      <div className="relative aspect-square overflow-hidden bg-white">
        <img
          src={product.image || "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&q=80&w=400"}
          alt={product.name}
          loading="lazy"
          className="w-full h-full object-contain p-2 group-hover:scale-105 transition-transform duration-300"
        />
        {discount > 0 && (
          <Badge className="absolute top-2 left-2 bg-primary text-primary-foreground font-bold">
            -{discount}%
          </Badge>
        )}
        <div className="absolute top-2 right-2 flex flex-col gap-2 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
          <Button
            variant="ghost"
            size="icon"
            onClick={(e) => { e.stopPropagation(); /* Logic for heart */ }}
            className="bg-card/90 hover:bg-secondary hover:text-secondary-foreground rounded-full h-10 w-10 md:h-8 md:w-8 border border-border shadow-sm active:scale-90 transition-transform"
          >
            <Heart className="h-5 w-5 md:h-4 md:w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={(e) => { e.stopPropagation(); /* Logic for cart */ }}
            className="bg-secondary hover:bg-secondary/90 text-secondary-foreground rounded-full h-10 w-10 md:h-8 md:w-8 shadow-sm active:scale-90 transition-transform"
          >
            <ShoppingCart className="h-5 w-5 md:h-4 md:w-4" />
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="p-3">
        <h3 className="text-sm font-medium line-clamp-2 mb-2 min-h-[40px] text-card-foreground">
          {product.name}
        </h3>

        {/* Price */}
        <div className="flex items-baseline gap-2 mb-2">
          <span className="text-lg md:text-xl font-bold text-secondary">
            {formatPrice(product.price)}
          </span>
          {product.originalPrice && (
            <span className="text-xs text-muted-foreground line-through">
              {formatPrice(product.originalPrice)}
            </span>
          )}
        </div>

        {/* Rating */}
        <div className="flex items-center gap-1 mb-2">
          <Star className="h-3 w-3 fill-rating text-rating" />
          <span className="text-xs font-medium text-card-foreground">{product.rating}</span>
          <span className="text-xs text-muted-foreground">
            ({product.reviews.toLocaleString()})
          </span>
          {product.sold && (
            <span className="text-xs text-muted-foreground ml-1">
              {product.sold.toLocaleString()} vendidos
            </span>
          )}
        </div>

        {/* Free shipping */}
        {product.freeShipping && (
          <div className="flex items-center gap-1 text-success text-xs">
            <Truck className="h-3 w-3" />
            <span>Frete Grátis</span>
          </div>
        )}

        {/* Flash deal progress bar */}
        {variant === "flash" && product.sold && (
          <div className="mt-2">
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-primary to-secondary rounded-full"
                style={{ width: `${Math.min((product.sold / 15000) * 100, 100)}%` }}
              />
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {product.sold.toLocaleString()} vendidos
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
