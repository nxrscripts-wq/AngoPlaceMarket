import { useChat } from "@/contexts/ChatContext";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

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
                return (
                    <div
                        key={room.id}
                        onClick={() => setActiveRoom(room)}
                        className={cn(
                            "flex items-center gap-3 p-4 cursor-pointer hover:bg-muted/50 transition-colors border-b border-border/40",
                            isActive && "bg-muted"
                        )}
                    >
                        <Avatar className="h-10 w-10">
                            <AvatarImage src={room.other_user?.avatar_url} />
                            <AvatarFallback>{room.other_user?.full_name?.substring(0, 2) || 'U'}</AvatarFallback>
                        </Avatar>

                        <div className="flex-1 min-w-0">
                            <div className="flex justify-between items-baseline mb-1">
                                <h4 className="text-sm font-semibold truncate">{room.other_user?.full_name || 'Utilizador'}</h4>
                                <span className="text-[10px] text-muted-foreground">
                                    {room.last_message_at && formatDistanceToNow(new Date(room.last_message_at), { addSuffix: true, locale: ptBR })}
                                </span>
                            </div>
                            <p className={cn("text-xs truncate", room.unread_count > 0 ? "font-bold text-foreground" : "text-muted-foreground")}>
                                {room.last_message || 'Nova conversa'}
                            </p>
                        </div>

                        {room.unread_count > 0 && (
                            <div className="h-5 w-5 rounded-full bg-secondary text-secondary-foreground text-[10px] font-bold flex items-center justify-center">
                                {room.unread_count}
                            </div>
                        )}
                    </div>
                );
            })}
        </div>
    );
};
