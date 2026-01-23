import { useNavigate } from 'react-router-dom';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Lock, UserPlus, LogIn } from 'lucide-react';

interface AuthRequiredModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    redirectPath?: string;
}

export const AuthRequiredModal = ({
    open,
    onOpenChange,
    redirectPath = '/'
}: AuthRequiredModalProps) => {
    const navigate = useNavigate();

    const handleLogin = () => {
        onOpenChange(false);
        navigate(`/login?redirect=${encodeURIComponent(redirectPath)}`);
    };

    const handleRegister = () => {
        onOpenChange(false);
        navigate('/register');
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader className="text-center">
                    <div className="w-16 h-16 bg-secondary/20 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Lock className="h-8 w-8 text-secondary" />
                    </div>
                    <DialogTitle className="text-xl font-bold text-center">
                        Autenticação Necessária
                    </DialogTitle>
                    <DialogDescription className="text-center">
                        Para continuar, é necessário iniciar sessão ou criar uma conta.
                    </DialogDescription>
                </DialogHeader>

                <div className="flex flex-col gap-3 mt-4">
                    <Button
                        onClick={handleLogin}
                        className="w-full bg-secondary hover:bg-secondary/90 text-secondary-foreground font-semibold h-11"
                    >
                        <LogIn className="mr-2 h-4 w-4" />
                        Iniciar Sessão
                    </Button>

                    <Button
                        onClick={handleRegister}
                        variant="outline"
                        className="w-full h-11 font-semibold"
                    >
                        <UserPlus className="mr-2 h-4 w-4" />
                        Criar Conta
                    </Button>
                </div>

                <p className="text-xs text-center text-muted-foreground mt-4">
                    Ao criar uma conta, você concorda com nossos Termos de Serviço e Política de Privacidade.
                </p>
            </DialogContent>
        </Dialog>
    );
};
