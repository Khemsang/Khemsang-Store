import { Route, Routes, Navigate } from "react-router-dom";
import { Provider } from "react-redux";
import { store } from "./store";
import { Suspense, lazy, useEffect, useState } from "react";

import { AuthProvider, useAuth } from "./context/AuthContext";
import { CartProvider } from "./context/CartContext";
import { ThemeProvider } from "./context/ThemeContext";
import { ToastProvider } from "./context/ToastContext";
import { LoadingProvider } from "./context/LoadingContext";

import Navbar from "./components/layout/Navbar/Navbar";
import Footer from "./components/layout/Footer/Footer";
import SearchResults from "./components/sections/SearchResults/SearchResults";
import ProtectedRoute from "./components/layout/ProtectedRoute";
import ScrollToTop from "./components/common/ScrollToTop";
import PageLoader from "./components/PageLoader";
import BackToTop from "./components/ui/BackToTop";
import ErrorBoundary from "./components/ErrorBoundary";
import { api } from "./services/api";
const Home = lazy(() => import("./pages/main/home"));
const Products = lazy(() => import("./pages/main/products"));
const Gallery = lazy(() => import("./pages/main/gallary"));
const About = lazy(() => import("./pages/main/about"));
const Contact = lazy(() => import("./pages/main/contact"));
const FAQ = lazy(() => import("./pages/main/FAQ"));
const Cart = lazy(() => import("./pages/main/Cart"));
const Checkout = lazy(() => import("./pages/main/Checkout"));
const Orders = lazy(() => import("./pages/main/Orders"));
const ProductDetailsPage = lazy(
  () => import("./pages/main/ProductDetailsPage ")
);
const FeaturedProductDetails = lazy(
  () => import("./pages/main/FeaturedProductDetails")
);
const AllFeaturedProducts = lazy(
  () => import("./pages/main/AllFeaturedProducts")
);
const PaymentSuccess = lazy(() => import("./pages/main/PaymentSuccess"));
const PaymentFailed = lazy(() => import("./pages/main/PaymentFailed"));
const VerifyOTP = lazy(() => import("./pages/main/VerifyOTP"));
const PrivacyPolicy = lazy(() => import("./pages/main/PrivacyPolicy"));
const TermsOfService = lazy(() => import("./pages/main/TermsOfService"));
const Sitemap = lazy(() => import("./pages/main/Sitemap"));
const SubmitTestimonial = lazy(() => import("./pages/main/SubmitTestimonial"));
const Profile = lazy(() => import("./pages/main/Profile"));
const FurnitureDoorPage = lazy(() => import("./pages/main/furniture"));
const MaintenancePage = lazy(() => import("./pages/main/MaintenancePage"));

const Login = lazy(() => import("./pages/auth/login"));
const Signup = lazy(() => import("./pages/auth/signup"));
const Dashboard = lazy(() => import("./pages/auth/Dashboard"));
const VerifyEmail = lazy(() => import("./pages/auth/VerifyEmail"));
const ForgotPassword = lazy(() => import("./pages/auth/ForgotPassword"));
const ResetPassword = lazy(() => import("./pages/auth/ResetPassword"));

// Admin Pages
const AdminLayout = lazy(() => import("./pages/admin/AdminLayout"));
const AdminDashboard = lazy(() => import("./pages/admin/AdminDashboard"));
const AdminProducts = lazy(() => import("./pages/admin/AdminProducts"));
const AdminFeaturedProducts = lazy(
  () => import("./pages/admin/AdminFeaturedProducts")
);
const AdminOrders = lazy(() => import("./pages/admin/AdminOrders"));
const AdminCategories = lazy(() => import("./pages/admin/AdminCategories"));
const AdminBanners = lazy(() => import("./pages/admin/AdminBanners"));
const AdminAbout = lazy(() => import("./pages/admin/AdminAbout"));
const AdminContact = lazy(() => import("./pages/admin/AdminContact"));
const AdminBrands = lazy(() => import("./pages/admin/AdminBrands"));
const AdminCoupons = lazy(() => import("./pages/admin/AdminCoupons"));
const AdminCustomers = lazy(() => import("./pages/admin/AdminCustomers"));
const AdminInventory = lazy(() => import("./pages/admin/AdminInventory"));
const AdminShipping = lazy(() => import("./pages/admin/AdminShipping"));
const AdminFeatures = lazy(() => import("./pages/admin/AdminFeatures"));
const AdminReviews = lazy(() => import("./pages/admin/AdminReviews"));
const AdminTestimonials = lazy(() => import("./pages/admin/AdminTestimonials"));
const SuperAdminDashboard = lazy(
  () => import("./pages/admin/SuperAdminDashboard")
);
const Wishlist = lazy(() => import("./pages/main/Wishlist"));
const OrderTracking = lazy(() => import("./pages/main/OrderTracking"));

