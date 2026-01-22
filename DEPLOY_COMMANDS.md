# Deployment Commands - Copy/Paste Ready

## PART A — REPO HYGIENE + GITHUB

### ✅ Already Done:
- `.gitignore` verified (excludes node_modules, .next, .env*, etc.)
- Git initialized
- Files staged

### Commands to Run (Local Machine):

```bash
# Navigate to project
cd /Users/patu/Documents/Projects/KatApp

# Create initial commit
git commit -m "Initial MVP"

# Rename branch to main
git branch -M main

# Add GitHub remote (REPLACE YOUR_USERNAME)
git remote add origin https://github.com/YOUR_USERNAME/udl-stem-lab.git

# Push to GitHub
git push -u origin main
```

**Before running above:**
1. Go to https://github.com/new
2. Repository name: `udl-stem-lab`
3. Description: "UDL STEM Lab - Mobile-first learning app with UDL supports and AI scaffolding"
4. **DO NOT** check "Initialize with README"
5. Click "Create repository"
6. Copy the repository URL and replace `YOUR_USERNAME` in the commands above

---

## PART B — SERVER PREP (UBUNTU 22.04)

**SSH into server first:**
```bash
ssh user@disruptiveexperience.com
```

### All Commands (Run on Server):

```bash
# 1. Update system
sudo apt update
sudo apt upgrade -y

# 2. Install Node.js 20 LTS
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs
node --version
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

## PART C — BUILD + RUN

**All commands run on server:**

```bash
# 1. Install dependencies
cd /var/www/udl-stem-lab
npm install

# 2. Build application
npm run build

# 3. Start with PM2
pm2 start npm --name "udl-stem-lab" -- start
pm2 save

# 4. Enable PM2 on startup (run the command it outputs)
pm2 startup
# It will output something like:
# sudo env PATH=$PATH:/usr/bin pm2 startup systemd -u YOUR_USERNAME --hp /home/YOUR_USERNAME
# Copy and run that exact command, then:
pm2 save

# 5. Verify app is running
pm2 status
pm2 logs udl-stem-lab --lines 20
curl http://localhost:3000
```

---

## PART D — NGINX CONFIG

### ⚠️ RECOMMENDATION: Use Subdomain (Option 2)

**Subpath requires basePath configuration and rebuild. Subdomain works out of the box.**

### Option 1: Subpath (Advanced - Not Recommended)

**If using subpath `/udl-stem-lab`:**

```bash
# 1. Edit main site config
sudo nano /etc/nginx/sites-available/disruptiveexperience.com

# 2. Add this location block inside the server {} block:
#    (Find the closing } and add before it)
```

**Paste this inside the server block:**
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

**Continue with commands:**
```bash
# 3. Configure Next.js for subpath
cd /var/www/udl-stem-lab
echo "NEXT_PUBLIC_BASE_PATH=/udl-stem-lab" > .env.production.local
npm run build
pm2 restart udl-stem-lab

# 4. Test and reload Nginx
sudo nginx -t
sudo systemctl reload nginx
```

### Option 2: Subdomain (Recommended - Use This)

**If using subdomain `udl-stem-lab.disruptiveexperience.com`:**

```bash
# 1. Create new config file
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

**Continue with commands:**
```bash
# 2. Enable the site
sudo ln -s /etc/nginx/sites-available/udl-stem-lab.disruptiveexperience.com /etc/nginx/sites-enabled/

# 3. Test and reload
sudo nginx -t
sudo systemctl reload nginx

# 4. No basePath needed for subdomain
```

---

## PART E — SSL

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

## PART F — FINALIZATION

### Health Checks:

```bash
# 1. Local app check
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

## File Locations Summary

- **App Directory**: `/var/www/udl-stem-lab`
- **Nginx Config (Subpath)**: `/etc/nginx/sites-available/disruptiveexperience.com`
- **Nginx Config (Subdomain)**: `/etc/nginx/sites-available/udl-stem-lab.disruptiveexperience.com`
- **PM2 Config**: Auto-saved via `pm2 save`
- **Environment File**: `/var/www/udl-stem-lab/.env.production.local`

---

## Troubleshooting Quick Reference

```bash
# App not responding
pm2 status
pm2 logs udl-stem-lab
pm2 restart udl-stem-lab

# Nginx 502
sudo tail -f /var/log/nginx/error.log
pm2 status
sudo nginx -t

# SSL issues
sudo certbot certificates
sudo certbot renew --dry-run
```

---

**Deployment URL:**
- Subpath: https://disruptiveexperience.com/udl-stem-lab
- Subdomain: https://udl-stem-lab.disruptiveexperience.com
