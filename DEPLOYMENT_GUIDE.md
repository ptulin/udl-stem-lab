# Complete Deployment Guide

## PART A — REPO HYGIENE + GITHUB

### ✅ Step 1: Verify .gitignore

The `.gitignore` is already configured to exclude:
- `node_modules/`
- `.next/`
- `out/`
- `.env*` files
- Build artifacts

### ✅ Step 2: Initialize Git and Create Initial Commit

```bash
cd /Users/patu/Documents/Projects/KatApp
git init
git add .
git commit -m "Initial MVP"
```

### Step 3: Create GitHub Repository

**On GitHub.com:**
1. Go to https://github.com/new
2. Repository name: `udl-stem-lab`
3. Description: "UDL STEM Lab - Mobile-first learning app with UDL supports and AI scaffolding"
4. Visibility: Choose Public or Private
5. **DO NOT** initialize with README, .gitignore, or license (we already have these)
6. Click "Create repository"

### Step 4: Connect and Push to GitHub

**Run these commands locally:**

```bash
cd /Users/patu/Documents/Projects/KatApp
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/udl-stem-lab.git
git push -u origin main
```

**Replace `YOUR_USERNAME` with your actual GitHub username.**

---

## PART B — SERVER PREP (UBUNTU 22.04)

**SSH into your server first:**
```bash
ssh user@disruptiveexperience.com
```

### Step 1: Update System

```bash
sudo apt update
sudo apt upgrade -y
```

### Step 2: Install Node.js 20 LTS

```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs
node --version  # Should show v20.x.x
npm --version
```

### Step 3: Install PM2

```bash
sudo npm install -g pm2
pm2 --version
```

### Step 4: Install Nginx (if not already installed)

```bash
sudo apt install -y nginx
sudo systemctl status nginx
```

### Step 5: Install Certbot

```bash
sudo apt install -y certbot python3-certbot-nginx
```

### Step 6: Create Deployment Directory

```bash
sudo mkdir -p /var/www/udl-stem-lab
sudo chown $USER:$USER /var/www/udl-stem-lab
```

### Step 7: Clone Repository

```bash
cd /var/www
git clone https://github.com/YOUR_USERNAME/udl-stem-lab.git
cd udl-stem-lab
```

**Replace `YOUR_USERNAME` with your actual GitHub username.**

---

## PART C — BUILD + RUN

### Step 1: Install Dependencies

```bash
cd /var/www/udl-stem-lab
npm install
```

### Step 2: Build the Application

```bash
npm run build
```

**Expected output:** Should complete without errors, showing route sizes.

### Step 3: Start with PM2

```bash
pm2 start npm --name "udl-stem-lab" -- start
pm2 save
pm2 startup
```

**After `pm2 startup`, it will output a command like:**
```bash
sudo env PATH=$PATH:/usr/bin pm2 startup systemd -u YOUR_USERNAME --hp /home/YOUR_USERNAME
```

**Run that exact command, then:**
```bash
pm2 save
```

### Step 4: Verify App is Running

```bash
pm2 status
pm2 logs udl-stem-lab --lines 20
curl http://localhost:3000
```

**Expected:** Should return HTML from the Next.js app.

---

## PART D — NGINX CONFIG

### ⚠️ IMPORTANT: Choose Your Deployment Method

**RECOMMENDATION: Use Subdomain (Option 2) - It's simpler and requires no Next.js configuration changes.**

**Subpath deployment** (`/udl-stem-lab`) requires:
- Setting `NEXT_PUBLIC_BASE_PATH=/udl-stem-lab` environment variable
- Rebuilding the app (`npm run build`) after setting basePath
- More complex nginx configuration
- Potential issues with static assets if not configured correctly

**Subdomain deployment** (`udl-stem-lab.disruptiveexperience.com`) is simpler:
- No Next.js configuration needed
- Works immediately after nginx setup
- Standard proxy configuration
- Easier to troubleshoot and maintain

### Option 1: Subpath Deployment (Advanced - Not Recommended)

**If your main site already has a config at `/etc/nginx/sites-available/disruptiveexperience.com`:**

1. **Edit the existing config:**
```bash
sudo nano /etc/nginx/sites-available/disruptiveexperience.com
```

2. **Add this location block inside the `server` block (before the closing `}`):**
```nginx
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
```

3. **Configure Next.js for subpath:**
```bash
cd /var/www/udl-stem-lab
echo "NEXT_PUBLIC_BASE_PATH=/udl-stem-lab" > .env.production.local
npm run build
pm2 restart udl-stem-lab
```

