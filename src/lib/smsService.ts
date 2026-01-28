import { supabase } from './supabase';

interface SendOtpResult {
    codeId: string;
    channel: 'sms' | 'email';
    expiresIn: number;
    phoneMasked: string;
    sent: boolean;
}

interface VerifyOtpResult {
    valid: boolean;
    error?: string;
    attemptsRemaining?: number;
    locked?: boolean;
    userId?: string;
    purpose?: string;
}

/**
 * Serviço de SMS para Angola
 * Suporta envio de OTP via SMS com fallback automático para email
 */
export const smsService = {
    /**
     * Envia código OTP de 6 dígitos para o telefone especificado
     * Se o SMS falhar, faz fallback para email (se fornecido)
     */
    sendOtp: async (
        phone: string,
        purpose: 'login' | 'action_confirm' | 'account_alert' | 'payment_confirm',
        options?: { userId?: string; email?: string }
    ): Promise<SendOtpResult> => {
        const { data, error } = await supabase.functions.invoke('send-sms', {
            body: {
                phone,
                purpose,
                user_id: options?.userId,
                email: options?.email
            }
        });

        if (error) throw error;
        if (data.error) throw new Error(data.error);

        return {
            codeId: data.code_id,
            channel: data.channel,
            expiresIn: data.expires_in,
            phoneMasked: data.phone_masked,
            sent: data.sent
        };
    },

    /**
     * Verifica o código OTP inserido pelo utilizador
     * Retorna erro se expirado, incorreto ou máximo de tentativas excedido
     */
    verifyOtp: async (codeId: string, code: string): Promise<VerifyOtpResult> => {
        const { data, error } = await supabase.functions.invoke('verify-otp', {
            body: { code_id: codeId, code }
        });

        if (error) {
            return { valid: false, error: error.message };
        }

        return {
            valid: data.valid,
            error: data.error,
            attemptsRemaining: data.attempts_remaining,
            locked: data.locked,
            userId: data.user_id,
            purpose: data.purpose
        };
    },

    /**
     * Formata número de telefone para o padrão angolano (+244)
     */
    formatPhone: (phone: string): string => {
        const cleaned = phone.replace(/\D/g, '');
        if (cleaned.startsWith('244')) return '+' + cleaned;
        if (cleaned.startsWith('9')) return '+244' + cleaned;
        return '+244' + cleaned;
    },

    /**
     * Valida se é um número de telefone angolano válido
     */
    isValidAngolaMobile: (phone: string): boolean => {
        const cleaned = phone.replace(/\D/g, '');
        // Angola mobile numbers: 9xx xxx xxx
        const mobilePattern = /^(244)?9\d{8}$/;
        return mobilePattern.test(cleaned);
    }
};
