import { useCallback, useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import {
    checkRateLimit,
    recordAction,
    getSecurityStatus,
    isBlocked,
    ActionType,
    RateLimitResult,
    RiskLevel
} from '@/lib/antiFraud';
import { toast } from 'sonner';

interface UseAntiFraudResult {
    // Check if action is allowed before performing
    canPerform: (action: ActionType) => RateLimitResult;
    // Record an action and get result
    performAction: (action: ActionType, details?: Record<string, any>) => Promise<{ allowed: boolean; message?: string }>;
    // Get current security status
    status: { blocked: boolean; riskLevel: RiskLevel; score: number };
    // Check if user is currently blocked
    isUserBlocked: boolean;
    // Block reason if blocked
    blockReason?: string;
}

/**
 * React hook for anti-fraud protection
 * Use this to protect actions in your components
 * 
 * @example
 * const { performAction, isUserBlocked } = useAntiFraud();
 * 
 * const handleSubmit = async () => {
 *   const result = await performAction('order_create', { amount: 50000 });
 *   if (!result.allowed) {
 *     // Action was blocked
 *     return;
 *   }
 *   // Proceed with order creation
 * };
 */
export const useAntiFraud = (): UseAntiFraudResult => {
    const { user } = useAuth();
    const [status, setStatus] = useState<{ blocked: boolean; riskLevel: RiskLevel; score: number }>({
        blocked: false,
        riskLevel: 'low',
        score: 0
    });

    // Update status periodically
    useEffect(() => {
        const updateStatus = () => {
            const currentStatus = getSecurityStatus(user?.id);
            setStatus({
                blocked: currentStatus.blocked,
                riskLevel: currentStatus.riskLevel,
                score: currentStatus.score
            });
        };

        updateStatus();
        const interval = setInterval(updateStatus, 30000); // Every 30 seconds

        return () => clearInterval(interval);
    }, [user?.id]);

    // Check if action is allowed (without recording)
    const canPerform = useCallback((action: ActionType): RateLimitResult => {
        return checkRateLimit(user?.id, action);
    }, [user?.id]);

    // Perform action with anti-fraud check
    const performAction = useCallback(async (
        action: ActionType,
        details: Record<string, any> = {}
    ): Promise<{ allowed: boolean; message?: string }> => {
        const result = await recordAction(user?.id, action, details);

        // Update local status
        const currentStatus = getSecurityStatus(user?.id);
        setStatus({
            blocked: currentStatus.blocked,
            riskLevel: currentStatus.riskLevel,
            score: currentStatus.score
        });

        if (!result.allowed) {
            // Show user-friendly message
            const messages: Record<string, string> = {
                blocked: 'Sua conta está temporariamente bloqueada por atividade suspeita.',
                rate_limit: `Muitas tentativas. Aguarde ${result.resetIn} segundos.`,
                suspicious: 'Atividade suspeita detectada. Por favor, tente novamente mais tarde.'
            };

            const messageType = result.blocked ? 'blocked' :
                result.reason?.includes('suspeita') ? 'suspicious' : 'rate_limit';

            toast.error(messages[messageType] || result.reason);

            return {
                allowed: false,
                message: result.reason
            };
        }

        return { allowed: true };
    }, [user?.id]);

    // Check if blocked
    const blockStatus = isBlocked(user?.id);

    return {
        canPerform,
        performAction,
        status,
        isUserBlocked: blockStatus.blocked,
        blockReason: blockStatus.reason
    };
};

/**
 * Higher-order component to protect routes from blocked users
 */
export const withAntiFraud = <P extends object>(
    WrappedComponent: React.ComponentType<P>,
    redirectOnBlock: string = '/'
): React.FC<P> => {
    return function WithAntiFraudComponent(props: P) {
        const { isUserBlocked, blockReason } = useAntiFraud();

        useEffect(() => {
            if (isUserBlocked) {
                toast.error(blockReason || 'Conta temporariamente bloqueada');
                window.location.href = redirectOnBlock;
            }
        }, [isUserBlocked, blockReason]);

        if (isUserBlocked) {
            return null;
        }

        return <WrappedComponent { ...props } />;
    };
};
