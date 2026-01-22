# Deployment Guide

## Overview

This document provides step-by-step instructions for deploying the UDL STEM Lab application to a production server.

**Live URL**: https://disruptiveexperience.com/udl-stem-lab

## Server Requirements

- Ubuntu 22.04 LTS
- Node.js 20+ (LTS)
- Nginx
- PM2
- Certbot (Let's Encrypt)
- Git

## Quick Deploy Commands

Once initial setup is complete, redeploy with:

```bash
cd /var/www/udl-stem-lab
git pull origin main
npm install
npm run build
pm2 restart udl-stem-lab
```

## Initial Server Setup

### 1. Install Node.js 20 LTS

```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs
node --version  # Should show v20.x.x
npm --version
```

### 2. Install PM2

```bash
sudo npm install -g pm2
pm2 --version
```

### 3. Install Nginx (if not already installed)

```bash
sudo apt update
sudo apt install -y nginx
sudo systemctl status nginx
```

### 4. Install Certbot

```bash
sudo apt install -y certbot python3-certbot-nginx
```

### 5. Create Deployment Directory

```bash
sudo mkdir -p /var/www/udl-stem-lab
sudo chown $USER:$USER /var/www/udl-stem-lab
```

### 6. Clone Repository

```bash
cd /var/www
git clone https://github.com/YOUR_USERNAME/udl-stem-lab.git
cd udl-stem-lab
```

## Build and Run

### 1. Install Dependencies

```bash
cd /var/www/udl-stem-lab
npm install
```

### 2. Build Application

```bash
npm run build
```

### 3. Start with PM2

```bash
pm2 start npm --name "udl-stem-lab" -- start
pm2 save
pm2 startup
# Follow the command output to enable PM2 on system startup
```

### 4. Verify App is Running

```bash
pm2 status
curl http://localhost:3000
```

## Nginx Configuration

### ⚠️ Deployment Method Recommendation

**RECOMMENDATION: Use Subdomain deployment for simpler setup.**

- **Subdomain**: No Next.js config changes needed, works immediately
- **Subpath**: Requires `basePath` configuration, rebuild, and more complex setup

### Subpath Configuration (Advanced)

**Note:** Subpath deployment requires setting `NEXT_PUBLIC_BASE_PATH` and rebuilding. Consider subdomain instead.

Create or edit `/etc/nginx/sites-available/disruptiveexperience.com`:

```nginx
server {
    listen 80;
    server_name disruptiveexperience.com;

    # Main site location
    location / {
        # Your existing main site configuration
        # ...
    }

    # UDL STEM Lab subpath
    location /udl-stem-lab {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        
        # WebSocket support
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        
        # Timeouts
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }
}
```

**IMPORTANT**: Next.js requires a `basePath` configuration for subpath deployment. See "Next.js Configuration" below.

### Recommended: Subdomain Configuration

**This is the recommended approach - simpler and requires no Next.js configuration:**

```nginx
server {
    listen 80;
    server_name udl-stem-lab.disruptiveexperience.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        
        # WebSocket support
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }
}
```

### Enable and Test Nginx

```bash
# If using subpath, ensure main site config includes the location block
sudo nginx -t
sudo systemctl reload nginx
```

## Next.js Configuration for Subpath

If using subpath deployment, update `next.config.js`:

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  basePath: '/udl-stem-lab',
  assetPrefix: '/udl-stem-lab',
}

module.exports = nextConfig
```

**Note**: After adding basePath, rebuild the app:
```bash
npm run build
pm2 restart udl-stem-lab
```

## SSL Certificate

### 1. Obtain Certificate

For subpath (uses main domain):
```bash
sudo certbot --nginx -d disruptiveexperience.com
```

For subdomain:
```bash
sudo certbot --nginx -d udl-stem-lab.disruptiveexperience.com
```

### 2. Auto-renewal

Certbot sets up auto-renewal automatically. Test with:
```bash
sudo certbot renew --dry-run
```

## Health Checks

### 1. Local Check

```bash
curl http://localhost:3000/udl-stem-lab
# or for subdomain:
curl http://localhost:3000
```

### 2. External Check

```bash
curl https://disruptiveexperience.com/udl-stem-lab
# or for subdomain:
curl https://udl-stem-lab.disruptiveexperience.com
```

### 3. Browser Check

- Navigate to: https://disruptiveexperience.com/udl-stem-lab
- Verify SSL certificate is valid
- Test all major flows (onboarding, lab, results, teacher dashboard)

## Rollback Procedure

If a deployment breaks:

```bash
cd /var/www/udl-stem-lab

# Option 1: Revert to previous commit
git log --oneline  # Find previous working commit
git checkout <previous-commit-hash>
npm install
npm run build
pm2 restart udl-stem-lab

# Option 2: Revert last commit
git revert HEAD
npm install
npm run build
pm2 restart udl-stem-lab
```

## Monitoring

### PM2 Monitoring

```bash
pm2 status
pm2 logs udl-stem-lab
pm2 monit
```

### Nginx Logs

```bash
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log
```

## Troubleshooting

### App not responding

1. Check PM2 status: `pm2 status`
2. Check logs: `pm2 logs udl-stem-lab`
3. Verify port: `netstat -tlnp | grep 3000`
4. Restart: `pm2 restart udl-stem-lab`

### Nginx 502 Bad Gateway

1. Check if app is running: `pm2 status`
2. Check nginx error log: `sudo tail -f /var/log/nginx/error.log`
3. Verify proxy_pass URL matches app port
4. Check firewall: `sudo ufw status`

### SSL Issues

1. Check certificate: `sudo certbot certificates`
2. Test renewal: `sudo certbot renew --dry-run`
3. Check nginx config: `sudo nginx -t`

## Maintenance

### Regular Updates

```bash
cd /var/www/udl-stem-lab
git pull origin main
npm install
npm run build
pm2 restart udl-stem-lab
```

### Clear PM2 Logs

```bash
pm2 flush
```

### Update Dependencies

```bash
npm update
npm run build
pm2 restart udl-stem-lab
```
