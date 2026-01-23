import { Home, Search, PlusSquare, Package, User } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";

export const BottomNav = () => {
    const location = useLocation();
    const { user } = useAuth();

    const navItems = [
        { icon: Home, label: "Início", path: "/" },
        { icon: Search, label: "Buscar", path: "/search" },
        { icon: PlusSquare, label: "Vender", path: "/publish", protected: true },
        { icon: Package, label: "Pedidos", path: "/orders", protected: true },
        { icon: User, label: "Perfil", path: "/profile", protected: true },
    ];

    return (
        <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-card/95 backdrop-blur-lg border-t border-border/50 pb-safe-area-inset-bottom">
            <div className="flex justify-around items-center h-16">
                {navItems.map((item) => {
                    const isActive = location.pathname === item.path;
                    return (
                        <Link
                            key={item.path}
                            to={item.path}
                            className={cn(
                                "flex flex-col items-center justify-center w-full h-full gap-1 transition-all duration-200 active:scale-90",
                                isActive ? "text-secondary" : "text-muted-foreground hover:text-foreground"
                            )}
                        >
                            <item.icon className={cn("h-5 w-5", isActive && "animate-bounce-subtle")} />
                            <span className="text-[10px] font-bold uppercase tracking-wider">{item.label}</span>
                        </Link>
                    );
                })}
            </div>
        </nav>
    );
};