4. **Test and reload Nginx:**
```bash
sudo nginx -t
sudo systemctl reload nginx
```

### Option 2: Subdomain Deployment (Recommended)

**If subpath doesn't work or you prefer subdomain:**

1. **Create new Nginx config:**
```bash
sudo nano /etc/nginx/sites-available/udl-stem-lab.disruptiveexperience.com
```

2. **Paste this full config:**
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
        
        # Timeouts
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }
}
```

3. **Enable the site:**
```bash
sudo ln -s /etc/nginx/sites-available/udl-stem-lab.disruptiveexperience.com /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

4. **No basePath needed for subdomain** (Next.js runs at root)

---

## PART E — SSL

### For Subpath (uses main domain certificate)

```bash
sudo certbot --nginx -d disruptiveexperience.com
```

**If certificate already exists, it will be updated automatically.**

### For Subdomain

```bash
sudo certbot --nginx -d udl-stem-lab.disruptiveexperience.com
```

### Verify Auto-renewal

```bash
sudo certbot renew --dry-run
```

**Expected:** Should complete successfully.

---

## PART F — FINALIZATION

### Step 1: Update README with Live URL

The README.md already includes the deployment section. After deployment, verify the URL works.

### Step 2: Health Checks

**Run these checks:**

```bash
# 1. Local app check
curl http://localhost:3000/udl-stem-lab
# or for subdomain:
curl http://localhost:3000

# 2. External HTTP check (before SSL)
curl http://disruptiveexperience.com/udl-stem-lab
# or for subdomain:
curl http://udl-stem-lab.disruptiveexperience.com

# 3. External HTTPS check (after SSL)
curl https://disruptiveexperience.com/udl-stem-lab
# or for subdomain:
curl https://udl-stem-lab.disruptiveexperience.com

# 4. PM2 status
pm2 status
pm2 logs udl-stem-lab --lines 10
```

**Browser checks:**
- Navigate to: `https://disruptiveexperience.com/udl-stem-lab`
- Verify SSL padlock is green
- Test landing page loads
- Test student onboarding flow
- Test teacher dashboard

### Step 3: Redeploy Instructions

**Quick redeploy command (save this):**
```bash
cd /var/www/udl-stem-lab
git pull origin main
npm install
npm run build
pm2 restart udl-stem-lab
```

### Step 4: Rollback Procedure

**If deployment breaks:**

```bash
cd /var/www/udl-stem-lab

# View recent commits
git log --oneline -10

# Option 1: Revert to specific commit
git checkout <commit-hash>
npm install
npm run build
pm2 restart udl-stem-lab

# Option 2: Revert last commit
git revert HEAD --no-edit
npm install
npm run build
pm2 restart udl-stem-lab

# Option 3: Reset to previous commit (destructive)
git reset --hard HEAD~1
npm install
npm run build
pm2 restart udl-stem-lab
```

---

## Troubleshooting

### App not responding on localhost:3000

```bash
pm2 status
pm2 logs udl-stem-lab
pm2 restart udl-stem-lab
netstat -tlnp | grep 3000
```

### Nginx 502 Bad Gateway

```bash
# Check if app is running
pm2 status

# Check nginx error log
sudo tail -f /var/log/nginx/error.log

# Verify proxy_pass URL
sudo nginx -t

# Check firewall
sudo ufw status
```

### SSL Certificate Issues

```bash
# List certificates
sudo certbot certificates

# Test renewal
sudo certbot renew --dry-run

# Force renewal (if needed)
sudo certbot renew --force-renewal
```

### Next.js basePath Issues

If assets don't load on subpath:
1. Verify `.env.production.local` has `NEXT_PUBLIC_BASE_PATH=/udl-stem-lab`
2. Rebuild: `npm run build`
3. Restart: `pm2 restart udl-stem-lab`

---

## Summary Checklist

- [ ] Git repo initialized and pushed to GitHub
- [ ] Node.js 20 LTS installed on server
- [ ] PM2 installed and configured
- [ ] Nginx installed and configured
- [ ] App built and running with PM2
- [ ] Nginx proxy configured (subpath or subdomain)
- [ ] SSL certificate obtained
- [ ] Health checks passing
- [ ] Browser tests successful
- [ ] Redeploy process documented

---

**Deployment Complete!** 🎉

The app should now be accessible at:
- **Subpath**: https://disruptiveexperience.com/udl-stem-lab
- **Subdomain**: https://udl-stem-lab.disruptiveexperience.com
