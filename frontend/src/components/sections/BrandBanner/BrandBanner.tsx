import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { api } from "../../../services/api";

interface Brand {
  _id: string;
  name: string;
  logo: string;
  website?: string;
}

const BrandBanner = () => {
  const [brands, setBrands] = useState<Brand[]>([]);

  useEffect(() => {
    fetchBrands();
  }, []);

  const fetchBrands = async () => {
    try {
      const { data } = await api.get("/brands");
      setBrands(data);
    } catch (err) {
      console.error("Error fetching brands:", err);
    }
  };

  if (brands.length === 0) return null;

  return (
    <div className="py-8 bg-gray-50 dark:bg-gray-900 border-y border-gray-200 dark:border-gray-800 overflow-hidden">
      <div className="container mx-auto px-4">
        <motion.p
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center text-gray-600 dark:text-gray-400 text-sm font-semibold mb-6 tracking-wider"
        >
          TRUSTED BY LEADING BRANDS
        </motion.p>

        <div className="relative">
          <div className="flex animate-scroll">
            {/* Triple the brands for seamless infinite scroll */}
            {[...brands, ...brands, ...brands].map((brand, idx) => (
              <div
                key={`brand-${idx}`}
                className="flex-shrink-0 mx-6 md:mx-10 grayscale hover:grayscale-0 transition-all duration-300 hover:scale-110 cursor-pointer"
                onClick={() =>
                  brand.website && window.open(brand.website, "_blank")
                }
              >
                <img
                  src={brand.logo}
                  alt={brand.name}
                  className="h-12 md:h-16 w-auto object-contain opacity-60 hover:opacity-100 transition-opacity"
                />
              </div>
            ))}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes scroll {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-33.333%);
          }
        }

        .animate-scroll {
          animation: scroll 30s linear infinite;
        }

        .animate-scroll:hover {
          animation-play-state: paused;
        }
      `}</style>
    </div>
  );
};

export default BrandBanner;
