import React from "react";
import { Check } from "lucide-react";

interface ColorVariant {
  _id: string;
  colorName: string;
  colorCode: string;
  images: string[];
  stock: number;
  price?: number;
  isActive: boolean;
}

interface ColorSelectorProps {
  variants: ColorVariant[];
  selectedVariant: ColorVariant | null;
  onSelectVariant: (variant: ColorVariant) => void;
  className?: string;
}

export const ColorSelector: React.FC<ColorSelectorProps> = ({
  variants,
  selectedVariant,
  onSelectVariant,
  className = "",
}) => {
  if (!variants || variants.length === 0) {
    return null;
  }

  return (
    <div className={className}>
      <div className="flex items-center gap-2 mb-3">
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
          Color:
        </span>
        {selectedVariant && (
          <span className="text-sm font-semibold text-gray-900 dark:text-white">
            {selectedVariant.colorName}
          </span>
        )}
      </div>
      
      <div className="flex flex-wrap gap-3">
        {variants.map((variant) => {
          const isSelected = selectedVariant?._id === variant._id;
          const isOutOfStock = variant.stock === 0;
          
          return (
            <button
              key={variant._id}
              onClick={() => !isOutOfStock && onSelectVariant(variant)}
              disabled={isOutOfStock}
              className={`relative group ${isOutOfStock ? 'cursor-not-allowed' : 'cursor-pointer'}`}
              title={`${variant.colorName}${isOutOfStock ? ' (Out of Stock)' : ''}`}
            >
              <div
                className={`w-12 h-12 rounded-full border-2 transition-all ${
                  isSelected
                    ? "border-purple-500 ring-2 ring-purple-200 dark:ring-purple-800 scale-110"
                    : "border-gray-300 dark:border-gray-600 hover:border-purple-300 hover:scale-105"
                } ${isOutOfStock ? 'opacity-40' : ''}`}
                style={{ backgroundColor: variant.colorCode }}
              >
                {isSelected && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Check className="w-6 h-6 text-white drop-shadow-lg" strokeWidth={3} />
                  </div>
                )}
              </div>
              
              {isOutOfStock && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-14 h-0.5 bg-red-500 rotate-45" />
                </div>
              )}
              
              {/* Tooltip */}
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                {variant.colorName}
                {isOutOfStock && " (Out of Stock)"}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
