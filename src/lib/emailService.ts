import { supabase } from './supabase';

export type EmailTemplate = 'welcome' | 'password_reset' | 'order_confirmation' | 'product_approved' | 'product_rejected';

interface SendEmailParams {
    userId?: string;
    recipient: string;
    subject: string;
    template: EmailTemplate;
    payload: Record<string, any>;
}

export const emailService = {
    /**
     * Envia um email transacional através de Supabase Edge Functions.
     * O sistema regista automaticamente o log na tabela email_logs.
     */
    async sendEmail({ userId, recipient, subject, template, payload }: SendEmailParams) {
        try {
            // 1. Criar log inicial
            const { data: log, error: logError } = await supabase
                .from('email_logs')
                .insert({
                    user_id: userId,
                    recipient,
                    subject,
                    template_name: template,
                    payload,
                    status: 'pending'
                })
                .select()
                .single();

            if (logError) throw logError;

            // 2. Chamar Edge Function para envio real
            // Nota: Em produção, isto seria supabase.functions.invoke('send-email', ...)
            const { data, error: functionError } = await supabase.functions.invoke('send-email', {
                body: { logId: log.id, recipient, subject, template, payload }
            });

            if (functionError) {
                // Atualizar log com erro se a funcão falhar na chamada
                await supabase
                    .from('email_logs')
                    .update({
                        status: 'failed',
                        last_error: functionError.message,
                        retry_count: 1
                    })
                    .eq('id', log.id);

                return { success: false, error: functionError };
            }

            return { success: true, data };
        } catch (error: any) {
            console.error('Email Service Error:', error);
            return { success: false, error: error.message };
        }
    }
};
