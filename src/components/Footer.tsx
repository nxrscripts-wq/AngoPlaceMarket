import { Facebook, Instagram, Twitter, Youtube, CreditCard, Shield, Truck, Headphones, MapPin } from "lucide-react";
import { Link } from "react-router-dom";

export const Footer = () => {
  return (
    <footer className="bg-card border-t border-border mt-8">
      {/* Features */}
      <div className="border-b border-border">
        <div className="container mx-auto px-4 py-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="flex items-center gap-3 p-2 bg-muted/20 rounded-xl md:bg-transparent md:p-0">
              <div className="p-2 bg-secondary/10 rounded-lg">
                <Truck className="h-5 w-5 md:h-6 md:w-6 text-secondary" />
              </div>
              <div>
                <p className="font-bold text-[13px] md:text-sm text-card-foreground">Frete Grátis</p>
                <p className="text-[10px] md:text-xs text-muted-foreground">Acima de 15k</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-2 bg-muted/20 rounded-xl md:bg-transparent md:p-0">
              <div className="p-2 bg-secondary/10 rounded-lg">
                <Shield className="h-5 w-5 md:h-6 md:w-6 text-secondary" />
              </div>
              <div>
                <p className="font-bold text-[13px] md:text-sm text-card-foreground">Compra Segura</p>
                <p className="text-[10px] md:text-xs text-muted-foreground">100% Protegido</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-2 bg-muted/20 rounded-xl md:bg-transparent md:p-0">
              <div className="p-2 bg-secondary/10 rounded-lg">
                <CreditCard className="h-5 w-5 md:h-6 md:w-6 text-secondary" />
              </div>
              <div>
                <p className="font-bold text-[13px] md:text-sm text-card-foreground">Multicaixa</p>
                <p className="text-[10px] md:text-xs text-muted-foreground">Pagamento local</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-2 bg-muted/20 rounded-xl md:bg-transparent md:p-0">
              <div className="p-2 bg-secondary/10 rounded-lg">
                <Headphones className="h-5 w-5 md:h-6 md:w-6 text-secondary" />
              </div>
              <div>
                <p className="font-bold text-[13px] md:text-sm text-card-foreground">Suporte 24h</p>
                <p className="text-[10px] md:text-xs text-muted-foreground">Angola inteira</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Links */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8">
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center mb-6">
              <img src="/logo.png" alt="AngoPlaceMarket" className="h-12 w-auto object-contain" />
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              O maior marketplace de Angola. Conectando vendedores e compradores em todo o país.
            </p>
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <MapPin className="h-4 w-4" />
              <span>Luanda, Angola</span>
            </div>
          </div>

          <div>
            <h3 className="font-bold mb-4 text-card-foreground">Atendimento</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link to="/help" className="hover:text-secondary transition-colors">Central de Ajuda</Link></li>
              <li><Link to="/orders" className="hover:text-secondary transition-colors">Meus Pedidos</Link></li>
              <li><Link to="/returns" className="hover:text-secondary transition-colors">Devolução</Link></li>
              <li><Link to="/contact" className="hover:text-secondary transition-colors">Fale Conosco</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="font-bold mb-4 text-card-foreground">Institucional</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link to="/about" className="hover:text-secondary transition-colors">Sobre Nós</Link></li>
              <li><Link to="/how-it-works" className="hover:text-secondary transition-colors font-bold text-secondary">Como Funciona</Link></li>
              <li><Link to="/terms" className="hover:text-secondary transition-colors">Política de Privacidade</Link></li>
              <li><Link to="/terms" className="hover:text-secondary transition-colors">Termos de Uso</Link></li>
              <li><Link to="/careers" className="hover:text-secondary transition-colors">Trabalhe Conosco</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="font-bold mb-4 text-card-foreground">Minha Conta</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link to="/profile" className="hover:text-secondary transition-colors">Minha Conta</Link></li>
              <li><Link to="/wishlist" className="hover:text-secondary transition-colors">Lista de Desejos</Link></li>
              <li><Link to="/track" className="hover:text-secondary transition-colors">Rastrear Pedido</Link></li>
              <li><Link to="/seller" className="hover:text-secondary transition-colors">Vender Produtos</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="font-bold mb-4 text-card-foreground">Redes Sociais</h3>
            <div className="flex gap-3 mb-4">
              <a href="#" className="p-2 bg-muted rounded-full hover:bg-secondary hover:text-secondary-foreground transition-colors text-card-foreground">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="#" className="p-2 bg-muted rounded-full hover:bg-secondary hover:text-secondary-foreground transition-colors text-card-foreground">
                <Instagram className="h-5 w-5" />
              </a>
              <a href="#" className="p-2 bg-muted rounded-full hover:bg-secondary hover:text-secondary-foreground transition-colors text-card-foreground">
                <Twitter className="h-5 w-5" />
              </a>
              <a href="#" className="p-2 bg-muted rounded-full hover:bg-secondary hover:text-secondary-foreground transition-colors text-card-foreground">
                <Youtube className="h-5 w-5" />
              </a>
            </div>
            <div>
              <h4 className="font-semibold text-sm mb-2 text-card-foreground">Formas de Pagamento</h4>
              <div className="flex flex-wrap gap-2">
                <div className="bg-muted rounded px-2 py-1 text-xs text-card-foreground">Multicaixa</div>
                <div className="bg-muted rounded px-2 py-1 text-xs text-card-foreground">Visa</div>
                <div className="bg-muted rounded px-2 py-1 text-xs text-card-foreground">Mastercard</div>
                <div className="bg-muted rounded px-2 py-1 text-xs text-card-foreground">TPA</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Copyright */}
      <div className="border-t border-border">
        <div className="container mx-auto px-4 py-4">
          <p className="text-center text-sm text-muted-foreground">
            © 2024 AngoPlaceMarket. Todos os direitos reservados. 🇦🇴
          </p>
        </div>
      </div>
    </footer>
  );
};
