# Deployment Summary - UDL STEM Lab

## ✅ PART A — REPO HYGIENE + GITHUB

### Status: READY

**Files verified:**
- ✅ `.gitignore` properly configured (excludes node_modules, .next, .env*, build artifacts)
- ✅ No secrets or credentials in codebase
- ✅ Git initialized
- ✅ All files staged

### Commands to Execute (Local Machine):

```bash
cd /Users/patu/Documents/Projects/KatApp

# Create initial commit
git commit -m "Initial MVP"

# Set main branch
git branch -M main

# Add GitHub remote (REPLACE YOUR_USERNAME with your GitHub username)
git remote add origin https://github.com/YOUR_USERNAME/udl-stem-lab.git

# Push to GitHub
git push -u origin main
```

**Before running above:**
1. Create GitHub repo at https://github.com/new
   - Name: `udl-stem-lab`
   - Description: "UDL STEM Lab - Mobile-first learning app with UDL supports and AI scaffolding"
   - **DO NOT** initialize with README, .gitignore, or license
   - Click "Create repository"

---

## 📋 PART B — SERVER PREP (UBUNTU 22.04)

### Commands to Execute (On Server via SSH):

```bash
# SSH into server first
ssh user@disruptiveexperience.com

# 1. Update system
sudo apt update && sudo apt upgrade -y

# 2. Install Node.js 20 LTS
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs
node --version  # Verify: v20.x.x
npm --version

# 3. Install PM2
sudo npm install -g pm2
pm2 --version

# 4. Install Nginx (if not installed)
sudo apt install -y nginx
sudo systemctl status nginx

# 5. Install Certbot
sudo apt install -y certbot python3-certbot-nginx

# 6. Create deployment directory
sudo mkdir -p /var/www/udl-stem-lab
sudo chown $USER:$USER /var/www/udl-stem-lab

# 7. Clone repository (REPLACE YOUR_USERNAME)
cd /var/www
git clone https://github.com/YOUR_USERNAME/udl-stem-lab.git
cd udl-stem-lab
```

---

## 🔨 PART C — BUILD + RUN

### Commands to Execute (On Server):

```bash
cd /var/www/udl-stem-lab

# 1. Install dependencies
npm install

# 2. Build application
npm run build

# 3. Start with PM2
pm2 start npm --name "udl-stem-lab" -- start
pm2 save

# 4. Enable PM2 on system startup
pm2 startup
# Copy and run the command it outputs (looks like):
# sudo env PATH=$PATH:/usr/bin pm2 startup systemd -u YOUR_USERNAME --hp /home/YOUR_USERNAME
# Then run:
pm2 save

# 5. Verify app is running
pm2 status
pm2 logs udl-stem-lab --lines 20
curl http://localhost:3000
```

**Expected:** `curl` should return HTML from the Next.js app.

---

## 🌐 PART D — NGINX CONFIG

### ⚠️ IMPORTANT: Deployment Method Decision

**RECOMMENDATION: Use Subdomain (Option 2) for simpler setup.**

Subpath deployment requires:
- Setting `NEXT_PUBLIC_BASE_PATH` environment variable
- Rebuilding the app after setting basePath
- More complex nginx configuration
- Potential issues with static assets and internal links

Subdomain deployment is simpler:
- No basePath configuration needed
- Works out of the box
- Standard nginx proxy setup
- Easier to maintain

### Option 1: Subpath - `/udl-stem-lab` (Advanced)

**File to edit:** `/etc/nginx/sites-available/disruptiveexperience.com`

**Commands:**
```bash
sudo nano /etc/nginx/sites-available/disruptiveexperience.com
```

**Add this location block inside the `server {}` block (before closing `}`):**
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

**Continue:**
```bash
# Configure Next.js for subpath
cd /var/www/udl-stem-lab
echo "NEXT_PUBLIC_BASE_PATH=/udl-stem-lab" > .env.production.local
npm run build
pm2 restart udl-stem-lab

# Test and reload Nginx
sudo nginx -t
sudo systemctl reload nginx
```

### Option 2: Subdomain (Recommended) - `udl-stem-lab.disruptiveexperience.com`

**File to create:** `/etc/nginx/sites-available/udl-stem-lab.disruptiveexperience.com`

**Commands:**
```bash
sudo nano /etc/nginx/sites-available/udl-stem-lab.disruptiveexperience.com
```

**Paste this full config:**
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

**Continue:**
```bash
# Enable the site
sudo ln -s /etc/nginx/sites-available/udl-stem-lab.disruptiveexperience.com /etc/nginx/sites-enabled/

# Test and reload
sudo nginx -t
sudo systemctl reload nginx

# No basePath needed for subdomain
```

---

## 🔒 PART E — SSL

### For Subpath (uses main domain):
```bash
sudo certbot --nginx -d disruptiveexperience.com
```

### For Subdomain:
```bash
sudo certbot --nginx -d udl-stem-lab.disruptiveexperience.com
```

### Verify Auto-renewal:
```bash
sudo certbot renew --dry-run
```

---

## ✅ PART F — FINALIZATION

### Health Checks:

```bash
# 1. Local check
curl http://localhost:3000/udl-stem-lab
# or for subdomain:
curl http://localhost:3000

# 2. External HTTPS check
curl https://disruptiveexperience.com/udl-stem-lab
# or for subdomain:
curl https://udl-stem-lab.disruptiveexperience.com

# 3. PM2 status
pm2 status
pm2 logs udl-stem-lab --lines 10
```

### Quick Redeploy (Save This):

```bash
cd /var/www/udl-stem-lab
git pull origin main
npm install
npm run build
pm2 restart udl-stem-lab
```

### Rollback Procedure:

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
```

---

## 📁 File Locations

- **App Directory**: `/var/www/udl-stem-lab`
- **Nginx Config (Subpath)**: `/etc/nginx/sites-available/disruptiveexperience.com`
- **Nginx Config (Subdomain)**: `/etc/nginx/sites-available/udl-stem-lab.disruptiveexperience.com`
- **Environment File**: `/var/www/udl-stem-lab/.env.production.local`
- **PM2 Config**: Auto-saved via `pm2 save`

---

## 🚨 Troubleshooting

### App not responding:
```bash
pm2 status
pm2 logs udl-stem-lab
pm2 restart udl-stem-lab
```

### Nginx 502 Bad Gateway:
```bash
sudo tail -f /var/log/nginx/error.log
pm2 status
sudo nginx -t
```

### SSL Issues:
```bash
sudo certbot certificates
sudo certbot renew --dry-run
```

---

## 🎯 Final URLs

- **Subpath**: https://disruptiveexperience.com/udl-stem-lab
- **Subdomain**: https://udl-stem-lab.disruptiveexperience.com

---

## 📚 Documentation Files

- `DEPLOYMENT_GUIDE.md` - Complete detailed guide
- `DEPLOY_COMMANDS.md` - Copy/paste ready commands
- `DEPLOYMENT.md` - Quick reference
- `README.md` - Project overview and local development

---

**Ready to deploy!** Follow the commands above in order. If you encounter any issues, check the troubleshooting section or review the detailed guides.
