import { Loader2 } from 'lucide-react';

interface LoadingScreenProps {
    fullScreen?: boolean;
}

export const LoadingScreen = ({ fullScreen = true }: LoadingScreenProps) => {
    return (
        <div className={`flex flex-col items-center justify-center bg-background gap-8 ${fullScreen ? 'min-h-screen' : 'h-[60vh]'}`}>
            <div className="relative">
                <div className="absolute inset-0 bg-secondary/20 blur-3xl rounded-full" />
                <img
                    src="/logo.png"
                    alt="AngoPlaceMarket"
                    className="h-24 md:h-32 w-auto object-contain relative z-10 animate-in zoom-in duration-700"
                />
            </div>
            <div className="flex flex-col items-center gap-3">
                <Loader2 className="h-10 w-10 animate-spin text-secondary" />
                <p className="text-lg font-bold text-secondary uppercase tracking-[0.2em] animate-pulse">
                    AngoPlace<span className="text-foreground">Market</span>
                </p>
                <p className="text-sm text-muted-foreground">O maior marketplace de Angola</p>
            </div>
        </div>
    );
};
