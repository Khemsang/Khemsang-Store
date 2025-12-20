import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaTrademark, FaArrowRight } from "react-icons/fa";
import { api } from "../../services/api";

interface Brand {
  _id: string;
  name: string;
  logo?: string;
  description?: string;
  productCount?: number;
}

const Brands = () => {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchBrands();
  }, []);

  const fetchBrands = async () => {
    try {
      const { data } = await api.get("/brands");
      setBrands(data);
    } catch (error) {
      console.error("Failed to fetch brands:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-3 mb-4">
            <FaTrademark className="w-8 h-8 text-purple-600" />
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">
              Our Brands
            </h1>
          </div>
          <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Explore products from our trusted brand partners
          </p>
        </div>

        {/* Brands Grid */}
        {brands.length === 0 ? (
          <div className="text-center py-20">
            <FaTrademark className="w-20 h-20 text-gray-300 mx-auto mb-6" />
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
              No Brands Available
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Check back later for brand listings
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {brands.map((brand) => (
              <div
                key={brand._id}
                onClick={() => navigate(`/products?brand=${brand.name}`)}
                className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all cursor-pointer group border border-gray-100 dark:border-gray-700"
              >
                <div className="aspect-square bg-gray-100 dark:bg-gray-700 rounded-xl flex items-center justify-center mb-4 overflow-hidden">
                  {brand.logo ? (
                    <img
                      src={brand.logo}
                      alt={brand.name}
                      className="w-full h-full object-contain p-4 group-hover:scale-110 transition-transform"
                    />
                  ) : (
                    <FaTrademark className="w-16 h-16 text-gray-400" />
                  )}
                </div>
                <h3 className="font-bold text-gray-900 dark:text-white text-center mb-2 group-hover:text-purple-600 transition-colors">
                  {brand.name}
                </h3>
                {brand.description && (
                  <p className="text-sm text-gray-500 dark:text-gray-400 text-center line-clamp-2">
                    {brand.description}
                  </p>
                )}
                <div className="flex items-center justify-center gap-2 mt-4 text-purple-600 opacity-0 group-hover:opacity-100 transition-opacity">
                  <span className="text-sm font-medium">View Products</span>
                  <FaArrowRight className="w-3 h-3" />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Brands;
