# Complete Automated Deployment

## ✅ What's Already Done

1. ✅ Code committed to GitHub: https://github.com/ptulin/udl-stem-lab
2. ✅ Deployment scripts created
3. ✅ Nginx configs prepared

## 🚀 Server Deployment (Run These on Server)

### Option 1: Automated (Recommended)

**SSH into server, then run:**

```bash
# Clone and run deployment script
cd /var/www
git clone https://github.com/ptulin/udl-stem-lab.git
cd udl-stem-lab
bash deploy-server.sh
bash setup-nginx.sh
sudo certbot --nginx -d udl-stem-lab.disruptiveexperience.com
```

### Option 2: Manual Step-by-Step

**1. SSH into server:**
```bash
ssh user@disruptiveexperience.com
```

**2. Run deployment script:**
```bash
cd /var/www
git clone https://github.com/ptulin/udl-stem-lab.git
cd udl-stem-lab
bash deploy-server.sh
```

**3. Configure Nginx:**
```bash
bash setup-nginx.sh
```

**4. Get SSL:**
```bash
sudo certbot --nginx -d udl-stem-lab.disruptiveexperience.com
```

**5. Test:**
Visit: https://udl-stem-lab.disruptiveexperience.com

## 📝 What the Scripts Do

### `deploy-server.sh`
- Checks/installs Node.js 20
- Checks/installs PM2
- Creates `/var/www/udl-stem-lab` directory
- Clones repository
- Installs dependencies
- Builds the app
- Starts with PM2

### `setup-nginx.sh`
- Creates nginx config for subdomain
- Enables the site
- Tests configuration
- Reloads nginx

## 🔄 Future Updates

```bash
cd /var/www/udl-stem-lab
git pull origin main
npm install
npm run build
pm2 restart udl-stem-lab
```

## ✅ Verification

```bash
# Check app is running
pm2 status

# Test locally
curl http://localhost:3000

# Check nginx
sudo systemctl status nginx

# View logs
pm2 logs udl-stem-lab
```

---

**All scripts are ready. Just SSH into your server and run them!**
