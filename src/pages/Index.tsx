import { HeroBanner } from "@/components/HeroBanner";
import { Categories } from "@/components/Categories";
import { FlashDeals } from "@/components/FlashDeals";
import { ProductGrid } from "@/components/ProductGrid";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <main>
        <HeroBanner />
        <Categories />
        <FlashDeals />
        <ProductGrid
          title="Super Descontos"
          subtitle="As melhores ofertas com preços baixos garantidos"
          filterType="super_discounts"
          className="bg-muted/30 py-12 md:py-16"
        />
        <ProductGrid
          title="Novidades"
          subtitle="Produtos recém-chegados ao marketplace"
          filterType="new_arrivals"
          viewAllLink="/search?filter=new"
          className="py-12 md:py-16"
        />
        <ProductGrid
          title="Mais Vendidos"
          subtitle="Os favoritos da comunidade AngoPlace"
          filterType="best_sellers"
          viewAllLink="/search"
          className="bg-muted/30 py-12 md:py-16"
        />
      </main>
    </div>
  );
};

export default Index;
