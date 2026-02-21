# Render Deployment Guide - नेपालीमा

## 📋 Prerequisites

1. GitHub account
2. Render account (https://render.com)
3. MongoDB Atlas account (https://mongodb.com/cloud/atlas)

---

## Step 1: MongoDB Atlas Setup (Database)

### 1.1 Account बनाउनुहोस्:
- https://www.mongodb.com/cloud/atlas जानुहोस्
- "Try Free" click गर्नुहोस्
- Email/Google संग sign up गर्नुहोस्

### 1.2 Free Cluster बनाउनुहोस्:
1. "Create a Deployment" → "M0 Free" select गर्नुहोस्
2. Provider: AWS
3. Region: Singapore (ap-southeast-1) - Nepal को लागि नजिक
4. Cluster Name: furniture-cluster
5. "Create Deployment" click गर्नुहोस्

### 1.3 Database User बनाउनुहोस्:
1. Username: `furnitureuser`
2. Password: Strong password generate गर्नुहोस् (save गर्नुहोस्!)
3. "Create Database User" click गर्नुहोस्

### 1.4 Network Access:
1. "Add IP Address" click गर्नुहोस्
2. "Allow Access from Anywhere" (0.0.0.0/0) select गर्नुहोस्
3. "Confirm" click गर्नुहोस्

### 1.5 Connection String लिनुहोस्:
1. "Connect" button click गर्नुहोस्
2. "Drivers" select गर्नुहोस्
3. Connection string copy गर्नुहोस्:
   ```
   mongodb+srv://furnitureuser:<password>@furniture-cluster.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```
4. `<password>` लाई आफ्नो password संग replace गर्नुहोस्
5. Database name add गर्नुहोस्: `/furniture_store` before `?`
   ```
   mongodb+srv://furnitureuser:yourpassword@furniture-cluster.xxxxx.mongodb.net/furniture_store?retryWrites=true&w=majority
   ```

---

## Step 2: Backend Deploy (Render)

### 2.1 Render Account:
- https://render.com जानुहोस्
- "Get Started for Free" click गर्नुहोस्
- GitHub संग sign up गर्नुहोस्

### 2.2 New Web Service:
1. Dashboard → "New +" → "Web Service"
2. "Connect a repository" → GitHub repository select गर्नुहोस्
3. Repository को permission दिनुहोस्

### 2.3 Configuration:
```
Name: furniture-backend
Region: Singapore (Southeast Asia)
Branch: main
Root Directory: backend
Runtime: Node
Build Command: npm install
Start Command: npm start
Instance Type: Free
```

### 2.4 Environment Variables:
"Advanced" → "Add Environment Variable" click गरेर यी सबै add गर्नुहोस्:

```env
NODE_ENV=production
PORT=5000
MONGO_URI=mongodb+srv://furnitureuser:yourpassword@furniture-cluster.xxxxx.mongodb.net/furniture_store?retryWrites=true&w=majority
JWT_SECRET=your-super-strong-secret-key-min-32-characters-long-12345678
JWT_EXPIRES_IN=7d
CLOUDINARY_CLOUD_NAME=doagofwa7
CLOUDINARY_API_KEY=139498521616376
CLOUDINARY_API_SECRET=QFewqIThVoih4JYyzUa5iqI0HOg
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=khemsangrai@gmail.com
SMTP_PASS=vfzp zssm rdph pxen
EMAIL_FROM=khemsangrai@gmail.com
FRONTEND_URL=https://your-frontend-url.onrender.com
```

**Important:** 
- `MONGO_URI` मा आफ्नो MongoDB connection string राख्नुहोस्
- `JWT_SECRET` लाई strong random string संग replace गर्नुहोस्
- `FRONTEND_URL` पछि update गर्नुहोस् (frontend deploy भएपछि)

### 2.5 Deploy:
1. "Create Web Service" click गर्नुहोस्
2. Deploy हुन 5-10 minutes लाग्छ
3. Logs हेर्नुहोस् - "Deploy succeeded" देखिनुपर्छ
4. URL मिल्छ: `https://furniture-backend.onrender.com`
5. Test गर्नुहोस्: `https://furniture-backend.onrender.com/health`

---

## Step 3: Frontend Deploy (Render)

### 3.1 New Static Site:
1. Dashboard → "New +" → "Static Site"
2. Same repository select गर्नुहोस्

### 3.2 Configuration:
```
Name: furniture-frontend
Branch: main
Root Directory: frontend
Build Command: npm install && npm run build
Publish Directory: dist
```

### 3.3 Environment Variables:
```env
VITE_API_URL=https://furniture-backend.onrender.com/api
VITE_ESEWA_URL=https://uat.esewa.com.np/epay/main
VITE_ESEWA_MERCHANT_ID=EPAYTEST
```

**Important:** `VITE_API_URL` मा आफ्नो backend URL राख्नुहोस्

### 3.4 Deploy:
1. "Create Static Site" click गर्नुहोस्
2. Deploy हुन 3-5 minutes लाग्छ
3. URL मिल्छ: `https://furniture-frontend.onrender.com`

---

## Step 4: Backend Environment Update

Frontend deploy भएपछि:

1. Backend service मा जानुहोस्
2. "Environment" tab click गर्नुहोस्
3. `FRONTEND_URL` edit गर्नुहोस्:
   ```
   FRONTEND_URL=https://furniture-frontend.onrender.com
   ```
4. "Save Changes" click गर्नुहोस्
5. Service automatically redeploy हुन्छ

---

## Step 5: Super Admin बनाउनुहोस्

### 5.1 Render Shell मा जानुहोस्:
1. Backend service → "Shell" tab
2. Shell open हुन्छ

### 5.2 Super Admin Create:
```bash
npm run create-super-admin
```

### 5.3 Credentials:
Script ले email र password दिन्छ - note गर्नुहोस्!

---

## Step 6: Testing

### 6.1 Backend Test:
```bash
# Health check
curl https://furniture-backend.onrender.com/health

# API test
curl https://furniture-backend.onrender.com/api/products
```

### 6.2 Frontend Test:
1. Browser मा frontend URL खोल्नुहोस्
2. Products देखिनुपर्छ
3. Login test गर्नुहोस् (super admin credentials संग)
4. Admin dashboard access गर्नुहोस्

---

## 🔧 Troubleshooting

### Backend Issues:

**1. Service won't start:**
```
Logs हेर्नुहोस्: Dashboard → Service → Logs

Common fixes:
- MongoDB connection string check गर्नुहोस्
- Environment variables सबै छन् कि check गर्नुहोस्
- Node version check: package.json मा "engines" छ
```

**2. MongoDB connection error:**
```
- Connection string correct छ कि check गर्नुहोस्
- Password मा special characters छन् भने URL encode गर्नुहोस्
- Network Access मा 0.0.0.0/0 allowed छ कि check गर्नुहोस्
- Database user created छ कि check गर्नुहोस्
```

**3. 503 Service Unavailable:**
```
- Free tier service 15 min inactive भएपछि sleep हुन्छ
- First request मा 30-60 seconds लाग्छ wake up हुन
- Paid plan ($7/month) मा always active रहन्छ
```

### Frontend Issues:

**1. Build fails:**
```
Logs हेर्नुहोस्: Dashboard → Site → Events

Common fixes:
- Build command correct छ कि: npm install && npm run build
- Publish directory: dist
- Environment variables सेट छन् कि
```

**2. API calls failing:**
```
- VITE_API_URL correct छ कि check गर्नुहोस्
- Backend CORS मा frontend URL allowed छ कि
- Browser console मा errors हेर्नुहोस्
```

**3. Blank page:**
```
- Browser console हेर्नुहोस्
- Network tab मा API calls check गर्नुहोस्
- Environment variables rebuild पछि सेट गर्नुभयो कि
```

---

## 📊 Render Free Tier Limits

### Backend (Web Service):
- ✅ 750 hours/month free
- ✅ 512MB RAM
- ✅ 0.1 CPU
- ⚠️ 15 minutes inactive = sleep
- ⚠️ 30-60 seconds wake up time
- ✅ Custom domain support
- ✅ Auto SSL certificate

### Frontend (Static Site):
- ✅ 100GB bandwidth/month
- ✅ Unlimited sites
- ✅ Global CDN
- ✅ Auto SSL certificate
- ✅ Custom domain support
- ✅ Always active (no sleep)

### Upgrade Options:
- Starter: $7/month (always active, 512MB RAM)
- Standard: $25/month (2GB RAM)
- Pro: $85/month (4GB RAM)

---

## 🎯 Post-Deployment Checklist

- [ ] MongoDB Atlas cluster running
- [ ] Backend deployed successfully
- [ ] Frontend deployed successfully
- [ ] Environment variables सबै सेट भए
- [ ] Backend health check working
- [ ] Frontend loading properly
- [ ] API calls working
- [ ] Super admin created
- [ ] Login working
- [ ] Admin dashboard accessible
- [ ] Products loading
- [ ] Image upload working (Cloudinary)
- [ ] Email sending working (SMTP)

---

## 🔐 Security Notes

1. **JWT_SECRET:** Strong random string use गर्नुहोस् (min 32 characters)
2. **MongoDB Password:** Strong password use गर्नुहोस्
3. **Environment Variables:** Never commit to Git
4. **SMTP Credentials:** App-specific password use गर्नुहोस्
5. **Cloudinary:** API keys secure राख्नुहोस्

---

## 📈 Monitoring

### Render Dashboard:
- Metrics: CPU, Memory, Bandwidth
- Logs: Real-time logs
- Events: Deploy history
- Analytics: Request stats

### MongoDB Atlas:
- Metrics: Database size, connections
- Performance: Query performance
- Alerts: Set up alerts

---

## 🔄 Updates र Maintenance

### Code Update:
```bash
# Local मा changes गर्नुहोस्
git add .
git commit -m "Update message"
git push origin main

# Render automatically redeploy गर्छ
```

### Manual Redeploy:
1. Dashboard → Service/Site
2. "Manual Deploy" → "Deploy latest commit"

### Environment Variable Update:
1. Dashboard → Service → Environment
2. Variable edit गर्नुहोस्
3. "Save Changes" → Auto redeploy

---

## 💰 Cost Estimation

### Free Tier (Recommended for testing):
- Backend: Free (with sleep)
- Frontend: Free
- MongoDB: Free (512MB)
- Total: $0/month

### Production (Recommended):
- Backend: $7/month (Starter - always active)
- Frontend: Free
- MongoDB: Free (512MB) or $9/month (2GB)
- Total: $7-16/month

### High Traffic:
- Backend: $25/month (Standard)
- Frontend: Free
- MongoDB: $25/month (10GB)
- Total: $50/month

---

## 🆘 Support

### Render Support:
- Docs: https://render.com/docs
- Community: https://community.render.com
- Status: https://status.render.com

### MongoDB Support:
- Docs: https://docs.mongodb.com
- Community: https://community.mongodb.com
- University: https://university.mongodb.com

---

## ✅ Success!

Tapailai deployment successful भयो भने:
- Backend URL: `https://furniture-backend.onrender.com`
- Frontend URL: `https://furniture-frontend.onrender.com`
- Admin Login: Super admin credentials use गर्नुहोस्

Congratulations! 🎉 Tapailai furniture store successfully deploy गर्नुभयो!
