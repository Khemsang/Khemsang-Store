import { useState } from "react";
import { Outlet, Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { ConfirmDialog, DarkModeToggle } from "../../components/common";
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
} from "react-icons/fa";

const AdminLayout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [showMobileMenu, setShowMobileMenu] = useState(false);

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
    { name: "Inventory", path: "/admin/inventory", icon: FaWarehouse },
    { name: "Orders", path: "/admin/orders", icon: FaShoppingBag },
    { name: "Shipping", path: "/admin/shipping", icon: FaTruck },
    { name: "Customers", path: "/admin/customers", icon: FaUsers },
    { name: "Categories", path: "/admin/categories", icon: FaTh },
    { name: "Coupons", path: "/admin/coupons", icon: FaTicketAlt },
    { name: "Reviews", path: "/admin/reviews", icon: FaStar },
    { name: "View Site", path: "/", icon: FaEye },
  ];

  // Links only for Super Admin
  const superAdminOnlyLinks = [
    { name: "Banners", path: "/admin/banners", icon: FaImage },
    { name: "About Page", path: "/admin/about", icon: FaInfoCircle },
    { name: "Brands", path: "/admin/brands", icon: FaTrademark },
    { name: "Contact", path: "/admin/contact", icon: FaEnvelope },
    { name: "Testimonials", path: "/admin/testimonials", icon: FaQuoteLeft },
    { name: "Manage Admins", path: "/admin/super-admin", icon: FaShieldAlt },
  ];

  const adminLinks = [
    ...commonLinks,
    ...(user?.isSuperAdmin ? superAdminOnlyLinks : []),
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 flex">
      {/* Sidebar - Desktop */}
      <aside
        className={`hidden lg:flex flex-col fixed left-0 top-0 h-screen bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 shadow-xl transition-all duration-300 z-50 ${
          sidebarOpen ? "w-64" : "w-20"
        }`}
      >
        {/* Sidebar Header */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-r from-[var(--root-color)] to-purple-600 rounded-xl flex items-center justify-center flex-shrink-0">
                <span className="text-white font-bold text-xl">A</span>
              </div>
              {sidebarOpen && (
                <h1 className="text-lg font-bold bg-gradient-to-r from-[var(--root-color)] to-purple-600 bg-clip-text text-transparent">
                  Admin Panel
                </h1>
              )}
            </div>
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <FaChevronLeft
                className={`text-gray-600 dark:text-gray-400 transition-transform ${
                  !sidebarOpen ? "rotate-180" : ""
                }`}
              />
            </button>
          </div>
        </div>

        {/* Sidebar Navigation */}
        <nav className="flex-1 overflow-y-auto p-4">
          <div className="space-y-2">
            {adminLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium ${
                  isActive(link.path)
                    ? "bg-gradient-to-r from-[var(--root-color)] to-purple-600 text-white shadow-lg"
                    : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                }`}
              >
                <link.icon className="text-lg flex-shrink-0" />
                {sidebarOpen && <span>{link.name}</span>}
              </Link>
            ))}
          </div>
        </nav>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-700 space-y-2">
          {sidebarOpen && (
            <div className="flex items-center gap-3 px-4 py-3 bg-gray-100 dark:bg-gray-700 rounded-xl mb-2">
              <div className="w-10 h-10 bg-gradient-to-r from-[var(--root-color)] to-purple-600 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0">
                {user?.name.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-gray-900 dark:text-white text-sm truncate">
                  {user?.name}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                  {user?.email}
                </p>
              </div>
            </div>
          )}
          <div className="flex items-center gap-2">
            <DarkModeToggle />
            <button
              onClick={handleLogoutClick}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all font-medium border border-red-200 dark:border-red-800 ${
                sidebarOpen ? "flex-1" : "w-full justify-center"
              }`}
            >
              <FaSignOutAlt />
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
                <div className="w-10 h-10 bg-gradient-to-r from-[var(--root-color)] to-purple-600 rounded-xl flex items-center justify-center">
                  <span className="text-white font-bold text-xl">A</span>
                </div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-[var(--root-color)] to-purple-600 bg-clip-text text-transparent">
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
                  <div className="w-12 h-12 bg-gradient-to-r from-[var(--root-color)] to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
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
                      className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all font-medium ${
                        isActive(link.path)
                          ? "bg-gradient-to-r from-[var(--root-color)] to-purple-600 text-white"
                          : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                      }`}
                    >
                      <link.icon className="text-lg" />
                      <span>{link.name}</span>
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
        <main className="flex-1 p-4 sm:p-6 lg:p-8">
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
