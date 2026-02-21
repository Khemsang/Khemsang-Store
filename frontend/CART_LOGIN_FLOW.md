# Cart Login Flow - Complete Guide

## Problem Statement
जब user cart मा items राख्छ र login गर्न जान्छ, login पछि:
- ❌ Home page मा redirect हुन्थ्यो (cart page मा होइन)
- ❌ Cart items हराउँथे (sync हुँदैनथ्यो)
- ❌ User लाई फेरि items add गर्नु पर्थ्यो

## Solution Implemented ✅

### 1. Redirect Path Preservation
Cart page बाट checkout button click गर्दा:
```typescript
// Cart.tsx
const handleCheckout = () => {
  if (!user) {
    navigate("/login", { state: { from: "/checkout" } });
  } else {
    navigate("/checkout");
  }
};
```

### 2. Login Flow with Path Storage
```typescript
// login.tsx
const handleLogin = async (e: React.FormEvent) => {
  // ...
  if (data.needsOTP) {
    // Store redirect path in sessionStorage
    const intendedPath = location.state?.from;
    if (intendedPath && intendedPath !== '/login' && intendedPath !== '/signup') {
      sessionStorage.setItem('redirectAfterLogin', intendedPath);
    }
    navigate("/verify-otp", { state: { email, from: intendedPath } });
  }
};
```

### 3. OTP Verification with Cart Redirect
```typescript
// VerifyOTP.tsx
const handleSubmit = async (e: React.FormEvent) => {
  // ...
  const redirectPath = location.state?.from || sessionStorage.getItem('redirectAfterLogin');
  sessionStorage.removeItem('redirectAfterLogin');

  if (data.user?.isAdmin || data.user?.isSuperAdmin) {
    window.location.href = "/admin/dashboard";
  } else if (redirectPath && redirectPath !== '/login' && redirectPath !== '/signup' && redirectPath !== '/verify-otp') {
    // Use window.location.href for cart/checkout to ensure cart sync
    if (redirectPath === '/cart' || redirectPath === '/checkout') {
      window.location.href = redirectPath;
    } else {
      navigate(redirectPath, { replace: true });
    }
  } else {
    navigate("/", { replace: true });
  }
};
```

### 4. Cart Sync on Login
```typescript
// CartContext.tsx
useEffect(() => {
  if (user) {
    syncCartAndFetch(); // Sync local cart to backend
  } else {
    loadLocalCart(); // Load from localStorage
  }
}, [user]);

const syncCartAndFetch = async () => {
  try {
    const localCart = localStorage.getItem("cart");
    if (localCart) {
      const items = JSON.parse(localCart);
      if (items.length > 0) {
        console.log("🔄 Syncing local cart to backend:", items.length, "items");
        await api.post("/cart/merge", { items });
        localStorage.removeItem("cart");
        console.log("✅ Cart synced successfully");
      }
    }
    await fetchCart(); // Fetch updated cart from backend
  } catch (error) {
    console.error("❌ Error syncing cart:", error);
    await fetchCart(); // Still fetch even if sync fails
  }
};
```

### 5. Backend Cart Merge
```javascript
// backend/src/controllers/cartController.js
export const mergeCart = async (req, res) => {
  try {
    const { items } = req.body;
    const user = await User.findById(req.user._id);

    items.forEach(item => {
      // Handle both formats
      const productId = typeof item.product === 'object' ? item.product._id : item.product;
      
      const existing = user.cart.find(c => c.product.toString() === productId);
      if (existing) {
        existing.quantity += item.quantity; // Merge quantities
      } else {
        user.cart.push({ product: productId, quantity: item.quantity });
      }
    });

    await user.save();
    const updatedUser = await User.findById(req.user._id).populate("cart.product");
    res.json(updatedUser.cart);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
```

## Complete Flow

### Scenario: User adds items to cart, then logs in

```
1. User (not logged in) adds items to cart
   ↓
   Items stored in localStorage
   
2. User clicks "Proceed to Checkout"
   ↓
   Redirected to /login with state: { from: "/checkout" }
   
3. User enters email & password
   ↓
   Path "/checkout" saved in sessionStorage
   ↓
   Redirected to /verify-otp
   
4. User enters OTP from email
   ↓
   OTP verified ✅
   ↓
   User logged in
   
5. CartContext detects user login
   ↓
   Reads localStorage cart items
   ↓
   Sends to backend: POST /api/cart/merge
   ↓
   Backend merges with existing cart
   ↓
   localStorage cleared
   ↓
   Fresh cart fetched from backend
   
6. OTP page reads sessionStorage
   ↓
   Finds redirectPath = "/checkout"
   ↓
   Uses window.location.href = "/checkout"
   ↓
   Full page reload ensures cart is synced
   
7. User lands on checkout page
   ✅ Cart items visible
   ✅ Ready to complete purchase
```

