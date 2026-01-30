import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Button } from './ui/button';
import { AlertTriangle } from 'lucide-react';

interface Props {
    children: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
}

export class GlobalErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false,
        error: null,
    };

    public static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error('Uncaught error:', error, errorInfo);
    }

    private handleReload = () => {
        window.location.reload();
    };

    public render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-background text-foreground text-center">
                    <div className="bg-destructive/10 p-4 rounded-full mb-6">
                        <AlertTriangle className="h-12 w-12 text-destructive" />
                    </div>
                    <h1 className="text-2xl font-bold mb-2">Ops! Algo correu mal.</h1>
                    <p className="text-muted-foreground mb-6 max-w-md">
                        Ocorreu um erro inesperado e a aplicação não conseguiu carregar corretamente.
                    </p>
                    <div className="flex gap-4">
                        <Button onClick={this.handleReload} variant="default">
                            Tentar Novamente
                        </Button>
                        <Button
                            onClick={() => window.location.href = '/'}
                            variant="outline"
                        >
                            Voltar ao Início
                        </Button>
                    </div>
                    {import.meta.env.MODE === 'development' && this.state.error && (
                        <div className="mt-8 p-4 bg-muted rounded-lg text-left max-w-2xl w-full overflow-auto text-xs font-mono">
                            <p className="font-bold text-destructive mb-2">Error Details:</p>
                            {this.state.error.toString()}
                        </div>
                    )}
                </div>
            );
        }

        return this.props.children;
    }
}
