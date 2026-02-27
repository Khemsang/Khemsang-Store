import { useState, useEffect } from "react";
import { Outlet, Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useMessages } from "../../context/MessageContext";
import { api } from "../../services/api";
import ConfirmDialog from "../../components/common/ConfirmDialog";
import DarkModeToggle from "../../components/common/DarkModeToggle";
import {
  FaBars,
  FaTimes,
  FaTachometerAlt,
  FaBox,
  FaShoppingBag,
  FaTh,
  FaImage,
  FaInfoCircle,
  FaEnvelope,
  FaStar,
  FaEye,
  FaSignOutAlt,
  FaChevronLeft,
  FaTrademark,
  FaTicketAlt,
  FaUsers,
  FaWarehouse,
  FaTruck,
  FaQuoteLeft,
  FaShieldAlt,
  FaInbox,
  FaFire,
} from "react-icons/fa";

const AdminLayout = () => {
  const { user, logout } = useAuth();
  const { unreadCount } = useMessages();
  const navigate = useNavigate();
  const location = useLocation();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [notifications, setNotifications] = useState({
    newOrders: 0,
    pendingReviews: 0,
    pendingTestimonials: 0,
  });

  // Fetch notification counts (excluding unread messages - now from context)
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const statsData = await api.get("/stats/notifications");
        setNotifications(statsData.data);
      } catch (error) {
        console.error("Failed to fetch notifications:", error);
      }
    };

    fetchNotifications();
    // Refresh every 30 seconds
    const interval = setInterval(fetchNotifications, 30000);
    
    return () => {
      clearInterval(interval);
    };
  }, []);

  const handleLogoutClick = () => {
    setShowLogoutConfirm(true);
    setShowMobileMenu(false);
  };

  const confirmLogout = async () => {
    setShowLogoutConfirm(false);
    await logout();
    navigate("/login");
  };

  // Links visible to all admins
  const commonLinks = [
    { name: "Dashboard", path: "/admin/dashboard", icon: FaTachometerAlt },
    { name: "Products", path: "/admin/products", icon: FaBox },
    {
      name: "Featured Products",
      path: "/admin/featured-products",
      icon: FaStar,
    },
    {
      name: "Flash Sales",
      path: "/admin/flash-sales",
      icon: FaFire,
    },
    { name: "Inventory", path: "/admin/inventory", icon: FaWarehouse },
    { name: "Orders", path: "/admin/orders", icon: FaShoppingBag, badge: notifications.newOrders },
    { name: "Inbox", path: "/admin/inbox", icon: FaInbox, badge: unreadCount },
    { name: "Shipping", path: "/admin/shipping", icon: FaTruck },
    { name: "Customers", path: "/admin/customers", icon: FaUsers },
    { name: "Coupons", path: "/admin/coupons", icon: FaTicketAlt },
    { name: "Reviews", path: "/admin/reviews", icon: FaStar, badge: notifications.pendingReviews },
    { name: "View Site", path: "/", icon: FaEye },
  ];

  // Links only for Super Admin
  const superAdminOnlyLinks = [
    { name: "Categories", path: "/admin/categories", icon: FaTh },
    { name: "Banners", path: "/admin/banners", icon: FaImage },
    { name: "About Page", path: "/admin/about", icon: FaInfoCircle },
    { name: "Brands", path: "/admin/brands", icon: FaTrademark },
    { name: "Contact", path: "/admin/contact", icon: FaEnvelope },
    { name: "Testimonials", path: "/admin/testimonials", icon: FaQuoteLeft, badge: notifications.pendingTestimonials },
    { name: "Manage Admins", path: "/admin/super-admin", icon: FaShieldAlt },
  ];

  const adminLinks = [
    ...commonLinks,
    ...(user?.isSuperAdmin ? superAdminOnlyLinks : []),
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="min-h-screen bg-gray-100 dark:from-gray-900 dark:to-gray-800 flex">
      {/* Sidebar - Desktop */}
      <aside
        className={`hidden lg:flex flex-col fixed left-0 top-0 h-screen bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 shadow-xl transition-all duration-300 z-50 ${
          sidebarOpen ? "w-64" : "w-20"
        }`}
      >
        {/* Sidebar Header */}
        <div className="p-3 md:p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 md:gap-3">
              <div className="w-9 h-9 md:w-10 md:h-10 bg-blue-600 rounded-xl flex items-center justify-center flex-shrink-0">
                <span className="text-white font-bold text-lg md:text-xl">A</span>
              </div>
              {sidebarOpen && (
                <h1 className="text-base md:text-lg font-bold bg-blue-600 bg-clip-text text-transparent">
                  Admin Panel
                </h1>
              )}
            </div>
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-1.5 md:p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <FaChevronLeft
                className={`w-4 h-4 text-gray-600 dark:text-gray-400 transition-transform ${
                  !sidebarOpen ? "rotate-180" : ""
                }`}
              />
            </button>
          </div>
        </div>

        {/* Sidebar Navigation */}
        <nav className="flex-1 overflow-y-auto p-3 md:p-4">
          <div className="space-y-1.5 md:space-y-2">
            {adminLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`flex items-center gap-2 md:gap-3 px-3 md:px-4 py-2.5 md:py-3 rounded-lg md:rounded-xl transition-all font-medium relative text-sm md:text-base ${
                  isActive(link.path)
                    ? "bg-blue-600 text-white shadow-lg"
                    : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                }`}
              >
                <link.icon className="text-base md:text-lg flex-shrink-0" />
                {sidebarOpen && (
                  <>
                    <span className="flex-1">{link.name}</span>
                    {link.badge && link.badge > 0 && (
                      <span className="flex items-center justify-center min-w-[18px] md:min-w-[20px] h-4 md:h-5 px-1.5 md:px-2 text-[10px] md:text-xs font-bold bg-red-500 text-white rounded-full">
                        {link.badge > 99 ? '99+' : link.badge}
                      </span>
                    )}
                  </>
                )}
                {!sidebarOpen && link.badge && link.badge > 0 && (
                  <span className="absolute -top-1 -right-1 flex items-center justify-center w-4 h-4 md:w-5 md:h-5 text-[10px] md:text-xs font-bold bg-red-500 text-white rounded-full border-2 border-white dark:border-gray-800">
                    {link.badge > 9 ? '9+' : link.badge}
                  </span>
                )}
              </Link>
            ))}
          </div>
        </nav>

        {/* Sidebar Footer */}
        <div className="p-3 md:p-4 border-t border-gray-200 dark:border-gray-700 space-y-2">
          {sidebarOpen && (
            <div className="flex items-center gap-2 md:gap-3 px-3 md:px-4 py-2.5 md:py-3 bg-gray-100 dark:bg-gray-700 rounded-lg md:rounded-xl mb-2">
              <div className="w-9 h-9 md:w-10 md:h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0 text-sm md:text-base">
                {user?.name.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-gray-900 dark:text-white text-xs md:text-sm truncate">
                  {user?.name}
                </p>
                <p className="text-[10px] md:text-xs text-gray-500 dark:text-gray-400 truncate">
                  {user?.email}
                </p>
              </div>
            </div>
          )}
          <div className="flex items-center gap-2">
            <DarkModeToggle />
            <button
              onClick={handleLogoutClick}
              className={`flex items-center gap-1.5 md:gap-2 px-3 md:px-4 py-2 rounded-lg text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all font-medium border border-red-200 dark:border-red-800 text-sm md:text-base ${
                sidebarOpen ? "flex-1" : "w-full justify-center"
              }`}
            >
              <FaSignOutAlt className="w-3.5 h-3.5 md:w-4 md:h-4" />
              {sidebarOpen && <span>Logout</span>}
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div
        className={`flex-1 flex flex-col ${
          sidebarOpen ? "lg:ml-64" : "lg:ml-20"
        } transition-all duration-300`}
      >
        {/* Top Bar - Mobile */}
        <header className="lg:hidden sticky top-0 z-40 bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl shadow-lg border-b border-gray-200 dark:border-gray-700">
          <div className="px-4 py-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center">
                  <span className="text-white font-bold text-xl">A</span>
                </div>
                <h1 className="text-xl font-bold bg-blue-600 bg-clip-text text-transparent">
                  Admin Panel
                </h1>
              </div>
              <button
                onClick={() => setShowMobileMenu(!showMobileMenu)}
                className="flex items-center justify-center w-10 h-10 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gradient-to-r hover:from-[var(--root-color)] hover:to-purple-600 hover:text-white transition-all"
              >
                {showMobileMenu ? <FaTimes /> : <FaBars />}
              </button>
            </div>

            {/* Mobile Menu */}
            {showMobileMenu && (
              <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-3 p-4 mb-4 bg-gradient-to-r from-[var(--root-color)]/10 to-purple-600/10 rounded-xl">
                  <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                    {user?.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1">
                    <p className="font-bold text-gray-900 dark:text-white">
                      {user?.name}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {user?.email}
                    </p>
                  </div>
                </div>

                <div className="space-y-1 mb-4">
                  {adminLinks.map((link) => (
                    <Link
                      key={link.path}
                      to={link.path}
                      onClick={() => setShowMobileMenu(false)}
                      className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all font-medium relative ${
                        isActive(link.path)
                          ? "bg-blue-600 text-white"
                          : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                      }`}
                    >
                      <link.icon className="text-lg" />
                      <span className="flex-1">{link.name}</span>
                      {link.badge && link.badge > 0 && (
                        <span className="flex items-center justify-center min-w-[20px] h-5 px-2 text-xs font-bold bg-red-500 text-white rounded-full">
                          {link.badge > 99 ? '99+' : link.badge}
                        </span>
                      )}
                    </Link>
                  ))}
                </div>

                <div className="flex items-center gap-2 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <DarkModeToggle />
                  <button
                    onClick={handleLogoutClick}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg text-red-600 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/30 transition-all font-medium border border-red-200 dark:border-red-800"
                  >
                    <FaSignOutAlt />
                    <span>Logout</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </header>

        {/* Main Content */}
        <main className={`flex-1 ${location.pathname === '/admin/inbox' || location.pathname === '/admin/flash-sales' ? '' : 'p-4 sm:p-6 lg:p-8'}`}>
          <Outlet />
        </main>
      </div>

      {/* Logout Confirmation Dialog */}
      <ConfirmDialog
        isOpen={showLogoutConfirm}
        title="Confirm Logout"
        message="Are you sure you want to logout from the admin panel?"
        confirmText="Yes, Logout"
        cancelText="Cancel"
        type="danger"
        onConfirm={confirmLogout}
        onCancel={() => setShowLogoutConfirm(false)}
      />
    </div>
  );
};

export default AdminLayout;
