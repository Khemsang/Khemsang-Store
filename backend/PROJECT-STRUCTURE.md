# Backend Project Structure

## Directory Structure

```
backend/
├── config/              # Configuration files
├── scripts/             # Utility scripts for admin/user management
├── src/
│   ├── config/         # Database and app configuration
│   ├── controllers/    # Request handlers
│   ├── middleware/     # Express middleware (auth, error handling)
│   ├── models/         # MongoDB models
│   ├── routes/         # API route definitions
│   ├── services/       # Business logic and external services
│   ├── utils/          # Helper functions
│   ├── app.js          # Express app configuration
│   └── server.js       # Server entry point
├── uploads/            # File upload directory
├── .env                # Environment variables
├── .env.example        # Environment variables template
└── package.json        # Dependencies and scripts
```

## Key Features

### Authentication & Authorization
- JWT-based authentication
- Role-based access control (Customer, Seller, Admin, Super Admin)
- Email verification with OTP
- Password reset functionality
- Super Admin bypasses OTP for direct login

### User Roles

1. **Customer** - Regular users who can browse and purchase
2. **Seller** - Vendors who can sell products (requires approval)
3. **Admin** - Can manage products, orders, users (created by Super Admin only)
4. **Super Admin** - Full system access, can create admins

### Security Features
- Passwords hashed with bcrypt
- HTTP-only cookies for JWT tokens
- CORS protection
- Admin accounts can only be created by Super Admin
- Public signup only creates customer/seller accounts

### API Routes

- `/api/auth` - Authentication (login, signup, verify, OTP)
- `/api/products` - Product management
- `/api/orders` - Order management
- `/api/cart` - Shopping cart
- `/api/categories` - Product categories
- `/api/admin-management` - Admin user management (Super Admin only)
- `/api/admin/sellers` - Seller management
- `/api/reviews` - Product reviews
- `/api/banners` - Homepage banners
- `/api/coupons` - Discount coupons
- `/api/stats` - Analytics and statistics

## Environment Variables

Required variables in `.env`:
- `PORT` - Server port (default: 5000)
- `MONGO_URI` - MongoDB connection string
- `JWT_SECRET` - Secret key for JWT tokens
- `JWT_EXPIRES_IN` - JWT expiration time (e.g., 7d)
- `FRONTEND_URL` - Frontend URL for CORS
- `SMTP_*` - Email configuration for OTP/verification

## Running the Application

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Start production server
npm start

# Create super admin
node scripts/create-super-admin.js
```

## Database Models

- **User** - User accounts with role-based permissions
- **Product** - Product catalog
- **Order** - Customer orders
- **Category** - Product categories
- **Review** - Product reviews
- **OTP** - One-time passwords for verification
- **AdminLog** - Admin action audit trail
- **Banner** - Homepage promotional banners
- **Coupon** - Discount codes

## Current Super Admin

- Email: cloudsnepalweb33@gmail.com
- Password: cloudsnepalweb33@gmail.com
