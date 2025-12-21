# Email Service Setup Guide

## Gmail Configuration Required

To enable email functionality, you need to configure Gmail in your `.env` file:

### Step 1: Update .env File

```env
GMAIL_USER=your-email@gmail.com
GMAIL_APP_PASSWORD=your-16-char-app-password
STORE_NAME=Khemsang Store
```

### Step 2: Generate Gmail App Password

1. Go to https://myaccount.google.com/apppasswords
2. Sign in with your Gmail account
3. Select "Mail" as the app
4. Select "Other" as the device and name it "Khemsang Store"
5. Click "Generate"
6. Copy the 16-character password (remove spaces)
7. Paste it in `.env` as `GMAIL_APP_PASSWORD`

**Note:** You need to have 2-Step Verification enabled on your Google account to generate app passwords.

## Email Features Enabled

### 1. User Authentication Emails
- ✅ **Email Verification**: Sent when user signs up
- ✅ **OTP for Login**: 6-digit code sent on login
- ✅ **Password Reset**: Link sent to reset forgotten password

### 2. Order Emails
- ✅ **Order Confirmation**: Sent when order is placed
- ✅ **Order Shipped**: Sent when admin marks order as shipped
- ✅ **Order Delivered**: Sent when order is delivered

### 3. Admin Management Emails (Super Admin → Admin)
- ✅ **Account Suspended**: Sent when super admin suspends an admin
- ✅ **Account Reactivated**: Sent when super admin reactivates an admin
- ✅ **Password Reset**: Sent when super admin resets admin password
- ✅ **Warning Notice**: Sent when super admin issues a warning

## Testing Email Service

After configuring Gmail credentials, restart the server:

```bash
cd backend
npm run dev
```

You should see:
```
✅ Gmail service ready
MongoDB Connected: ...
Server running on port 4000
```

If you see an error like "❌ Gmail connection failed", check:
1. Gmail email is correct
2. App password is correct (16 characters, no spaces)
3. 2-Step Verification is enabled on your Google account

## Email Templates

All email templates are beautifully designed with:
- Responsive HTML design
- Professional styling
- Clear call-to-action buttons
- Mobile-friendly layout

## Development Mode

In development mode (`NODE_ENV=development`):
- OTP codes are shown in API response if email fails
- Detailed error logs are shown in console
- Email sending errors won't crash the server

## Production Recommendations

For production, consider:
1. Using a dedicated email service (SendGrid, AWS SES, Mailgun)
2. Setting up email rate limiting
3. Adding email queue system (Bull, BullMQ)
4. Monitoring email delivery rates
5. Setting up SPF, DKIM, and DMARC records

## Troubleshooting

### "Invalid login" error
- Check if app password is correct
- Make sure 2-Step Verification is enabled
- Try generating a new app password

### Emails not received
- Check spam folder
- Verify recipient email is correct
- Check Gmail sending limits (500 emails/day for free accounts)

### "Connection timeout"
- Check internet connection
- Verify firewall isn't blocking port 587
- Try using port 465 with `secure: true`
