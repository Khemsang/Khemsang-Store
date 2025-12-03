import { Route, Routes, Navigate } from "react-router-dom";
import { Provider } from "react-redux";
import { store } from "./store/store";
import { Suspense } from "react";

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
import PageLoader from "./components/PageLoader";

// Lazy load pages for better performance
import { lazy } from "react";

// Main Pages - Lazy loaded
const Home = lazy(() => import("./pages/main/Home"));
const Products = lazy(() => import("./pages/main/Products"));
const Gallery = lazy(() => import("./pages/main/Gallery"));
const About = lazy(() => import("./pages/main/About"));
const Contact = lazy(() => import("./pages/main/Contact"));
const FAQ = lazy(() => import("./pages/main/FAQ"));
const Cart = lazy(() => import("./pages/main/Cart"));
const Checkout = lazy(() => import("./pages/main/Checkout"));
const Orders = lazy(() => import("./pages/main/Orders"));
const ProductDetailsPage = lazy(
  () => import("./pages/main/ProductDetailsPage")
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

// Auth Pages - Lazy loaded
const Login = lazy(() => import("./pages/auth/login"));
const Signup = lazy(() => import("./pages/auth/signup"));
const Dashboard = lazy(() => import("./pages/auth/Dashboard"));
const VerifyEmail = lazy(() => import("./pages/auth/VerifyEmail"));

// Admin Pages - Lazy loaded
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
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          Loading...
        </div>
      }
    >
      <PageLoader>
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
