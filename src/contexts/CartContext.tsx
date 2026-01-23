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
    const { user } = useAuth();
    const [cartItems, setCartItems] = useState<CartItem[]>([]);
    const [loading, setLoading] = useState(true);

    // Initial load
    useEffect(() => {
        const loadCart = async () => {
            setLoading(true);
            if (user) {
                // Load from DB
                const { data, error } = await supabase
                    .from('cart_items')
                    .select('*, products(*)')
                    .eq('user_id', user.id);

                if (!error && data) {
                    setCartItems(data);
                }
            } else {
                // Load from Local Storage
                const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
                if (stored) {
                    try {
                        setCartItems(JSON.parse(stored));
                    } catch (e) {
                        localStorage.removeItem(LOCAL_STORAGE_KEY);
                    }
                }
            }
            setLoading(false);
        };

        loadCart();
    }, [user]);

    // Sync Local Storage -> DB on Login
    useEffect(() => {
        const syncCart = async () => {
            if (!user) return;

            const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
            if (!stored) return;

            const localItems: CartItem[] = JSON.parse(stored);
            if (localItems.length === 0) return;

            try {
                // Insert local items to DB
                // Handle duplicates: logic could be complex, for simplified MVP we insert new ones
                // or update existing. For now, we'll iterate and upsert.

                for (const item of localItems) {
                    // Check if already in DB
                    const { data: existing } = await supabase
                        .from('cart_items')
                        .select('id, quantity')
                        .eq('user_id', user.id)
                        .eq('product_id', item.product_id)
                        .single();

                    if (existing) {
                        // Update quantity
                        await supabase
                            .from('cart_items')
                            .update({ quantity: existing.quantity + item.quantity })
                            .eq('id', existing.id);
                    } else {
                        // Insert new
                        await supabase
                            .from('cart_items')
                            .insert({
                                user_id: user.id,
                                product_id: item.product_id,
                                quantity: item.quantity
                            });
                    }
                }

                // Clear local storage after sync
                localStorage.removeItem(LOCAL_STORAGE_KEY);

                // Refresh cart from DB
                const { data } = await supabase
                    .from('cart_items')
                    .select('*, products(*)')
                    .eq('user_id', user.id);

                if (data) setCartItems(data);
                toast.success('Carrinho sincronizado com sua conta!');

            } catch (error) {
                console.error('Error syncing cart:', error);
            }
        };

        syncCart();
    }, [user]);

    // Save to Local Storage when items change (only for guests)
    useEffect(() => {
        if (!user) {
            localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(cartItems));
        }
    }, [cartItems, user]);

    const addToCart = useCallback(async (product: Product, quantity = 1) => {
        if (user) {
            // DB Logic
            try {
                // Optimistic UI
                const tempId = crypto.randomUUID();
                const newItem: CartItem = {
                    id: tempId,
                    user_id: user.id,
                    product_id: product.id,
                    quantity,
                    created_at: new Date().toISOString(),
                    products: product
                };

                // Check if exists in state to update optimistic
                setCartItems(prev => {
                    const exists = prev.find(p => p.product_id === product.id);
                    if (exists) {
                        return prev.map(p => p.product_id === product.id ? { ...p, quantity: p.quantity + quantity } : p);
                    }
                    return [...prev, newItem];
                });

                // Check DB for existing item
                const { data: existing } = await supabase
                    .from('cart_items')
                    .select('id, quantity')
                    .eq('user_id', user.id)
                    .eq('product_id', product.id)
                    .single();

                if (existing) {
                    const { error } = await supabase
                        .from('cart_items')
                        .update({ quantity: existing.quantity + quantity })
                        .eq('id', existing.id);
                    if (error) throw error;
                } else {
                    const { error, data } = await supabase
                        .from('cart_items')
                        .insert({
                            user_id: user.id,
                            product_id: product.id,
                            quantity
                        })
                        .select()
                        .single();
                    if (error) throw error;
                    // Update ID from DB
                    if (data) {
                        setCartItems(prev => prev.map(p => p.id === tempId ? { ...p, id: data.id } : p));
                    }
                }
                toast.success('Produto adicionado ao carrinho');
            } catch (error) {
                console.error(error);
                toast.error('Erro ao adicionar ao carrinho');
                // Revert state if needed (omitted for MVP brevity, but recommended)
            }
        } else {
            // Local Logic
            setCartItems(prev => {
                const existing = prev.find(item => item.product_id === product.id);
                let newItems;
                if (existing) {
                    newItems = prev.map(item =>
                        item.product_id === product.id
                            ? { ...item, quantity: item.quantity + quantity }
                            : item
                    );
                } else {
                    const newItem: CartItem = {
                        id: crypto.randomUUID(),
                        user_id: 'guest',
                        product_id: product.id,
                        quantity,
                        created_at: new Date().toISOString(),
                        products: product
                    };
                    newItems = [...prev, newItem];
                }
                return newItems;
            });
            toast.success('Produto adicionado ao carrinho');
        }
    }, [user]);

    const removeFromCart = useCallback(async (id: string) => {
        if (user) {
            try {
                // Optimistic
                setCartItems(prev => prev.filter(item => item.id !== id));

                const { error } = await supabase
                    .from('cart_items')
                    .delete()
                    .eq('id', id);

                if (error) throw error;
            } catch (error) {
                toast.error('Erro ao remover item');
                // Revert logic here if needed
            }
        } else {
            setCartItems(prev => prev.filter(item => item.id !== id));
        }
    }, [user]);

    const updateQuantity = useCallback(async (id: string, quantity: number) => {
        if (quantity < 1) return;

        if (user) {
            // Optimistic
            setCartItems(prev => prev.map(item => item.id === id ? { ...item, quantity } : item));

            try {
                const { error } = await supabase
                    .from('cart_items')
                    .update({ quantity })
                    .eq('id', id);
                if (error) throw error;
            } catch (error) {
                toast.error('Erro ao atualizar quantidade');
            }
        } else {
            setCartItems(prev => prev.map(item => item.id === id ? { ...item, quantity } : item));
        }
    }, [user]);

    const clearCart = useCallback(async () => {
        if (user) {
            setCartItems([]);
            await supabase.from('cart_items').delete().eq('user_id', user.id);
        } else {
            setCartItems([]);
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