// New User Pages
const Brands = lazy(() => import("./pages/main/Brands"));
const Categories = lazy(() => import("./pages/main/Categories"));
const TrackOrder = lazy(() => import("./pages/main/OrderTracking"));
const Deals = lazy(() => import("./pages/main/Deals"));
const NewArrivals = lazy(() => import("./pages/main/NewArrivals"));
const BestSellers = lazy(() => import("./pages/main/BestSellers"));
const HelpCenter = lazy(() => import("./pages/main/HelpCenter"));
const ReturnPolicy = lazy(() => import("./pages/main/ReturnPolicy"));
const ShippingInfo = lazy(() => import("./pages/main/ShippingInfo"));
const Compare = lazy(() => import("./pages/main/Compare"));

/**
 * ========================================
 * APP ROUTES COMPONENT
 * Handles all routing logic
 * ========================================
 */
const AppRoutes = () => {
  const { user, loading } = useAuth();
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [maintenanceMessage, setMaintenanceMessage] = useState("");
  const [checkingMaintenance, setCheckingMaintenance] = useState(true);

  // Check maintenance status
  useEffect(() => {
    const checkMaintenance = async () => {
      try {
        const res = await api.get("/admin-management/maintenance-status");
        setMaintenanceMode(res.data.maintenanceMode);
        setMaintenanceMessage(res.data.maintenanceMessage);
      } catch (err) {
      } finally {
        setCheckingMaintenance(false);
      }
    };
    checkMaintenance();
  }, []);

  // Show loading while checking auth or maintenance
  if (loading || checkingMaintenance) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-white via-blue-50/30 to-orange-50/30 dark:from-gray-900 dark:via-blue-900/10 dark:to-gray-900">
        <div className="text-center">
          {/* Modern e-commerce loader */}
          <div className="relative w-32 h-32 mx-auto mb-8">
            {/* Outer rotating gradient ring */}
            <div className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-500 via-purple-500 to-orange-500 animate-spin" style={{ animationDuration: '2s' }}></div>
            <div className="absolute inset-1 rounded-full bg-white dark:bg-gray-900"></div>
            
            {/* Inner counter-rotating ring */}
            <div className="absolute inset-4 rounded-full border-4 border-transparent border-t-blue-600 border-r-orange-600 animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}></div>
            
            {/* Center shopping bag icon */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="bg-gradient-to-br from-blue-600 to-orange-600 p-5 rounded-2xl shadow-2xl">
                <svg className="w-10 h-10 text-white animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
              </div>
            </div>
          </div>
          
          <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-orange-600 bg-clip-text text-transparent mb-3">
            Loading Store
          </h2>
          <p className="text-gray-600 dark:text-gray-400 font-medium mb-6">
            Please wait while we prepare everything...
          </p>
          
          {/* Animated progress dots */}
          <div className="flex justify-center gap-2">
            <div className="w-3 h-3 bg-blue-600 rounded-full animate-bounce shadow-lg" style={{ animationDelay: "0ms" }}></div>
            <div className="w-3 h-3 bg-purple-600 rounded-full animate-bounce shadow-lg" style={{ animationDelay: "150ms" }}></div>
            <div className="w-3 h-3 bg-orange-600 rounded-full animate-bounce shadow-lg" style={{ animationDelay: "300ms" }}></div>
          </div>
        </div>
      </div>
    );
  }

  // Show maintenance page for non-super-admin users
  if (maintenanceMode && !user?.isSuperAdmin) {
    return (
      <Suspense fallback={<div className="min-h-screen bg-purple-900" />}>
        <MaintenancePage message={maintenanceMessage} />
      </Suspense>
    );
  }

  // Redirect admin to dashboard immediately if they're on non-admin pages
  if (user?.isAdmin) {
    const isAdminRoute = window.location.pathname.startsWith("/admin");
    const isAuthRoute = ["/login", "/verify-otp", "/signup", "/forgot-password", "/reset-password"].includes(window.location.pathname);
    
    if (!isAdminRoute && !isAuthRoute) {
      return <Navigate to="/admin/dashboard" replace />;
    }
  }

  return (
    <Suspense
      fallback={
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-white via-blue-50/30 to-orange-50/30 dark:from-gray-900 dark:via-blue-900/10 dark:to-gray-900">
          <div className="text-center">
            {/* Modern e-commerce page loader */}
            <div className="relative w-28 h-28 mx-auto mb-8">
              {/* Outer rotating gradient ring */}
              <div className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-500 to-orange-500 animate-spin" style={{ animationDuration: '1.5s' }}></div>
              <div className="absolute inset-1 rounded-full bg-white dark:bg-gray-900"></div>
              
              {/* Inner pulsing ring */}
              <div className="absolute inset-3 rounded-full border-4 border-transparent border-t-blue-600 border-b-orange-600 animate-spin" style={{ animationDirection: 'reverse' }}></div>
              
              {/* Center icon */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="bg-gradient-to-br from-blue-600 to-orange-600 p-4 rounded-xl shadow-xl">
                  <svg className="w-8 h-8 text-white animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                  </svg>
                </div>
              </div>
            </div>
            
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
              Loading page...
            </h3>
            <div className="flex justify-center gap-2 mt-4">
              <div className="w-2.5 h-2.5 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: "0ms" }}></div>
              <div className="w-2.5 h-2.5 bg-orange-600 rounded-full animate-bounce" style={{ animationDelay: "150ms" }}></div>
              <div className="w-2.5 h-2.5 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: "300ms" }}></div>
            </div>
          </div>
        </div>
      }
    >
      <Routes>
          {/* ========== ADMIN ROUTES ========== */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute adminOnly>
                <AdminLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<AdminDashboard />} />
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="products" element={<AdminProducts />} />
            <Route
              path="featured-products"
              element={<AdminFeaturedProducts />}
            />
            <Route path="orders" element={<AdminOrders />} />
            <Route path="categories" element={<AdminCategories />} />
            <Route path="banners" element={<AdminBanners />} />
            <Route path="about" element={<AdminAbout />} />
            <Route path="contact" element={<AdminContact />} />
            <Route path="brands" element={<AdminBrands />} />
            <Route path="coupons" element={<AdminCoupons />} />
            <Route path="customers" element={<AdminCustomers />} />
            <Route path="inventory" element={<AdminInventory />} />
            <Route path="shipping" element={<AdminShipping />} />
            <Route path="features" element={<AdminFeatures />} />
            <Route path="reviews" element={<AdminReviews />} />
            <Route path="testimonials" element={<AdminTestimonials />} />
            <Route path="super-admin" element={<SuperAdminDashboard />} />
          </Route>

          {/* ========== AUTH ROUTES ========== */}
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/verify-email" element={<VerifyEmail />} />
          <Route path="/verify-otp" element={<VerifyOTP />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />

          {/* ========== PAYMENT ROUTES ========== */}
          <Route path="/payment/success" element={<PaymentSuccess />} />
          <Route path="/payment/failed" element={<PaymentFailed />} />

          {/* ========== USER ROUTES (with Navbar & Footer) ========== */}
          <Route
            path="/*"
            element={
              <>
                <Navbar />
                <Routes>
                  {/* Public Pages */}
                  <Route path="/" element={<Home />} />
                  <Route path="/products" element={<Products />} />
                  <Route path="/gallery" element={<Gallery />} />
                  <Route path="/about" element={<About />} />
                  <Route path="/contact" element={<Contact />} />
                  <Route path="/faq" element={<FAQ />} />
                  <Route
                    path="/submit-testimonial"
                    element={<SubmitTestimonial />}
                  />
                  <Route path="/search" element={<SearchResults />} />
                  <Route path="/furniture" element={<FurnitureDoorPage />} />

                  {/* Product Pages */}
                  <Route path="/product/:id" element={<ProductDetailsPage />} />
                  <Route
                    path="/featured/:id"
                    element={<FeaturedProductDetails />}
                  />
                  <Route
                    path="/featured-products"
                    element={<AllFeaturedProducts />}
                  />
                  <Route path="/cart" element={<Cart />} />
                  <Route path="/wishlist" element={<Wishlist />} />
                  <Route path="/order/:id" element={<OrderTracking />} />

                  {/* Protected Pages */}
                  <Route
                    path="/dashboard"
                    element={
                      <ProtectedRoute>
                        <Dashboard />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/profile"
                    element={
                      <ProtectedRoute>
                        <Profile />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/checkout"
                    element={
                      <ProtectedRoute>
                        <Checkout />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/orders"
                    element={
                      <ProtectedRoute>
                        <Orders />
                      </ProtectedRoute>
                    }
                  />

                  {/* Legal Pages */}
                  <Route path="/privacy-policy" element={<PrivacyPolicy />} />
                  <Route
                    path="/terms-of-service"
                    element={<TermsOfService />}
                  />
                  <Route path="/sitemap" element={<Sitemap />} />

                  {/* New Pages */}
                  <Route path="/brands" element={<Brands />} />
                  <Route path="/categories" element={<Categories />} />
                  <Route path="/track" element={<TrackOrder />} />
                  <Route path="/compare" element={<Compare />} />
                  <Route path="/deals" element={<Deals />} />
                  <Route path="/new-arrivals" element={<NewArrivals />} />
                  <Route path="/best-sellers" element={<BestSellers />} />
                  <Route path="/help" element={<HelpCenter />} />
                  <Route path="/return-policy" element={<ReturnPolicy />} />
                  <Route path="/shipping-info" element={<ShippingInfo />} />
                </Routes>
                <Footer />
              </>
            }
          />
        </Routes>
      </Suspense>
  );
};

/**
 * ========================================
 * MAIN APP COMPONENT
 * Wraps everything with providers
 * ========================================
 */
const App = () => {
  return (
    <ErrorBoundary>
      <Provider store={store}>
        <ThemeProvider>
          <ToastProvider>
            <LoadingProvider>
              <AuthProvider>
                <CartProvider>
                  <ScrollToTop />
                  <AppRoutes />
                  <BackToTop />
                </CartProvider>
              </AuthProvider>
            </LoadingProvider>
          </ToastProvider>
        </ThemeProvider>
      </Provider>
    </ErrorBoundary>
  );
};

export default App;
