/**
 * Security utilities for input validation
 * Protects against IDOR, Open Redirect, and other injection attacks
 */

// UUID v4 regex pattern
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

/**
 * Validates if a string is a valid UUID v4
 * Prevents IDOR attacks by ensuring IDs are properly formatted
 */
export const isValidUUID = (id: string): boolean => {
    if (!id || typeof id !== 'string') return false;
    return UUID_REGEX.test(id);
};

/**
 * Validates and sanitizes a UUID, returning null if invalid
 */
export const sanitizeUUID = (id: string): string | null => {
    if (!isValidUUID(id)) return null;
    return id.toLowerCase();
};

// Allowed hosts for redirects (prevents Open Redirect)
const ALLOWED_REDIRECT_HOSTS = [
    'localhost',
    '127.0.0.1',
    'cpywwtagycbcrqsnpqra.supabase.co',
    'angoplace.com',
    'angoplace.ao',
];

/**
 * Validates if a URL is safe for redirection
 * Prevents Open Redirect vulnerabilities
 */
export const isSafeRedirect = (url: string): boolean => {
    if (!url || typeof url !== 'string') return false;

    // Allow relative URLs starting with /
    if (url.startsWith('/') && !url.startsWith('//')) {
        return true;
    }

    try {
        const parsed = new URL(url);

        // Only allow http and https protocols
        if (!['http:', 'https:'].includes(parsed.protocol)) {
            return false;
        }

        // Check if host is in allowed list
        const hostname = parsed.hostname.toLowerCase();
        return ALLOWED_REDIRECT_HOSTS.some(
            (allowed) => hostname === allowed || hostname.endsWith('.' + allowed)
        );
    } catch {
        return false;
    }
};

/**
 * Returns a safe redirect URL or falls back to default
 */
export const getSafeRedirect = (url: string, fallback = '/'): string => {
    return isSafeRedirect(url) ? url : fallback;
};

/**
 * Sanitizes a string for safe display (prevents XSS in text content)
 */
export const sanitizeText = (text: string): string => {
    if (!text || typeof text !== 'string') return '';
    return text
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#x27;');
};

/**
 * Validates that a value is a safe positive integer
 */
export const isValidPositiveInt = (value: unknown): value is number => {
    return (
        typeof value === 'number' &&
        Number.isInteger(value) &&
        value > 0 &&
        value <= Number.MAX_SAFE_INTEGER
    );
};
/**
 * Validates password strength
 * Requirements:
 * - Minimum 6 characters
 * - At least one uppercase letter
 * - At least one number
 * - At least one symbol
 */
export const validatePassword = (password: string): { isValid: boolean; error?: string } => {
    if (!password || password.length < 6) {
        return { isValid: false, error: 'A palavra-passe deve ter pelo menos 6 caracteres.' };
    }

    const hasUppercase = /[A-Z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const hasSymbol = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    if (!hasUppercase) {
        return { isValid: false, error: 'A palavra-passe deve conter pelo menos uma letra maiúscula.' };
    }

    if (!hasNumber) {
        return { isValid: false, error: 'A palavra-passe deve conter pelo menos um número.' };
    }

    if (!hasSymbol) {
        return { isValid: false, error: 'A palavra-passe deve conter pelo menos um símbolo (ex: !, @, #, $).' };
    }

    return { isValid: true };
};
