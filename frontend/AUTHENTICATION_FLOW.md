# Authentication Flow - Clean Routing

## Complete User Journey

### Flow Summary
```
Email Verification → Login Page → OTP Page → Final Destination
```

### Step-by-Step Flow

#### 1. Email Verification
```
User clicks verification link from Gmail
  ↓
Shows: "Verifying Email..."
  ↓
Success: "Email verified successfully! Redirecting to login..."
  ↓
Wait 2 seconds
  ↓
→ Redirect to /login
```

#### 2. Login Page
```
User enters email & password
  ↓
Click "Sign In"
  ↓
Shows: "Login successful! Redirecting..." toast
  ↓
Wait 1.5 seconds
  ↓
If OTP Required (Regular Users):
  → Navigate to /verify-otp
  → OTP sent to Gmail
  
If NO OTP (Super Admin):
  → Redirect to /admin/dashboard
```

#### 3. OTP Verification
```
User receives OTP in Gmail
  ↓
Enter 6-digit OTP on /verify-otp page
  ↓
Click "Verify & Continue"
  ↓
Shows: "OTP verified successfully!" toast
  ↓
Wait 1 second
  ↓
Check redirect destination:
  - Admin/Super Admin → /admin/dashboard
  - User from cart/checkout → /checkout or /cart
  - Regular user → / (home page)
```

#### 4. Signup Flow
```
User fills signup form
  ↓
Click "Create Account"
  ↓
Shows: "Account created successfully! Please check your email to verify."
  ↓
Wait 2 seconds
  ↓
→ Redirect to /login
  ↓
(Then follow Email Verification flow above)
```

## Example: Cart to Checkout Flow

```
1. User adds items to cart
2. Clicks "Proceed to Checkout"
3. Not logged in → Redirect to /login (path saved: /checkout)
4. User logs in → OTP sent to Gmail
5. Navigate to /verify-otp
6. User enters OTP from Gmail
7. OTP verified → Redirect to /checkout ✅
```

## Key Points

✅ **Email Verify** → Always goes to `/login`
✅ **Login** → Goes to `/verify-otp` (OTP sent to Gmail)
✅ **OTP Verify** → Goes to final destination (home/cart/checkout/dashboard)
✅ **Path Preservation** → Cart/checkout paths saved throughout flow
✅ **Clean Routing** → No double redirects, one clear path

## Session Storage

- `redirectAfterLogin`: Stores intended path (e.g., `/checkout`)
- Cleared after successful OTP verification and redirect

## User Feedback

- Toast notifications at each step
- Loading states on buttons
- Success messages before redirects
- Clear error messages if something fails
