import {
  useState,
  useEffect,
  createContext,
  useContext,
  ReactNode,
} from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaGlobe, FaCheck } from "react-icons/fa";

type Language = "en" | "ne";

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const translations: Record<Language, Record<string, string>> = {
  en: {
    // Navigation
    "nav.home": "Home",
    "nav.products": "Products",
    "nav.cart": "Cart",
    "nav.wishlist": "Wishlist",
    "nav.orders": "Orders",
    "nav.profile": "Profile",
    "nav.login": "Login",
    "nav.signup": "Sign Up",
    "nav.logout": "Logout",

    // Products
    "product.addToCart": "Add to Cart",
    "product.buyNow": "Buy Now",
    "product.outOfStock": "Out of Stock",
    "product.inStock": "In Stock",
    "product.reviews": "Reviews",
    "product.description": "Description",
    "product.specifications": "Specifications",

    // Cart
    "cart.title": "Shopping Cart",
    "cart.empty": "Your cart is empty",
    "cart.subtotal": "Subtotal",
    "cart.shipping": "Shipping",
    "cart.total": "Total",
    "cart.checkout": "Proceed to Checkout",
    "cart.continueShopping": "Continue Shopping",

    // Checkout
    "checkout.title": "Checkout",
    "checkout.shipping": "Shipping Information",
    "checkout.payment": "Payment Method",
    "checkout.placeOrder": "Place Order",
    "checkout.coupon": "Have a Coupon?",
    "checkout.apply": "Apply",

    // Common
    "common.search": "Search",
    "common.filter": "Filter",
    "common.sort": "Sort",
    "common.price": "Price",
    "common.category": "Category",
    "common.brand": "Brand",
    "common.size": "Size",
    "common.color": "Color",
    "common.quantity": "Quantity",
    "common.remove": "Remove",
    "common.save": "Save",
    "common.cancel": "Cancel",
    "common.loading": "Loading...",
    "common.noResults": "No results found",
  },
  ne: {
    // Navigation
    "nav.home": "गृहपृष्ठ",
    "nav.products": "उत्पादनहरू",
    "nav.cart": "कार्ट",
    "nav.wishlist": "इच्छा सूची",
    "nav.orders": "अर्डरहरू",
    "nav.profile": "प्रोफाइल",
    "nav.login": "लग इन",
    "nav.signup": "साइन अप",
    "nav.logout": "लग आउट",

    // Products
    "product.addToCart": "कार्टमा थप्नुहोस्",
    "product.buyNow": "अहिले किन्नुहोस्",
    "product.outOfStock": "स्टकमा छैन",
    "product.inStock": "स्टकमा छ",
    "product.reviews": "समीक्षाहरू",
    "product.description": "विवरण",
    "product.specifications": "विशेषताहरू",

    // Cart
    "cart.title": "किनमेल कार्ट",
    "cart.empty": "तपाईंको कार्ट खाली छ",
    "cart.subtotal": "उप-जम्मा",
    "cart.shipping": "ढुवानी",
    "cart.total": "जम्मा",
    "cart.checkout": "चेकआउटमा जानुहोस्",
    "cart.continueShopping": "किनमेल जारी राख्नुहोस्",

    // Checkout
    "checkout.title": "चेकआउट",
    "checkout.shipping": "ढुवानी जानकारी",
    "checkout.payment": "भुक्तानी विधि",
    "checkout.placeOrder": "अर्डर गर्नुहोस्",
    "checkout.coupon": "कुपन छ?",
    "checkout.apply": "लागू गर्नुहोस्",

    // Common
    "common.search": "खोज्नुहोस्",
    "common.filter": "फिल्टर",
    "common.sort": "क्रमबद्ध",
    "common.price": "मूल्य",
    "common.category": "श्रेणी",
    "common.brand": "ब्रान्ड",
    "common.size": "साइज",
    "common.color": "रंग",
    "common.quantity": "मात्रा",
    "common.remove": "हटाउनुहोस्",
    "common.save": "सेभ गर्नुहोस्",
    "common.cancel": "रद्द गर्नुहोस्",
    "common.loading": "लोड हुँदैछ...",
    "common.noResults": "कुनै परिणाम भेटिएन",
  },
};

const LanguageContext = createContext<LanguageContextType | undefined>(
  undefined
);

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [language, setLanguage] = useState<Language>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("language") as Language;
      return saved || "en";
    }
    return "en";
  });

  useEffect(() => {
    localStorage.setItem("language", language);
  }, [language]);

  const t = (key: string): string => {
    return translations[language][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
};

// Language Toggle Component
const LanguageToggle = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { language, setLanguage } = useLanguage();

  const languages = [
    { code: "en" as Language, name: "English", flag: "🇺🇸" },
    { code: "ne" as Language, name: "नेपाली", flag: "🇳🇵" },
  ];

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
      >
        <FaGlobe className="w-4 h-4 text-gray-600 dark:text-gray-300" />
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
          {languages.find((l) => l.code === language)?.flag}
        </span>
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            <div
              className="fixed inset-0 z-40"
              onClick={() => setIsOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute right-0 top-full mt-2 z-50 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden min-w-[150px]"
            >
              {languages.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => {
                    setLanguage(lang.code);
                    setIsOpen(false);
                  }}
                  className={`w-full flex items-center justify-between gap-3 px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${
                    language === lang.code
                      ? "bg-purple-50 dark:bg-purple-900/20"
                      : ""
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{lang.flag}</span>
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      {lang.name}
                    </span>
                  </div>
                  {language === lang.code && (
                    <FaCheck className="w-4 h-4 text-purple-600" />
                  )}
                </button>
              ))}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default LanguageToggle;
