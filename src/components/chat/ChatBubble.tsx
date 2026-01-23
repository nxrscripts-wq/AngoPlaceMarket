import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface ChatBubbleProps {
    content: string;
    isSender: boolean;
    timestamp: string;
    avatarUrl?: string;
    type?: 'text' | 'image' | 'system' | 'product_link';
}

export const ChatBubble = ({ content, isSender, timestamp, avatarUrl, type = 'text' }: ChatBubbleProps) => {
    if (type === 'system') {
        return (
            <div className="flex justify-center my-4">
                <span className="text-xs text-muted-foreground bg-muted/50 px-3 py-1 rounded-full">
                    {content}
                </span>
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
                        <img src={content} alt="Anexo" className="rounded-lg max-h-48 object-cover" />
                    ) : (
                        <p>{content}</p>
                    )}
                </div>
                <span className="text-[10px] text-muted-foreground mt-1 px-1">
                    {format(new Date(timestamp), "HH:mm", { locale: ptBR })}
                </span>
            </div>
        </div>
    );
};
