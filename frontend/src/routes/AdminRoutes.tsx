import { lazy } from "react";
import { Route } from "react-router-dom";
import ProtectedRoute from "../components/layout/ProtectedRoute";

const AdminLayout = lazy(() => import("../pages/admin/AdminLayout"));
const AdminDashboard = lazy(() => import("../pages/admin/AdminDashboard"));
const AdminProducts = lazy(() => import("../pages/admin/AdminProducts"));
const AdminFeaturedProducts = lazy(() => import("../pages/admin/AdminFeaturedProducts"));
const AdminFlashSales = lazy(() => import("../pages/admin/AdminFlashSales"));
const AdminOrders = lazy(() => import("../pages/admin/AdminOrders"));
const AdminInbox = lazy(() => import("../pages/admin/AdminInbox"));
const AdminCategories = lazy(() => import("../pages/admin/AdminCategories"));
const AdminBanners = lazy(() => import("../pages/admin/AdminBanners"));
const AdminAbout = lazy(() => import("../pages/admin/AdminAbout"));
const AdminContact = lazy(() => import("../pages/admin/AdminContact"));
const AdminBrands = lazy(() => import("../pages/admin/AdminBrands"));
const AdminCoupons = lazy(() => import("../pages/admin/AdminCoupons"));
const AdminCustomers = lazy(() => import("../pages/admin/AdminCustomers"));
const AdminInventory = lazy(() => import("../pages/admin/AdminInventory"));
const AdminShipping = lazy(() => import("../pages/admin/AdminShipping"));
const AdminFeatures = lazy(() => import("../pages/admin/AdminFeatures"));
const AdminReviews = lazy(() => import("../pages/admin/AdminReviews"));
const AdminTestimonials = lazy(() => import("../pages/admin/AdminTestimonials"));
const SuperAdminDashboard = lazy(() => import("../pages/admin/SuperAdminDashboard"));

const AdminRoutes = () => (
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
    <Route path="flash-sales" element={<AdminFlashSales />} />
    <Route path="orders" element={<AdminOrders />} />
    <Route path="inbox" element={<AdminInbox />} />
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
);

export default AdminRoutes;
