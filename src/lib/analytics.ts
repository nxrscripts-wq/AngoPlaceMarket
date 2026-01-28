import { supabase } from './supabase';

// Session ID (persists for the session)
const getSessionId = (): string => {
    let sessionId = sessionStorage.getItem('analytics_session');
    if (!sessionId) {
        sessionId = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
        sessionStorage.setItem('analytics_session', sessionId);
    }
    return sessionId;
};

// Detect device type
const getDeviceType = (): 'mobile' | 'tablet' | 'desktop' => {
    const width = window.innerWidth;
    if (width < 768) return 'mobile';
    if (width < 1024) return 'tablet';
    return 'desktop';
};

// Get browser name
const getBrowser = (): string => {
    const ua = navigator.userAgent;
    if (ua.includes('Chrome')) return 'Chrome';
    if (ua.includes('Firefox')) return 'Firefox';
    if (ua.includes('Safari')) return 'Safari';
    if (ua.includes('Edge')) return 'Edge';
    return 'Other';
};

// Check if user has consented to analytics
const hasConsent = (): boolean => {
    return localStorage.getItem('analytics_consent') === 'true';
};

type EventType =
    | 'page_view' | 'product_view' | 'add_to_cart' | 'remove_from_cart'
    | 'checkout_start' | 'checkout_complete' | 'search' | 'filter_apply'
    | 'chat_start' | 'review_submit' | 'wishlist_add';

type FunnelStage =
    | 'landing' | 'browse' | 'product_view' | 'add_cart' | 'cart_view'
    | 'checkout_start' | 'payment_init' | 'payment_complete' | 'order_confirm';

type ErrorSeverity = 'warning' | 'error' | 'critical';

/**
 * GDPR-compliant Analytics Service
 * Does not collect PII, respects user consent
 */
export const analytics = {
    /**
     * Set user consent for analytics
     */
    setConsent: (consent: boolean) => {
        localStorage.setItem('analytics_consent', consent.toString());
    },

    /**
     * Check if analytics is enabled
     */
    isEnabled: (): boolean => {
        return hasConsent();
    },

    /**
     * Track a generic event
     */
    track: async (eventType: EventType, eventData: Record<string, unknown> = {}) => {
        if (!hasConsent()) return;

        try {
            await supabase.from('analytics_events').insert({
                session_id: getSessionId(),
                event_type: eventType,
                event_data: eventData,
                page_path: window.location.pathname,
                referrer: document.referrer || null,
                device_type: getDeviceType(),
                browser: getBrowser()
            });
        } catch (error) {
            console.warn('Analytics track error:', error);
        }
    },

    /**
     * Track funnel stage progression
     */
    trackFunnel: async (stage: FunnelStage, productId?: string, orderValue?: number) => {
        if (!hasConsent()) return;

        try {
            await supabase.from('funnel_events').insert({
                session_id: getSessionId(),
                stage,
                product_id: productId || null,
                order_value: orderValue || null
            });
        } catch (error) {
            console.warn('Funnel track error:', error);
        }
    },

    /**
     * Track page view
     */
    pageView: async (pagePath?: string) => {
        if (!hasConsent()) return;

        await analytics.track('page_view', {
            path: pagePath || window.location.pathname,
            title: document.title
        });
    },

    /**
     * Track product view
     */
    productView: async (productId: string, productName: string, price: number) => {
        await analytics.track('product_view', { productId, productName, price });
        await analytics.trackFunnel('product_view', productId);
    },

    /**
     * Track add to cart
     */
    addToCart: async (productId: string, quantity: number, price: number) => {
        await analytics.track('add_to_cart', { productId, quantity, price });
        await analytics.trackFunnel('add_cart', productId, price * quantity);
    },

    /**
     * Track search
     */
    search: async (query: string, resultsCount: number) => {
        // Don't log the actual query to avoid PII
        await analytics.track('search', {
            queryLength: query.length,
            resultsCount,
            hasResults: resultsCount > 0
        });
    },

    /**
     * Log an error
     */
    logError: async (
        error: Error | string,
        component: string,
        severity: ErrorSeverity = 'error'
    ) => {
        try {
            const errorMessage = error instanceof Error ? error.message : error;
            const errorStack = error instanceof Error ? error.stack : null;

            await supabase.from('error_logs').insert({
                error_type: 'frontend',
                error_message: errorMessage,
                error_stack: errorStack,
                component,
                user_agent: navigator.userAgent,
                page_path: window.location.pathname,
                severity
            });
        } catch (e) {
            console.error('Failed to log error:', e);
        }
    },

    /**
     * Track performance metric
     */
    trackPerformance: async (
        metricType: 'page_load' | 'api_latency' | 'lcp' | 'fcp' | 'cls' | 'fid',
        value: number
    ) => {
        if (!hasConsent()) return;

        try {
            await supabase.from('performance_metrics').insert({
                metric_type: metricType,
                value,
                page_path: window.location.pathname,
                device_type: getDeviceType()
            });
        } catch (error) {
            console.warn('Performance track error:', error);
        }
    },

    /**
     * Initialize Web Vitals tracking
     */
    initWebVitals: () => {
        if (!hasConsent()) return;

        // Track LCP (Largest Contentful Paint)
        if ('PerformanceObserver' in window) {
            try {
                const lcpObserver = new PerformanceObserver((list) => {
                    const entries = list.getEntries();
                    const lastEntry = entries[entries.length - 1];
                    analytics.trackPerformance('lcp', lastEntry.startTime);
                });
                lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });

                // Track FCP (First Contentful Paint)
                const fcpObserver = new PerformanceObserver((list) => {
                    const entries = list.getEntries();
                    const fcp = entries.find(e => e.name === 'first-contentful-paint');
                    if (fcp) {
                        analytics.trackPerformance('fcp', fcp.startTime);
                    }
                });
                fcpObserver.observe({ entryTypes: ['paint'] });
            } catch (e) {
                // PerformanceObserver might not support all entry types
            }
        }

        // Track page load time
        window.addEventListener('load', () => {
            const timing = performance.timing;
            const pageLoadTime = timing.loadEventEnd - timing.navigationStart;
            if (pageLoadTime > 0) {
                analytics.trackPerformance('page_load', pageLoadTime);
            }
        });
    }
};

// Auto-track page views on route changes (for SPA)
let lastPath = '';
export const trackRouteChange = () => {
    const currentPath = window.location.pathname;
    if (currentPath !== lastPath) {
        lastPath = currentPath;
        analytics.pageView(currentPath);
    }
};
