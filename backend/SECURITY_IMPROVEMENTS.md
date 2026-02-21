# 🔒 Security Improvements Implementation Guide

## ✅ Completed Improvements

### 1. Unified Authentication Middleware
**File:** `backend/src/middleware/auth.unified.js`

**Features:**
- Consolidated auth.js + roleAuth.js into single file
- Added refresh token support (access: 15min, refresh: 7 days)
- Enhanced logging with request tracking
- Standardized API responses
- Role-based authorization factory
- Admin action logging

**Usage:**
```javascript
import { authenticate, requireAdmin, requireSuperAdmin } from "./middleware/auth.unified.js";

// Basic auth
router.get("/profile", authenticate, getProfile);

// Admin only
router.get("/admin/users", requireAdmin, getUsers);

// Super admin only
router.delete("/admin/:id", requireSuperAdmin, deleteAdmin);
```

### 2. Enhanced File Upload Security
**File:** `backend/src/middleware/upload.js`

**Improvements:**
- MIME type validation against whitelist
- Extension matching with MIME type
- Suspicious filename detection
- Secure random filenames
- File size limits (5MB per file, max 5 files)
- Comprehensive error handling

**Blocked Patterns:**
- Double extensions (.php, .exe, .sh, .bat, .cmd, .js)
- MIME type spoofing
- Oversized files

### 3. CSRF Protection
**File:** `backend/src/middleware/csrf.js`

**Implementation:**
- Double Submit Cookie pattern
- Constant-time comparison (timing attack prevention)
- Auto-generation for new sessions
- Public endpoint exemptions
- Token rotation support

**Frontend Integration Required:**
```javascript
// Get CSRF token
const { data } = await api.get("/auth/csrf-token");

// Include in requests
axios.defaults.headers.common["x-csrf-token"] = data.csrfToken;
```

### 4. Request ID Tracking
**File:** `backend/src/middleware/requestId.js`

**Features:**
- Unique ID for each request
- Request/response logging
- Performance tracking
- User action correlation
- Debug support

**Log Format:**
```json
{
  "requestId": "req_1234567890_abc123",
  "method": "POST",
  "path": "/api/products",
  "duration": "45ms",
  "statusCode": 201,
  "userId": "user_id_here"
}
```

### 5. Refresh Token System
**Files:** 
- `backend/src/models/User.js` (added refreshTokens field)
- `backend/src/controllers/authController.js` (added refresh functions)

**Features:**
- Secure token storage (hashed in DB)
- Device tracking
- IP logging
- Automatic cleanup of expired tokens
- Token rotation on refresh

---

## 🚀 Integration Steps

### Step 1: Update app.js

```javascript
import { addRequestId, logRequest } from "./middleware/requestId.js";
import { generateAndSetCsrfToken, validateCsrfToken, getCsrfToken } from "./middleware/csrf.js";

// Add after existing middleware
app.use(addRequestId);
app.use(logRequest);
app.use(generateAndSetCsrfToken);

// CSRF token endpoint
app.get("/api/auth/csrf-token", getCsrfToken);

// Apply CSRF validation to state-changing requests
app.use(validateCsrfToken);

// ... rest of routes
```

### Step 2: Update authRoutes.js

```javascript
import { authenticate } from "../middleware/auth.unified.js";
import { refreshAccessToken, logoutWithRefreshToken } from "../controllers/authController.js";

// Add refresh token route
router.post("/refresh", refreshAccessToken);

// Update logout to use new function
router.post("/logout", authenticate, logoutWithRefreshToken);
```

### Step 3: Update Login Flow

Modify `verifyOTP` in authController.js:

```javascript
export const verifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;
    
    // ... existing OTP validation ...

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    user.otpVerifiedAt = new Date();
    await user.save();
    await OTP.deleteOne({ _id: otpRecord._id });

    // Generate tokens using unified auth
    const { generateAccessToken, generateRefreshToken, setAuthCookies } = 
      await import("../middleware/auth.unified.js");
    
    const accessToken = generateAccessToken(user._id);
    const refreshToken = generateRefreshToken(user._id);

    // Store hashed refresh token in DB
    const hashedRefreshToken = crypto.createHash("sha256").update(refreshToken).digest("hex");
    user.refreshTokens.push({
      token: hashedRefreshToken,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      device: req.headers["user-agent"],
      ip: req.ip,
    });
    await user.save();

    // Set cookies
    setAuthCookies(res, accessToken, refreshToken);

    // ... rest of response ...
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
```

### Step 4: Frontend API Updates

**File:** `frontend/src/services/api.ts`

```typescript
// Add CSRF token fetching
let csrfToken: string | null = null;

export const fetchCsrfToken = async () => {
  const { data } = await api.get("/auth/csrf-token");
  csrfToken = data.csrfToken;
  return csrfToken;
};

// Update interceptor
api.interceptors.request.use(async (config) => {
  // Add CSRF token to state-changing requests
  if (["post", "put", "patch", "delete"].includes(config.method?.toLowerCase() || "")) {
    if (!csrfToken) {
      await fetchCsrfToken();
    }
    config.headers["x-csrf-token"] = csrfToken;
  }
  return config;
});

// Handle token refresh on 401
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // Try to refresh token
        await api.post("/auth/refresh");
        return api(originalRequest);
      } catch (refreshError) {
        // Refresh failed, redirect to login
        window.location.href = "/login?session=expired";
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);
```

