import { useState, useCallback, useRef, useEffect } from 'react';
import { toast } from 'sonner';

// Payment cooldown to prevent double payments (5 minutes)
const PAYMENT_COOLDOWN_MS = 5 * 60 * 1000;

interface PaymentAttempt {
    orderId: string;
    timestamp: number;
    status: 'pending' | 'processing' | 'completed' | 'failed';
}

// In-memory store for payment attempts (persisted to localStorage)
const getStoredAttempts = (): PaymentAttempt[] => {
    try {
        const stored = localStorage.getItem('payment_attempts');
        return stored ? JSON.parse(stored) : [];
    } catch {
        return [];
    }
};

const setStoredAttempts = (attempts: PaymentAttempt[]) => {
    localStorage.setItem('payment_attempts', JSON.stringify(attempts));
};

/**
 * Hook to manage payment protection against double payments
 */
export const usePaymentProtection = () => {
    const [pendingPayments, setPendingPayments] = useState<PaymentAttempt[]>(getStoredAttempts);
    const processingRef = useRef<Set<string>>(new Set());

    // Cleanup old attempts on mount
    useEffect(() => {
        const now = Date.now();
        const validAttempts = pendingPayments.filter(
            attempt => now - attempt.timestamp < PAYMENT_COOLDOWN_MS
        );
        if (validAttempts.length !== pendingPayments.length) {
            setPendingPayments(validAttempts);
            setStoredAttempts(validAttempts);
        }
    }, []);

    /**
     * Check if payment can be initiated for an order
     */
    const canPay = useCallback((orderId: string): {
        allowed: boolean;
        reason?: string;
        remainingSeconds?: number;
    } => {
        // Check if currently processing
        if (processingRef.current.has(orderId)) {
            return {
                allowed: false,
                reason: 'Um pagamento está sendo processado para este pedido. Aguarde.'
            };
        }

        // Check cooldown
        const now = Date.now();
        const recentAttempt = pendingPayments.find(
            attempt => attempt.orderId === orderId &&
                attempt.status !== 'failed' &&
                now - attempt.timestamp < PAYMENT_COOLDOWN_MS
        );

        if (recentAttempt) {
            const elapsed = now - recentAttempt.timestamp;
            const remaining = Math.ceil((PAYMENT_COOLDOWN_MS - elapsed) / 1000);

            if (recentAttempt.status === 'completed') {
                return {
                    allowed: false,
                    reason: 'Este pedido já foi pago.',
                    remainingSeconds: 0
                };
            }

            return {
                allowed: false,
                reason: `Aguarde ${Math.floor(remaining / 60)}:${(remaining % 60).toString().padStart(2, '0')} para tentar novamente.`,
                remainingSeconds: remaining
            };
        }

        return { allowed: true };
    }, [pendingPayments]);

    /**
     * Register a payment attempt
     */
    const registerAttempt = useCallback((orderId: string): boolean => {
        const check = canPay(orderId);
        if (!check.allowed) {
            toast.error(check.reason || 'Pagamento não permitido');
            return false;
        }

        // Mark as processing
        processingRef.current.add(orderId);

        // Add to pending payments
        const newAttempt: PaymentAttempt = {
            orderId,
            timestamp: Date.now(),
            status: 'pending'
        };

        setPendingPayments(prev => {
            const updated = [...prev.filter(a => a.orderId !== orderId), newAttempt];
            setStoredAttempts(updated);
            return updated;
        });

        return true;
    }, [canPay]);

    /**
     * Update payment status
     */
    const updateStatus = useCallback((orderId: string, status: 'processing' | 'completed' | 'failed') => {
        // Remove from processing set
        processingRef.current.delete(orderId);

        setPendingPayments(prev => {
            const updated = prev.map(attempt =>
                attempt.orderId === orderId
                    ? { ...attempt, status }
                    : attempt
            );
            setStoredAttempts(updated);
            return updated;
        });

        // Show appropriate toast
        if (status === 'completed') {
            toast.success('Pagamento concluído com sucesso!');
        } else if (status === 'failed') {
            toast.error('Pagamento falhou. Tente novamente.');
        }
    }, []);

    /**
     * Clear a specific payment attempt (for retries after failure)
     */
    const clearAttempt = useCallback((orderId: string) => {
        processingRef.current.delete(orderId);
        setPendingPayments(prev => {
            const updated = prev.filter(a => a.orderId !== orderId);
            setStoredAttempts(updated);
            return updated;
        });
    }, []);

    /**
     * Get the status of a payment attempt
     */
    const getAttemptStatus = useCallback((orderId: string): PaymentAttempt | null => {
        return pendingPayments.find(a => a.orderId === orderId) || null;
    }, [pendingPayments]);

    return {
        canPay,
        registerAttempt,
        updateStatus,
        clearAttempt,
        getAttemptStatus,
        pendingPayments
    };
};

/**
 * Utility to format payment status for display
 */
export const formatPaymentStatus = (status: string): { label: string; color: string } => {
    const statusMap: Record<string, { label: string; color: string }> = {
        'pending': { label: 'Pendente', color: 'yellow' },
        'processing': { label: 'Processando', color: 'blue' },
        'completed': { label: 'Concluído', color: 'green' },
        'failed': { label: 'Falhou', color: 'red' },
        'refunded': { label: 'Reembolsado', color: 'purple' },
    };
    return statusMap[status] || { label: status, color: 'gray' };
};

/**
 * Generate a unique payment reference
 */
export const generatePaymentReference = (orderId: string): string => {
    const timestamp = Date.now().toString(36).toUpperCase();
    const orderPart = orderId.slice(0, 4).toUpperCase();
    const random = Math.random().toString(36).substring(2, 6).toUpperCase();
    return `AP-${orderPart}-${timestamp}-${random}`;
};
