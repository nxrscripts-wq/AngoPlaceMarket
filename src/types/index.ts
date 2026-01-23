export type ProductStatus = 'PENDENTE' | 'PUBLICADO' | 'REJEITADO';

export interface UserProfile {
    id: string;
    full_name: string;
    email: string;
    phone?: string;
    province?: string;
    municipality?: string;
    avatar_url?: string;
    is_seller?: boolean;
    is_admin?: boolean;
    is_blocked?: boolean;
    risk_level?: 'low' | 'medium' | 'high';
    created_at?: string;
}

export interface Product {
    id: string;
    name: string;
    price: number;
    description: string;
    category: string;
    sub_category?: string;
    image: string;
    stock: number;
    status: ProductStatus;
    seller_id: string;
    created_at: string;
    location?: string;
    seller_province?: string;
    seller_municipality?: string;
    is_flash_deal: boolean;
    rejection_reason?: string;
    needs_adjustment?: boolean;
    adjustment_notes?: string;
    old_price?: number;
    rating: number;
    sales: number;
    is_international: boolean;
    profiles?: UserProfile;
}

export interface Order {
    id: string;
    user_id: string;
    total: number;
    total_amount?: number;
    status: string;
    created_at: string;
    profiles?: UserProfile;
    order_items?: OrderItem[];
}

export interface OrderItem {
    id: string;
    order_id: string;
    product_id: string;
    product_name: string;
    product_price: number;
    quantity: number;
    products?: Product;
}

export interface CartItem {
    id: string;
    user_id: string;
    product_id: string;
    quantity: number;
    products: Product;
}

export interface WishlistItem {
    id: string;
    user_id: string;
    product_id: string;
    products: Product;
}

export interface Notification {
    id: string;
    user_id: string;
    title: string;
    message: string;
    type: string;
    read: boolean;
    created_at: string;
}

export interface TrackingStep {
    title: string;
    date: string;
    completed: boolean;
    current?: boolean;
    icon: React.ElementType;
}

export interface TrackingData {
    id: string;
    status: string;
    last_update: string;
    steps: TrackingStep[];
}
export interface FraudAlert {
    id: string;
    user_id: string;
    description: string;
    severity: 'low' | 'medium' | 'high';
    status: 'pending' | 'resolved';
    created_at: string;
    profiles?: UserProfile;
}

export interface MarketplaceSetting {
    key: string;
    value: any;
    updated_at: string;
}
