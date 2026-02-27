import { useCallback, useState } from 'react';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';

interface ColorVariant {
  colorName: string;
  colorCode: string;
  stock?: number;
  price?: number;
}

interface Product {
  _id: string;
  title: string;
  price: number;
  stock: number;
  colorVariants?: ColorVariant[];
}

interface FeaturedProduct extends Product {
  productId?: string;
}

interface AddToCartResult {
  success: boolean;
  reason?: string;
  error?: string;
}

// ✅ Smart product ID resolution
export const resolveProductId = (product: Product | FeaturedProduct): string => {
  // Featured products have productId, regular products use _id
  return (product as FeaturedProduct).productId || product._id;
};

// ✅ Check if product is available
export const isProductAvailable = (product: Product | FeaturedProduct): boolean => {
  const productId = resolveProductId(product);
  
  // Featured product must have valid productId
  if ('productId' in product && !product.productId) {
    return false;
  }
  
  // Check stock
  const stock = product.stock || 0;
  return stock > 0;
};

// ✅ Get product price (variant or base)
export const getProductPrice = (
  product: Product | FeaturedProduct,
  variant?: ColorVariant
): number => {
  if (variant?.price) return variant.price;
  return product.price;
};

// ✅ Get product stock (variant or base)
export const getProductStock = (
  product: Product | FeaturedProduct,
  variant?: ColorVariant
): number => {
  if (variant) {
    return variant.stock || 0;
  }
  return product.stock || 0;
};

export const useUniversalCart = () => {
  const { cart, addToCart } = useCart();
  const { success, error } = useToast();
  const [processing, setProcessing] = useState(false);
  
  const addProductToCart = useCallback(async (
    product: Product | FeaturedProduct,
    quantity: number = 1,
    variant?: ColorVariant
  ): Promise<AddToCartResult> => {
    if (processing) {
      return { success: false, reason: 'processing' };
    }
    
    try {
      setProcessing(true);
      
      // ✅ Smart product ID resolution
      const productId = resolveProductId(product);
      
        productId,
        title: product.title,
        quantity,
        variant: variant?.colorName,
        isFeatured: 'productId' in product
      });
      
      // ✅ Validate availability
      if (!isProductAvailable(product)) {
        error('Product not available');
        return { success: false, reason: 'unavailable' };
      }
      
      // ✅ Validate stock
      const availableStock = getProductStock(product, variant);
      if (availableStock < quantity) {
        error(`Only ${availableStock} available`);
        return { success: false, reason: 'insufficient_stock' };
      }
      
      // ✅ Check if already in cart BEFORE API call
      const variantInfo = variant ? {
        colorName: variant.colorName,
        colorCode: variant.colorCode
      } : undefined;
      
      const isExisting = cart.some(item =>
        item.product._id === productId &&
        (!variantInfo || item.colorVariant?.colorName === variantInfo.colorName)
      );
      
      
      // ✅ Add to cart
      await addToCart(productId, quantity, variantInfo);
      
      // ✅ Show toast only if new item
      if (!isExisting) {
        success('Added to cart!');
      } else {
      }
      
      return { success: true };
    } catch (err: any) {
      const errorCode = err.response?.data?.code;
      
      
      switch (errorCode) {
        case 'INSUFFICIENT_STOCK':
          error(err.response.data.message);
          break;
        case 'PRODUCT_NOT_FOUND':
          error('Product not found');
          break;
        case 'VARIANT_NOT_FOUND':
          error('Selected variant not available');
          break;
        case 'CART_LIMIT_EXCEEDED':
          error(err.response.data.message);
          break;
        default:
          error('Failed to add to cart');
      }
      
      return { success: false, error: err.message };
    } finally {
      setProcessing(false);
    }
  }, [cart, addToCart, processing, success, error]);
  
  return { 
    addProductToCart, 
    processing,
    resolveProductId,
    isProductAvailable,
    getProductPrice,
    getProductStock
  };
};
