import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Check, CheckCheck, Image as ImageIcon, ExternalLink } from "lucide-react";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";

interface ChatBubbleProps {
    content: string;
    isSender: boolean;
    timestamp: string;
    avatarUrl?: string;
    type?: 'text' | 'image' | 'system' | 'product_link';
    readAt?: string | null;
    productInfo?: {
        name: string;
        price: number;
        image: string;
        id: string;
    };
}

export const ChatBubble = ({
    content,
    isSender,
    timestamp,
    avatarUrl,
    type = 'text',
    readAt,
    productInfo
}: ChatBubbleProps) => {
    if (type === 'system') {
        return (
            <div className="flex justify-center my-4">
                <span className="text-xs text-muted-foreground bg-muted/50 px-3 py-1 rounded-full">
                    {content}
                </span>
            </div>
        );
    }

    if (type === 'product_link' && productInfo) {
        return (
            <div className={cn("flex gap-3 mb-4", isSender ? "flex-row-reverse" : "flex-row")}>
                <div className={cn(
                    "flex flex-col max-w-[80%]",
                    isSender ? "items-end" : "items-start"
                )}>
                    <a
                        href={`/produto/${productInfo.id}`}
                        className={cn(
                            "block p-3 rounded-2xl shadow-sm hover:opacity-90 transition-opacity",
                            isSender
                                ? "bg-secondary text-secondary-foreground rounded-tr-none"
                                : "bg-card text-card-foreground border border-border rounded-tl-none"
                        )}
                    >
                        <div className="flex gap-3">
                            <img
                                src={productInfo.image}
                                alt={productInfo.name}
                                className="w-16 h-16 rounded-lg object-cover"
                            />
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium truncate">{productInfo.name}</p>
                                <p className="text-lg font-bold text-secondary mt-1">
                                    {productInfo.price.toLocaleString('pt-AO', { style: 'currency', currency: 'AOA' })}
                                </p>
                                <span className="text-xs flex items-center gap-1 mt-1 opacity-70">
                                    <ExternalLink className="h-3 w-3" /> Ver produto
                                </span>
                            </div>
                        </div>
                    </a>
                    <div className="flex items-center gap-1 mt-1 px-1">
                        <span className="text-[10px] text-muted-foreground">
                            {format(new Date(timestamp), "HH:mm", { locale: ptBR })}
                        </span>
                        {isSender && (
                            readAt ? (
                                <CheckCheck className="h-3 w-3 text-blue-500" />
                            ) : (
                                <Check className="h-3 w-3 text-muted-foreground" />
                            )
                        )}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className={cn("flex gap-3 mb-4", isSender ? "flex-row-reverse" : "flex-row")}>
            {!isSender && (
                <Avatar className="h-8 w-8">
                    <AvatarImage src={avatarUrl} />
                    <AvatarFallback className="text-xs">U</AvatarFallback>
                </Avatar>
            )}

            <div className={cn(
                "flex flex-col max-w-[75%]",
                isSender ? "items-end" : "items-start"
            )}>
                <div className={cn(
                    "px-4 py-2 rounded-2xl text-sm break-words shadow-sm",
                    isSender
                        ? "bg-secondary text-secondary-foreground rounded-tr-none"
                        : "bg-card text-card-foreground border border-border rounded-tl-none"
                )}>
                    {type === 'image' ? (
                        <Dialog>
                            <DialogTrigger asChild>
                                <div className="cursor-pointer group relative">
                                    <img
                                        src={content}
                                        alt="Anexo"
                                        className="rounded-lg max-h-48 object-cover hover:opacity-90 transition-opacity"
                                    />
                                    <div className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg">
                                        <ImageIcon className="h-6 w-6 text-white" />
                                    </div>
                                </div>
                            </DialogTrigger>
                            <DialogContent className="max-w-3xl p-0 overflow-hidden">
                                <img
                                    src={content}
                                    alt="Imagem ampliada"
                                    className="w-full h-auto max-h-[80vh] object-contain"
                                />
                            </DialogContent>
                        </Dialog>
                    ) : (
                        <p>{content}</p>
                    )}
                </div>

                {/* Timestamp and read status */}
                <div className="flex items-center gap-1 mt-1 px-1">
                    <span className="text-[10px] text-muted-foreground">
                        {format(new Date(timestamp), "HH:mm", { locale: ptBR })}
                    </span>
                    {isSender && (
                        readAt ? (
                            <CheckCheck className="h-3 w-3 text-blue-500" />
                        ) : (
                            <Check className="h-3 w-3 text-muted-foreground" />
                        )
                    )}
                </div>
            </div>
        </div>
    );
};
