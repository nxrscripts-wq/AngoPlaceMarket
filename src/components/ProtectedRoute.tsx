import { ReactNode, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { LoadingScreen } from './LoadingScreen';

interface ProtectedRouteProps {
    children: ReactNode;
    requireAdmin?: boolean;
}

export const ProtectedRoute = ({ children, requireAdmin = false }: ProtectedRouteProps) => {
    const { user, profile, loading } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        if (!loading && !user) {
            // Redirect to login but save the current location to redirect back after login
            navigate(`/login?redirect=${encodeURIComponent(location.pathname)}`, { replace: true });
        }
    }, [user, loading, navigate, location.pathname]);

    if (loading) {
        return <LoadingScreen />;
    }

    if (!user) {
        return null;
    }

    // Admin check using profile data
    if (requireAdmin && !profile?.is_admin) {
        navigate('/', { replace: true });
        return null;
    }

    return <>{children}</>;
};
