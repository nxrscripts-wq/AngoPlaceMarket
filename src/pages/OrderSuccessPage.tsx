import { useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { CheckCircle, Package, ArrowRight } from 'lucide-react';
import confetti from 'canvas-confetti';

const OrderSuccessPage = () => {
    const navigate = useNavigate();

    useEffect(() => {
        const duration = 3000;
        const animationEnd = Date.now() + duration;
        const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

        const randomInRange = (min: number, max: number) => {
            return Math.random() * (max - min) + min;
        };

        const interval: any = setInterval(function () {
            const timeLeft = animationEnd - Date.now();

            if (timeLeft <= 0) {
                return clearInterval(interval);
            }

            const particleCount = 50 * (timeLeft / duration);
            confetti(Object.assign({}, defaults, { particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } }));
            confetti(Object.assign({}, defaults, { particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } }));
        }, 250);

        return () => clearInterval(interval);
    }, []);

    return (
        <div className="min-h-screen flex items-center justify-center bg-muted/20 p-4">
            <div className="bg-background rounded-3xl shadow-xl border border-border p-8 max-w-md w-full text-center relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-primary via-secondary to-primary animate-gradient"></div>

                <div className="mb-6 flex justify-center">
                    <div className="h-24 w-24 bg-green-500/10 rounded-full flex items-center justify-center animate-bounce-slow">
                        <CheckCircle className="h-12 w-12 text-green-500" />
                    </div>
                </div>

                <h1 className="text-3xl font-black mb-2 text-foreground">Pedido Confirmado!</h1>
                <p className="text-muted-foreground mb-8">Obrigado pela sua compra. O vendedor será notificado imediatamente.</p>

                <div className="space-y-4">
                    <Button onClick={() => navigate('/orders')} className="w-full h-12 text-lg font-bold bg-secondary hover:bg-secondary/90 text-secondary-foreground shadow-lg shadow-secondary/20">
                        <Package className="mr-2 h-5 w-5" />
                        Ver Meus Pedidos
                    </Button>

                    <Button variant="outline" onClick={() => navigate('/')} className="w-full h-12 text-lg">
                        Continuar Comprando
                    </Button>
                </div>

                <div className="mt-8 pt-6 border-t border-border">
                    <p className="text-xs text-muted-foreground">
                        Um email de confirmação foi enviado para sua caixa de entrada.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default OrderSuccessPage;
