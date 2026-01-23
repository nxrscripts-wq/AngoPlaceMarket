import { useRef, useEffect, useState } from "react";
import { useChat } from "@/contexts/ChatContext";
import { ChatBubble } from "./ChatBubble";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, Image as ImageIcon, ArrowLeft, Loader2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export const ChatWindow = () => {
    const { activeRoom, messages, sendMessage, loadingMessages, setActiveRoom } = useChat();
    const { user } = useAuth();
    const [newMessage, setNewMessage] = useState("");
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSend = async (e?: React.FormEvent) => {
        e?.preventDefault();
        if (!newMessage.trim() || !activeRoom) return;

        const msg = newMessage;
        setNewMessage(""); // Optimistic clear
        await sendMessage(activeRoom.id, msg);
    };

    if (!activeRoom) {
        return (
            <div className="flex flex-col items-center justify-center h-full text-muted-foreground p-8">
                <div className="bg-muted p-4 rounded-full mb-4">
                    <Send className="h-8 w-8 text-muted-foreground/50" />
                </div>
                <p>Selecione uma conversa para começar</p>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full bg-background/50 backdrop-blur-sm">
            {/* Header */}
            <div className="flex items-center gap-3 p-3 border-b border-border bg-background/95 backdrop-blur support-[backdrop-filter]:bg-background/60 sticky top-0 z-10">
                <Button variant="ghost" size="icon" className="md:hidden -ml-2" onClick={() => setActiveRoom(null)}>
                    <ArrowLeft className="h-5 w-5" />
                </Button>

                <Avatar className="h-9 w-9">
                    <AvatarImage src={activeRoom.other_user?.avatar_url} />
                    <AvatarFallback>{activeRoom.other_user?.full_name?.substring(0, 2)}</AvatarFallback>
                </Avatar>

                <div className="flex-1">
                    <h3 className="font-semibold text-sm">{activeRoom.other_user?.full_name}</h3>
                    {activeRoom.product_id && (
                        <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                            Negociando produto
                        </span>
                    )}
                </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {loadingMessages ? (
                    <div className="flex justify-center p-4">
                        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                    </div>
                ) : (
                    <>
                        {messages.length === 0 && (
                            <div className="text-center text-xs text-muted-foreground my-8">
                                <p>Início da conversa com {activeRoom.other_user?.full_name}</p>
                            </div>
                        )}

                        {messages.map((msg) => (
                            <ChatBubble
                                key={msg.id}
                                content={msg.content}
                                isSender={msg.sender_id === user?.id}
                                timestamp={msg.created_at}
                                type={msg.msg_type as any}
                                avatarUrl={msg.sender_id === user?.id ? user?.user_metadata?.avatar_url : activeRoom.other_user?.avatar_url}
                            />
                        ))}
                        <div ref={messagesEndRef} />
                    </>
                )}
            </div>

            {/* Input Area */}
            <div className="p-3 bg-background border-t border-border">
                <form onSubmit={handleSend} className="flex items-center gap-2">
                    <Button type="button" variant="ghost" size="icon" className="shrink-0 text-muted-foreground hover:text-foreground">
                        <ImageIcon className="h-5 w-5" />
                    </Button>

                    <Input
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Digite sua mensagem..."
                        className="flex-1 rounded-full bg-muted border-none focus-visible:ring-1 focus-visible:ring-secondary"
                    />

                    <Button
                        type="submit"
                        size="icon"
                        disabled={!newMessage.trim()}
                        className="rounded-full bg-secondary text-secondary-foreground hover:bg-secondary/90 shrink-0 h-10 w-10"
                    >
                        <Send className="h-4 w-4" />
                    </Button>
                </form>
            </div>
        </div>
    );
};
