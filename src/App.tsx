import { Suspense, lazy } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { LoadingScreen } from "@/components/LoadingScreen";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { Layout } from "./components/Layout";
import { GlobalErrorBoundary } from "@/components/GlobalErrorBoundary";

// Critical Routes (Eager load or lightweight)
import Index from "./pages/Index";
import LoginPage from "./pages/LoginPage";

// Lazy Loaded Routes
const RegisterPage = lazy(() => import("./pages/RegisterPage"));
const ForgotPasswordPage = lazy(() => import("./pages/ForgotPasswordPage"));
const ProfilePage = lazy(() => import("./pages/ProfilePage"));
const ProductDetailsPage = lazy(() => import("./pages/ProductDetailsPage"));
const PublishPage = lazy(() => import("./pages/PublishPage"));
const SellerPage = lazy(() => import("./pages/SellerPage"));
const AdminPage = lazy(() => import("./pages/AdminPage"));
const CategoryPage = lazy(() => import("./pages/CategoryPage"));
const SearchPage = lazy(() => import("./pages/SearchPage"));
const CartPage = lazy(() => import("./pages/CartPage"));
const OrderSuccessPage = lazy(() => import("./pages/OrderSuccessPage"));
const HelpCenterPage = lazy(() => import("./pages/HelpCenterPage"));
const OrdersPage = lazy(() => import("./pages/OrdersPage"));
const ReturnsPage = lazy(() => import("./pages/ReturnsPage"));
const ContactPage = lazy(() => import("./pages/ContactPage"));
const AboutPage = lazy(() => import("./pages/AboutPage"));
const TermsPage = lazy(() => import("./pages/TermsPage"));
const CareersPage = lazy(() => import("./pages/CareersPage"));
const WishlistPage = lazy(() => import("./pages/WishlistPage"));
const TrackOrderPage = lazy(() => import("./pages/TrackOrderPage"));
const HowItWorksPage = lazy(() => import("./pages/HowItWorksPage"));
const ChatPage = lazy(() => import("./pages/ChatPage"));
const NotFound = lazy(() => import("./pages/NotFound"));
const PaymentHistoryPage = lazy(() => import("./pages/PaymentHistoryPage"));
const NotificationsPage = lazy(() => import("./pages/NotificationsPage"));

// ... (in Routes)

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      refetchOnWindowFocus: false,
    },
  },
});

import { CartProvider } from "@/contexts/CartContext";

import { ChatProvider } from "@/contexts/ChatContext";

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <CartProvider>
        <ChatProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <Layout>
                <GlobalErrorBoundary>
                  <Suspense fallback={<LoadingScreen />}>
                    <Routes>
                      <Route path="/login" element={<LoginPage />} />
                      <Route path="/register" element={<RegisterPage />} />
                      <Route path="/forgot-password" element={<ForgotPasswordPage />} />

                      {/* Protected Marketplace Routes */}
                      <Route path="/" element={<ProtectedRoute><Index /></ProtectedRoute>} />
                      <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
                      <Route path="/product/:id" element={<ProtectedRoute><ProductDetailsPage /></ProtectedRoute>} />
                      <Route path="/publish" element={<ProtectedRoute><PublishPage /></ProtectedRoute>} />
                      <Route path="/seller" element={<ProtectedRoute><SellerPage /></ProtectedRoute>} />
                      <Route path="/admin" element={<ProtectedRoute requireAdmin><AdminPage /></ProtectedRoute>} />
                      <Route path="/category/:id" element={<ProtectedRoute><CategoryPage /></ProtectedRoute>} />
                      <Route path="/search" element={<ProtectedRoute><SearchPage /></ProtectedRoute>} />
                      <Route path="/how-it-works" element={<ProtectedRoute><HowItWorksPage /></ProtectedRoute>} />
                      <Route path="/cart" element={<ProtectedRoute><CartPage /></ProtectedRoute>} />
                      <Route path="/order-success" element={<ProtectedRoute><OrderSuccessPage /></ProtectedRoute>} />
                      <Route path="/help" element={<ProtectedRoute><HelpCenterPage /></ProtectedRoute>} />
                      <Route path="/orders" element={<ProtectedRoute><OrdersPage /></ProtectedRoute>} />
                      <Route path="/payments" element={<ProtectedRoute><PaymentHistoryPage /></ProtectedRoute>} />
                      <Route path="/notifications" element={<ProtectedRoute><NotificationsPage /></ProtectedRoute>} />
                      <Route path="/returns" element={<ProtectedRoute><ReturnsPage /></ProtectedRoute>} />
                      <Route path="/contact" element={<ProtectedRoute><ContactPage /></ProtectedRoute>} />
                      <Route path="/about" element={<ProtectedRoute><AboutPage /></ProtectedRoute>} />
                      <Route path="/terms" element={<ProtectedRoute><TermsPage /></ProtectedRoute>} />
                      <Route path="/careers" element={<ProtectedRoute><CareersPage /></ProtectedRoute>} />
                      <Route path="/wishlist" element={<ProtectedRoute><WishlistPage /></ProtectedRoute>} />
                      <Route path="/track" element={<ProtectedRoute><TrackOrderPage /></ProtectedRoute>} />
                      <Route path="/track/:id" element={<ProtectedRoute><TrackOrderPage /></ProtectedRoute>} />

                      <Route path="*" element={<NotFound />} />
                    </Routes>
                  </Suspense>
                </GlobalErrorBoundary>
              </Layout>
            </BrowserRouter>
          </TooltipProvider>
        </ChatProvider>
      </CartProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
