# API Documentation

Base URL: `http://localhost:5000/api`

## Authentication Endpoints

### POST `/auth/signup`
Register a new customer or seller account.

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "message": "Account created! Please check your email to verify your account.",
  "email": "john@example.com"
}
```

### POST `/auth/login`
Login with email and password.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response (Regular User):**
```json
{
  "message": "OTP sent to your email",
  "needsOTP": true
}
```

**Response (Super Admin):**
```json
{
  "message": "Super Admin login successful",
  "user": { ... },
  "needsOTP": false,
  "redirectTo": "/super-admin/dashboard"
}
```

### POST `/auth/verify-otp`
Verify OTP for login.

**Request Body:**
```json
{
  "email": "user@example.com",
  "otp": "123456"
}
```

### GET `/auth/verify-email/:token`
Verify email address with token from email.

### POST `/auth/resend-verification`
Resend email verification link.

### POST `/auth/forgot-password`
Request password reset link.

### POST `/auth/reset-password`
Reset password with token.

### GET `/auth/me`
Get current user profile (requires authentication).

### PUT `/auth/profile`
Update user profile (requires authentication).

### PUT `/auth/change-password`
Change password (requires authentication).

## Admin Management (Super Admin Only)

### GET `/admin-management/admins`
Get all admin users.

### POST `/admin-management/create-admin`
Create a new admin account.

**Request Body:**
```json
{
  "name": "Admin Name",
  "email": "admin@example.com",
  "password": "password123",
  "phone": "1234567890",
  "adminRole": "admin",
  "permissions": { ... }
}
```

### PUT `/admin-management/suspend/:userId`
Suspend an admin account.

### PUT `/admin-management/activate/:userId`
Activate a suspended admin account.

### PUT `/admin-management/reset-password/:userId`
Reset admin password.

### PUT `/admin-management/warn/:userId`
Issue warning to admin.

## Product Management

### GET `/products`
Get all products with pagination and filters.

**Query Parameters:**
- `page` - Page number
- `limit` - Items per page
- `category` - Filter by category
- `search` - Search term
- `minPrice` - Minimum price
- `maxPrice` - Maximum price

### GET `/products/:id`
Get single product details.

### POST `/products`
Create new product (Admin/Seller only).

### PUT `/products/:id`
Update product (Admin/Seller only).

### DELETE `/products/:id`
Delete product (Admin/Seller only).

## Order Management

### GET `/orders`
Get user orders (authenticated).

### GET `/orders/:id`
Get single order details.

### POST `/orders`
Create new order.

### PUT `/orders/:id/status`
Update order status (Admin only).

## Category Management

### GET `/categories`
Get all categories.

### POST `/categories`
Create category (Admin only).

### PUT `/categories/:id`
Update category (Admin only).

### DELETE `/categories/:id`
Delete category (Admin only).

## Cart Management

### GET `/cart`
Get user cart (authenticated).

### POST `/cart`
Add item to cart.

### PUT `/cart/:itemId`
Update cart item quantity.

### DELETE `/cart/:itemId`
Remove item from cart.

## Review Management

### GET `/reviews/product/:productId`
Get product reviews.

### POST `/reviews`
Create review (authenticated).

### PUT `/reviews/:id`
Update review (authenticated).

### DELETE `/reviews/:id`
Delete review (authenticated).

## Seller Management (Admin Only)

### GET `/admin/sellers`
Get all sellers.

### PUT `/admin/sellers/:id/approve`
Approve seller account.

### PUT `/admin/sellers/:id/reject`
Reject seller account.

## Banner Management (Admin Only)

### GET `/banners`
Get all banners.

### POST `/banners`
Create banner.

### PUT `/banners/:id`
Update banner.

### DELETE `/banners/:id`
Delete banner.

## Coupon Management (Admin Only)

### GET `/coupons`
Get all coupons.

### POST `/coupons`
Create coupon.

### PUT `/coupons/:id`
Update coupon.

### DELETE `/coupons/:id`
Delete coupon.

### POST `/coupons/validate`
Validate coupon code.

## Statistics (Admin Only)

### GET `/stats/dashboard`
Get dashboard statistics.

### GET `/stats/sales`
Get sales analytics.

### GET `/stats/users`
Get user statistics.

## File Upload

### POST `/upload`
Upload image file.

**Form Data:**
- `image` - Image file

**Response:**
```json
{
  "url": "https://cloudinary.com/..."
}
```

## Authentication

Most endpoints require authentication. Include JWT token in cookie or Authorization header:

```
Authorization: Bearer <token>
```

## Error Responses

All errors follow this format:

```json
{
  "message": "Error description"
}
```

Common status codes:
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `500` - Server Error
