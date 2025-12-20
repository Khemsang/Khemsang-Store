# Khemsang Store - E-Commerce Platform

Full-stack e-commerce platform with React frontend and Node.js backend.

## Tech Stack

**Frontend:** React, TypeScript, Tailwind CSS, Redux Toolkit, Vite
**Backend:** Node.js, Express, MongoDB, JWT, Cloudinary
**Email:** Nodemailer with Gmail SMTP

## Quick Start

### Prerequisites
- Node.js 18+
- MongoDB Atlas account
- Cloudinary account
- Gmail account (for SMTP)

### Local Development

1. **Clone and install:**
```bash
# Backend
cd backend
npm install
cp .env.example .env
# Fill in your .env values

# Frontend
cd ../frontend
npm install
cp .env.example .env
```

2. **Start development servers:**
```bash
# Terminal 1 - Backend
cd backend && npm run dev

# Terminal 2 - Frontend
cd frontend && npm run dev
```

3. **Create Super Admin:**
```bash
cd backend
node create-super-admin.js
```

## Deploy to Render

### Option 1: Blueprint (Recommended)
1. Push code to GitHub
2. Go to [Render Dashboard](https://dashboard.render.com)
3. Click "New" → "Blueprint"
4. Connect your GitHub repo
5. Render will auto-detect `render.yaml`
6. Add environment variables in Render dashboard

### Option 2: Manual Setup

**Backend (Web Service):**
- Root Directory: `backend`
- Build Command: `npm install`
- Start Command: `npm start`
- Environment Variables: See `.env.example`

**Frontend (Static Site):**
- Root Directory: `frontend`
- Build Command: `npm install && npm run build`
- Publish Directory: `dist`
- Environment Variables: `VITE_API_URL=https://your-backend.onrender.com/api`

### Environment Variables (Render)

**Backend:**
```
NODE_ENV=production
MONGO_URI=your-mongodb-uri
JWT_SECRET=your-secret
CLOUDINARY_CLOUD_NAME=xxx
CLOUDINARY_API_KEY=xxx
CLOUDINARY_API_SECRET=xxx
EMAIL_USER=your@gmail.com
EMAIL_PASS=app-password
FRONTEND_URL=https://your-frontend.onrender.com
```

**Frontend:**
```
VITE_API_URL=https://your-backend.onrender.com/api
```

## Features

- 🛒 Full e-commerce functionality
- 👤 User authentication with email verification
- 🔐 Admin panel with role-based access
- 👑 Super Admin dashboard
- 📧 Email notifications
- 🖼️ Image upload via Cloudinary
- 🌙 Dark mode support
- 📱 Fully responsive
- 🔧 Maintenance mode

## Admin Roles

| Feature | Admin | Super Admin |
|---------|-------|-------------|
| Manage own products | ✅ | ✅ |
| View all products | ❌ | ✅ (view only) |
| Manage banners | ❌ | ✅ |
| Manage brands | ❌ | ✅ |
| Manage admins | ❌ | ✅ |
| Site settings | ❌ | ✅ |
| Maintenance mode | ❌ | ✅ |

## License

MIT
