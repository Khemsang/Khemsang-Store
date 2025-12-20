import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from "./Header";
import { logo } from "../../../image";
import { api } from "../../../services/api";
import {
  FaBars,
  FaSearch,
  FaShoppingCart,
  FaUser,
  FaTimes,
  FaTachometerAlt,
  FaBox,
  FaImages,
  FaInfoCircle,
  FaEnvelope,
  FaCouch,
  FaChair,
  FaBed,
  FaDoorOpen,
  FaHeart,
  FaChevronRight,
} from "react-icons/fa";
import ResponsiveMenu from "./Responsive";

import { useAuth } from "../../../context/AuthContext";
import { useCart } from "../../../context/CartContext";
import { DarkModeToggle, ConfirmDialog } from "../../common";

const Navbar: React.FC = () => {
  const [showMenu, setShowMenu] = useState(false);
  const [hoveredMenu, setHoveredMenu] = useState<string | null>(null);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [categories, setCategories] = useState<any[]>([]);

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const navigate = useNavigate();

  const { user, logout } = useAuth();
  const { cart } = useCart();

  const cartItemCount = cart.reduce((t, i) => t + i.quantity, 0);

  // Fetch categories from API
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const { data } = await api.get("/categories");
        setCategories(data);
      } catch (error) {
        console.error("Error fetching categories:", error);
      }
    };
    fetchCategories();
  }, []);

  // Helper to get icon component
  const getIconComponent = (iconName: string) => {
    const icons: any = {
      FaCouch,
      FaChair,
      FaBed,
      FaDoorOpen,
      FaBox,
    };
    return icons[iconName] || FaBox;
  };

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
    {
      name: "Products",
      path: "/products",
      icon: FaBox,
      submenu: categories.map((cat) => ({
        name: cat.name,
        icon: getIconComponent(cat.icon),
      })),
    },
    { name: "Gallery", path: "/gallery", icon: FaImages },
    { name: "About", path: "/about", icon: FaInfoCircle },
    { name: "Contact", path: "/contact", icon: FaEnvelope },
  ];

  // Scroll effect
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 30);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const allSubmenu = navLinks
    .filter((n) => n.submenu)
    .flatMap((n) => n.submenu || []);

  const filteredSubmenu = searchTerm
    ? allSubmenu.filter((i) =>
        i.name.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : [];

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchTerm)}`);
      setShowSearch(false);
      setSearchTerm("");
    }
  };

  const toggleMenu = () => setShowMenu((p) => !p);

  const handleEnter = (name: string) => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setHoveredMenu(name);
  };

  const handleLeave = () => {
    timerRef.current = setTimeout(() => setHoveredMenu(null), 300);
  };

  const goCategory = (name: string) => {
    setShowSearch(false);
    navigate(`/furniture?category=${encodeURIComponent(name)}`);
  };

  const handleLogoutClick = () => {
    setShowProfileMenu(false);
    setShowLogoutConfirm(true);
  };

  const confirmLogout = async () => {
    setShowLogoutConfirm(false);
    await logout();
    navigate("/");
  };

  return (
    <nav
      className={`sticky top-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-white/70 dark:bg-gray-900/70 backdrop-blur-xl shadow-xl"
          : "bg-white dark:bg-gray-900 shadow-md"
      }`}
    >
      {/* Top Header */}
      <div className="bg-gradient-to-r from-[var(--root-color)] to-purple-600 text-white text-sm py-2">
        <div className="container px-4">
          <Header />
        </div>
      </div>

      {/* Main Navbar */}
      <div className="container px-4">
        <div className="flex justify-between items-center py-4">
          {/* Logo */}
          <div
            className="flex items-center gap-3 cursor-pointer group"
            onClick={() => navigate("/")}
          >
            <img
              src={logo}
              alt="Logo"
              className="h-12 md:h-14 transform group-hover:scale-105 transition-transform duration-300"
            />
            <div className="hidden md:block">
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                Khemsang Store
              </h1>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Quality & Style
              </p>
            </div>
          </div>

          {/* Desktop Nav Links */}
          <ul className="hidden lg:flex items-center gap-1">
            {navLinks.map(({ name, path, icon: Icon, submenu }) => (
              <li
                key={name}
                className="relative"
                onMouseEnter={() => handleEnter(name)}
                onMouseLeave={handleLeave}
              >
                <a
                  href={path}
                  className="flex items-center gap-3 px-6 py-3 rounded-xl text-gray-700 dark:text-gray-300 hover:text-[var(--root-color)] hover:bg-gray-100/70 dark:hover:bg-gray-800/70 transition-all duration-300 font-medium"
                >
                  {Icon && <Icon className="text-lg" />}
                  {name}
                </a>

                {/* Submenu */}
                {submenu && hoveredMenu === name && (
                  <div className="absolute top-full mt-2 left-0 w-72 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl shadow-2xl overflow-hidden animate-fadeIn z-50">
                    {/* Header */}
                    <div className="px-4 py-3 bg-gradient-to-r from-[var(--root-color)]/10 to-purple-600/10 border-b border-gray-100 dark:border-gray-700">
                      <p className="text-sm font-semibold text-gray-900 dark:text-white">
                        Shop by Category
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {submenu.length} categories available
                      </p>
                    </div>
                    {/* Categories Grid */}
                    <div className="p-2 max-h-80 overflow-y-auto">
                      {submenu.map(({ name: sub, icon: SubIcon }) => (
                        <button
                          key={sub}
                          onClick={() => goCategory(sub)}
                          className="w-full flex items-center gap-3 px-3 py-2.5 text-gray-700 dark:text-gray-300 hover:bg-gradient-to-r hover:from-[var(--root-color)]/10 hover:to-purple-600/10 rounded-lg transition-all duration-200 group"
                        >
                          <div className="w-9 h-9 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center group-hover:bg-[var(--root-color)] group-hover:text-white transition-all">
                            {SubIcon && <SubIcon className="text-sm" />}
                          </div>
                          <span className="flex-1 text-sm font-medium text-left">
                            {sub}
                          </span>
                          <FaChevronRight className="w-3 h-3 text-gray-400 group-hover:text-[var(--root-color)] group-hover:translate-x-1 transition-all" />
                        </button>
                      ))}
                    </div>
                    {/* Footer */}
                    <div className="px-4 py-3 bg-gray-50 dark:bg-gray-700/50 border-t border-gray-100 dark:border-gray-700">
                      <button
                        onClick={() => navigate("/products")}
                        className="w-full text-center text-sm font-semibold text-[var(--root-color)] hover:underline"
                      >
                        View All Products →
                      </button>
                    </div>
                  </div>
                )}
              </li>
            ))}
          </ul>

          {/* Right Side */}
          <div className="flex items-center gap-3">
            {/* Search */}
            <button
              onClick={() => setShowSearch((p) => !p)}
              className="hidden md:flex items-center justify-center w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gradient-to-r hover:from-[var(--root-color)] hover:to-purple-600 hover:text-white transition-all"
            >
              <FaSearch />
            </button>

            {/* Dark Mode & Language */}
            <div className="hidden md:flex items-center gap-2">
              <DarkModeToggle />
            </div>

            {/* Wishlist */}
            <button
              onClick={() => navigate("/wishlist")}
              className="hidden md:flex relative items-center justify-center w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gradient-to-r hover:from-red-500 hover:to-pink-500 hover:text-white transition-all"
              title="Wishlist"
            >
              <FaHeart />
            </button>

            {/* Cart */}
            <button
              onClick={() => navigate("/cart")}
              className="relative flex items-center justify-center w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gradient-to-r hover:from-[var(--root-color)] hover:to-purple-600 hover:text-white transition-all"
              title="Cart"
            >
              <FaShoppingCart />
              {cartItemCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold animate-pulse">
                  {cartItemCount}
                </span>
              )}
            </button>

            {/* Profile/Login */}
            {user ? (
              <div className="relative hidden md:block">
                <button
                  onClick={() => setShowProfileMenu((p) => !p)}
                  className="w-10 h-10 bg-gradient-to-r from-[var(--root-color)] to-purple-600 text-white rounded-full hover:shadow-lg transition-all flex items-center justify-center hover:scale-110 transform duration-200"
                >
                  <FaUser className="text-lg" />
                </button>

                {showProfileMenu && (
                  <div className="absolute right-0 mt-3 w-72 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-purple-200 dark:border-purple-900/30 py-2 animate-fadeIn z-50">
                    <div className="px-4 py-4 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-t-2xl">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg">
                          {user.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-gray-900 dark:text-white truncate">
                            {user.name}
                          </p>
                          <p className="text-xs text-gray-600 dark:text-gray-400 truncate">
                            {user.email}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="py-2">
                      <button
                        onClick={() => {
                          navigate("/profile");
                          setShowProfileMenu(false);
                        }}
                        className="w-full px-4 py-3 text-left hover:bg-gradient-to-r hover:from-purple-50 hover:to-pink-50 dark:hover:from-purple-900/20 dark:hover:to-pink-900/20 transition-all flex items-center gap-3 group"
                      >
                        <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center text-white group-hover:scale-110 transition-transform">
                          <svg
                            className="w-5 h-5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                            />
                          </svg>
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900 dark:text-white">
                            My Profile
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            View and edit profile
                          </p>
                        </div>
                      </button>
                      <button
                        onClick={() => {
                          navigate("/cart");
                          setShowProfileMenu(false);
                        }}
                        className="w-full px-4 py-3 text-left hover:bg-gradient-to-r hover:from-blue-50 hover:to-cyan-50 dark:hover:from-blue-900/20 dark:hover:to-cyan-900/20 transition-all flex items-center gap-3 group"
                      >
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center text-white group-hover:scale-110 transition-transform">
                          <svg
                            className="w-5 h-5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                            />
                          </svg>
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900 dark:text-white">
                            My Cart
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            View shopping cart
                          </p>
                        </div>
                      </button>
                      <button
                        onClick={() => {
                          navigate("/orders");
                          setShowProfileMenu(false);
                        }}
                        className="w-full px-4 py-3 text-left hover:bg-gradient-to-r hover:from-green-50 hover:to-emerald-50 dark:hover:from-green-900/20 dark:hover:to-emerald-900/20 transition-all flex items-center gap-3 group"
                      >
                        <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-500 rounded-lg flex items-center justify-center text-white group-hover:scale-110 transition-transform">
                          <svg
                            className="w-5 h-5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                            />
                          </svg>
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900 dark:text-white">
                            My Orders
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            Track your orders
                          </p>
                        </div>
                      </button>
                      <button
                        onClick={() => {
                          navigate("/wishlist");
                          setShowProfileMenu(false);
                        }}
                        className="w-full px-4 py-3 text-left hover:bg-gradient-to-r hover:from-red-50 hover:to-pink-50 dark:hover:from-red-900/20 dark:hover:to-pink-900/20 transition-all flex items-center gap-3 group"
                      >
                        <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-pink-500 rounded-lg flex items-center justify-center text-white group-hover:scale-110 transition-transform">
                          <FaHeart className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900 dark:text-white">
                            My Wishlist
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            Saved items
                          </p>
                        </div>
                      </button>
                    </div>
                    <div className="border-t border-gray-200 dark:border-gray-700 pt-2">
                      <button
                        onClick={handleLogoutClick}
                        className="w-full px-4 py-3 text-left hover:bg-red-50 dark:hover:bg-red-900/20 transition-all flex items-center gap-3 group"
                      >
                        <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-red-600 rounded-lg flex items-center justify-center text-white group-hover:scale-110 transition-transform">
                          <svg
                            className="w-5 h-5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                            />
                          </svg>
                        </div>
                        <div>
                          <p className="font-semibold text-red-600">Logout</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            Sign out of account
                          </p>
                        </div>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={() => navigate("/login")}
                className="hidden md:flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[var(--root-color)] to-purple-600 text-white rounded-full font-semibold hover:shadow-lg transition-all"
              >
                <FaUser /> Login
              </button>
            )}

            {/* Mobile Menu */}
            <button
              onClick={toggleMenu}
              className="lg:hidden flex items-center justify-center w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gradient-to-r hover:from-[var(--root-color)] hover:to-purple-600 hover:text-white transition-all"
            >
              {showMenu ? <FaTimes /> : <FaBars />}
            </button>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      {showSearch && (
        <div className="border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 animate-slideDown">
          <div className="container px-4 py-4">
            <form
              onSubmit={handleSearch}
              className="relative max-w-2xl mx-auto"
            >
              <input
                type="text"
                placeholder="Search products..."
                className="w-full px-6 py-4 pr-12 rounded-2xl border-2 border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-[var(--root-color)]"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                autoFocus
              />
              <button
                type="submit"
                className="absolute right-3 top-1/2 -translate-y-1/2 bg-primary text-white p-3 rounded-xl hover:bg-primary/90"
              >
                <FaSearch />
              </button>

              {searchTerm && filteredSubmenu.length > 0 && (
                <div className="absolute w-full top-full mt-2 bg-white dark:bg-gray-800 rounded-xl shadow-2xl border max-h-96 overflow-auto z-50">
                  <p className="px-6 py-3 font-semibold bg-gray-100 dark:bg-gray-700">
                    Quick Categories
                  </p>
                  {filteredSubmenu.map((c) => (
                    <button
                      key={c.name}
                      onClick={() => goCategory(c.name)}
                      className="w-full text-left px-6 py-4 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-all flex items-center gap-3"
                    >
                      {c.icon && <c.icon className="text-lg" />}
                      {c.name}
                    </button>
                  ))}
                </div>
              )}
            </form>
          </div>
        </div>
      )}

      <ResponsiveMenu showMenu={showMenu} onClose={() => setShowMenu(false)} />

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
    </nav>
  );
};

export default Navbar;
