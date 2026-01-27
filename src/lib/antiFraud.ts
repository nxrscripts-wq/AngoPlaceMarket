import { supabase } from '@/lib/supabase';

// ============================================================================
// TYPES
// ============================================================================

export type ActionType =
    | 'login'
    | 'register'
    | 'password_reset'
    | 'order_create'
    | 'payment_attempt'
    | 'review_create'
    | 'message_send'
    | 'product_publish'
    | 'search'
    | 'api_call';

export type RiskLevel = 'low' | 'medium' | 'high' | 'critical';

export interface SecurityEvent {
    id?: string;
    user_id?: string;
    action: ActionType;
    ip_address?: string;
    user_agent?: string;
    risk_level: RiskLevel;
    blocked: boolean;
    details: Record<string, any>;
    created_at?: string;
}

export interface RateLimitResult {
    allowed: boolean;
    remaining: number;
    resetIn: number;
    blocked: boolean;
    reason?: string;
}

// ============================================================================
// RATE LIMIT CONFIGURATION
// ============================================================================

const RATE_LIMITS: Record<ActionType, { limit: number; windowMs: number }> = {
    login: { limit: 5, windowMs: 60 * 1000 },
    register: { limit: 3, windowMs: 5 * 60 * 1000 },
    password_reset: { limit: 3, windowMs: 15 * 60 * 1000 },
    order_create: { limit: 10, windowMs: 60 * 1000 },
    payment_attempt: { limit: 5, windowMs: 5 * 60 * 1000 },
    review_create: { limit: 5, windowMs: 60 * 1000 },
    message_send: { limit: 30, windowMs: 60 * 1000 },
    product_publish: { limit: 5, windowMs: 60 * 1000 },
    search: { limit: 60, windowMs: 60 * 1000 },
    api_call: { limit: 100, windowMs: 60 * 1000 },
};

const SUSPICIOUS_THRESHOLDS = {
    failedLogins: 5,
    rapidActions: 10,
    unusualHours: [2, 5],
    highValueOrders: 500000,
};

const BLOCK_DURATION = {
    temporary: 15 * 60 * 1000,
    extended: 60 * 60 * 1000,
    severe: 24 * 60 * 60 * 1000,
};

// ============================================================================
// IN-MEMORY STORAGE
// ============================================================================

interface ActionRecord {
    count: number;
    firstAction: number;
    lastAction: number;
}

const actionStore = new Map<string, ActionRecord>();
const blockStore = new Map<string, { until: number; reason: string }>();
const suspiciousStore = new Map<string, { score: number; events: string[] }>();

const getFingerprint = (): string => {
    const nav = typeof navigator !== 'undefined' ? navigator : null;
    const screen = typeof window !== 'undefined' ? window.screen : null;

    const components = [
        nav?.userAgent || '',
        nav?.language || '',
        screen?.width || 0,
        screen?.height || 0,
        new Date().getTimezoneOffset(),
    ];

    const str = components.join('|');
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash;
    }
    return `fp_${Math.abs(hash).toString(36)}`;
};

const getRateLimitKey = (userId: string | undefined, action: ActionType): string => {
    return `${userId || getFingerprint()}:${action}`;
};

// ============================================================================
// RATE LIMITING
// ============================================================================

export const checkRateLimit = (userId: string | undefined, action: ActionType): RateLimitResult => {
    const key = getRateLimitKey(userId, action);
    const config = RATE_LIMITS[action];
    const now = Date.now();

    const block = blockStore.get(userId || getFingerprint());
    if (block && block.until > now) {
        return {
            allowed: false,
            remaining: 0,
            resetIn: Math.ceil((block.until - now) / 1000),
            blocked: true,
            reason: block.reason
        };
    }

    let record = actionStore.get(key);

    if (!record || (now - record.firstAction) > config.windowMs) {
        record = { count: 0, firstAction: now, lastAction: now };
    }

    if (record.count >= config.limit) {
        const resetIn = Math.ceil((record.firstAction + config.windowMs - now) / 1000);
        return {
            allowed: false,
            remaining: 0,
            resetIn: Math.max(0, resetIn),
            blocked: false,
            reason: `Limite atingido. Aguarde ${resetIn}s.`
        };
    }

    record.count++;
    record.lastAction = now;
    actionStore.set(key, record);

    return {
        allowed: true,
        remaining: config.limit - record.count,
        resetIn: Math.ceil((record.firstAction + config.windowMs - now) / 1000),
        blocked: false
    };
};

// ============================================================================
// RISK SCORING
// ============================================================================

export const calculateRiskScore = (
    userId: string | undefined,
    action: ActionType,
    details: Record<string, any> = {}
): { score: number; factors: string[] } => {
    let score = 0;
    const factors: string[] = [];

    const hour = new Date().getHours();
    if (hour >= SUSPICIOUS_THRESHOLDS.unusualHours[0] && hour <= SUSPICIOUS_THRESHOLDS.unusualHours[1]) {
        score += 15;
        factors.push('unusual_hour');
    }

    const key = getRateLimitKey(userId, action);
    const record = actionStore.get(key);
    if (record && record.count >= SUSPICIOUS_THRESHOLDS.rapidActions && (Date.now() - record.firstAction) < 10000) {
        score += 30;
        factors.push('rapid_actions');
    }

    if (details.amount && details.amount > SUSPICIOUS_THRESHOLDS.highValueOrders) {
        score += 25;
        factors.push('high_value');
    }

    if (details.failed) {
        score += 10;
        factors.push('failed_attempt');
    }

    if (!userId && ['order_create', 'payment_attempt'].includes(action)) {
        score += 40;
        factors.push('anonymous_sensitive');
    }

    return { score, factors };
};

