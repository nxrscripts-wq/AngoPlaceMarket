import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from './AuthContext';
import { toast } from 'sonner';

interface ChatRoom {
    id: string;
    buyer_id: string;
    seller_id: string;
    product_id?: string;
    order_id?: string;
    last_message: string | null;
    last_message_at: string;
    unread_count: number;
    other_user?: {
        full_name: string;
        avatar_url: string;
    };
    product?: {
        id: string;
        name: string;
        price: number;
        images: string[];
    };
}

interface Message {
    id: string;
    room_id: string;
    sender_id: string;
    content: string;
    msg_type: 'text' | 'image' | 'system' | 'product_link';
    created_at: string;
    read_at: string | null;
}

interface ChatContextType {
    activeRoom: ChatRoom | null;
    setActiveRoom: (room: ChatRoom | null) => void;
    messages: Message[];
    loadingMessages: boolean;
    startChat: (sellerId: string, productId?: string, orderId?: string) => Promise<string>;
    sendMessage: (roomId: string, content: string, type?: 'text' | 'image') => Promise<void>;
    sendImage: (roomId: string, file: File) => Promise<void>;
    markAsRead: (roomId: string) => Promise<void>;
    rooms: ChatRoom[];
    loadingRooms: boolean;
    refreshRooms: () => Promise<void>;
    totalUnread: number;
    isTyping: boolean;
    setIsTyping: (typing: boolean) => void;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const ChatProvider = ({ children }: { children: React.ReactNode }) => {
    const { user } = useAuth();
    const [activeRoom, setActiveRoom] = useState<ChatRoom | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [rooms, setRooms] = useState<ChatRoom[]>([]);
    const [loadingRooms, setLoadingRooms] = useState(false);
    const [loadingMessages, setLoadingMessages] = useState(false);
    const [totalUnread, setTotalUnread] = useState(0);
    const [isTyping, setIsTyping] = useState(false);
    const globalChannelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);

    // Fetch rooms
    const refreshRooms = useCallback(async () => {
        if (!user) return;
        try {
            setLoadingRooms(true);
            const { data, error } = await supabase
                .from('chat_rooms')
                .select(`
                    *,
                    buyer:buyer_id(full_name, avatar_url),
                    seller:seller_id(full_name, avatar_url),
                    product:product_id(id, name, price, images)
                `)
                .or(`buyer_id.eq.${user.id},seller_id.eq.${user.id}`)
                .order('last_message_at', { ascending: false });

            if (error) throw error;

            const formattedRooms = (data || []).map(room => {
                const isBuyer = room.buyer_id === user.id;
                return {
                    ...room,
                    unread_count: isBuyer ? room.unread_count_buyer || 0 : room.unread_count_seller || 0,
                    other_user: isBuyer ? room.seller : room.buyer
                };
            });

            setRooms(formattedRooms);

            // Calculate total unread
            const unread = formattedRooms.reduce((acc, room) => acc + room.unread_count, 0);
            setTotalUnread(unread);
        } catch (error) {
            console.error('Error fetching rooms:', error);
        } finally {
            setLoadingRooms(false);
        }
    }, [user]);

    // Mark messages as read
    const markAsRead = useCallback(async (roomId: string) => {
        if (!user) return;

        try {
            // Update messages that are not from current user and not yet read
            await supabase
                .from('chat_messages')
                .update({ read_at: new Date().toISOString() })
                .eq('room_id', roomId)
                .neq('sender_id', user.id)
                .is('read_at', null);

            // Update room unread count
            const room = rooms.find(r => r.id === roomId);
            if (room) {
                const isBuyer = room.buyer_id === user.id;
                await supabase
                    .from('chat_rooms')
                    .update(isBuyer ? { unread_count_buyer: 0 } : { unread_count_seller: 0 })
                    .eq('id', roomId);
            }

            // Refresh rooms to update counts
            await refreshRooms();
        } catch (error) {
            console.error('Error marking as read:', error);
        }
    }, [user, rooms, refreshRooms]);

