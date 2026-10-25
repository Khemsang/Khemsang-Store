import { lazy } from "react";
import { Route } from "react-router-dom";
import ProtectedRoute from "../components/layout/ProtectedRoute";
import MainLayout from "../components/layout/MainLayout";
import SearchResults from "../components/sections/SearchResults/SearchResults";

const Home = lazy(() => import("../pages/main/home"));
const Products = lazy(() => import("../pages/main/products"));
const Gallery = lazy(() => import("../pages/main/gallary"));
const About = lazy(() => import("../pages/main/about"));
const Contact = lazy(() => import("../pages/main/contact"));
const FAQ = lazy(() => import("../pages/main/FAQ"));
const Cart = lazy(() => import("../pages/main/Cart"));
const Checkout = lazy(() => import("../pages/main/Checkout"));
const Orders = lazy(() => import("../pages/main/Orders"));
const Profile = lazy(() => import("../pages/main/Profile"));
const Dashboard = lazy(() => import("../pages/auth/Dashboard"));
const Wishlist = lazy(() => import("../pages/main/Wishlist"));
const ProductDetailsPage = lazy(() => import("../pages/main/ProductDetailsPage "));
const FeaturedProductDetails = lazy(() => import("../pages/main/FeaturedProductDetails"));
const AllFeaturedProducts = lazy(() => import("../pages/main/AllFeaturedProducts"));
const FlashSales = lazy(() => import("../pages/main/FlashSales"));
const OrderTracking = lazy(() => import("../pages/main/OrderTracking"));
const SubmitTestimonial = lazy(() => import("../pages/main/SubmitTestimonial"));
const FurnitureDoorPage = lazy(() => import("../pages/main/furniture"));
const Brands = lazy(() => import("../pages/main/Brands"));
const Categories = lazy(() => import("../pages/main/Categories"));
const Deals = lazy(() => import("../pages/main/Deals"));
const NewArrivals = lazy(() => import("../pages/main/NewArrivals"));
const BestSellers = lazy(() => import("../pages/main/BestSellers"));
const HelpCenter = lazy(() => import("../pages/main/HelpCenter"));
const ReturnPolicy = lazy(() => import("../pages/main/ReturnPolicy"));
const ShippingInfo = lazy(() => import("../pages/main/ShippingInfo"));
const Compare = lazy(() => import("../pages/main/Compare"));
const PrivacyPolicy = lazy(() => import("../pages/main/PrivacyPolicy"));
const TermsOfService = lazy(() => import("../pages/main/TermsOfService"));
const Sitemap = lazy(() => import("../pages/main/Sitemap"));

const MainRoutes = () => (
  <Route element={<MainLayout />}>
    {/* Public */}
    <Route path="/" element={<Home />} />
    <Route path="/products" element={<Products />} />
    <Route path="/gallery" element={<Gallery />} />
    <Route path="/about" element={<About />} />
    <Route path="/contact" element={<Contact />} />
    <Route path="/faq" element={<FAQ />} />
    <Route path="/search" element={<SearchResults />} />
    <Route path="/furniture" element={<FurnitureDoorPage />} />
    <Route path="/submit-testimonial" element={<SubmitTestimonial />} />

    {/* Products & collections */}
    <Route path="/product/:id" element={<ProductDetailsPage />} />
    <Route path="/featured/:id" element={<FeaturedProductDetails />} />
    <Route path="/featured-products" element={<AllFeaturedProducts />} />
    <Route path="/cart" element={<Cart />} />
    <Route path="/flash-sales" element={<FlashSales />} />
    <Route path="/wishlist" element={<Wishlist />} />
    <Route path="/order/:id" element={<OrderTracking />} />
    <Route path="/track" element={<OrderTracking />} />
    <Route path="/brands" element={<Brands />} />
    <Route path="/categories" element={<Categories />} />
    <Route path="/deals" element={<Deals />} />
    <Route path="/new-arrivals" element={<NewArrivals />} />
    <Route path="/best-sellers" element={<BestSellers />} />
    <Route path="/compare" element={<Compare />} />

    {/* Support & legal */}
    <Route path="/help" element={<HelpCenter />} />
    <Route path="/return-policy" element={<ReturnPolicy />} />
    <Route path="/shipping-info" element={<ShippingInfo />} />
    <Route path="/privacy-policy" element={<PrivacyPolicy />} />
    <Route path="/terms-of-service" element={<TermsOfService />} />
    <Route path="/sitemap" element={<Sitemap />} />

    {/* Protected */}
    <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
    <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
    <Route path="/checkout" element={<ProtectedRoute><Checkout /></ProtectedRoute>} />
    <Route path="/orders" element={<ProtectedRoute><Orders /></ProtectedRoute>} />
  </Route>
);

export default MainRoutes;