export const getRiskLevel = (score: number): RiskLevel => {
    if (score >= 80) return 'critical';
    if (score >= 50) return 'high';
    if (score >= 25) return 'medium';
    return 'low';
};

// ============================================================================
// BLOCKING
// ============================================================================

export const blockUser = (identifier: string, durationMs: number, reason: string): void => {
    blockStore.set(identifier, { until: Date.now() + durationMs, reason });
    console.warn(`[Antifraude] Bloqueado: ${identifier}, Motivo: ${reason}`);
};

export const unblockUser = (identifier: string): void => {
    blockStore.delete(identifier);
    suspiciousStore.delete(identifier);
};

export const isBlocked = (userId: string | undefined): { blocked: boolean; reason?: string; until?: Date } => {
    const identifier = userId || getFingerprint();
    const block = blockStore.get(identifier);

    if (!block) return { blocked: false };
    if (block.until <= Date.now()) {
        blockStore.delete(identifier);
        return { blocked: false };
    }

    return { blocked: true, reason: block.reason, until: new Date(block.until) };
};

// ============================================================================
// SECURITY LOGGING & ADMIN ALERTS
// ============================================================================

export const logSecurityEvent = async (event: SecurityEvent): Promise<void> => {
    const fullEvent = {
        ...event,
        user_agent: typeof navigator !== 'undefined' ? navigator.userAgent : undefined,
        created_at: new Date().toISOString()
    };

    console[event.risk_level === 'critical' || event.risk_level === 'high' ? 'warn' : 'log']('[Antifraude]', fullEvent);

    try {
        await supabase.from('security_logs').insert(fullEvent);
    } catch { /* silent */ }

    if (event.risk_level === 'critical' || (event.risk_level === 'high' && event.blocked)) {
        await sendAdminAlert(fullEvent);
    }
};

const sendAdminAlert = async (event: SecurityEvent): Promise<void> => {
    try {
        await supabase.from('notifications').insert({
            user_id: null,
            type: 'SECURITY_ALERT',
            title: `Alerta: ${event.risk_level.toUpperCase()}`,
            message: `Ação suspeita: ${event.action}. ${event.blocked ? 'Bloqueado.' : ''}`,
            read: false,
            metadata: event
        });
    } catch { /* silent */ }
};

// ============================================================================
// MAIN API
// ============================================================================

export const recordAction = async (
    userId: string | undefined,
    action: ActionType,
    details: Record<string, any> = {}
): Promise<RateLimitResult> => {
    const result = checkRateLimit(userId, action);

    if (!result.allowed) {
        await logSecurityEvent({
            user_id: userId,
            action,
            risk_level: result.blocked ? 'high' : 'medium',
            blocked: result.blocked,
            details: { ...details, reason: result.reason }
        });
        return result;
    }

    const { score, factors } = calculateRiskScore(userId, action, details);
    const identifier = userId || getFingerprint();

    let suspect = suspiciousStore.get(identifier) || { score: 0, events: [] };
    suspect.score = Math.min(100, suspect.score + score);
    suspect.events = [...suspect.events, ...factors].slice(-10);
    suspiciousStore.set(identifier, suspect);

    const riskLevel = getRiskLevel(suspect.score);

    if (riskLevel === 'critical') {
        blockUser(identifier, BLOCK_DURATION.extended, 'Atividade suspeita');
        await logSecurityEvent({
            user_id: userId,
            action,
            risk_level: 'critical',
            blocked: true,
            details: { score: suspect.score, factors: suspect.events }
        });
        return { ...result, allowed: false, blocked: true, reason: 'Atividade suspeita detectada' };
    }

    if (riskLevel === 'high') {
        await logSecurityEvent({
            user_id: userId,
            action,
            risk_level: 'high',
            blocked: false,
            details: { score: suspect.score, factors: suspect.events }
        });
    }

    return result;
};

export const getSecurityStatus = (userId: string | undefined): {
    blocked: boolean;
    riskLevel: RiskLevel;
    score: number;
    reason?: string;
} => {
    const identifier = userId || getFingerprint();
    const blockStatus = isBlocked(userId);
    const suspect = suspiciousStore.get(identifier);

    return {
        blocked: blockStatus.blocked,
        riskLevel: suspect ? getRiskLevel(suspect.score) : 'low',
        score: suspect?.score || 0,
        reason: blockStatus.reason
    };
};

// Cleanup every 5 minutes
if (typeof window !== 'undefined') {
    setInterval(() => {
        const now = Date.now();
        for (const [key, record] of actionStore.entries()) {
            if (now - record.lastAction > 60 * 60 * 1000) actionStore.delete(key);
        }
        for (const [key, block] of blockStore.entries()) {
            if (block.until <= now) blockStore.delete(key);
        }
        for (const [key, suspect] of suspiciousStore.entries()) {
            suspect.score = Math.max(0, suspect.score - 5);
            if (suspect.score === 0) suspiciousStore.delete(key);
        }
    }, 5 * 60 * 1000);
}