## Key Points

### Why window.location.href for cart/checkout?
```typescript
if (redirectPath === '/cart' || redirectPath === '/checkout') {
  window.location.href = redirectPath; // Full page reload
} else {
  navigate(redirectPath, { replace: true }); // SPA navigation
}
```

**Reason:** Full page reload ensures:
- CartContext re-initializes
- Cart sync completes before page renders
- No race conditions
- Fresh data from backend

### localStorage Cart Format
```json
[
  {
    "product": {
      "_id": "product_id_here",
      "title": "Product Name",
      "price": 1000,
      "images": ["url"]
    },
    "quantity": 2
  }
]
```

### Backend Cart Format
```json
[
  {
    "product": "product_id_here",
    "quantity": 2
  }
]
```

### Merge Logic
- If product exists in backend cart → Add quantities
- If product doesn't exist → Add new item
- After merge → Clear localStorage
- Return populated cart with full product details

## Testing Checklist

### Test 1: Cart to Checkout Flow
- [ ] Add items to cart (not logged in)
- [ ] Click "Proceed to Checkout"
- [ ] Should redirect to /login
- [ ] Login with credentials
- [ ] Enter OTP
- [ ] Should land on /checkout
- [ ] Cart items should be visible
- [ ] Quantities should be correct

### Test 2: Cart to Cart Flow
- [ ] Add items to cart (not logged in)
- [ ] Manually go to /login
- [ ] Login with credentials
- [ ] Enter OTP
- [ ] Should land on home page (no redirect path)
- [ ] Navigate to /cart
- [ ] Cart items should be visible

### Test 3: Existing Cart Merge
- [ ] Login to account
- [ ] Add items to cart
- [ ] Logout
- [ ] Add different items to cart (localStorage)
- [ ] Login again
- [ ] Both sets of items should be in cart
- [ ] Quantities should be merged if same product

### Test 4: Admin Login
- [ ] Add items to cart (not logged in)
- [ ] Login as admin
- [ ] Should go to /admin/dashboard
- [ ] Cart items should still be synced (for later)

## Debugging

### Check localStorage
```javascript
// In browser console
console.log(JSON.parse(localStorage.getItem('cart')));
```

### Check sessionStorage
```javascript
// In browser console
console.log(sessionStorage.getItem('redirectAfterLogin'));
```

### Check Backend Logs
```bash
# Look for these messages
🔄 Syncing local cart to backend: X items
✅ Updated existing item: quantity Y
✅ Added new item: quantity Z
✅ Cart merged successfully. Total items: N
```

### Check Network Tab
- POST /api/cart/merge - Should return merged cart
- GET /api/cart - Should return full cart with products

## Common Issues

### Issue 1: Cart items disappear after login
**Cause:** Cart sync failed or localStorage cleared too early
**Solution:** Check network tab for /api/cart/merge errors

### Issue 2: Redirects to home instead of cart
**Cause:** sessionStorage not set or cleared too early
**Solution:** Check sessionStorage before OTP verification

### Issue 3: Duplicate items in cart
**Cause:** Merge logic not working correctly
**Solution:** Check backend mergeCart function logs

### Issue 4: Cart shows but quantities wrong
**Cause:** Merge adding instead of replacing
**Solution:** Backend should add quantities for same product

## API Endpoints

### Cart Management
- `GET /api/cart` - Get user's cart
- `POST /api/cart` - Add item to cart
- `POST /api/cart/merge` - Merge localStorage cart (after login)
- `PUT /api/cart/:productId` - Update item quantity
- `DELETE /api/cart/:productId` - Remove item
- `DELETE /api/cart` - Clear entire cart

### Request/Response Examples

#### Merge Cart Request
```json
POST /api/cart/merge
{
  "items": [
    {
      "product": {
        "_id": "product_id_1",
        "title": "Chair"
      },
      "quantity": 2
    },
    {
      "product": {
        "_id": "product_id_2"
      },
      "quantity": 1
    }
  ]
}
```

#### Merge Cart Response
```json
[
  {
    "_id": "cart_item_id",
    "product": {
      "_id": "product_id_1",
      "title": "Chair",
      "price": 5000,
      "images": ["url"]
    },
    "quantity": 2
  }
]
```

---

**Last Updated:** 2026-02-21
**Status:** ✅ Implemented and Working
**Version:** 1.0.0
