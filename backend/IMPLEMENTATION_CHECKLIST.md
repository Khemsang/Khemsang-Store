# 🚀 Security & Code Quality Implementation Checklist

## 🔴 PHASE 1: CRITICAL SECURITY (Week 1)

### Day 1-2: Authentication & Authorization
- [ ] **Install unified auth middleware**
  - [ ] Copy `auth.unified.js` to middleware folder
  - [ ] Add JWT_REFRESH_SECRET to .env
  - [ ] Test token generation functions
  
- [ ] **Update User model**
  - [ ] Add refreshTokens field (already done ✅)
  - [ ] Run database migration if needed
  - [ ] Test user creation

- [ ] **Update authController**
  - [ ] Add jwt import (already done ✅)
  - [ ] Add refreshAccessToken function (already done ✅)
  - [ ] Add logoutWithRefreshToken function (already done ✅)
  - [ ] Update verifyOTP to generate refresh tokens
  - [ ] Update login flow if needed

- [ ] **Update authRoutes**
  ```javascript
  import { authenticate } from "../middleware/auth.unified.js";
  import { refreshAccessToken, logoutWithRefreshToken } from "../controllers/authController.js";
  
  router.post("/refresh", refreshAccessToken);
  router.post("/logout", authenticate, logoutWithRefreshToken);
  ```

### Day 3: CSRF Protection
- [ ] **Add CSRF middleware to app.js**
  ```javascript
  import { generateAndSetCsrfToken, validateCsrfToken, getCsrfToken } from "./middleware/csrf.js";
  
  app.use(generateAndSetCsrfToken);
  app.get("/api/auth/csrf-token", getCsrfToken);
  app.use(validateCsrfToken); // After routes that need CSRF
  ```

- [ ] **Test CSRF protection**
  - [ ] Test GET requests (should work)
  - [ ] Test POST without token (should fail)
  - [ ] Test POST with token (should work)

### Day 4: File Upload Security
- [ ] **Update upload middleware** (already done ✅)
- [ ] **Update routes using upload**
  ```javascript
  import { uploadMultiple, uploadErrorHandler } from "../middleware/upload.js";
  
  router.post("/", auth, isAdmin, uploadMultiple("images", 5), createProduct);
  ```

- [ ] **Test file uploads**
  - [ ] Test valid image upload
  - [ ] Test invalid MIME type (should fail)
  - [ ] Test suspicious filename (should fail)
  - [ ] Test file size limit

### Day 5: Request Tracking
- [ ] **Add request ID middleware to app.js**
  ```javascript
  import { addRequestId, logRequest } from "./middleware/requestId.js";
  
  app.use(addRequestId);
  app.use(logRequest);
  ```

- [ ] **Verify logging**
  - [ ] Check logs for request IDs
  - [ ] Verify duration tracking
  - [ ] Test error correlation

---

## 🟠 PHASE 2: CODE QUALITY (Week 2)

### Day 1: Standardize Responses
- [ ] **Update controllers to use ApiResponse**
  ```javascript
  import { ApiResponse } from "../utils/apiResponse.js";
  
  // Instead of:
  res.status(200).json({ message: "Success", data });
  
  // Use:
  ApiResponse.success(res, data, "Success");
  ```

- [ ] **Update error responses**
  ```javascript
  // Instead of:
  res.status(404).json({ message: "Not found" });
  
  // Use:
  ApiResponse.notFound(res, "Resource not found");
  ```

### Day 2: Add Constants
- [ ] **Replace hardcoded values**
  ```javascript
  import { USER_ROLES, ORDER_STATUS, HTTP_STATUS } from "../constants/index.js";
  
  // Instead of:
  if (user.role === "admin") { }
  
  // Use:
  if (user.role === USER_ROLES.ADMIN) { }
  ```

- [ ] **Update all controllers**
  - [ ] authController.js
  - [ ] productController.js
  - [ ] orderController.js
  - [ ] Others...

### Day 3: Add AsyncHandler
- [ ] **Wrap async controllers**
  ```javascript
  import { asyncHandler } from "../utils/asyncHandler.js";
  
  // Instead of:
  export const getProducts = async (req, res) => {
    try {
      // code
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  };
  
  // Use:
  export const getProducts = asyncHandler(async (req, res) => {
    // code - no try-catch needed!
  });
  ```

- [ ] **Update all controllers**
  - [ ] Remove try-catch blocks
  - [ ] Wrap with asyncHandler
  - [ ] Test error handling

### Day 4-5: Migrate to Unified Auth
- [ ] **Update all routes**
  ```javascript
  // Old:
  import { auth, isAdmin } from "../middleware/auth.js";
  
  // New:
  import { authenticate, requireAdmin } from "../middleware/auth.unified.js";
  
  // Old:
  router.get("/", auth, isAdmin, getProducts);
  
  // New:
  router.get("/", requireAdmin, getProducts);
  ```

- [ ] **Test each route**
  - [ ] Public routes
  - [ ] Protected routes
  - [ ] Admin routes
  - [ ] Super admin routes

- [ ] **Remove old auth files**
  - [ ] Delete auth.js (after migration)
  - [ ] Delete authMiddleware.js (if exists)
  - [ ] Delete roleAuth.js (after migration)

---

## 🟡 PHASE 3: FRONTEND INTEGRATION (Week 3)

### Day 1: Update API Client
- [ ] **Add CSRF token fetching**
  ```typescript
  // frontend/src/services/api.ts
  let csrfToken: string | null = null;
  
  export const fetchCsrfToken = async () => {
    const { data } = await api.get("/auth/csrf-token");
    csrfToken = data.csrfToken;
    return csrfToken;
  };
  ```

