/**
 * E2E Tests for Cart Functionality
 * Tests critical user flows with Playwright
 */

import { test, expect } from '@playwright/test';

test.describe('Cart Functionality', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to home page
    await page.goto('/');
  });
  
  test('should prevent rapid clicks (button lock)', async ({ page }) => {
    // Navigate to product details
    await page.goto('/product/test-product-id');
    
    // Wait for page to load
    await page.waitForSelector('[data-testid="add-to-cart-btn"]');
    
    const addBtn = page.locator('[data-testid="add-to-cart-btn"]');
    
    // Click rapidly 5 times
    await Promise.all([
      addBtn.click(),
      addBtn.click(),
      addBtn.click(),
      addBtn.click(),
      addBtn.click()
    ]);
    
    // Wait for API call to complete
    await page.waitForTimeout(1000);
    
    // Check cart badge - should only show 1 item
    const cartBadge = page.locator('[data-testid="cart-badge"]');
    await expect(cartBadge).toHaveText('1');
    
    // Check that only one toast appeared
    const toasts = page.locator('[role="status"]');
    await expect(toasts).toHaveCount(1);
  });
  
  test('should show toast only once per product', async ({ page }) => {
    await page.goto('/product/test-product-id');
    
    const addBtn = page.locator('[data-testid="add-to-cart-btn"]');
    
    // First add - should show toast
    await addBtn.click();
    await page.waitForSelector('[role="status"]');
    
    let toasts = page.locator('[role="status"]:visible');
    await expect(toasts).toHaveCount(1);
    await expect(toasts.first()).toContainText('Added to cart');
    
    // Wait for toast to disappear
    await page.waitForTimeout(3000);
    
    // Second add - should NOT show toast
    await addBtn.click();
    await page.waitForTimeout(500);
    
    toasts = page.locator('[role="status"]:visible');
    await expect(toasts).toHaveCount(0);
  });
  
  test('should handle featured product direct add', async ({ page }) => {
    await page.goto('/');
    
    // Find featured product card
    const featuredCard = page.locator('[data-testid="featured-product-card"]').first();
    
    // Click add to cart
    const addBtn = featuredCard.locator('[data-testid="quick-add-btn"]');
    await addBtn.click();
    
    // Should show loading state
    await expect(addBtn).toContainText('Adding...');
    await expect(addBtn).toBeDisabled();
    
    // Wait for completion
    await page.waitForTimeout(1000);
    
    // Button should be enabled again
    await expect(addBtn).toBeEnabled();
    await expect(addBtn).toContainText('Add to Cart');
    
    // Cart badge should update
    const cartBadge = page.locator('[data-testid="cart-badge"]');
    await expect(cartBadge).toHaveText('1');
  });
  
  test('should merge guest cart on login', async ({ page }) => {
    // Add items as guest
    await page.goto('/product/product-1');
    await page.locator('[data-testid="add-to-cart-btn"]').click();
    await page.waitForTimeout(500);
    
    await page.goto('/product/product-2');
    await page.locator('[data-testid="add-to-cart-btn"]').click();
    await page.waitForTimeout(500);
    
    // Check guest cart has 2 items
    let cartBadge = page.locator('[data-testid="cart-badge"]');
    await expect(cartBadge).toHaveText('2');
    
    // Login
    await page.goto('/login');
    await page.fill('[name="email"]', 'test@example.com');
    await page.fill('[name="password"]', 'password123');
    await page.click('[type="submit"]');
    
    // Wait for login to complete
    await page.waitForURL('/');
    await page.waitForTimeout(1000);
    
    // Cart should still have items (merged)
    cartBadge = page.locator('[data-testid="cart-badge"]');
    await expect(cartBadge).toHaveText('2');
    
    // Should show merge confirmation toast
    const toast = page.locator('[role="status"]:visible');
    await expect(toast).toContainText('Cart merged');
  });
  
  test('should adjust quantity in product listing', async ({ page }) => {
    await page.goto('/products');
    
    // Find first product card
    const productCard = page.locator('[data-testid="product-card"]').first();
    
    // Find quantity controls
    const incrementBtn = productCard.locator('[aria-label="Increase quantity"]');
    const decrementBtn = productCard.locator('[aria-label="Decrease quantity"]');
    const quantityInput = productCard.locator('[aria-label="Product quantity"]');
    
    // Initial quantity should be 1
    await expect(quantityInput).toHaveValue('1');
    
    // Increment to 3
    await incrementBtn.click();
    await incrementBtn.click();
    await expect(quantityInput).toHaveValue('3');
    
    // Add to cart
    const addBtn = productCard.locator('[data-testid="quick-add-btn"]');
    await addBtn.click();
    await page.waitForTimeout(1000);
    
    // Cart badge should show 3
    const cartBadge = page.locator('[data-testid="cart-badge"]');
    await expect(cartBadge).toHaveText('3');
    
    // Quantity should reset to 1
    await expect(quantityInput).toHaveValue('1');
  });
  
  test('should handle out of stock products', async ({ page }) => {
    await page.goto('/product/out-of-stock-product');
    
    // Add to cart button should be disabled
    const addBtn = page.locator('[data-testid="add-to-cart-btn"]');
    await expect(addBtn).toBeDisabled();
    
    // Should show out of stock message
    const stockBadge = page.locator('[data-testid="stock-badge"]');
    await expect(stockBadge).toContainText('Out of Stock');
  });
  
  test('should show error toast for insufficient stock', async ({ page }) => {
    await page.goto('/product/low-stock-product');
    
    // Set quantity higher than available stock
    const quantityInput = page.locator('[aria-label="Product quantity"]');
    await quantityInput.fill('100');
    
    // Try to add to cart
    const addBtn = page.locator('[data-testid="add-to-cart-btn"]');
    await addBtn.click();
    
    // Should show error toast
    await page.waitForSelector('[role="status"]');
    const toast = page.locator('[role="status"]:visible');
    await expect(toast).toContainText('available');
  });
  
  test('should persist toast history across page reloads', async ({ page }) => {
    await page.goto('/product/test-product-id');
    
    // Add to cart - should show toast
    const addBtn = page.locator('[data-testid="add-to-cart-btn"]');
    await addBtn.click();
    await page.waitForSelector('[role="status"]');
    
    // Reload page
    await page.reload();
    await page.waitForLoadState('networkidle');
    
    // Add again - should NOT show toast
    await addBtn.click();
    await page.waitForTimeout(500);
    
    const toasts = page.locator('[role="status"]:visible');
    await expect(toasts).toHaveCount(0);
  });
  
  test('should handle buy now flow', async ({ page }) => {
    await page.goto('/product/test-product-id');
    
    // Click buy now
    const buyNowBtn = page.locator('[data-testid="buy-now-btn"]');
    await buyNowBtn.click();
    
    // Should redirect to checkout
    await page.waitForURL('/checkout');
    
    // Cart should have the item
    const cartItems = page.locator('[data-testid="cart-item"]');
    await expect(cartItems).toHaveCount(1);
  });
  
  test('should be accessible with keyboard navigation', async ({ page }) => {
    await page.goto('/product/test-product-id');
    
    // Tab to add to cart button
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    
    // Check focus is on add to cart button
    const addBtn = page.locator('[data-testid="add-to-cart-btn"]');
    await expect(addBtn).toBeFocused();
    
    // Press Enter to add
    await page.keyboard.press('Enter');
    
    // Should add to cart
    await page.waitForTimeout(1000);
    const cartBadge = page.locator('[data-testid="cart-badge"]');
    await expect(cartBadge).toHaveText('1');
  });
  
  test('should announce loading state to screen readers', async ({ page }) => {
    await page.goto('/product/test-product-id');
    
    const addBtn = page.locator('[data-testid="add-to-cart-btn"]');
    
    // Check initial aria-busy state
    await expect(addBtn).toHaveAttribute('aria-busy', 'false');
    
    // Click add to cart
    await addBtn.click();
    
    // Should set aria-busy during loading
    await expect(addBtn).toHaveAttribute('aria-busy', 'true');
    
    // Wait for completion
    await page.waitForTimeout(1000);
    
    // Should reset aria-busy
    await expect(addBtn).toHaveAttribute('aria-busy', 'false');
  });
});

test.describe('Analytics Tracking', () => {
  test('should track add to cart events', async ({ page }) => {
    // Listen for analytics calls
    const analyticsEvents: any[] = [];
    
    page.on('console', msg => {
      if (msg.text().includes('📊 Analytics')) {
        analyticsEvents.push(msg.text());
      }
    });
    
    await page.goto('/product/test-product-id');
    
    const addBtn = page.locator('[data-testid="add-to-cart-btn"]');
    await addBtn.click();
    await page.waitForTimeout(1000);
    
    // Check analytics event was logged
    expect(analyticsEvents.length).toBeGreaterThan(0);
    expect(analyticsEvents.some(e => e.includes('add_to_cart'))).toBeTruthy();
  });
});
