import { useCallback } from 'react';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';
import { api } from '../services/api';

interface ColorVariant {
  colorName: string;
  colorCode: string;
  stock?: number;
  price?: number;
}

interface StockValidationResult {
  valid: boolean;
  availableStock?: number;
  message?: string;
}

export const useStockValidation = () => {
  const { cart } = useCart();
  const { error } = useToast();
  
  const validateStock = useCallback(async (
    productId: string,
    requestedQty: number,
    variant?: ColorVariant
  ): Promise<StockValidationResult> => {
    try {
      // Check current cart quantity
      const cartItem = cart.find(item => 
        item.product._id === productId &&
        (!variant || item.colorVariant?.colorName === variant.colorName)
      );
      
      const currentQty = cartItem?.quantity || 0;
      const totalQty = currentQty + requestedQty;
      
      // Get product stock from API
      const { data: product } = await api.get(`/products/${productId}`);
      
      const availableStock = variant
        ? product.colorVariants?.find((v: any) => v.colorName === variant.colorName)?.stock
        : product.stock;
      
      if (availableStock === undefined) {
        error('Unable to check stock availability');
        return { valid: false, message: 'Stock information unavailable' };
      }
      
      if (totalQty > availableStock) {
        const canAdd = Math.max(0, availableStock - currentQty);
        const message = canAdd > 0
          ? `Only ${canAdd} more can be added (${availableStock} total available)`
          : `Out of stock (${currentQty} already in cart)`;
        
        error(message);
        return { 
          valid: false, 
          availableStock: canAdd,
          message
        };
      }
      
      return { 
        valid: true, 
        availableStock,
        message: 'Stock available'
      };
    } catch (err: any) {
      console.error('Stock validation error:', err);
      error('Failed to validate stock');
      return { 
        valid: false,
        message: 'Validation failed'
      };
    }
  }, [cart, error]);
  
  const getStockStatus = useCallback((stock: number) => {
    if (stock === 0) {
      return { 
        label: 'Out of Stock', 
        color: 'red',
        available: false
      };
    }
    if (stock < 5) {
      return { 
        label: `Only ${stock} left`, 
        color: 'orange',
        available: true,
        lowStock: true
      };
    }
    return { 
      label: 'In Stock', 
      color: 'green',
      available: true,
      lowStock: false
    };
  }, []);
  
  return { 
    validateStock,
    getStockStatus
  };
};