    // Subscribe to new messages for active room
    useEffect(() => {
        if (!activeRoom) {
            setMessages([]);
            return;
        }

        const fetchMessages = async () => {
            setLoadingMessages(true);
            const { data, error } = await supabase
                .from('chat_messages')
                .select('*')
                .eq('room_id', activeRoom.id)
                .order('created_at', { ascending: true });

            if (error) toast.error('Erro ao carregar mensagens');
            else setMessages(data || []);
            setLoadingMessages(false);

            // Mark messages as read when opening room
            await markAsRead(activeRoom.id);
        };

        fetchMessages();

        // Subscribe to real-time messages
        const channel = supabase
            .channel(`room:${activeRoom.id}`)
            .on(
                'postgres_changes',
                { event: 'INSERT', schema: 'public', table: 'chat_messages', filter: `room_id=eq.${activeRoom.id}` },
                (payload) => {
                    const newMessage = payload.new as Message;
                    setMessages((prev) => [...prev, newMessage]);

                    // Mark as read if message is from other user
                    if (newMessage.sender_id !== user?.id) {
                        markAsRead(activeRoom.id);
                    }
                }
            )
            .on(
                'postgres_changes',
                { event: 'UPDATE', schema: 'public', table: 'chat_messages', filter: `room_id=eq.${activeRoom.id}` },
                (payload) => {
                    // Update read status in real-time
                    setMessages((prev) => prev.map(msg =>
                        msg.id === payload.new.id ? { ...msg, read_at: payload.new.read_at } : msg
                    ));
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [activeRoom, user, markAsRead]);

    // Global subscription for notifications
    useEffect(() => {
        if (!user) return;

        // Subscribe to new messages across all rooms for current user
        const channel = supabase
            .channel(`user-messages:${user.id}`)
            .on(
                'postgres_changes',
                { event: 'INSERT', schema: 'public', table: 'chat_messages' },
                async (payload) => {
                    const newMessage = payload.new as Message;

                    // Check if this message is for one of user's rooms
                    const room = rooms.find(r => r.id === newMessage.room_id);
                    if (room && newMessage.sender_id !== user.id) {
                        // Show notification if not in active room
                        if (!activeRoom || activeRoom.id !== newMessage.room_id) {
                            toast.info(`Nova mensagem de ${room.other_user?.full_name || 'Utilizador'}`, {
                                description: newMessage.msg_type === 'image' ? '📸 Enviou uma imagem' : newMessage.content.substring(0, 50),
                                action: {
                                    label: 'Ver',
                                    onClick: () => setActiveRoom(room)
                                }
                            });
                        }

                        // Refresh rooms to update unread counts
                        await refreshRooms();
                    }
                }
            )
            .subscribe();

        globalChannelRef.current = channel;

        return () => {
            if (globalChannelRef.current) {
                supabase.removeChannel(globalChannelRef.current);
            }
        };
    }, [user, rooms, activeRoom, refreshRooms]);

    // Initial rooms fetch
    useEffect(() => {
        if (user) refreshRooms();
    }, [user, refreshRooms]);

    const startChat = useCallback(async (sellerId: string, productId?: string, orderId?: string) => {
        if (!user) {
            toast.error("Faça login para iniciar um chat");
            throw new Error("User not logged in");
        }

        // Check if room exists
        let query = supabase
            .from('chat_rooms')
            .select('id')
            .eq('buyer_id', user.id)
            .eq('seller_id', sellerId);

        if (productId) {
            query = query.eq('product_id', productId);
        }
        if (orderId) {
            query = query.eq('order_id', orderId);
        }

        const { data: existingRoom } = await query.maybeSingle();

        if (existingRoom) {
            return existingRoom.id;
        }

        // Create new room
        const { data, error } = await supabase
            .from('chat_rooms')
            .insert({
                buyer_id: user.id,
                seller_id: sellerId,
                product_id: productId,
                order_id: orderId,
                last_message: 'Iniciou uma conversa',
            })
            .select()
            .single();

        if (error) {
            toast.error("Erro ao criar conversa");
            throw error;
        }

        await refreshRooms();
        return data.id;
    }, [user, refreshRooms]);

    const sendMessage = useCallback(async (roomId: string, content: string, type: 'text' | 'image' = 'text') => {
        if (!user) return;

        const { error } = await supabase
            .from('chat_messages')
            .insert({
                room_id: roomId,
                sender_id: user.id,
                content,
                msg_type: type
            });

        if (error) {
            toast.error("Erro ao enviar mensagem");
            console.error(error);
            return;
        }

        // Update room metadata
        const room = rooms.find(r => r.id === roomId);
        const isBuyer = room?.buyer_id === user.id;

        await supabase
            .from('chat_rooms')
            .update({
                last_message: type === 'image' ? '📸 Imagem' : content.substring(0, 100),
                last_message_at: new Date().toISOString(),
                // Increment unread for the other user
                ...(isBuyer
                    ? { unread_count_seller: (room?.unread_count || 0) + 1 }
                    : { unread_count_buyer: (room?.unread_count || 0) + 1 }
                )
            })
            .eq('id', roomId);

        refreshRooms();
    }, [user, rooms, refreshRooms]);

    const sendImage = useCallback(async (roomId: string, file: File) => {
        if (!user) return;

        try {
            // Validate file
            if (!file.type.startsWith('image/')) {
                toast.error('Apenas imagens são permitidas');
                return;
            }

            if (file.size > 5 * 1024 * 1024) {
                toast.error('Imagem muito grande (máx. 5MB)');
                return;
            }

            // Upload to Supabase Storage
            const fileExt = file.name.split('.').pop();
            const fileName = `${user.id}/${roomId}/${Date.now()}.${fileExt}`;

            const { data: uploadData, error: uploadError } = await supabase.storage
                .from('chat-images')
                .upload(fileName, file, {
                    cacheControl: '3600',
                    upsert: false
                });

            if (uploadError) {
                console.error('Upload error:', uploadError);
                toast.error('Erro ao enviar imagem');
                return;
            }

            // Get public URL
            const { data: { publicUrl } } = supabase.storage
                .from('chat-images')
                .getPublicUrl(uploadData.path);

            // Send message with image URL
            await sendMessage(roomId, publicUrl, 'image');
        } catch (error) {
            console.error('Error sending image:', error);
            toast.error('Erro ao enviar imagem');
        }
    }, [user, sendMessage]);

    return (
        <ChatContext.Provider value={{
            activeRoom,
            setActiveRoom,
            messages,
            loadingMessages,
            startChat,
            sendMessage,
            sendImage,
            markAsRead,
            rooms,
            loadingRooms,
            refreshRooms,
            totalUnread,
            isTyping,
            setIsTyping
        }}>
            {children}
        </ChatContext.Provider>
    );
};

export const useChat = () => {
    const context = useContext(ChatContext);
    if (context === undefined) {
        throw new Error('useChat must be used within a ChatProvider');
    }
    return context;
};
