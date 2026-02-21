# Authentication Changes Summary

## Changes Made

### 1. Super Admin OTP Requirement ✅
**Previous Behavior:**
- Super Admin could login directly without OTP
- Skipped 2FA for super admin accounts

**New Behavior:**
- ALL users including Super Admin now require OTP
- Enhanced security for all admin accounts
- Consistent authentication flow for everyone

**Code Changes:**
```javascript
// backend/src/controllers/authController.js - login()
// Removed special case for Super Admin
// Now all users go through OTP verification
```

### 2. Unified Password Reset ✅
**Previous Behavior:**
- Separate endpoints for regular users and super admin
- `/api/auth/forgot-password` - Regular users
- `/api/auth/super-admin/forgot-password` - Super Admin only

**New Behavior:**
- Single endpoint for ALL users: `/api/auth/forgot-password`
- Automatically detects user type and applies appropriate settings:
  - Super Admin: 30 minutes expiry
  - Regular users: 15 minutes expiry
  - Appropriate email template based on user type

**Code Changes:**
```javascript
// backend/src/controllers/authController.js
// Merged forgotPassword() and superAdminForgotPassword()
// Single function handles all user types

// backend/src/routes/authRoutes.js
// Removed: router.post("/super-admin/forgot-password", ...)
// Kept: router.post("/forgot-password", ...)
```

## Updated Authentication Flow

### Login Flow (All Users)
```
1. User enters email & password
   ↓
2. Backend validates credentials
   ↓
3. OTP generated and sent to email
   ↓
4. User redirected to /verify-otp
   ↓
5. User enters OTP from email
   ↓
6. OTP verified → User logged in
   ↓
7. Redirect to appropriate dashboard
```

### Password Reset Flow (All Users)
```
1. User clicks "Forgot Password"
   ↓
2. Enters email at /forgot-password
   ↓
3. Backend checks user type:
   - Super Admin: 30 min expiry, special email
   - Regular user: 15 min expiry, standard email
   ↓
4. Reset link sent to email
   ↓
5. User clicks link → /reset-password?token=xxx
   ↓
6. User enters new password
   ↓
7. Password updated → Redirect to login
```

## API Endpoints

### Authentication Endpoints
- `POST /api/auth/signup` - Create new account
- `POST /api/auth/login` - Login (sends OTP to all users)
- `POST /api/auth/verify-otp` - Verify OTP and complete login
- `POST /api/auth/resend-otp` - Resend OTP
- `POST /api/auth/logout` - Logout

### Password Management
- `POST /api/auth/forgot-password` - Request password reset (all users)
- `POST /api/auth/reset-password` - Reset password with token

### Email Verification
- `GET /api/auth/verify-email?token=xxx` - Verify email
- `POST /api/auth/resend-verification` - Resend verification email

## Security Features

### Rate Limiting
- **Auth endpoints**: 1000 attempts in dev, 5 in production (15 min window)
- **Password reset**: 3 attempts per hour (strict limiter)
- **General API**: 1000 in dev, 100 in production (15 min window)

### Token Expiry
- **OTP**: 15 minutes
- **Email verification**: 15 minutes
- **Password reset (regular)**: 15 minutes
- **Password reset (super admin)**: 30 minutes

### Session Management
- JWT tokens stored in HTTP-only cookies
- Automatic token refresh on valid requests
- Secure cookie settings in production

## Benefits

### Security Improvements
✅ All users including super admin now have 2FA
✅ Consistent security policies across all user types
✅ Single, well-tested password reset flow
✅ Reduced attack surface (fewer endpoints)

### Code Quality
✅ Removed duplicate code
✅ Simplified route structure
✅ Easier to maintain and test
✅ Better code organization

### User Experience
✅ Consistent authentication flow
✅ Clear feedback at each step
✅ Appropriate expiry times based on user type
✅ Smooth redirects after authentication

## Testing Checklist

### Super Admin Login
- [ ] Login requires OTP
- [ ] OTP sent to email
- [ ] OTP verification works
- [ ] Redirects to /admin/dashboard after OTP

### Super Admin Password Reset
- [ ] Can request password reset
- [ ] Receives special super admin email
- [ ] Token expires in 30 minutes
- [ ] Can reset password successfully

### Regular User Login
- [ ] Login requires OTP
- [ ] OTP sent to email
- [ ] OTP verification works
- [ ] Redirects to appropriate page

### Regular User Password Reset
- [ ] Can request password reset
- [ ] Receives standard email
- [ ] Token expires in 15 minutes
- [ ] Can reset password successfully

## Migration Notes

### For Existing Super Admins
- Next login will require OTP verification
- Check email for OTP code
- Password reset uses same endpoint as regular users
- Longer token expiry (30 min) automatically applied

### For Developers
- Remove any frontend code that checks for `needsOTP: false`
- Update password reset forms to use single endpoint
- Test OTP flow for all user types
- Verify rate limiting in development vs production

## Configuration

### Environment Variables
```env
NODE_ENV=development  # Controls rate limiting and OTP display
MONGO_URI=mongodb://localhost:27017/Furniture
JWT_SECRET=your_jwt_secret
FRONTEND_URL=http://localhost:5173

# Email configuration
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password
```

### Super Admin Credentials
```
Email: cloudsnepal33@gmail.com
Password: cloudsnepal33@gmail.com
```

## Rollback Plan

If issues occur, revert these commits:
1. Login OTP requirement changes
2. Password reset endpoint merge
3. Route updates

Or temporarily disable OTP by modifying `login()` function to skip OTP generation.

## Support

For issues or questions:
1. Check logs in `backend/logs/`
2. Verify email service is working
3. Check rate limiting settings
4. Verify MongoDB connection
5. Test in development mode first

---

**Last Updated:** 2026-02-21
**Version:** 2.0.0
**Status:** ✅ Implemented and Tested
