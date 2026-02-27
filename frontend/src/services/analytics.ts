/**
 * Analytics Service
 * Tracks user interactions and cart events for business insights
 */

interface AddToCartEvent {
  productId: string;
  productName: string;
  quantity: number;
  price: number;
  variant?: string;
  source: 'details_page' | 'listing_quick_add' | 'featured_showcase' | 'wishlist' | 'buy_now';
  isNewItem: boolean;
  isFeatured: boolean;
  toastShown: boolean;
}

interface RemoveFromCartEvent {
  productId: string;
  productName: string;
  quantity: number;
  price: number;
}

interface ErrorEvent {
  action: string;
  errorCode?: string;
  errorMessage?: string;
  productId?: string;
  source?: string;
}

class AnalyticsService {
  private enabled: boolean = true;
  private debugMode: boolean = import.meta.env.DEV;
  
  /**
   * Track product view
   */
  trackProductView(data: {
    productId: string;
    productName: string;
    productCategory: string;
    productPrice: number;
    isFeatured: boolean;
  }): void {
    this.track('product_view', data);
  }
  
  /**
   * Track add to cart event
   */
  trackAddToCart(data: AddToCartEvent): void {
    this.track('add_to_cart', {
      ...data,
      value: data.price * data.quantity,
      currency: 'NPR'
    });
  }
  
  /**
   * Track remove from cart
   */
  trackRemoveFromCart(data: RemoveFromCartEvent): void {
    this.track('remove_from_cart', {
      ...data,
      value: data.price * data.quantity,
      currency: 'NPR'
    });
  }
  
  /**
   * Track checkout started
   */
  trackCheckoutStarted(data: {
    cartValue: number;
    itemCount: number;
    items: Array<{
      productId: string;
      productName: string;
      quantity: number;
      price: number;
    }>;
  }): void {
    this.track('begin_checkout', {
      value: data.cartValue,
      currency: 'NPR',
      items: data.items
    });
  }
  
  /**
   * Track purchase completed
   */
  trackPurchase(data: {
    orderId: string;
    orderValue: number;
    items: Array<{
      productId: string;
      productName: string;
      quantity: number;
      price: number;
    }>;
  }): void {
    this.track('purchase', {
      transaction_id: data.orderId,
      value: data.orderValue,
      currency: 'NPR',
      items: data.items
    });
  }
  
  /**
   * Track wishlist add
   */
  trackAddToWishlist(data: {
    productId: string;
    productName: string;
    productPrice: number;
  }): void {
    this.track('add_to_wishlist', data);
  }
  
  /**
   * Track error events
   */
  trackError(data: ErrorEvent): void {
    this.track('error', {
      ...data,
      timestamp: new Date().toISOString()
    });
    
    if (this.debugMode) {
      console.error('📊 Analytics: Error', data);
    }
  }
  
  /**
   * Track custom event
   */
  trackCustomEvent(eventName: string, data: Record<string, any>): void {
    this.track(eventName, data);
  }
  
  /**
   * Core tracking method
   */
  private track(eventName: string, properties: Record<string, any>): void {
    if (!this.enabled) return;
    
    const eventData = {
      event: eventName,
      timestamp: Date.now(),
      ...properties
    };
    
    // Google Analytics 4
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', eventName, properties);
    }
    
    // Facebook Pixel
    if (typeof window !== 'undefined' && (window as any).fbq) {
      (window as any).fbq('track', eventName, properties);
    }
    
    // Custom backend analytics (optional)
    if (import.meta.env.VITE_ANALYTICS_ENDPOINT) {
      this.sendToBackend(eventData);
    }
    
    // Console log in development
    if (this.debugMode) {
    }
  }
  
  /**
   * Send analytics to backend
   */
  private async sendToBackend(data: Record<string, any>): Promise<void> {
    try {
      const endpoint = import.meta.env.VITE_ANALYTICS_ENDPOINT;
      if (!endpoint) return;
      
      await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
    } catch (error) {
      console.error('Failed to send analytics:', error);
    }
  }
  
  /**
   * Enable/disable analytics
   */
  setEnabled(enabled: boolean): void {
    this.enabled = enabled;
  }
  
  /**
   * Get analytics stats (dev only)
   */
  getStats(): void {
    // Stats available in debug mode only
  }
}

export const analytics = new AnalyticsService();
