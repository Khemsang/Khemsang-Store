import { Product, ColorVariant } from "../types/product.types";

export const getProductImage = (product: Product): string => {
  return product.images?.[0] || product.image || "/placeholder.jpg";
};

export const isOutOfStock = (product: Product, variantName?: string): boolean => {
  if (variantName && product.colorVariants) {
    const variant = product.colorVariants.find(v => v.colorName === variantName);
    return variant ? variant.stock === 0 : true;
  }
  return product.stock === 0;
};

export const getAvailableStock = (product: Product, variantName?: string): number => {
  if (variantName && product.colorVariants) {
    const variant = product.colorVariants.find(v => v.colorName === variantName);
    return variant?.stock || 0;
  }
  return product.stock || 0;
};

export const getEffectivePrice = (product: Product, variantName?: string): number => {
  let basePrice = product.price;

  if (variantName && product.colorVariants) {
    const variant = product.colorVariants.find(v => v.colorName === variantName);
    if (variant?.price) {
      basePrice = variant.price;
    }
  }

  if (product.discount && product.discount > 0) {
    return basePrice * (1 - product.discount / 100);
  }

  return basePrice;
};

export const isFlashSaleActive = (product: Product, variantName?: string): boolean => {
  if (variantName && product.colorVariants) {
    const variant = product.colorVariants.find(v => v.colorName === variantName);
    if (variant?.isFlashSale) {
      return isFlashSaleTimeValid(variant.flashStartTime, variant.flashEndTime) && 
             (variant.flashStock || 0) > 0;
    }
  }

  if (product.isFlashSale) {
    return isFlashSaleTimeValid(product.flashStartTime, product.flashEndTime) && 
           (product.flashStock || 0) > 0;
  }

  return false;
};

const isFlashSaleTimeValid = (startTime?: string, endTime?: string): boolean => {
  if (!startTime || !endTime) return false;
  
  const now = new Date().getTime();
  const start = new Date(startTime).getTime();
  const end = new Date(endTime).getTime();
  
  return now >= start && now <= end;
};

export const getFlashSaleTimeRemaining = (endTime?: string): { hours: number; minutes: number; seconds: number } | null => {
  if (!endTime) return null;

  const now = new Date().getTime();
  const end = new Date(endTime).getTime();
  const diff = end - now;

  if (diff <= 0) {
    return { hours: 0, minutes: 0, seconds: 0 };
  }

  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diff % (1000 * 60)) / 1000);

  return { hours, minutes, seconds };
};

export const getStockStatus = (stock: number): {
  level: "critical" | "low" | "medium" | "high";
  message: string;
  color: string;
} => {
  if (stock === 0) {
    return {
      level: "critical",
      message: "Out of Stock",
      color: "red",
    };
  }
  
  if (stock <= 5) {
    return {
      level: "critical",
      message: `Only ${stock} left`,
      color: "red",
    };
  }
  
  if (stock <= 20) {
    return {
      level: "low",
      message: `${stock} in stock`,
      color: "orange",
    };
  }
  
  if (stock <= 50) {
    return {
      level: "medium",
      message: `${stock} in stock`,
      color: "yellow",
    };
  }
  
  return {
    level: "high",
    message: `${stock} in stock`,
    color: "green",
  };
};

export const getActiveColorVariants = (product: Product): ColorVariant[] => {
  return product.colorVariants?.filter(v => v.isActive) || [];
};

export const formatPrice = (price: number, currency: string = "Rs."): string => {
  return `${currency} ${price.toLocaleString()}`;
};

export const calculateSavings = (originalPrice: number, currentPrice: number): number => {
  return Math.max(0, originalPrice - currentPrice);
};

export const calculateSavingsPercentage = (originalPrice: number, currentPrice: number): number => {
  if (originalPrice <= 0) return 0;
  return Math.round(((originalPrice - currentPrice) / originalPrice) * 100);
};

export const isValidProduct = (product: any): product is Product => {
  return (
    product &&
    typeof product === "object" &&
    typeof product._id === "string" &&
    typeof product.title === "string" &&
    typeof product.price === "number" &&
    product.price >= 0
  );
};

export const getProductUrl = (productId: string): string => {
  return `/product/${productId}`;
};

export const isVariantLowStock = (variant: ColorVariant, threshold: number = 5): boolean => {
  return variant.stock > 0 && variant.stock <= threshold;
};

export const sortVariantsByStock = (variants: ColorVariant[]): ColorVariant[] => {
  return [...variants].sort((a, b) => b.stock - a.stock);
};

export const getInStockVariants = (variants: ColorVariant[]): ColorVariant[] => {
  return variants.filter(v => v.stock > 0);
};
