import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Grid3x3, ArrowRight, Package } from "lucide-react";
import { api } from "../../services/api";
import { Card } from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import { Loading } from "../../components/ui/loading";

interface Category {
  _id: string;
  name: string;
  image?: string;
  description?: string;
  productCount?: number;
}

const Categories = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [imageErrors, setImageErrors] = useState<Record<string, boolean>>({});
  const navigate = useNavigate();

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const { data } = await api.get("/categories");
      setCategories(data);
    } catch (error) {
      console.error("Failed to fetch categories:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleImageError = (categoryId: string) => {
    setImageErrors((prev) => ({ ...prev, [categoryId]: true }));
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <Loading />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:from-gray-900 dark:via-blue-900/10 dark:to-gray-900 py-16">
      <div className="container mx-auto px-4 md:px-6 lg:px-8 max-w-7xl">
        {/* Header */}
        <div className="text-center mb-12">
          <Badge className="mb-4 bg-blue-600 text-white">
            <Grid3x3 className="w-4 h-4 mr-1" />
            Browse Categories
          </Badge>
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-blue-600 bg-clip-text text-transparent">
            Shop by Category
          </h1>
          <p className="text-gray-600 dark:text-gray-400 text-lg max-w-2xl mx-auto">
            Browse our wide range of product categories
          </p>
        </div>

        {/* Categories Grid */}
        {categories.length === 0 ? (
          <Card className="text-center py-20">
            <Package className="w-20 h-20 text-gray-300 mx-auto mb-6" />
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
              No Categories Available
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Categories will appear here once added
            </p>
          </Card>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {categories.map((category) => (
              <Card
                key={category._id}
                onClick={() => navigate(`/products?category=${category.name}`)}
                className="group relative overflow-hidden cursor-pointer hover:shadow-2xl transition-all duration-300 border-0"
              >
                <div className="aspect-[4/3] bg-gradient-to-br from-blue-100 to-orange-100 dark:from-blue-900/30 dark:to-orange-900/30 overflow-hidden">
                  {imageErrors[category._id] || !category.image ? (
                    <div className="w-full h-full flex items-center justify-center">
                      <Package className="w-16 h-16 text-blue-300" />
                    </div>
                  ) : (
                    <img
                      src={category.image}
                      alt={category.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      onError={() => handleImageError(category._id)}
                    />
                  )}
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-4">
                  <h3 className="font-bold text-white text-lg mb-1 group-hover:text-orange-300 transition-colors">
                    {category.name}
                  </h3>
                  {category.description && (
                    <p className="text-white/80 text-sm line-clamp-1 mb-2">
                      {category.description}
                    </p>
                  )}
                  <div className="flex items-center gap-2 text-orange-400 opacity-0 group-hover:opacity-100 transition-opacity">
                    <span className="text-sm font-semibold">Explore</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Categories;
