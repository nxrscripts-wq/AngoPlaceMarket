import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Search, ShoppingCart, Menu, Package, TrendingUp, Clock, User, LogOut, ShieldCheck } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { NotificationsPanel } from "@/components/NotificationsPanel";
import { AuthRequiredModal } from "@/components/AuthRequiredModal";
import { useAuth } from "@/contexts/AuthContext";
import { useCart } from "@/contexts/CartContext";
import { MARKETPLACE_CATEGORIES } from "@/lib/categories";

const popularSearches = [
  "iPhone 15 Pro",
  "Vestido de Verão",
  "Apartamento Talatona",
  "Toyota Hilux",
  "Teclado Mecânico",
];

const recentSearches = [
  "Processador Intel",
  "Teclado Mecânico",
  "Mouse Gamer",
];

export const Header = () => {
  const navigate = useNavigate();
  const { user, profile, signOut, loading } = useAuth();
  const { cartCount } = useCart();
  const [searchFocused, setSearchFocused] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const [authModalOpen, setAuthModalOpen] = useState(false);

  const handleCartClick = () => {
    if (!user) {
      setAuthModalOpen(true);
    } else {
      // Navigate to cart
      navigate('/cart');
    }
  };

  const handleBuyClick = () => {
    if (!user) {
      setAuthModalOpen(true);
    } else {
      // Navigate to checkout or cart
      navigate('/cart');
    }
  };

  const handleSellClick = () => {
    if (!user) {
      setAuthModalOpen(true);
    } else {
      navigate('/seller');
    }
  };

  const getInitials = () => {
    const name = user?.user_metadata?.full_name || user?.email || '';
    return name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2);
  };

  return (
    <>
      <header className="sticky top-0 z-50 bg-background border-b border-border">
        {/* Top bar */}
        <div className="bg-primary text-primary-foreground text-[10px] sm:text-xs py-1">
          <div className="container mx-auto px-4 flex justify-between items-center text-center sm:text-left">
            <span className="font-medium flex-1 sm:flex-none">🇦🇴 Entrega para toda Angola • Frete grátis +15k</span>
            <div className="hidden md:flex gap-4">
              <span className="hover:text-secondary cursor-pointer transition-colors">Baixe o App</span>
              <span className="hover:text-secondary cursor-pointer transition-colors">Central de Ajuda</span>
            </div>
          </div>
        </div>

        {/* Main header */}
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center gap-4">
            {/* Mobile menu - NOW POWERED BY SHEET */}
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden text-card-foreground hover:text-secondary -ml-2" aria-label="Abrir menu lateral">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="bg-card w-[300px] p-0 border-r border-border">
                <SheetHeader className="p-6 border-b border-border bg-muted/20">
                  <SheetTitle className="text-left flex items-center gap-3">
                    <img src="/logo.png" alt="Logo" className="h-8 w-auto" />
                  </SheetTitle>
                </SheetHeader>
                <div className="flex flex-col h-full">
                  <div className="flex-1 overflow-y-auto p-4 space-y-6">
                    {/* User Section in Mobile Menu */}
                    <div className="space-y-3">
                      <p className="text-[10px] font-black uppercase text-secondary tracking-widest px-2">A Minha Conta</p>
                      {user ? (
                        <div className="space-y-1">
                          <button onClick={() => navigate('/profile')} className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-muted transition-colors">
                            <User className="h-5 w-5 text-secondary" />
                            <div className="text-left">
                              <p className="text-sm font-bold">{user.user_metadata?.full_name || 'Meu Perfil'}</p>
                              <p className="text-[10px] text-muted-foreground truncate max-w-[180px]">{user.email}</p>
                            </div>
                          </button>
                          <button onClick={() => navigate('/orders')} className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-muted transition-colors">
                            <Package className="h-5 w-5 text-secondary" />
                            <span className="text-sm font-bold">Meus Pedidos</span>
                          </button>
                          {profile?.is_admin && (
                            <button onClick={() => navigate('/admin')} className="w-full flex items-center gap-3 p-4 rounded-xl bg-primary text-primary-foreground shadow-lg shadow-primary/20 hover:scale-[1.02] transition-all border-2 border-primary">
                              <ShieldCheck className="h-6 w-6" />
                              <div className="text-left">
                                <span className="text-sm font-black block">Painel Admin</span>
                                <span className="text-[10px] opacity-80 uppercase tracking-tighter">Acesso Total</span>
                              </div>
                            </button>
                          )}
                        </div>
                      ) : (
                        <Button onClick={() => navigate('/login')} className="w-full bg-secondary text-secondary-foreground font-black h-12 rounded-xl">
                          Entrar / Registar
                        </Button>
                      )}
                    </div>

                    {/* Navigation */}
                    <div className="space-y-3">
                      <p className="text-[10px] font-black uppercase text-secondary tracking-widest px-2">Explorar</p>
                      <div className="space-y-1">
                        <button onClick={() => navigate('/search?filter=flash')} className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-muted transition-colors text-secondary">
                          <Clock className="h-5 w-5" />
                          <span className="text-sm font-black">Ofertas do Dia</span>
                        </button>
                        {MARKETPLACE_CATEGORIES.map((cat) => (
                          <button
                            key={cat.id}
                            onClick={() => navigate(`/category/${cat.id}`)}
                            className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-muted transition-colors"
                          >
                            <cat.icon className="h-5 w-5 text-muted-foreground" />
                            <span className="text-sm font-medium">{cat.name}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Bottom of Drawer */}
                  <div className="p-4 border-t border-border bg-muted/10">
                    <button onClick={() => navigate('/help')} className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-muted transition-colors text-muted-foreground">
                      <ShieldCheck className="h-5 w-5" />
                      <span className="text-sm font-medium">Ajuda & Segurança</span>
                    </button>
                    {user && (
                      <button onClick={signOut} className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-red-500/10 text-red-500 transition-colors mt-2">
                        <LogOut className="h-5 w-5" />
                        <span className="text-sm font-bold">Sair da Conta</span>
                      </button>
                    )}
                  </div>
                </div>
              </SheetContent>
            </Sheet>

            {/* Logo */}
            <Link to="/" className="flex-shrink-0 flex items-center hover:opacity-90 transition-opacity">
              <img src="/logo.png" alt="AngoPlaceMarket" className="h-8 md:h-12 w-auto object-contain" />
            </Link>

            {/* Search bar */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (searchValue.trim()) {
                  navigate(`/search?q=${encodeURIComponent(searchValue.trim())}`);
                  setSearchFocused(false);
                }
              }}
              className="flex-1 max-w-2xl hidden md:block relative"
            >
              <div className="relative w-full">
                <Input
                  type="text"
                  placeholder="Buscar produtos, marcas e muito mais..."
                  className="w-full pr-12 rounded-full border-2 border-border bg-card text-card-foreground placeholder:text-muted-foreground focus:border-secondary h-11"
                  value={searchValue}
                  onChange={(e) => setSearchValue(e.target.value)}
                  onFocus={() => setSearchFocused(true)}
                  onBlur={() => setTimeout(() => setSearchFocused(false), 200)}
                />
                <Button
                  type="submit"
                  size="icon"
                  className="absolute right-1 top-1/2 -translate-y-1/2 rounded-full h-9 w-9 bg-secondary hover:bg-secondary/90 text-secondary-foreground"
                  aria-label="Submeter pesquisa"
                >
                  <Search className="h-4 w-4" />
                </Button>
              </div>

              {/* Search Dropdown */}
              {searchFocused && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-card border border-border rounded-xl shadow-2xl overflow-hidden z-50 animate-in fade-in slide-in-from-top-2">
                  {recentSearches.length > 0 && (
                    <div className="p-3 border-b border-border">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <Clock className="h-3 w-3" /> Buscas recentes
                        </span>
                        <button className="text-xs text-primary hover:text-secondary transition-colors">Limpar</button>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {recentSearches.map((term) => (
                          <button
                            key={term}
                            className="px-3 py-1.5 bg-muted text-card-foreground text-sm rounded-full hover:bg-secondary hover:text-secondary-foreground transition-colors"
                          >
                            {term}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                  <div className="p-3">
                    <span className="text-xs text-muted-foreground flex items-center gap-1 mb-2">
                      <TrendingUp className="h-3 w-3" /> Popular em Angola
                    </span>
                    <div className="space-y-1">
                      {popularSearches.map((term) => (
                        <button
                          key={term}
                          className="w-full text-left px-3 py-2 text-sm text-card-foreground hover:bg-secondary/10 rounded-lg transition-colors"
                        >
                          {term}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </form>

            {/* Actions */}
            <div className="flex items-center gap-1.5 md:gap-3 ml-auto">
              <div className="hidden sm:block">
                <NotificationsPanel />
              </div>

              <Button
                variant="ghost"
                className="hidden md:flex gap-2 text-card-foreground hover:text-secondary hover:bg-secondary/10"
                onClick={handleSellClick}
              >
                <Package className="h-5 w-5" />
                <span className="text-sm">Vender</span>
              </Button>

              <Button
                variant="ghost"
                size="icon"
                className="md:hidden text-card-foreground"
                onClick={handleSellClick}
                aria-label="Vender produto"
              >
                <Package className="h-5 w-5" />
              </Button>

              <Button
                className="gap-2 bg-secondary hover:bg-secondary/90 text-secondary-foreground font-semibold h-9 md:h-11 px-3 md:px-4"
                onClick={handleBuyClick}
              >
                <ShoppingCart className="h-4 w-4 md:h-5 md:w-5" />
                <span className="hidden lg:inline">Comprar</span>
                {cartCount > 0 && (
                  <Badge className="bg-primary text-primary-foreground h-4 md:h-5 min-w-[16px] md:min-w-[20px] flex items-center justify-center p-0 text-[10px] md:text-xs">
                    {cartCount}
                  </Badge>
                )}
              </Button>

              {/* User Menu */}
              {!loading && (
                user ? (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="rounded-full h-8 w-8 md:h-10 md:w-10" aria-label="Menu do utilizador">
                        <Avatar className="h-7 w-7 md:h-8 md:w-8">
                          <AvatarImage src={user.user_metadata?.avatar_url} />
                          <AvatarFallback className="bg-secondary text-secondary-foreground text-[10px] md:text-xs">
                            {getInitials()}
                          </AvatarFallback>
                        </Avatar>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48">
                      <div className="px-2 py-1.5">
                        <p className="text-sm font-medium">{user.user_metadata?.full_name || 'Utilizador'}</p>
                        <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                      </div>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => navigate('/profile')}>
                        <User className="mr-2 h-4 w-4" />
                        Meu Perfil
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => navigate('/orders')}>
                        <Package className="mr-2 h-4 w-4" />
                        Meus Pedidos
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      {profile?.is_admin && (
                        <>
                          <DropdownMenuItem onClick={() => navigate('/admin')} className="text-primary font-bold bg-primary/5 focus:bg-primary focus:text-primary-foreground m-1 rounded-lg transition-all">
                            <ShieldCheck className="mr-2 h-4 w-4" />
                            Painel Administrador
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                        </>
                      )}
                      <DropdownMenuItem onClick={signOut} className="text-red-500 focus:text-red-500">
                        <LogOut className="mr-2 h-4 w-4" />
                        Sair
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                ) : (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => navigate('/login')}
                    className="sm:hidden text-card-foreground"
                    aria-label="Entrar"
                  >
                    <User className="h-5 w-5" />
                  </Button>
                )
              )}

              {!loading && !user && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate('/login')}
                  className="hidden sm:flex h-9 px-4"
                >
                  Entrar
                </Button>
              )}
            </div>
          </div>

          {/* Mobile search - ENHANCED */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (searchValue.trim()) {
                navigate(`/search?q=${encodeURIComponent(searchValue.trim())}`);
              }
            }}
            className="mt-3 md:hidden animate-in slide-in-from-top-2 duration-300"
          >
            <div className="relative w-full">
              <Input
                type="text"
                placeholder="O que procuras hoje?"
                className="w-full pr-14 rounded-2xl border-2 border-border bg-muted/20 text-card-foreground placeholder:text-muted-foreground focus:border-secondary h-14 text-base shadow-inner"
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
              />
              <Button
                type="submit"
                size="icon"
                className="absolute right-1.5 top-1/2 -translate-y-1/2 rounded-xl h-11 w-11 bg-secondary text-secondary-foreground shadow-lg"
                aria-label="Submeter pesquisa"
              >
                <Search className="h-5 w-5" />
              </Button>
            </div>
          </form>
        </div>

        {/* Categories nav */}
        <nav className="border-t border-border bg-background">
          <div className="container mx-auto px-4">
            <ul className="flex items-center gap-6 overflow-x-auto py-2.5 text-sm font-medium scrollbar-hide">
              <li
                onClick={() => navigate('/search?filter=flash')}
                className="whitespace-nowrap text-secondary cursor-pointer transition-colors font-semibold hover:underline"
              >
                Ofertas do Dia
              </li>
              <li
                onClick={() => navigate('/search?filter=discounts')}
                className="whitespace-nowrap text-card-foreground hover:text-secondary cursor-pointer transition-colors"
              >
                Super Descontos
              </li>
              <li
                onClick={() => navigate('/search?filter=new')}
                className="whitespace-nowrap text-card-foreground hover:text-secondary cursor-pointer transition-colors"
              >
                Novidades
              </li>
              {MARKETPLACE_CATEGORIES.slice(0, 8).map((cat) => (
                <li
                  key={cat.id}
                  onClick={() => navigate(`/category/${cat.id}`)}
                  className="whitespace-nowrap text-card-foreground hover:text-secondary cursor-pointer transition-colors"
                >
                  {cat.name}
                </li>
              ))}
            </ul>
          </div>
        </nav>
      </header>

      <AuthRequiredModal
        open={authModalOpen}
        onOpenChange={setAuthModalOpen}
        redirectPath={window.location.pathname}
      />
    </>
  );
};
