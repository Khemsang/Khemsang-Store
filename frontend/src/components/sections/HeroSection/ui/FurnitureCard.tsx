// src/components/HeroSection/FurnitureCard.tsx
import React from "react";
import { furnitureData } from "../../../constants/components/HeroSection/heroData";

const FurnitureCard: React.FC = () => {
  return (
    <section className="py-12 bg-gray-50">
      <div className="max-w-7xl mx-auto px-6">
        <h2 className="text-3xl font-bold text-gray-800 mb-8 text-center">
          Featured Products
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
          {furnitureData.map(({ title, desc, image }, index) => (
            <div
              key={index}
              className="bg-white rounded-lg shadow-md p-6 hover:shadow-xl transition-shadow duration-300"
            >
              <img
                src={image}
                alt={title}
                className="w-16 h-16 object-cover rounded-md mb-4 mx-auto"
                loading="lazy"
              />
              <h3 className="text-xl font-semibold text-gray-900 mb-2 text-center">
                {title}
              </h3>
              <p className="text-gray-600 text-center">{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FurnitureCard;
