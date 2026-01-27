import { useMemo } from 'react';
import { Check, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PasswordStrengthIndicatorProps {
    password: string;
    className?: string;
}

interface Requirement {
    label: string;
    met: boolean;
}

export const PasswordStrengthIndicator = ({ password, className }: PasswordStrengthIndicatorProps) => {
    const requirements: Requirement[] = useMemo(() => [
        { label: 'Mínimo 6 caracteres', met: password.length >= 6 },
        { label: 'Uma letra maiúscula', met: /[A-Z]/.test(password) },
        { label: 'Um número', met: /[0-9]/.test(password) },
        { label: 'Um símbolo (!@#$%)', met: /[!@#$%^&*(),.?":{}|<>]/.test(password) },
    ], [password]);

    const strength = useMemo(() => {
        const metCount = requirements.filter(r => r.met).length;
        if (metCount === 0) return { level: 0, label: '', color: 'bg-muted' };
        if (metCount === 1) return { level: 1, label: 'Fraca', color: 'bg-red-500' };
        if (metCount === 2) return { level: 2, label: 'Razoável', color: 'bg-orange-500' };
        if (metCount === 3) return { level: 3, label: 'Boa', color: 'bg-yellow-500' };
        return { level: 4, label: 'Forte', color: 'bg-green-500' };
    }, [requirements]);

    if (!password) return null;

    return (
        <div className={cn('space-y-3', className)}>
            {/* Strength Bar */}
            <div className="space-y-1.5">
                <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">Força da senha</span>
                    <span className={cn(
                        'font-medium transition-colors',
                        strength.level === 1 && 'text-red-500',
                        strength.level === 2 && 'text-orange-500',
                        strength.level === 3 && 'text-yellow-500',
                        strength.level === 4 && 'text-green-500',
                    )}>
                        {strength.label}
                    </span>
                </div>
                <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                    <div
                        className={cn(
                            'h-full transition-all duration-300 ease-out rounded-full',
                            strength.color
                        )}
                        style={{ width: `${(strength.level / 4) * 100}%` }}
                    />
                </div>
            </div>

            {/* Requirements Checklist */}
            <div className="grid grid-cols-2 gap-1.5">
                {requirements.map((req, i) => (
                    <div
                        key={i}
                        className={cn(
                            'flex items-center gap-1.5 text-xs transition-colors duration-200',
                            req.met ? 'text-green-600' : 'text-muted-foreground'
                        )}
                    >
                        {req.met ? (
                            <Check className="h-3 w-3 flex-shrink-0" />
                        ) : (
                            <X className="h-3 w-3 flex-shrink-0" />
                        )}
                        <span>{req.label}</span>
                    </div>
                ))}
            </div>
        </div>
    );
};
