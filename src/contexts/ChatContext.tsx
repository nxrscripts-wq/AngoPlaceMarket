import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from './AuthContext';
import { toast } from 'sonner';

interface ChatRoom {
    id: string;
    buyer_id: string;
    seller_id: string;
    product_id?: string;
    last_message: string | null;
    last_message_at: string;
    unread_count: number;
    other_user?: {
        full_name: string;
        avatar_url: string;
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
    startChat: (sellerId: string, productId?: string) => Promise<string>;
    sendMessage: (roomId: string, content: string, type?: 'text' | 'image') => Promise<void>;
    rooms: ChatRoom[];
    loadingRooms: boolean;
    refreshRooms: () => Promise<void>;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const ChatProvider = ({ children }: { children: React.ReactNode }) => {
    const { user } = useAuth();
    const [activeRoom, setActiveRoom] = useState<ChatRoom | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [rooms, setRooms] = useState<ChatRoom[]>([]);
    const [loadingRooms, setLoadingRooms] = useState(false);
    const [loadingMessages, setLoadingMessages] = useState(false);

    // Fetch rooms
    const refreshRooms = async () => {
        if (!user) return;
        try {
            setLoadingRooms(true);
            const { data, error } = await supabase
                .from('chat_rooms')
                .select(`
          *,
          buyer:buyer_id(full_name, avatar_url),
          seller:seller_id(full_name, avatar_url)
        `)
                .order('last_message_at', { ascending: false });

            if (error) throw error;

            const formattedRooms = data.map(room => {
                const isBuyer = room.buyer_id === user.id;
                return {
                    ...room,
                    unread_count: isBuyer ? room.unread_count_buyer : room.unread_count_seller,
                    other_user: isBuyer ? room.seller : room.buyer
                };
            });

            setRooms(formattedRooms);
        } catch (error) {
            console.error('Error fetching rooms:', error);
        } finally {
            setLoadingRooms(false);
        }
    };

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
        };

        fetchMessages();

        // Subscribe to real-time messages
        const channel = supabase
            .channel(`room:${activeRoom.id}`)
            .on(
                'postgres_changes',
                { event: 'INSERT', schema: 'public', table: 'chat_messages', filter: `room_id=eq.${activeRoom.id}` },
                (payload) => {
                    setMessages((prev) => [...prev, payload.new as Message]);
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [activeRoom]);

    // Initial rooms fetch
    useEffect(() => {
        if (user) refreshRooms();
    }, [user]);

    const startChat = async (sellerId: string, productId?: string) => {
        if (!user) {
            toast.error("Faça login para iniciar um chat");
            throw new Error("User not logged in");
        }

        // Check if room exists
        const { data: existingRoom } = await supabase
            .from('chat_rooms')
            .select('id')
            .eq('buyer_id', user.id)
            .eq('seller_id', sellerId)
            .eq('product_id', productId) // Optional strict product mapping
            .maybeSingle();

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
    };

    const sendMessage = async (roomId: string, content: string, type: 'text' | 'image' = 'text') => {
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

        // Optimize: Optimistic update could happen here, but subscription handles it fast enough usually

        // Update room metadata
        await supabase
            .from('chat_rooms')
            .update({
                last_message: type === 'image' ? '📸 Imagem' : content,
                last_message_at: new Date().toISOString()
            })
            .eq('id', roomId);

        // Refresh rooms list to bubble up the conversation
        refreshRooms();
    };

    return (
        <ChatContext.Provider value={{ activeRoom, setActiveRoom, messages, loadingMessages, startChat, sendMessage, rooms, loadingRooms, refreshRooms }}>
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
