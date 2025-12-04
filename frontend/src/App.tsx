import { Route, Routes, Navigate } from "react-router-dom";
import { Provider } from "react-redux";
import { store } from "./store/store";
import { Suspense, lazy } from "react";

// Context Providers
import { AuthProvider, useAuth } from "./context/AuthContext";
import { CartProvider } from "./context/CartContext";
import { ThemeProvider } from "./context/ThemeContext";
import { ToastProvider } from "./context/ToastContext";
import { LoadingProvider } from "./context/LoadingContext";

// Layout Components
import {
  Navbar,
  Footer,
  SearchResults,
  ProtectedRoute,
  ScrollToTop,
} from "./components";
import PageLoader from "./components/PageLoader";

/**
 * ========================================
 * LAZY LOADED PAGES
 * Better performance - loads only when needed
 * ========================================
 */

// Main Pages
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

// Auth Pages
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

/**
 * ========================================
 * APP ROUTES COMPONENT
 * Handles all routing logic
 * ========================================
 */
const AppRoutes = () => {
  const { user, loading } = useAuth();

  // Show loading while checking auth
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading...
      </div>
    );
  }

  // Redirect admin to dashboard
  if (user?.isAdmin && window.location.pathname === "/") {
    return <Navigate to="/admin/dashboard" replace />;
  }

  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          Loading...
        </div>
      }
    >
      <PageLoader>
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
                </Routes>
                <Footer />
              </>
            }
          />
        </Routes>
      </PageLoader>
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
    <Provider store={store}>
      <ThemeProvider>
        <ToastProvider>
          <LoadingProvider>
            <AuthProvider>
              <CartProvider>
                <ScrollToTop />
                <AppRoutes />
              </CartProvider>
            </AuthProvider>
          </LoadingProvider>
        </ToastProvider>
      </ThemeProvider>
    </Provider>
  );
};

export default App;
