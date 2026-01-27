import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { supabase } from '@/lib/supabase';
import type { User, Session } from '@supabase/supabase-js';
import type { UserProfile } from '@/types';

interface LoginAttempt {
    count: number;
    lockedUntil: number | null;
}

interface OtpAttempt {
    count: number;
    lockedUntil: number | null;
}

interface AuthContextType {
    user: User | null;
    session: Session | null;
    loading: boolean;
    loginAttempts: LoginAttempt;
    isLocked: boolean;
    lockTimeRemaining: number;
    // OTP rate limiting
    otpAttempts: OtpAttempt;
    isOtpLocked: boolean;
    otpLockTimeRemaining: number;
    signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
    signInWithOtp: (identifier: string, type?: 'email' | 'phone') => Promise<{ error: Error | null }>;
    signUp: (email: string, password: string, metadata?: Record<string, unknown>) => Promise<{ error: Error | null }>;
    signOut: () => Promise<void>;
    resetPassword: (email: string) => Promise<{ error: Error | null }>;
    updatePassword: (newPassword: string) => Promise<{ error: Error | null }>;
    verifyOtp: (identifier: string, token: string, type: 'email' | 'phone') => Promise<{ error: Error | null, data?: any }>;
    resetOtpAttempts: () => void;
    signInWithGoogle: () => Promise<{ error: Error | null }>;
    profile: UserProfile | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const MAX_LOGIN_ATTEMPTS = 3;
const MAX_OTP_ATTEMPTS = 3;
const LOCKOUT_DURATION_MS = 30000; // 30 seconds

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [session, setSession] = useState<Session | null>(null);
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const [loginAttempts, setLoginAttempts] = useState<LoginAttempt>({ count: 0, lockedUntil: null });
    const [lockTimeRemaining, setLockTimeRemaining] = useState(0);

    // OTP rate limiting state
    const [otpAttempts, setOtpAttempts] = useState<OtpAttempt>({ count: 0, lockedUntil: null });
    const [otpLockTimeRemaining, setOtpLockTimeRemaining] = useState(0);

    const isLocked = loginAttempts.lockedUntil !== null && Date.now() < loginAttempts.lockedUntil;
    const isOtpLocked = otpAttempts.lockedUntil !== null && Date.now() < otpAttempts.lockedUntil;

    // Load attempts from localStorage on mount
    useEffect(() => {
        const stored = localStorage.getItem('login_attempts');
        if (stored) {
            try {
                const parsed = JSON.parse(stored);
                // Verify if lock is still valid
                if (parsed.lockedUntil && Date.now() > parsed.lockedUntil) {
                    setLoginAttempts({ count: 0, lockedUntil: null });
                    localStorage.removeItem('login_attempts');
                } else {
                    setLoginAttempts(parsed);
                }
            } catch (e) {
                localStorage.removeItem('login_attempts');
            }
        }
    }, []);

    // Save attempts to localStorage on change
    useEffect(() => {
        localStorage.setItem('login_attempts', JSON.stringify(loginAttempts));
    }, [loginAttempts]);

    // Check and update lock timer
    useEffect(() => {
        if (!loginAttempts.lockedUntil) {
            setLockTimeRemaining(0);
            return;
        }

        const updateTimer = () => {
            const remaining = Math.max(0, loginAttempts.lockedUntil! - Date.now());
            setLockTimeRemaining(remaining);

            if (remaining === 0) {
                setLoginAttempts({ count: 0, lockedUntil: null });
                localStorage.removeItem('login_attempts');
            }
        };

        updateTimer();
        const interval = setInterval(updateTimer, 1000);
        return () => clearInterval(interval);
    }, [loginAttempts.lockedUntil]);

    // Check and update OTP lock timer
    useEffect(() => {
        if (!otpAttempts.lockedUntil) {
            setOtpLockTimeRemaining(0);
            return;
        }

        const updateOtpTimer = () => {
            const remaining = Math.max(0, otpAttempts.lockedUntil! - Date.now());
            setOtpLockTimeRemaining(remaining);

            if (remaining === 0) {
                setOtpAttempts({ count: 0, lockedUntil: null });
            }
        };

        updateOtpTimer();
        const interval = setInterval(updateOtpTimer, 1000);
        return () => clearInterval(interval);
    }, [otpAttempts.lockedUntil]);

