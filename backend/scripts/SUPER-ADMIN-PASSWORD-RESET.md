# Super Admin Password Reset Guide

यदि Super Admin ले आफ्नो password बिर्सिएको छ भने, यहाँ तीन तरिकाहरू छन् password reset गर्न:

## Method 1: API Endpoint (Recommended)
Super Admin को लागि विशेष forgot password endpoint बनाइएको छ:

```bash
POST /api/auth/super-admin/forgot-password
Content-Type: application/json

{
  "email": "khemsangrai@gmail.com"
}
```

यो endpoint:
- केवल Super Admin को लागि मात्र काम गर्छ
- 30 मिनेटको लागि valid reset token बनाउँछ
- विशेष security email template पठाउँछ

## Method 2: Script द्वारा Email Reset
Terminal मा यो command चलाउनुहोस्:

```bash
cd backend
node super-admin-reset-password.js
```

यो script:
- Super Admin को email मा reset link पठाउँछ
- यदि email fail भयो भने manual reset URL देखाउँछ
- 30 मिनेटको expiry time दिन्छ

## Method 3: Direct Password Change (Emergency)
यदि email access छैन भने, direct password change गर्न सकिन्छ:

```bash
cd backend
node change-super-admin-password.js
```

यो script:
- Interactive prompt देखाउँछ
- नयाँ password सोध्छ
- तुरुन्तै password change गर्छ
- कुनै email वा token चाहिँदैन

## Security Features

### Super Admin Email Template
- 🛡️ High priority security alert
- ⚠️ Special warning messages
- 🔐 30 मिनेट expiry (normal users को लागि 15 मिनेट)
- 🚨 Security instructions

### API Endpoint Security
- केवल Super Admin email को लागि मात्र
- Activity logging
- Extended token expiry
- Special email template

### Script Security
- Database connection verification
- Super Admin role verification
- Password strength validation
- Secure token generation

## Usage Examples

### Frontend Integration
```javascript
// Super Admin forgot password
const response = await fetch('/api/auth/super-admin/forgot-password', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email: 'khemsangrai@gmail.com' })
});

const data = await response.json();
console.log(data.message); // "Super Admin password reset link sent to your email"
```

### Reset Password (Same as normal users)
```javascript
// Reset password using token
const response = await fetch('/api/auth/reset-password', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ 
    token: 'reset-token-from-email',
    password: 'newPassword123'
  })
});
```

## Files Created/Modified

### New Files:
- `backend/super-admin-reset-password.js` - Email reset script
- `backend/change-super-admin-password.js` - Direct password change
- `backend/SUPER-ADMIN-PASSWORD-RESET.md` - This guide

### Modified Files:
- `backend/src/controllers/authController.js` - Added superAdminForgotPassword function
- `backend/src/routes/authRoutes.js` - Added super admin route
- `backend/src/services/emailService.js` - Added special email template

## Environment Variables Required
```env
MONGO_URI=mongodb://localhost:27017/your-database
FRONTEND_URL=http://localhost:5173
GMAIL_USER=your-email@gmail.com
GMAIL_APP_PASSWORD=your-app-password
STORE_NAME=Khemsang Store
```

## Notes
- Super Admin email: `khemsangrai@gmail.com`
- सबै methods secure छन् र proper validation गर्छन्
- Development mode मा tokens console मा देखिन्छन्
- Production मा केवल email मार्फत मात्र reset link पाइन्छ