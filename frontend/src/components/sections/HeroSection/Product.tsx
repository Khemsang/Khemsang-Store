import React, { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "../../../store/hooks";
import { fetchFeaturedProducts } from "../../../store/slices/featuredProductsSlice";
import { ProductFeatureCard } from "..";

const Product: React.FC = () => {
  const dispatch = useAppDispatch();
  const { items: featuredProducts, loading } = useAppSelector(
    (state) => state.featuredProducts
  );

  useEffect(() => {
    dispatch(fetchFeaturedProducts());
  }, [dispatch]);

  if (loading) {
    return (
      <section className="w-full bg-gray-50 py-10 px-4 sm:px-6 md:px-10">
        <div className="max-w-7xl mx-auto text-center">
          <div className="text-gray-500">Loading featured products...</div>
        </div>
      </section>
    );
  }

  return (
    <section className="w-full bg-gray-50 py-10 px-4 sm:px-6 md:px-10">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-3xl font-bold text-gray-800 mb-8 text-center">
          Our Featured Products
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6">
          {featuredProducts.map((product) => (
            <ProductFeatureCard key={product._id} {...product} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default Product;