    // Initialize session and fetch profile
    useEffect(() => {
        let isMounted = true;

        // Safety timeout to prevent infinite loading (10 seconds)
        const safetyTimeout = setTimeout(() => {
            if (isMounted) {
                console.warn('Auth initialization reached safety timeout');
                setLoading(false);
            }
        }, 10000);

        const fetchProfile = async (userId: string) => {
            try {
                const { data: profileData, error } = await supabase
                    .from('profiles')
                    .select('*')
                    .eq('id', userId)
                    .single();

                if (error) throw error;

                if (isMounted) {
                    setProfile(profileData);

                    // Check if blocked on load
                    if (profileData?.is_blocked) {
                        await supabase.auth.signOut();
                    }
                }
            } catch (error) {
                console.error('Error fetching profile:', error);
                if (isMounted) setProfile(null);
            }
        };

        const initSession = async () => {
            try {
                // Initial session check
                const { data: { session }, error: sessionError } = await supabase.auth.getSession();

                if (sessionError) {
                    console.error('Session init error:', sessionError);
                    if (isMounted) setLoading(false);
                    return;
                }

                if (!isMounted) return;

                setSession(session);
                const currentUser = session?.user ?? null;
                setUser(currentUser);

                if (currentUser) {
                    // Timeout-protected profile fetch
                    try {
                        // Create a promise that rejects after 5 seconds
                        const timeoutPromise = new Promise((_, reject) =>
                            setTimeout(() => reject(new Error('Profile fetch timeout')), 5000)
                        );

                        await Promise.race([
                            fetchProfile(currentUser.id),
                            timeoutPromise
                        ]);
                    } catch (e) {
                        console.warn('Profile fetch timed out or failed, continuing without profile', e);
                        // Don't block app load on profile failure
                    }
                } else {
                    setProfile(null);
                }
            } catch (error) {
                console.error('Error getting session:', error);
            } finally {
                if (isMounted) {
                    setLoading(false);
                    clearTimeout(safetyTimeout);
                }
            }
        };

        initSession();

        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
            if (!isMounted) return;

            setSession(session);
            const currentUser = session?.user ?? null;
            setUser(currentUser);

            if (currentUser) {
                // Fetch profile on login or token refresh
                if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED' || !profile) {
                    await fetchProfile(currentUser.id);
                }
            } else {
                setProfile(null);
            }

            if (event === 'SIGNED_OUT') {
                setProfile(null);
            }

            setLoading(false);
            clearTimeout(safetyTimeout);
        });

        return () => {
            isMounted = false;
            subscription.unsubscribe();
            clearTimeout(safetyTimeout);
        };
    }, [profile]);

    const signIn = useCallback(async (email: string, password: string) => {
        try {
            const { data, error } = await supabase.auth.signInWithPassword({ email, password });

            if (error) {
                const newCount = loginAttempts.count + 1;

                if (newCount >= MAX_LOGIN_ATTEMPTS) {
                    const lockedUntil = Date.now() + LOCKOUT_DURATION_MS;
                    setLoginAttempts({
                        count: newCount,
                        lockedUntil,
                    });

                    // Security Notification for Lockout
                    await supabase.from('notifications').insert({
                        user_id: data?.user?.id || null, // Best effort if we can identify from email, but standard Supabase doesn't reveal ID on failed sign-in
                        title: 'Bloqueio de Segurança',
                        message: 'A sua conta foi temporariamente bloqueada devido a 3 tentativas de login falhadas.',
                        type: 'SECURITY'
                    });
                } else {
                    setLoginAttempts({ count: newCount, lockedUntil: null });
                }

                // Generic error message to prevent account enumeration
                return { error: new Error('Credenciais inválidas. Verifique os seus dados e tente novamente.') };
            }

            // Check if user is blocked
            const { data: profileData, error: profileError } = await supabase
                .from('profiles')
                .select('is_blocked')
                .eq('id', data.user?.id)
                .single();

            if (profileData?.is_blocked) {
                await supabase.auth.signOut();
                return { error: new Error('A sua conta está temporariamente suspensa por razões de segurança. Contacte o suporte.') };
            }

            // Reset attempts on successful login
            setLoginAttempts({ count: 0, lockedUntil: null });
            return { error: null };
        } catch (err) {
            return { error: err as Error };
        }
    }, [isLocked, lockTimeRemaining, loginAttempts.count]);

    const signUp = useCallback(async (email: string, password: string, metadata?: Record<string, unknown>) => {
        try {
            const { error } = await supabase.auth.signUp({
                email,
                password,
                options: { data: metadata },
            });
            return { error };
        } catch (err) {
            return { error: err as Error };
        }
    }, []);

    const signOut = useCallback(async () => {
        await supabase.auth.signOut();
        setUser(null);
        setSession(null);
    }, []);

    const resetPassword = useCallback(async (email: string) => {
        try {
            const { error } = await supabase.auth.resetPasswordForEmail(email, {
                redirectTo: `${window.location.origin}/reset-password`,
            });
            return { error };
        } catch (err) {
            return { error: err as Error };
        }
    }, []);

    const updatePassword = useCallback(async (newPassword: string) => {
        try {
            const { error } = await supabase.auth.updateUser({ password: newPassword });
            return { error };
        } catch (err) {
            return { error: err as Error };
        }
    }, []);

    const signInWithOtp = useCallback(async (identifier: string, type: 'email' | 'phone' = 'email') => {
        try {
            const { error } = await supabase.auth.signInWithOtp({
                [type]: identifier,
                options: {
                    shouldCreateUser: false, // Only for existing users by default in login page, but Supabase creates if not exists. 
                    // Let's allow strictly for login, but usually OTP is used for both.
                    // For "Login", we usually assume user exists.
                }
            } as any); // Type cast might be needed depending on supabase-js version if strict

            return { error };
        } catch (err) {
            return { error: err as Error };
        }
    }, []);

    const verifyOtp = useCallback(async (identifier: string, token: string, type: 'email' | 'phone') => {
        // Check if OTP verification is locked
        if (isOtpLocked) {
            return {
                error: new Error('Verificação bloqueada. Aguarde antes de tentar novamente.'),
                data: { user: null, session: null }
            };
        }

        try {
            const params: any = {
                token,
                type: type === 'phone' ? 'sms' : 'email',
            };

            if (type === 'phone') {
                params.phone = identifier;
            } else {
                params.email = identifier;
            }

            const { data, error } = await supabase.auth.verifyOtp(params);

            if (error) {
                // Increment OTP attempts on failure
                const newCount = otpAttempts.count + 1;

                if (newCount >= MAX_OTP_ATTEMPTS) {
                    const lockedUntil = Date.now() + LOCKOUT_DURATION_MS;
                    setOtpAttempts({ count: newCount, lockedUntil });
                } else {
                    setOtpAttempts({ count: newCount, lockedUntil: null });
                }

                return { error: new Error('Código inválido ou expirado.'), data: { user: null, session: null } };
            }

            if (data.user) {
                // Reset all attempts on successful OTP login
                setLoginAttempts({ count: 0, lockedUntil: null });
                setOtpAttempts({ count: 0, lockedUntil: null });
            }

            return { error: null, data };
        } catch (err) {
            return { error: err as Error, data: { user: null, session: null } };
        }
    }, [isOtpLocked, otpAttempts.count]);

    const resetOtpAttempts = useCallback(() => {
        setOtpAttempts({ count: 0, lockedUntil: null });
    }, []);

    const signInWithGoogle = useCallback(async () => {
        try {
            const { error } = await supabase.auth.signInWithOAuth({
                provider: 'google',
                options: {
                    redirectTo: window.location.origin,
                },
            });
            return { error };
        } catch (err) {
            return { error: err as Error };
        }
    }, []);

    return (
        <AuthContext.Provider
            value={{
                user,
                session,
                loading,
                loginAttempts,
                isLocked,
                lockTimeRemaining,
                otpAttempts,
                isOtpLocked,
                otpLockTimeRemaining,
                signIn,
                signInWithOtp,
                signUp,
                signOut,
                resetPassword,
                updatePassword,
                verifyOtp,
                resetOtpAttempts,
                signInWithGoogle,
                profile,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
