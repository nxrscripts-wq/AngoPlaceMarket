import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Cookie, X, Shield } from 'lucide-react';
import { analytics } from '@/lib/analytics';

export const CookieConsent = () => {
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        // Check if consent was already given
        const consent = localStorage.getItem('analytics_consent');
        if (consent === null) {
            // Show banner after a short delay
            const timer = setTimeout(() => setVisible(true), 1500);
            return () => clearTimeout(timer);
        }
    }, []);

    const handleAccept = () => {
        analytics.setConsent(true);
        analytics.initWebVitals();
        analytics.pageView();
        setVisible(false);
    };

    const handleDecline = () => {
        analytics.setConsent(false);
        setVisible(false);
    };

    if (!visible) return null;

    return (
        <div className="fixed bottom-0 left-0 right-0 z-50 p-4 md:p-6 animate-in slide-in-from-bottom duration-500">
            <Card className="max-w-4xl mx-auto p-4 md:p-6 bg-card/95 backdrop-blur border-secondary/20 shadow-xl">
                <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
                    <div className="p-3 bg-secondary/10 rounded-xl shrink-0">
                        <Cookie className="h-6 w-6 text-secondary" />
                    </div>

                    <div className="flex-1 space-y-1">
                        <h4 className="font-semibold flex items-center gap-2">
                            <Shield className="h-4 w-4 text-green-500" />
                            Respeitamos a sua privacidade
                        </h4>
                        <p className="text-sm text-muted-foreground">
                            Utilizamos cookies de análise para melhorar a sua experiência.
                            Não recolhemos dados pessoais identificáveis.
                            Pode recusar sem impacto na utilização da plataforma.
                        </p>
                    </div>

                    <div className="flex gap-2 w-full md:w-auto">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={handleDecline}
                            className="flex-1 md:flex-none"
                        >
                            Recusar
                        </Button>
                        <Button
                            size="sm"
                            onClick={handleAccept}
                            className="flex-1 md:flex-none bg-secondary hover:bg-secondary/90 text-secondary-foreground"
                        >
                            Aceitar
                        </Button>
                    </div>

                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={handleDecline}
                        className="absolute top-2 right-2 md:static h-8 w-8"
                    >
                        <X className="h-4 w-4" />
                    </Button>
                </div>
            </Card>
        </div>
    );
};
