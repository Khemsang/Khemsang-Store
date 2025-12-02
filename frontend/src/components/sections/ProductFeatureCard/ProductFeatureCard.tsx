import React from "react";

interface ProductFeatureCardProps {
  title?: string;
  description?: string;
  image?: string;
  price?: number;
  originalPrice?: number;
  discount?: number;
}

const ProductFeatureCard: React.FC<ProductFeatureCardProps> = ({
  title = "Product",
  description = "Product description",
  image = "/placeholder.jpg",
  price = 0,
  originalPrice,
  discount = 0,
}) => {
  return (
    <div className="bg-white rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2">
      <div className="relative h-64 bg-gray-100">
        <img src={image} alt={title} className="w-full h-full object-cover" />
        {discount > 0 && (
          <span className="absolute top-2 right-2 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
            -{discount}%
          </span>
        )}
      </div>
      <div className="p-5">
        <h3 className="font-semibold text-lg text-gray-800 mb-2 line-clamp-1">
          {title}
        </h3>
        <p className="text-sm text-gray-600 mb-4 line-clamp-2">{description}</p>
        <div className="flex items-center justify-between mb-4">
          <div>
            <span className="text-2xl font-bold text-primary">
              Rs. {price.toLocaleString()}
            </span>
            {originalPrice && (
              <span className="text-sm text-gray-400 line-through ml-2">
                Rs. {originalPrice.toLocaleString()}
              </span>
            )}
          </div>
        </div>
        <button className="w-full bg-primary text-white py-3 rounded-lg hover:bg-primary/90 transition-colors font-semibold">
          Add to Cart
        </button>
      </div>
    </div>
  );
};

export default ProductFeatureCard;
