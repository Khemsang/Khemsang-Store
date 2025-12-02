// src/components/ui/FeatureCard.tsx
import React from "react";
import type { FeatureCardData } from "../../../constants/components/HeroSection/FeatureCardData";

const FeatureCard: React.FC<FeatureCardData> = ({ title, desc, image }) => {
  return (
    <div className="flex flex-col sm:flex-row items-center sm:items-start justify-between gap-4 rounded bg-red-900 p-4 hover:shadow-md transition">
      {/* Text section */}
      <div className="flex-1 text-center sm:text-left">
        <h3 className="font-semibold text-lg text-white">{title}</h3>
        <p className="text-sm text-gray-300">{desc}</p>
      </div>

      {/* Image section */}
      <div className="bg-gray-100 rounded flex items-center justify-center overflow-hidden w-full sm:w-[120px] h-[100px]">
        <img
          src={image}
          alt={title}
          className="object-contain w-full h-full"
        />
      </div>
    </div>
  );
};

export default FeatureCard;
