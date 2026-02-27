/**
 * Product Type Definitions
 * Centralized type definitions for type safety
 */

export interface ColorVariant {
  colorName: string;
  colorCode: string;
  images?: string[];
  sku?: string;
  price?: number;
  stock: number;
  isActive: boolean;
  isFlashSale?: boolean;
  flashDiscountType?: "percentage" | "flat";
  flashDiscountValue?: number;
  flashStartTime?: string;
  flashEndTime?: string;
  flashStock?: number;
}

export interface ProductSpecifications {
  weight?: string;
  dimensions?: string;
  material?: string;
  color?: string;
  size?: string;
}

export interface Product {
  _id: string;
  title: string;
  description: string;
  shortDescription?: string;
  price: number;
  originalPrice?: number;
  discount?: number;
  images: string[];
  image?: string; // Legacy support
  category: string;
  subcategory?: string;
  brand?: string;
  stock: number;
  sku?: string;
  specifications?: ProductSpecifications;
  features?: string[];
  tags?: string[];
  colorVariants?: ColorVariant[];
  colors?: string[]; // Legacy support
  sizes?: string[];
  metaTitle?: string;
  metaDescription?: string;
  isActive: boolean;
  isFeatured: boolean;
  isNewArrival: boolean;
  isBestSeller: boolean;
  isFlashSale: boolean;
  flashDiscountType?: "percentage" | "flat";
  flashDiscountValue?: number;
  flashStartTime?: string;
  flashEndTime?: string;
  flashStock?: number;
  rating: number;
  numReviews: number;
  freeShipping: boolean;
  shippingCost?: number;
  warranty?: string;
  returnPolicy?: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface CartColorVariant {
  colorName: string;
  colorCode: string;
  price?: number;
}

export interface CartItem {
  _id?: string;
  product: Product;
  quantity: number;
  colorVariant?: CartColorVariant;
  priceSnapshot?: {
    originalPrice: number;
    discountedPrice: number;
    discount: number;
    snapshotAt: string;
  };
  addedAt?: string;
}

export interface ProductCardProps {
  product: Product;
  onAddToCart?: (product: Product, colorVariant?: CartColorVariant) => void;
  showColorVariants?: boolean;
  colorScheme?: "blue" | "purple" | "orange";
}

export interface FlashSaleProduct extends Product {
  flashEndTime: string;
  flashStock: number;
}
