import { useChat } from "@/contexts/ChatContext";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { Loader2, Package, Image as ImageIcon } from "lucide-react";

export const ChatList = () => {
    const { rooms, activeRoom, setActiveRoom, loadingRooms } = useChat();

    if (loadingRooms) {
        return (
            <div className="flex justify-center items-center h-full">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
        );
    }

    if (rooms.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-full text-center p-4">
                <p className="text-sm text-muted-foreground">Nenhuma conversa encontrada</p>
            </div>
        );
    }

    return (
        <div className="h-full overflow-y-auto">
            {rooms.map((room) => {
                const isActive = activeRoom?.id === room.id;
                const hasUnread = room.unread_count > 0;

                // Format last message preview
                const getLastMessagePreview = () => {
                    if (!room.last_message) return 'Nova conversa';
                    if (room.last_message.startsWith('📸')) return '📸 Imagem';
                    return room.last_message.length > 40
                        ? room.last_message.substring(0, 40) + '...'
                        : room.last_message;
                };

                return (
                    <div
                        key={room.id}
                        onClick={() => setActiveRoom(room)}
                        className={cn(
                            "flex items-center gap-3 p-4 cursor-pointer hover:bg-muted/50 transition-colors border-b border-border/40",
                            isActive && "bg-muted"
                        )}
                    >
                        {/* Avatar with online indicator potential */}
                        <div className="relative">
                            <Avatar className="h-12 w-12">
                                <AvatarImage src={room.other_user?.avatar_url} />
                                <AvatarFallback className="bg-secondary/20 text-secondary">
                                    {room.other_user?.full_name?.substring(0, 2).toUpperCase() || 'U'}
                                </AvatarFallback>
                            </Avatar>
                            {hasUnread && (
                                <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-secondary text-[10px] font-bold text-secondary-foreground shadow ring-2 ring-background">
                                    {room.unread_count > 9 ? '9+' : room.unread_count}
                                </span>
                            )}
                        </div>

                        <div className="flex-1 min-w-0">
                            {/* Name and time */}
                            <div className="flex justify-between items-baseline mb-1">
                                <h4 className={cn(
                                    "text-sm truncate",
                                    hasUnread ? "font-bold" : "font-semibold"
                                )}>
                                    {room.other_user?.full_name || 'Utilizador'}
                                </h4>
                                <span className="text-[10px] text-muted-foreground shrink-0 ml-2">
                                    {room.last_message_at && formatDistanceToNow(new Date(room.last_message_at), { addSuffix: false, locale: ptBR })}
                                </span>
                            </div>

                            {/* Last message */}
                            <p className={cn(
                                "text-xs truncate",
                                hasUnread ? "font-semibold text-foreground" : "text-muted-foreground"
                            )}>
                                {getLastMessagePreview()}
                            </p>

                            {/* Product context */}
                            {room.product && (
                                <div className="flex items-center gap-1.5 mt-1">
                                    <div className="w-1 h-3 bg-secondary rounded-full" />
                                    <Package className="h-3 w-3 text-muted-foreground" />
                                    <span className="text-[10px] text-muted-foreground truncate">
                                        {room.product.name}
                                    </span>
                                </div>
                            )}
                        </div>

                        {/* Product thumbnail */}
                        {room.product?.images?.[0] && (
                            <div className="shrink-0">
                                <img
                                    src={room.product.images[0]}
                                    alt=""
                                    className="w-10 h-10 rounded-md object-cover border border-border"
                                />
                            </div>
                        )}
                    </div>
                );
            })}
        </div>
    );
};
