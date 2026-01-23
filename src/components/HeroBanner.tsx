import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const banners = [
  {
    id: 1,
    title: "OFERTAS EXCLUSIVAS",
    subtitle: "Até 80% OFF",
    description: "Em milhares de produtos selecionados para Angola",
    gradient: "from-primary via-primary/80 to-background",
  },
  {
    id: 2,
    title: "NOVOS USUÁRIOS",
    subtitle: "Cupom de 5.000 Kz",
    description: "Na sua primeira compra acima de 10.000 Kz",
    gradient: "from-secondary/20 via-background to-background",
  },
  {
    id: 3,
    title: "FRETE GRÁTIS",
    subtitle: "Compras +15.000 Kz",
    description: "Entrega para toda Angola",
    gradient: "from-success/30 via-background to-background",
  },
];

export const HeroBanner = () => {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % banners.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const prev = () => setCurrent((current - 1 + banners.length) % banners.length);
  const next = () => setCurrent((current + 1) % banners.length);

  return (
    <section className="relative overflow-hidden">
      <div className="relative h-48 md:h-72">
        {banners.map((banner, index) => (
          <div
            key={banner.id}
            className={`absolute inset-0 transition-all duration-500 ease-in-out bg-gradient-to-r ${banner.gradient} ${
              index === current ? "opacity-100 translate-x-0" : "opacity-0 translate-x-full"
            }`}
          >
            <div className="container mx-auto px-4 h-full flex items-center">
              <div className="max-w-lg">
                <p className="text-sm md:text-base font-semibold mb-2 text-secondary">{banner.title}</p>
                <h2 className="text-3xl md:text-5xl font-bold mb-2 text-card-foreground">{banner.subtitle}</h2>
                <p className="text-sm md:text-lg text-muted-foreground">{banner.description}</p>
                <Button className="mt-4 bg-secondary text-secondary-foreground hover:bg-secondary/90 font-semibold px-6">
                  Comprar Agora
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Navigation */}
      <Button
        variant="ghost"
        size="icon"
        className="absolute left-2 top-1/2 -translate-y-1/2 bg-card/80 hover:bg-card text-card-foreground rounded-full border border-border"
        onClick={prev}
      >
        <ChevronLeft className="h-5 w-5" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        className="absolute right-2 top-1/2 -translate-y-1/2 bg-card/80 hover:bg-card text-card-foreground rounded-full border border-border"
        onClick={next}
      >
        <ChevronRight className="h-5 w-5" />
      </Button>

      {/* Indicators */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
        {banners.map((_, index) => (
          <button
            key={index}
            className={`h-2 rounded-full transition-all ${
              index === current ? "bg-secondary w-6" : "bg-card-foreground/30 w-2"
            }`}
            onClick={() => setCurrent(index)}
          />
        ))}
      </div>
    </section>
  );
};
