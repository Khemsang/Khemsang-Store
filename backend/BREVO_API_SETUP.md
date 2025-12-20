# Brevo API Email Setup (Production-Ready)

## Why Brevo API instead of SMTP?

- ✅ **No port blocking** - Works on Render, Heroku, and all cloud platforms
- ✅ **More reliable** - Direct API calls, no SMTP timeouts
- ✅ **Better deliverability** - Brevo handles SPF/DKIM automatically
- ✅ **Free tier** - 300 emails/day free forever
- ✅ **Production-safe** - No authentication failures

## Setup Steps

### 1. Get Brevo API Key

1. Go to https://app.brevo.com (create account if needed)
2. Navigate to **Settings** → **API Keys**
3. Click **Generate a new API key**
4. Copy the key (starts with `xkeysib-...`)

### 2. Update Environment Variables

**Local (.env):**
```env
BREVO_API_KEY=xkeysib-your-api-key-here
EMAIL_FROM=your-verified-email@domain.com
FRONTEND_URL=http://localhost:5173
```

**Render Dashboard:**
- Go to your backend service
- Click **Environment** tab
- Add:
  - `BREVO_API_KEY` = your API key
  - `EMAIL_FROM` = your verified sender email
  - `FRONTEND_URL` = your frontend URL

### 3. Verify Sender Email (Important!)

1. In Brevo dashboard, go to **Senders** → **Domains & Addresses**
2. Add your sender email (e.g., `noreply@yourdomain.com`)
3. Verify it via the confirmation email
4. Use this verified email in `EMAIL_FROM`

### 4. Update Auth Controller

Replace SMTP imports with Brevo API:

```javascript
// OLD (SMTP)
import { sendVerificationEmail } from "../config/email.js";
import { sendOTPEmail, sendPasswordResetEmail } from "../services/emailService.js";

// NEW (Brevo API)
import {
  sendVerificationEmail,
  sendOTPEmail,
  sendPasswordResetEmail,
} from "../services/brevoEmailService.js";
```

### 5. Test Locally

```bash
cd backend
npm run dev
```

Try signup/login - emails should send via Brevo API!

## API Limits

| Plan | Emails/Day | Cost |
|------|------------|------|
| Free | 300 | $0 |
| Lite | 10,000 | $25/month |
| Premium | 20,000+ | $65/month |

## Troubleshooting

**Error: "Sender not verified"**
- Go to Brevo → Senders → Verify your email

**Error: "API key invalid"**
- Regenerate API key in Brevo dashboard
- Update `.env` and Render environment variables

**Emails not received:**
- Check spam folder
- Verify sender email in Brevo
- Check Brevo dashboard → Statistics for delivery status

## Fallback to Console (Development)

If API key is missing, emails are logged to console in development mode:

```
⚠️ Dev mode - email skipped
Verification token: abc123...
```

## Migration from SMTP

1. Install the new service (already done)
2. Get Brevo API key
3. Update imports in `authController.js`
4. Deploy to Render
5. Remove old SMTP env vars (optional)

Done! No more SMTP port issues! 🎉
