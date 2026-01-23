import { useEffect } from "react";
import { ChatList } from "@/components/chat/ChatList";
import { ChatWindow } from "@/components/chat/ChatWindow";
import { useChat } from "@/contexts/ChatContext";
import { cn } from "@/lib/utils";

const ChatPage = () => {
    const { activeRoom, refreshRooms } = useChat();

    useEffect(() => {
        refreshRooms();
    }, []);

    return (
        <div className="container mx-auto max-w-6xl h-[calc(100vh-64px-64px)] md:h-[calc(100vh-100px)] py-4 px-0 md:px-4">
            <div className="bg-card border border-border rounded-xl shadow-xl overflow-hidden h-full flex flex-col md:flex-row">

                {/* Sidebar List */}
                <div className={cn(
                    "w-full md:w-80 lg:w-96 border-r border-border bg-background flex flex-col",
                    activeRoom ? "hidden md:flex" : "flex"
                )}>
                    <div className="p-4 border-b border-border bg-muted/20">
                        <h2 className="font-bold text-lg">Mensagens</h2>
                    </div>
                    <ChatList />
                </div>

                {/* Main Chat Window */}
                <div className={cn(
                    "flex-1 bg-muted/5",
                    !activeRoom ? "hidden md:flex" : "flex"
                )}>
                    <ChatWindow />
                </div>
            </div>
        </div>
    );
};

export default ChatPage;
