import { Route, Routes, Navigate } from "react-router-dom";
import { Provider } from "react-redux";
import { store } from "./store/store";

// Contexts
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { CartProvider } from "./contexts/CartContext";
import { ThemeProvider } from "./contexts/ThemeContext";
import { ToastProvider } from "./contexts/ToastContext";

// Layout & Common Components
import {
  Navbar,
  Footer,
  SearchResults,
  ProtectedRoute,
  ScrollToTop,
} from "./components";

// Main Pages
import {
  Home,
  Products,
  Gallery,
  About,
  Contact,
  FAQ,
  Cart,
  Checkout,
  Orders,
  ProductDetailsPage,
  FeaturedProductDetails,
  AllFeaturedProducts,
  PaymentSuccess,
  PaymentFailed,
  VerifyOTP,
  PrivacyPolicy,
  TermsOfService,
  Sitemap,
} from "./pages/main";

import SubmitTestimonial from "./pages/main/SubmitTestimonial";
import Profile from "./pages/main/Profile";
import FurnitureDoorPage from "./pages/main/furniture";

// Auth Pages
import { Login, Signup, Dashboard } from "./pages/auth";
import VerifyEmail from "./pages/auth/VerifyEmail";

// Admin Pages
import {
  AdminLayout,
  AdminDashboard,
  AdminProducts,
  AdminFeaturedProducts,
  AdminOrders,
  AdminCategories,
  AdminBanners,
  AdminAbout,
  AdminContact,
} from "./pages/admin";

// ----------------------------------------------------------

const AppRoutes = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading...
      </div>
    );
  }

  // Auto redirect admin from home → admin dashboard
  if (user?.isAdmin && window.location.pathname === "/") {
    return <Navigate to="/admin/dashboard" replace />;
  }

  return (
    <Routes>
      {/* ---------- Admin Routes ---------- */}
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
        <Route path="featured-products" element={<AdminFeaturedProducts />} />
        <Route path="orders" element={<AdminOrders />} />
        <Route path="categories" element={<AdminCategories />} />
        <Route path="banners" element={<AdminBanners />} />
        <Route path="about" element={<AdminAbout />} />
        <Route path="contact" element={<AdminContact />} />
      </Route>

      {/* ---------- Auth Routes ---------- */}
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/verify-email" element={<VerifyEmail />} />
      <Route path="/verify-otp" element={<VerifyOTP />} />

      {/* ---------- Payment Status ---------- */}
      <Route path="/payment/success" element={<PaymentSuccess />} />
      <Route path="/payment/failed" element={<PaymentFailed />} />

      {/* ---------- User Routes (Navbar + Footer) ---------- */}
      <Route
        path="/*"
        element={
          <>
            <Navbar />
            <Routes>
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

              <Route path="/search" element={<SearchResults />} />
              <Route path="/furniture" element={<FurnitureDoorPage />} />

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

              <Route path="/privacy-policy" element={<PrivacyPolicy />} />
              <Route path="/terms-of-service" element={<TermsOfService />} />
              <Route path="/sitemap" element={<Sitemap />} />
            </Routes>

            <Footer />
          </>
        }
      />
    </Routes>
  );
};

// ----------------------------------------------------------

const App = () => {
  return (
    <Provider store={store}>
      <ThemeProvider>
        <ToastProvider>
          <AuthProvider>
            <CartProvider>
              <ScrollToTop />
              <AppRoutes />
            </CartProvider>
          </AuthProvider>
        </ToastProvider>
      </ThemeProvider>
    </Provider>
  );
};

export default App;