- [ ] **Add request interceptor**
  ```typescript
  api.interceptors.request.use(async (config) => {
    if (["post", "put", "patch", "delete"].includes(config.method?.toLowerCase() || "")) {
      if (!csrfToken) await fetchCsrfToken();
      config.headers["x-csrf-token"] = csrfToken;
    }
    return config;
  });
  ```

### Day 2: Add Token Refresh
- [ ] **Update response interceptor**
  ```typescript
  api.interceptors.response.use(
    (response) => response,
    async (error) => {
      const originalRequest = error.config;
      
      if (error.response?.status === 401 && !originalRequest._retry) {
        originalRequest._retry = true;
        try {
          await api.post("/auth/refresh");
          return api(originalRequest);
        } catch (refreshError) {
          window.location.href = "/login?session=expired";
          return Promise.reject(refreshError);
        }
      }
      
      return Promise.reject(error);
    }
  );
  ```

### Day 3: Test Frontend
- [ ] **Test authentication flow**
  - [ ] Login
  - [ ] Token refresh
  - [ ] Logout
  - [ ] Session expiry

- [ ] **Test CSRF protection**
  - [ ] Form submissions
  - [ ] API calls
  - [ ] File uploads

### Day 4-5: Update Components
- [ ] **Centralize API calls**
  - [ ] Move inline axios calls to services
  - [ ] Create service files for each feature
  - [ ] Update components to use services

- [ ] **Add error handling**
  - [ ] Global error boundary
  - [ ] Toast notifications
  - [ ] Retry logic

---

## 🟢 PHASE 4: TESTING & DEPLOYMENT (Week 4)

### Day 1-2: Testing
- [ ] **Manual testing**
  - [ ] All authentication flows
  - [ ] All CRUD operations
  - [ ] File uploads
  - [ ] Admin operations
  - [ ] Payment flows

- [ ] **Security testing**
  - [ ] CSRF attacks
  - [ ] XSS attempts
  - [ ] SQL injection attempts
  - [ ] File upload exploits
  - [ ] Rate limiting

### Day 3: Environment Setup
- [ ] **Update .env files**
  ```env
  # Production
  NODE_ENV=production
  JWT_SECRET=<generate-strong-secret>
  JWT_REFRESH_SECRET=<generate-different-strong-secret>
  FRONTEND_URL=https://yourdomain.com
  ```

- [ ] **Generate secrets**
  ```bash
  node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
  ```

### Day 4: Deployment
- [ ] **Pre-deployment checklist**
  - [ ] All tests passing
  - [ ] Environment variables set
  - [ ] Database backed up
  - [ ] Monitoring configured
  - [ ] Error tracking setup (Sentry)

- [ ] **Deploy backend**
  - [ ] Build application
  - [ ] Run migrations
  - [ ] Start server
  - [ ] Verify health check

- [ ] **Deploy frontend**
  - [ ] Build application
  - [ ] Update API URLs
  - [ ] Deploy to hosting
  - [ ] Verify CORS settings

### Day 5: Post-Deployment
- [ ] **Monitor logs**
  - [ ] Check for errors
  - [ ] Verify request IDs
  - [ ] Check performance

- [ ] **Test production**
  - [ ] Authentication
  - [ ] CSRF protection
  - [ ] File uploads
  - [ ] All critical flows

---

## 📊 VERIFICATION CHECKLIST

### Security Verification
- [ ] HTTPS enabled
- [ ] Cookies are httpOnly and secure
- [ ] CSRF protection working
- [ ] Rate limiting active
- [ ] File upload validation working
- [ ] JWT tokens expiring correctly
- [ ] Refresh tokens working
- [ ] Session management working

### Code Quality Verification
- [ ] No hardcoded values
- [ ] Consistent error responses
- [ ] All async handlers wrapped
- [ ] Constants used everywhere
- [ ] Logging comprehensive
- [ ] No duplicate code

### Performance Verification
- [ ] Response times < 200ms
- [ ] Database queries optimized
- [ ] Indexes created
- [ ] Caching implemented
- [ ] Compression enabled

---

## 🆘 ROLLBACK PLAN

If something goes wrong:

### Immediate Rollback
```bash
# Backend
git revert HEAD
npm install
pm2 restart all

# Frontend
git revert HEAD
npm run build
# Deploy previous version
```

### Partial Rollback
- Keep new middleware files
- Revert route changes
- Use old auth temporarily
- Fix issues incrementally

---

## 📝 NOTES

### Important Reminders
- Always test in development first
- Keep old code until fully migrated
- Monitor logs after each change
- Have database backups ready
- Communicate with team

### Common Issues
1. **CSRF token not found**
   - Check cookie settings
   - Verify frontend is sending header
   - Check CORS configuration

2. **Token refresh failing**
   - Verify JWT_REFRESH_SECRET is set
   - Check token expiry in database
   - Verify cookie path settings

3. **File upload rejected**
   - Check MIME type whitelist
   - Verify file size limits
   - Check for suspicious patterns

---

## ✅ COMPLETION CRITERIA

Project is ready when:
- [ ] All checklist items completed
- [ ] All tests passing
- [ ] Security audit passed
- [ ] Performance benchmarks met
- [ ] Documentation updated
- [ ] Team trained on new features
- [ ] Monitoring alerts configured
- [ ] Backup strategy in place

---

**Start Date:** _____________
**Target Completion:** _____________
**Actual Completion:** _____________

**Team Members:**
- Backend Lead: _____________
- Frontend Lead: _____________
- QA Lead: _____________
- DevOps: _____________

---

Good luck with the implementation! 🚀
