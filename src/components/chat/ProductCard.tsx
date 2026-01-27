import { ExternalLink, Package } from "lucide-react";
import { cn } from "@/lib/utils";

interface ProductCardProps {
    id: string;
    name: string;
    price: number;
    image?: string;
    variant?: 'compact' | 'full';
    className?: string;
}

export const ProductCard = ({ id, name, price, image, variant = 'compact', className }: ProductCardProps) => {
    const formattedPrice = price.toLocaleString('pt-AO', { style: 'currency', currency: 'AOA' });

    if (variant === 'compact') {
        return (
            <a
                href={`/produto/${id}`}
                className={cn(
                    "flex items-center gap-2 p-2 rounded-lg bg-muted/50 hover:bg-muted transition-colors group",
                    className
                )}
            >
                {image && (
                    <img
                        src={image}
                        alt={name}
                        className="w-8 h-8 rounded-md object-cover"
                    />
                )}
                <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium truncate">{name}</p>
                    <p className="text-xs font-bold text-secondary">{formattedPrice}</p>
                </div>
                <ExternalLink className="h-3 w-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
            </a>
        );
    }

    return (
        <a
            href={`/produto/${id}`}
            className={cn(
                "block p-3 rounded-xl bg-card border border-border hover:border-secondary/50 transition-all hover:shadow-md group",
                className
            )}
        >
            <div className="flex gap-3">
                {image ? (
                    <img
                        src={image}
                        alt={name}
                        className="w-16 h-16 rounded-lg object-cover"
                    />
                ) : (
                    <div className="w-16 h-16 rounded-lg bg-muted flex items-center justify-center">
                        <Package className="h-6 w-6 text-muted-foreground" />
                    </div>
                )}
                <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate mb-1">{name}</p>
                    <p className="text-lg font-bold text-secondary">{formattedPrice}</p>
                    <span className="text-[10px] flex items-center gap-1 mt-1 text-muted-foreground group-hover:text-secondary transition-colors">
                        <ExternalLink className="h-3 w-3" /> Ver detalhes
                    </span>
                </div>
            </div>
        </a>
    );
};
