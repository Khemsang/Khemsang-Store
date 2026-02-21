# Production Deployment Guide

## 🚀 Deployment Options

### Option 1: Docker Compose (सिफारिस गरिएको)

#### Prerequisites:
- Docker र Docker Compose installed
- Domain name (optional)
- SSL certificate (optional)

#### Steps:

1. **Environment Variables सेटअप गर्नुहोस्:**
```bash
cp .env.docker.example .env
# .env file edit गरेर आफ्नो credentials राख्नुहोस्
```

2. **Docker Compose चलाउनुहोस्:**
```bash
docker-compose up -d
```

3. **Logs हेर्नुहोस्:**
```bash
docker-compose logs -f backend
docker-compose logs -f frontend
```

4. **Stop गर्नुहोस्:**
```bash
docker-compose down
```

---

### Option 2: VPS/Cloud Server (Manual)

#### Prerequisites:
- Ubuntu 20.04+ server
- Node.js 18+
- MongoDB
- Nginx
- PM2

#### Backend Deployment:

1. **Server मा code upload गर्नुहोस्:**
```bash
git clone <your-repo-url>
cd furniture-store/backend
```

2. **Dependencies install गर्नुहोस्:**
```bash
npm ci --only=production
```

3. **Environment variables सेटअप गर्नुहोस्:**
```bash
cp .env.example .env
nano .env  # Edit with your values
```

4. **PM2 संग start गर्नुहोस्:**
```bash
npm install -g pm2
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

5. **PM2 monitoring:**
```bash
pm2 status
pm2 logs
pm2 monit
```

#### Frontend Deployment:

1. **Build गर्नुहोस्:**
```bash
cd ../frontend
npm ci
npm run build
```

2. **Nginx configuration:**
```bash
sudo nano /etc/nginx/sites-available/furniture-store
```

```nginx
server {
    listen 80;
    server_name yourdomain.com;
    root /var/www/furniture-store/frontend/dist;
    index index.html;

    # Gzip compression
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;

    # API proxy
    location /api {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # SPA routing
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Cache static assets
    location ~* \.(jpg|jpeg|png|gif|ico|css|js|svg|woff|woff2)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

3. **Enable site:**
```bash
sudo ln -s /etc/nginx/sites-available/furniture-store /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

4. **SSL Setup (Certbot):**
```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d yourdomain.com
```

---

### Option 3: Cloud Platforms

#### Vercel (Frontend):
```bash
cd frontend
vercel --prod
```

#### Railway/Render (Backend):
1. Connect GitHub repository
2. Set environment variables
3. Deploy automatically

---

## 🔒 Security Checklist

- [ ] Strong JWT_SECRET सेट गरिएको
- [ ] MongoDB strong password
- [ ] HTTPS enabled
- [ ] Firewall configured
- [ ] Rate limiting enabled
- [ ] Environment variables secure
- [ ] Regular backups configured
- [ ] Monitoring setup गरिएको

---

## 📊 Monitoring

### PM2 Monitoring:
```bash
pm2 monit
pm2 logs --lines 100
```

### Server Monitoring:
```bash
# CPU/Memory usage
htop

# Disk usage
df -h

# Network connections
netstat -tulpn
```

### Application Logs:
```bash
# Backend logs
tail -f backend/logs/combined-*.log
tail -f backend/logs/error-*.log

# Nginx logs
tail -f /var/log/nginx/access.log
tail -f /var/log/nginx/error.log
```

---

## 🔄 Updates र Maintenance

### Code Update:
```bash
git pull origin main
cd backend && npm ci --only=production
pm2 restart furniture-backend

cd ../frontend && npm ci && npm run build
```

### Database Backup:
```bash
# MongoDB backup
mongodump --uri="mongodb://localhost:27017/furniture_store" --out=/backup/$(date +%Y%m%d)

# Restore
mongorestore --uri="mongodb://localhost:27017/furniture_store" /backup/20240101
```

### Automated Backups (Cron):
```bash
crontab -e

# Daily backup at 2 AM
0 2 * * * mongodump --uri="mongodb://localhost:27017/furniture_store" --out=/backup/$(date +\%Y\%m\%d)

# Delete backups older than 30 days
0 3 * * * find /backup -type d -mtime +30 -exec rm -rf {} +
```

---

## 🐛 Troubleshooting

### Backend not starting:
```bash
pm2 logs furniture-backend --lines 50
# Check environment variables
# Check MongoDB connection
# Check port availability
```

### High memory usage:
```bash
pm2 restart furniture-backend
# Check for memory leaks
# Reduce PM2 instances
```

### Database connection issues:
```bash
# Check MongoDB status
sudo systemctl status mongod

# Check connection string
# Check firewall rules
```

---

## 📈 Performance Optimization

1. **Enable Redis caching**
2. **CDN for static assets**
3. **Database indexing** (already implemented)
4. **Image optimization** (Cloudinary)
5. **Gzip compression** (Nginx)
6. **HTTP/2** (Nginx)
7. **Load balancing** (multiple PM2 instances)

---

## 🔐 Environment Variables

### Backend (.env):
```env
NODE_ENV=production
PORT=5000
MONGO_URI=mongodb://...
JWT_SECRET=...
CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=...
SMTP_PASS=...
EMAIL_FROM=...
FRONTEND_URL=https://yourdomain.com
LOG_LEVEL=info
```

### Frontend (.env):
```env
VITE_API_URL=https://yourdomain.com/api
```
