import { useState } from "react";
import {
  FaTimes,
  FaTachometerAlt,
  FaBox,
  FaImages,
  FaInfoCircle,
  FaEnvelope,
  FaUser,
  FaShoppingCart,
  FaSignOutAlt,
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import logo from "../../../assets/images/logo/logo.png";
import { useAuth } from "../../../context/AuthContext";
import { useCart } from "../../../context/CartContext";
import DarkModeToggle from "../../common/DarkModeToggle";
import ConfirmDialog from "../../common/ConfirmDialog";

type ResponsiveMenuProps = {
  showMenu: boolean;
  onClose: () => void;
};

const ResponsiveMenu = ({ showMenu, onClose }: ResponsiveMenuProps) => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { cart } = useCart();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const cartItemCount = cart.reduce((t, i) => t + i.quantity, 0);

  const navLinks = [
    // Only show Dashboard link for admin users
    ...(user?.isAdmin
      ? [
          {
            name: "Dashboard",
            path: "/admin/dashboard",
            icon: FaTachometerAlt,
          },
        ]
      : []),
    { name: "Products", path: "/products", icon: FaBox },
    { name: "Gallery", path: "/gallery", icon: FaImages },
    { name: "About", path: "/about", icon: FaInfoCircle },
    { name: "Contact", path: "/contact", icon: FaEnvelope },
  ];

  const handleNavigation = (path: string) => {
    navigate(path);
    onClose();
  };

  const handleLogoutClick = () => {
    setShowLogoutConfirm(true);
  };

  const confirmLogout = async () => {
    setShowLogoutConfirm(false);
    await logout();
    navigate("/");
    onClose();
  };

  return (
    <div
      className={`fixed top-0 left-0 w-full h-screen bg-black/50 backdrop-blur-sm z-50 transition-all duration-300 ${
        showMenu ? "opacity-100 visible" : "opacity-0 invisible"
      }`}
      onClick={onClose}
    >
      <div
        className={`fixed top-0 left-0 w-[280px] h-screen bg-white dark:bg-gray-900 shadow-2xl transition-transform duration-300 ${
          showMenu ? "translate-x-0" : "-translate-x-full"
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <img src={logo} alt="Logo" className="h-10" />
            <span className="font-bold text-gray-900 dark:text-white">
              Menu
            </span>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-red-500 hover:text-white transition-colors"
          >
            <FaTimes />
          </button>
        </div>

        {/* User Profile Section */}
        {user && (
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-[var(--root-color)]/10 to-purple-600/10 rounded-xl">
              <div className="w-12 h-12 bg-gradient-to-r from-[var(--root-color)] to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                {user.name?.charAt(0)?.toUpperCase() || 'U'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-gray-900 dark:text-white truncate">
                  {user.name}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                  {user.email}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Navigation Links */}
        <nav className="p-4 flex-1 overflow-y-auto">
          <ul className="space-y-2">
            {navLinks.map(({ name, path, icon: Icon }) => (
              <li key={name}>
                <button
                  onClick={() => handleNavigation(path)}
                  className="w-full flex items-center gap-4 px-4 py-3 rounded-xl text-gray-700 dark:text-gray-300 hover:bg-gradient-to-r hover:from-[var(--root-color)]/20 hover:to-purple-600/20 hover:text-[var(--root-color)] transition-all"
                >
                  <Icon className="text-xl" />
                  <span className="font-medium">{name}</span>
                </button>
              </li>
            ))}

            {/* Cart */}
            <li>
              <button
                onClick={() => handleNavigation("/cart")}
                className="w-full flex items-center gap-4 px-4 py-3 rounded-xl text-gray-700 dark:text-gray-300 hover:bg-gradient-to-r hover:from-[var(--root-color)]/20 hover:to-purple-600/20 hover:text-[var(--root-color)] transition-all"
              >
                <FaShoppingCart className="text-xl" />
                <span className="font-medium">Cart</span>
                {cartItemCount > 0 && (
                  <span className="ml-auto bg-red-500 text-white text-xs rounded-full h-6 w-6 flex items-center justify-center font-bold">
                    {cartItemCount}
                  </span>
                )}
              </button>
            </li>

            {/* User Actions */}
            {user ? (
              <>
                <li>
                  <button
                    onClick={handleLogoutClick}
                    className="w-full flex items-center gap-4 px-4 py-3 rounded-xl text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all"
                  >
                    <FaSignOutAlt className="text-xl" />
                    <span className="font-medium">Logout</span>
                  </button>
                </li>
              </>
            ) : (
              <li>
                <button
                  onClick={() => handleNavigation("/login")}
                  className="w-full flex items-center gap-4 px-4 py-3 rounded-xl bg-gradient-to-r from-[var(--root-color)] to-purple-600 text-white hover:shadow-lg transition-all"
                >
                  <FaUser className="text-xl" />
                  <span className="font-medium">Login</span>
                </button>
              </li>
            )}

            {/* Dark Mode Toggle */}
            <li className="pt-4 border-t border-gray-200 dark:border-gray-700">
              <div className="px-4 py-2">
                <DarkModeToggle />
              </div>
            </li>
          </ul>
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-700">
          <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
            © 2024 Khemsang Store
          </p>
        </div>
      </div>

      {/* Logout Confirmation Dialog */}
      <ConfirmDialog
        isOpen={showLogoutConfirm}
        title="Confirm Logout"
        message="Are you sure you want to logout? You will need to login again to access your account."
        confirmText="Yes, Logout"
        cancelText="Cancel"
        type="warning"
        onConfirm={confirmLogout}
        onCancel={() => setShowLogoutConfirm(false)}
      />
    </div>
  );
};

export default ResponsiveMenu;
