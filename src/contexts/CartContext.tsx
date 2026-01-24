import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from './AuthContext';
import { toast } from 'sonner';
import { CartItem, Product } from '@/types';

interface CartContextType {
    cartItems: CartItem[];
    addToCart: (product: Product, quantity?: number) => Promise<void>;
    removeFromCart: (id: string) => Promise<void>;
    updateQuantity: (id: string, quantity: number) => Promise<void>;
    clearCart: () => Promise<void>;
    validateStock: () => Promise<boolean>;
    cartCount: number;
    cartTotal: number;
    loading: boolean;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const LOCAL_STORAGE_KEY = 'apm_cart';

export const CartProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const { user, loading: authLoading } = useAuth();
    const [cartItems, setCartItems] = useState<CartItem[]>([]);
    const [loading, setLoading] = useState(true);

    // Consolidated Load & Sync Logic
    useEffect(() => {
        if (authLoading) return;

        const initializeCart = async () => {
            setLoading(true);
            try {
                if (!user) {
                    // GUEST: Load from LocalStorage
                    const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
                    if (stored) {
                        try {
                            setCartItems(JSON.parse(stored));
                        } catch {
                            localStorage.removeItem(LOCAL_STORAGE_KEY);
                            setCartItems([]);
                        }
                    } else {
                        setCartItems([]);
                    }
                } else {
                    // USER: Check for local items to sync first
                    const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
                    if (stored) {
                        const localItems: CartItem[] = JSON.parse(stored);
                        if (localItems.length > 0) {
                            // SYNC PROCESS
                            for (const item of localItems) {
                                const { data: existing } = await supabase
                                    .from('cart_items')
                                    .select('id, quantity')
                                    .eq('user_id', user.id)
                                    .eq('product_id', item.product_id)
                                    .single();

                                if (existing) {
                                    await supabase
                                        .from('cart_items')
                                        .update({ quantity: existing.quantity + item.quantity })
                                        .eq('id', existing.id);
                                } else {
                                    await supabase
                                        .from('cart_items')
                                        .insert({
                                            user_id: user.id,
                                            product_id: item.product_id,
                                            quantity: item.quantity
                                        });
                                }
                            }
                            // Clean up local after sync
                            localStorage.removeItem(LOCAL_STORAGE_KEY);
                            toast.success('Seu carrinho temporário foi salvo na sua conta!');
                        }
                    }

                    // Load final state from DB
                    const { data, error } = await supabase
                        .from('cart_items')
                        .select('*, products(*)')
                        .eq('user_id', user.id)
                        .order('created_at', { ascending: false });

                    if (!error && data) {
                        setCartItems(data);
                    }
                }
            } catch (error) {
                console.error('Error initializing cart:', error);
                toast.error('Erro ao carregar carrinho.');
            } finally {
                setLoading(false);
            }
        };

        initializeCart();
    }, [user, authLoading]);

    // Save to Local Storage ONLY for guests
    useEffect(() => {
        if (!user && !authLoading) {
            localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(cartItems));
        }
    }, [cartItems, user, authLoading]);

    const addToCart = useCallback(async (product: Product, quantity = 1) => {
        if (quantity < 1) return;

        // Optimistic Update
        const tempId = crypto.randomUUID();
        setCartItems(prev => {
            const existing = prev.find(p => p.product_id === product.id);
            if (existing) {
                return prev.map(p => p.product_id === product.id
                    ? { ...p, quantity: p.quantity + quantity }
                    : p);
            }
            const newItem: CartItem = {
                id: tempId,
                user_id: user ? user.id : 'guest',
                product_id: product.id,
                quantity,
                created_at: new Date().toISOString(),
                products: product
            };
            return [...prev, newItem];
        });
        toast.success('Produto adicionado ao carrinho');

        if (user) {
            try {
                const { data: existing } = await supabase
                    .from('cart_items')
                    .select('id, quantity')
                    .eq('user_id', user.id)
                    .eq('product_id', product.id)
                    .single();

                if (existing) {
                    await supabase
                        .from('cart_items')
                        .update({ quantity: existing.quantity + quantity })
                        .eq('id', existing.id);
                } else {
                    const { data } = await supabase
                        .from('cart_items')
                        .insert({
                            user_id: user.id,
                            product_id: product.id,
                            quantity
                        })
                        .select('id')
                        .single();

                    // Update the temp ID with real DB ID
                    if (data) {
                        setCartItems(prev => prev.map(item => item.id === tempId ? { ...item, id: data.id } : item));
                    }
                }
            } catch (error) {
                console.error('Error adding to backend cart:', error);
                // In a perfect world, we revert the optimistic update here
                toast.error('Erro ao sincronizar com o servidor');
            }
        }
    }, [user]);

    const removeFromCart = useCallback(async (id: string) => {
        setCartItems(prev => prev.filter(item => item.id !== id));

        if (user) {
            try {
                await supabase.from('cart_items').delete().eq('id', id);
            } catch (error) {
                console.error('Error removing item:', error);
            }
        }
    }, [user]);

    const updateQuantity = useCallback(async (id: string, quantity: number) => {
        if (quantity < 1) return;

        setCartItems(prev => prev.map(item => item.id === id ? { ...item, quantity } : item));

        if (user) {
            try {
                await supabase
                    .from('cart_items')
                    .update({ quantity })
                    .eq('id', id);
            } catch (error) {
                console.error('Error updating quantity:', error);
            }
        }
    }, [user]);

    const clearCart = useCallback(async () => {
        setCartItems([]);
        if (user) {
            await supabase.from('cart_items').delete().eq('user_id', user.id);
        } else {
            localStorage.removeItem(LOCAL_STORAGE_KEY);
        }
    }, [user]);

    const cartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);
    const cartTotal = cartItems.reduce((acc, item) => acc + (item.products.price * item.quantity), 0);

    return (
        <CartContext.Provider value={{
            cartItems,
            addToCart,
            removeFromCart,
            updateQuantity,
            clearCart,
            cartCount,
            cartTotal,
            loading
        }}>
            {children}
        </CartContext.Provider>
    );
};

export const useCart = () => {
    const context = useContext(CartContext);
    if (context === undefined) {
        throw new Error('useCart must be used within a CartProvider');
    }
    return context;
};