### Step 5: Environment Variables

Add to `.env`:

```env
# JWT Secrets (CHANGE THESE!)
JWT_SECRET=your-super-secret-jwt-key-change-this
JWT_REFRESH_SECRET=your-super-secret-refresh-key-change-this-too

# Security
NODE_ENV=production
FRONTEND_URL=https://yourdomain.com
```

---

## 📋 Migration Checklist

- [ ] Install unified auth middleware
- [ ] Update all routes to use new auth middleware
- [ ] Add CSRF protection to app.js
- [ ] Add request ID middleware
- [ ] Update login/OTP flow with refresh tokens
- [ ] Add refresh token endpoint
- [ ] Update frontend API interceptors
- [ ] Add CSRF token fetching
- [ ] Test authentication flow
- [ ] Test token refresh
- [ ] Test CSRF protection
- [ ] Update environment variables
- [ ] Run database migration (add refreshTokens field)
- [ ] Test file uploads with new validation
- [ ] Monitor logs for request IDs

---

## 🧪 Testing Commands

```bash
# Test CSRF protection
curl -X POST http://localhost:5000/api/products \
  -H "Content-Type: application/json" \
  -d '{"name":"Test"}' \
  # Should fail with 403

# Test with CSRF token
curl -X GET http://localhost:5000/api/auth/csrf-token \
  -c cookies.txt

curl -X POST http://localhost:5000/api/products \
  -b cookies.txt \
  -H "Content-Type: application/json" \
  -H "x-csrf-token: <token-from-previous-request>" \
  -d '{"name":"Test"}'
  # Should succeed

# Test token refresh
curl -X POST http://localhost:5000/api/auth/refresh \
  -b cookies.txt
  # Should return new access token
```

---

## 🔄 Gradual Migration Strategy

### Phase 1: Add New Middleware (No Breaking Changes)
1. Add all new middleware files
2. Keep existing auth middleware
3. Test in development

### Phase 2: Parallel Running
1. Update some routes to use new auth
2. Keep old auth for others
3. Monitor logs for issues

### Phase 3: Full Migration
1. Update all routes to new auth
2. Remove old auth middleware files
3. Update frontend
4. Deploy to production

### Phase 4: Cleanup
1. Remove deprecated code
2. Update documentation
3. Add monitoring alerts

---

## 📊 Security Improvements Summary

| Feature | Before | After | Impact |
|---------|--------|-------|--------|
| Token Expiry | 30 days | 15 min (access) + 7 days (refresh) | ⬆️ High |
| CSRF Protection | ❌ None | ✅ Double Submit Cookie | ⬆️ Critical |
| File Upload | Basic validation | MIME + Extension + Suspicious pattern | ⬆️ High |
| Request Tracking | ❌ None | ✅ Unique ID per request | ⬆️ Medium |
| Auth Middleware | 3 separate files | 1 unified file | ⬆️ Code Quality |
| Token Storage | Cookie only | Cookie + DB (hashed) | ⬆️ High |
| Logging | Basic | Structured with context | ⬆️ Medium |

---

## 🎯 Next Steps (Priority Order)

1. **Immediate (This Week)**
   - [ ] Integrate unified auth middleware
   - [ ] Add CSRF protection
   - [ ] Update file upload validation
   - [ ] Add request ID tracking

2. **Short Term (Next 2 Weeks)**
   - [ ] Implement refresh token flow
   - [ ] Update frontend API client
   - [ ] Add comprehensive testing
   - [ ] Update documentation

3. **Medium Term (Next Month)**
   - [ ] Add API versioning (/api/v1)
   - [ ] Implement rate limiting per user
   - [ ] Add audit log model
   - [ ] Add unit tests

4. **Long Term (Next Quarter)**
   - [ ] Add 2FA with TOTP
   - [ ] Implement device tracking
   - [ ] Add Redis for sessions
   - [ ] Add monitoring (Sentry)

---

## 🆘 Troubleshooting

### CSRF Token Issues
```javascript
// If CSRF fails, check:
1. Cookie is being set: Check browser DevTools > Application > Cookies
2. Header is being sent: Check Network tab > Request Headers
3. Token matches: Compare cookie value with header value
```

### Refresh Token Not Working
```javascript
// Debug steps:
1. Check if refreshToken cookie exists
2. Verify JWT_REFRESH_SECRET is set
3. Check token expiry in database
4. Verify token hash matches
```

### File Upload Rejected
```javascript
// Common issues:
1. MIME type not in whitelist - Add to ALLOWED_FILE_TYPES
2. Extension mismatch - Ensure file extension matches MIME
3. File too large - Check limits in upload.js
```

---

## 📚 Additional Resources

- [OWASP CSRF Prevention](https://cheatsheetseries.owasp.org/cheatsheets/Cross-Site_Request_Forgery_Prevention_Cheat_Sheet.html)
- [JWT Best Practices](https://tools.ietf.org/html/rfc8725)
- [File Upload Security](https://cheatsheetseries.owasp.org/cheatsheets/File_Upload_Cheat_Sheet.html)
- [Express Security Best Practices](https://expressjs.com/en/advanced/best-practice-security.html)

---

**Last Updated:** 2024
**Version:** 1.0.0
**Status:** Ready for Implementation
