import { useRef, useEffect, useState, useCallback } from "react";
import { useChat } from "@/contexts/ChatContext";
import { ChatBubble } from "./ChatBubble";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, Image as ImageIcon, ArrowLeft, Loader2, X, Package, ExternalLink } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

export const ChatWindow = () => {
    const { activeRoom, messages, sendMessage, sendImage, loadingMessages, setActiveRoom } = useChat();
    const { user } = useAuth();
    const [newMessage, setNewMessage] = useState("");
    const [isSending, setIsSending] = useState(false);
    const [selectedImage, setSelectedImage] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [showImagePreview, setShowImagePreview] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSend = async (e?: React.FormEvent) => {
        e?.preventDefault();
        if (!newMessage.trim() || !activeRoom || isSending) return;

        const msg = newMessage;
        setNewMessage("");
        setIsSending(true);
        await sendMessage(activeRoom.id, msg);
        setIsSending(false);
    };

    const handleImageSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (!file.type.startsWith('image/')) {
            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            return;
        }

        setSelectedImage(file);
        const reader = new FileReader();
        reader.onload = (e) => {
            setImagePreview(e.target?.result as string);
            setShowImagePreview(true);
        };
        reader.readAsDataURL(file);

        // Reset input
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    }, []);

    const handleSendImage = async () => {
        if (!selectedImage || !activeRoom || isSending) return;

        setIsSending(true);
        setShowImagePreview(false);
        await sendImage(activeRoom.id, selectedImage);
        setSelectedImage(null);
        setImagePreview(null);
        setIsSending(false);
    };

    const cancelImagePreview = () => {
        setSelectedImage(null);
        setImagePreview(null);
        setShowImagePreview(false);
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

                <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-sm truncate">{activeRoom.other_user?.full_name}</h3>
                    {activeRoom.product && (
                        <a
                            href={`/produto/${activeRoom.product.id}`}
                            className="text-[10px] text-muted-foreground flex items-center gap-1 hover:text-secondary transition-colors"
                        >
                            <Package className="h-3 w-3" />
                            <span className="truncate">{activeRoom.product.name}</span>
                            <ExternalLink className="h-2.5 w-2.5" />
                        </a>
                    )}
                </div>
            </div>

            {/* Product Card (if linked) */}
            {activeRoom.product && (
                <div className="px-3 py-2 bg-muted/30 border-b border-border">
                    <a
                        href={`/produto/${activeRoom.product.id}`}
                        className="flex items-center gap-3 p-2 rounded-lg bg-card border border-border hover:border-secondary/50 transition-colors"
                    >
                        <img
                            src={activeRoom.product.images?.[0] || '/placeholder.svg'}
                            alt={activeRoom.product.name}
                            className="w-12 h-12 rounded-md object-cover"
                        />
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{activeRoom.product.name}</p>
                            <p className="text-sm font-bold text-secondary">
                                {activeRoom.product.price?.toLocaleString('pt-AO', { style: 'currency', currency: 'AOA' })}
                            </p>
                        </div>
                        <ExternalLink className="h-4 w-4 text-muted-foreground" />
                    </a>
                </div>
            )}

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
                                readAt={msg.read_at}
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
                    {/* Hidden file input */}
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleImageSelect}
                    />

                    <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="shrink-0 text-muted-foreground hover:text-foreground"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isSending}
                    >
                        <ImageIcon className="h-5 w-5" />
                    </Button>

                    <Input
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Digite sua mensagem..."
                        className="flex-1 rounded-full bg-muted border-none focus-visible:ring-1 focus-visible:ring-secondary"
                        disabled={isSending}
                    />

                    <Button
                        type="submit"
                        size="icon"
                        disabled={!newMessage.trim() || isSending}
                        className="rounded-full bg-secondary text-secondary-foreground hover:bg-secondary/90 shrink-0 h-10 w-10"
                    >
                        {isSending ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                            <Send className="h-4 w-4" />
                        )}
                    </Button>
                </form>
            </div>

            {/* Image Preview Dialog */}
            <Dialog open={showImagePreview} onOpenChange={setShowImagePreview}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Enviar imagem</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                        {imagePreview && (
                            <div className="relative rounded-lg overflow-hidden bg-muted">
                                <img
                                    src={imagePreview}
                                    alt="Preview"
                                    className="w-full h-auto max-h-64 object-contain"
                                />
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="absolute top-2 right-2 bg-background/80 hover:bg-background"
                                    onClick={cancelImagePreview}
                                >
                                    <X className="h-4 w-4" />
                                </Button>
                            </div>
                        )}
                        <div className="flex gap-2">
                            <Button
                                variant="outline"
                                className="flex-1"
                                onClick={cancelImagePreview}
                            >
                                Cancelar
                            </Button>
                            <Button
                                className="flex-1 bg-secondary hover:bg-secondary/90"
                                onClick={handleSendImage}
                                disabled={isSending}
                            >
                                {isSending ? (
                                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                ) : (
                                    <Send className="h-4 w-4 mr-2" />
                                )}
                                Enviar
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
};
