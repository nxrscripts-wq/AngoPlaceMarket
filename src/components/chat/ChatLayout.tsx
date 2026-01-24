import React, { useState, useEffect } from 'react';
import { useChat } from '@/contexts/ChatContext';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { MessageCircle, Send, Image as ImageIcon, Loader2, ArrowLeft, MoreVertical, X } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';

// --- Chat Window Component ---
export const ChatWindow = ({ onClose }: { onClose?: () => void }) => {
    const { activeRoom, messages, sendMessage, user } = useChat();
    const { user: currentUser } = useAuth();
    const [newMessage, setNewMessage] = useState('');
    const [isSending, setIsSending] = useState(false);
    const scrollRef = React.useRef<HTMLDivElement>(null);

    // Scroll to bottom on new messages
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    if (!activeRoom || !currentUser) return null;

    const otherUser = activeRoom.buyer_id === currentUser.id
        ? activeRoom.profiles_seller
        : activeRoom.profiles_buyer;

    const handleSend = async (e?: React.FormEvent) => {
        e?.preventDefault();
        if (!newMessage.trim()) return;

        setIsSending(true);
        await sendMessage(newMessage);
        setNewMessage('');
        setIsSending(false);
    };

    // Group messages logic (omitted for brevity, can add later)

    return (
        <div className="flex flex-col h-full bg-background md:border-l">
            {/* Header */}
            <div className="p-4 border-b flex items-center gap-3 shadow-sm bg-card/50 backdrop-blur-sm">
                {onClose && (
                    <Button variant="ghost" size="icon" onClick={onClose} className="md:hidden">
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                )}
                <Avatar className="h-10 w-10 border">
                    <AvatarImage src={otherUser?.avatar_url} />
                    <AvatarFallback>{otherUser?.full_name?.substring(0, 2).toUpperCase() || 'U'}</AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                    <h3 className="font-semibold truncate">{otherUser?.full_name || 'Usuário'}</h3>
                    {activeRoom.products && (
                        <p className="text-xs text-muted-foreground truncate flex items-center gap-1">
                            Sobre: <span className="font-medium text-secondary">{activeRoom.products.name}</span>
                        </p>
                    )}
                </div>
                <Button variant="ghost" size="icon">
                    <MoreVertical className="h-5 w-5" />
                </Button>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4" ref={scrollRef}>
                {messages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-muted-foreground opacity-50">
                        <MessageCircle className="h-12 w-12 mb-2" />
                        <p>Nenhuma mensagem ainda.</p>
                        <p className="text-sm">Comece a conversa!</p>
                    </div>
                ) : (
                    messages.map((msg) => {
                        const isMe = msg.sender_id === currentUser.id;
                        return (
                            <div key={msg.id} className={cn("flex", isMe ? "justify-end" : "justify-start")}>
                                <div className={cn(
                                    "max-w-[75%] px-4 py-2 rounded-2xl text-sm shadow-sm",
                                    isMe
                                        ? "bg-secondary text-secondary-foreground rounded-br-sm"
                                        : "bg-muted rounded-bl-sm"
                                )}>
                                    {msg.image_url && (
                                        <div className="mb-2 rounded-lg overflow-hidden">
                                            <img src={msg.image_url} alt="Enviada" className="w-full h-auto max-h-60 object-cover" />
                                        </div>
                                    )}
                                    <p className="break-words">{msg.content}</p>
                                    <span className={cn(
                                        "text-[10px] block mt-1 text-right opacity-70",
                                        isMe ? "text-secondary-foreground/80" : "text-muted-foreground"
                                    )}>
                                        {formatDistanceToNow(new Date(msg.created_at), { addSuffix: true, locale: ptBR })}
                                    </span>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>

            {/* Input Area */}
            <div className="p-4 border-t bg-background">
                <form onSubmit={handleSend} className="flex gap-2 items-end">
                    <Button type="button" variant="ghost" size="icon" className="shrink-0 text-muted-foreground hover:text-foreground">
                        <ImageIcon className="h-5 w-5" />
                        <span className="sr-only">Enviar imagem</span>
                    </Button>
                    <Input
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Escreva uma mensagem..."
                        className="flex-1 min-h-[44px]"
                        disabled={isSending}
                    />
                    <Button type="submit" size="icon" className="shrink-0 bg-secondary hover:bg-secondary/90" disabled={!newMessage.trim() || isSending}>
                        {isSending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                    </Button>
                </form>
            </div>
        </div>
    );
};

// --- Chat List Component ---
export const ChatList = ({ onSelect }: { onSelect?: () => void }) => {
    const { rooms, activeRoom, setActiveRoom, loading, user: chatContextUser } = useChat(); // Need to check why user isn't exposed directly from context if types say so, but assuming we can get from auth context
    const { user } = useAuth(); // Better source of truth

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center p-8 space-y-4">
                <Loader2 className="h-8 w-8 animate-spin text-secondary" />
                <p className="text-muted-foreground text-sm">Carregando conversas...</p>
            </div>
        );
    }

    if (rooms.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-full p-8 text-center text-muted-foreground">
                <div className="bg-muted p-4 rounded-full mb-4">
                    <MessageCircle className="h-8 w-8" />
                </div>
                <h3 className="font-semibold text-foreground mb-1">Nenhuma conversa</h3>
                <p className="text-sm">Suas conversas com vendedores ou compradores aparecerão aqui.</p>
            </div>
        );
    }

    return (
        <ScrollArea className="h-full">
            <div className="flex flex-col p-2 gap-1">
                {rooms.map((room) => {
                    const isBuyer = room.buyer_id === user?.id;
                    const otherUser = isBuyer ? room.profiles_seller : room.profiles_buyer;
                    const unreadCount = isBuyer ? room.unread_count_buyer : room.unread_count_seller;
                    const isActive = activeRoom?.id === room.id;

                    return (
                        <button
                            key={room.id}
                            onClick={() => {
                                setActiveRoom(room);
                                onSelect?.();
                            }}
                            className={cn(
                                "flex items-start gap-3 p-3 text-left rounded-lg transition-colors hover:bg-muted/50",
                                isActive && "bg-secondary/10 hover:bg-secondary/20"
                            )}
                        >
                            <div className="relative">
                                <Avatar>
                                    <AvatarImage src={otherUser?.avatar_url} />
                                    <AvatarFallback>{otherUser?.full_name?.substring(0, 2).toUpperCase()}</AvatarFallback>
                                </Avatar>
                                {unreadCount > 0 && (
                                    <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white shadow ring-2 ring-background">
                                        {unreadCount}
                                    </span>
                                )}
                            </div>
                            <div className="flex-1 min-w-0 overflow-hidden">
                                <div className="flex items-center justify-between gap-2 mb-1">
                                    <span className="font-semibold truncate text-sm">{otherUser?.full_name}</span>
                                    <span className="text-[10px] text-muted-foreground shrink-0 tabular-nums">
                                        {room.last_message_at && formatDistanceToNow(new Date(room.last_message_at), { addSuffix: false, locale: ptBR })}
                                    </span>
                                </div>
                                <p className={cn("text-xs truncate", unreadCount > 0 ? "text-foreground font-medium" : "text-muted-foreground")}>
                                    {room.last_message || "Iniciou uma conversa"}
                                </p>
                                {room.products && (
                                    <div className="flex items-center gap-1 mt-1 text-[10px] text-muted-foreground">
                                        <div className="w-1 h-3 bg-secondary rounded-full" />
                                        <span className="truncate">{room.products.name}</span>
                                    </div>
                                )}
                            </div>
                        </button>
                    );
                })}
            </div>
        </ScrollArea>
    );
};

// --- Main Chat Layout Component ---
export const ChatLayout = () => {
    const { activeRoom, setActiveRoom } = useChat();
    const [isMobileListOpen, setIsMobileListOpen] = useState(true);

    // On mobile, if activeRoom changes (is selected), hide list
    useEffect(() => {
        if (activeRoom) {
            setIsMobileListOpen(false);
        } else {
            setIsMobileListOpen(true);
        }
    }, [activeRoom]);

    const handleCloseChat = () => {
        setActiveRoom(null);
        setIsMobileListOpen(true);
    };

    return (
        <div className="flex h-[calc(100vh-4rem)] md:h-[600px] w-full max-w-5xl mx-auto md:border rounded-xl md:shadow-lg overflow-hidden bg-background">
            {/* Sidebar (List) */}
            <div className={cn(
                "w-full md:w-80 flex flex-col border-r bg-card/30",
                !isMobileListOpen && "hidden md:flex"
            )}>
                <div className="p-4 border-b">
                    <h2 className="font-bold text-lg">Mensagens</h2>
                </div>
                <div className="flex-1 overflow-hidden">
                    <ChatList />
                </div>
            </div>

            {/* Main Window */}
            <div className={cn(
                "flex-1 flex flex-col",
                isMobileListOpen && "hidden md:flex"
            )}>
                {activeRoom ? (
                    <ChatWindow onClose={handleCloseChat} />
                ) : (
                    <div className="hidden md:flex flex-col items-center justify-center h-full text-muted-foreground p-8 text-center bg-muted/10">
                        <div className="bg-muted p-6 rounded-full mb-6">
                            <MessageCircle className="h-16 w-16 opacity-50" />
                        </div>
                        <h2 className="text-xl font-semibold mb-2 text-foreground">Sua Central de Mensagens</h2>
                        <p className="max-w-sm">Selecione uma conversa da lista para ver os detalhes, negociar e tirar dúvidas com vendedores.</p>
                    </div>
                )}
            </div>
        </div>
    );
};
