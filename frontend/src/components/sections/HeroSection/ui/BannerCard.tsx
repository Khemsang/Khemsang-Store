import React from "react";
import type { BannerData } from "../../../constants/components/HeroSection/heroData";

const BannerCard: React.FC<BannerData> = ({ title, subtitle, description, buttonText, image }) => {
  return (
    <div className="bg-primary/30 p-6 rounded-2xl flex flex-col md:flex-row items-center h-[60vh]">
      <div className="flex-1 space-y-4">
        <p className="text-sm text-gray-600">{subtitle}</p>
        <h1 className="text-3xl font-bold text-gray-800">{title}</h1>
        <p className="text-gray-500">{description}</p>
      </div>
      <div className="flex-1 mt-6 md:mt-0 flex justify-center items-center">
        <img
          src={image}
          alt={title}
          className="object-contain max-h-[40vh] w-auto md:w-full"
        />
        
      </div>
      <button className="mt-4 px-5 py-2 bg-gray-300 text-white rounded-full hover:bg-gray-800">
          {buttonText}
        </button>
    </div>
  );
};

export default BannerCard;
