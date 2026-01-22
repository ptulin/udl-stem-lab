# Step-by-Step Deployment Guide

Based on your portfolio deployment pattern. Follow these steps **one at a time**.

---

## STEP 1: Create GitHub Repository

**On your computer, open a web browser:**

1. Go to: https://github.com/new
2. **Repository name:** `udl-stem-lab`
3. **Description:** "UDL STEM Lab - Mobile-first learning app with UDL supports and AI scaffolding"
4. **Visibility:** Choose Public or Private
5. **IMPORTANT:** Do NOT check any boxes (no README, no .gitignore, no license)
6. Click **"Create repository"**

**Wait for the page to load, then proceed to Step 2.**

---

## STEP 2: Commit and Push to GitHub

**On your computer, in Terminal:**

```bash
cd /Users/patu/Documents/Projects/KatApp
```

**Then run these commands one by one:**

```bash
# Create the initial commit
git commit -m "Initial MVP"
```

**Expected:** Should show files being committed.

```bash
# Set branch to main
git branch -M main
```

**Expected:** Should complete silently.

```bash
# Connect to GitHub (using your username from portfolio)
git remote add origin https://github.com/ptulin/udl-stem-lab.git
```

**Expected:** Should complete silently.

```bash
# Push to GitHub
git push -u origin main
```

**Expected:** You may be prompted for GitHub credentials. Enter your username and password/token.
**If successful:** You'll see "Branch 'main' set up to track remote branch 'main' from 'origin'."

**✅ Step 2 Complete! Check GitHub - your code should be there now.**

---

## STEP 3: SSH into Your Server

**In Terminal:**

```bash
ssh user@disruptiveexperience.com
```

**Replace `user` with your actual SSH username if different.**

**Expected:** You should be logged into your server. You'll see a command prompt like:
```
user@server:~$
```

**✅ Step 3 Complete! You're now on the server.**

---

## STEP 4: Install Node.js (if not already installed)

**On the server, run:**

```bash
node --version
```

**If it shows a version (like v20.x.x):** Skip to Step 5.

**If it says "command not found":** Run these:

```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs
node --version
```

**Expected:** Should show `v20.x.x` or similar.

**✅ Step 4 Complete!**

---

## STEP 5: Install PM2 (if not already installed)

**On the server, run:**

```bash
pm2 --version
```

**If it shows a version:** Skip to Step 6.

**If it says "command not found":** Run:

```bash
sudo npm install -g pm2
pm2 --version
```

**Expected:** Should show a version number.

**✅ Step 5 Complete!**

---

## STEP 6: Create Deployment Directory

**On the server, run:**

```bash
sudo mkdir -p /var/www/udl-stem-lab
sudo chown $USER:$USER /var/www/udl-stem-lab
```

**Expected:** Should complete silently.

**Verify:**
```bash
ls -la /var/www/udl-stem-lab
```

**Expected:** Should show an empty directory.

**✅ Step 6 Complete!**

---

## STEP 7: Clone Repository from GitHub

**On the server, run:**

```bash
cd /var/www
git clone https://github.com/ptulin/udl-stem-lab.git
```

**Expected:** Should download files and show "Cloning into 'udl-stem-lab'..."

**Verify:**
```bash
cd udl-stem-lab
ls -la
```

**Expected:** Should show files like `package.json`, `app/`, `components/`, etc.

**✅ Step 7 Complete!**

---

## STEP 8: Install Dependencies

**On the server (you should still be in `/var/www/udl-stem-lab`):**

```bash
npm install
```

**Expected:** Will take 30-60 seconds, showing package installation progress.

**Wait for it to finish.** You'll see "added XXX packages" at the end.

**✅ Step 8 Complete!**

---

## STEP 9: Build the Application

**On the server:**

```bash
npm run build
```

**Expected:** Will take 30-60 seconds. Should show:
- "Compiled successfully"
- Route sizes
- "Linting and checking validity of types"

**If you see errors:** Stop and let me know. Otherwise, continue.

**✅ Step 9 Complete!**

---

## STEP 10: Start with PM2

**On the server:**

```bash
pm2 start npm --name "udl-stem-lab" -- start
```

**Expected:** Should show:
```
[PM2] Starting in fork_mode
[PM2] Successfully started
```

**Then:**
```bash
pm2 save
```

**Expected:** Should show "PM2 dump file saved"

**Then:**
```bash
pm2 status
```

**Expected:** Should show `udl-stem-lab` with status "online" (green).

**✅ Step 10 Complete!**

---

## STEP 11: Test App is Running

**On the server:**

```bash
curl http://localhost:3000
```

**Expected:** Should return HTML (a long string starting with `<!DOCTYPE html>`).

**If you see HTML:** ✅ App is running! Continue to Step 12.

**If you see an error:** Check PM2 logs:
```bash
pm2 logs udl-stem-lab --lines 20
```

**✅ Step 11 Complete!**

---

## STEP 12: Configure Nginx (Subdomain - Recommended)

**We'll use subdomain: `udl-stem-lab.disruptiveexperience.com`**

**On the server:**

```bash
sudo nano /etc/nginx/sites-available/udl-stem-lab.disruptiveexperience.com
```

**This opens a text editor. Paste this entire configuration:**

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

**To save and exit:**
- Press `Ctrl + X`
- Press `Y` (yes)
- Press `Enter`

**✅ Step 12 Complete!**

---

## STEP 13: Enable Nginx Site

**On the server:**

```bash
sudo ln -s /etc/nginx/sites-available/udl-stem-lab.disruptiveexperience.com /etc/nginx/sites-enabled/
```

**Expected:** Should complete silently.

**Then test nginx config:**
```bash
sudo nginx -t
```

**Expected:** Should show "syntax is ok" and "test is successful"

**If you see errors:** Stop and let me know.

**Then reload nginx:**
```bash
sudo systemctl reload nginx
```

**Expected:** Should complete silently.

**✅ Step 13 Complete!**

---

## STEP 14: Get SSL Certificate

**On the server:**

```bash
sudo certbot --nginx -d udl-stem-lab.disruptiveexperience.com
```

**Expected:** 
- Will ask for email (enter your email)
- Will ask to agree to terms (type `A` and press Enter)
- Will ask about sharing email (type `Y` or `N` and press Enter)
- Will ask about redirecting HTTP to HTTPS (type `2` and press Enter for "Redirect")

**Wait for it to complete.** Should show "Congratulations! Your certificate has been generated..."

**✅ Step 14 Complete!**

---

## STEP 15: Test the Live Site

**On your computer (in a web browser):**

Go to: `https://udl-stem-lab.disruptiveexperience.com`

**Expected:** 
- Should load the UDL STEM Lab landing page
- Should show a green padlock (SSL working)
- Should show "Start as Student" and "Switch to Teacher" buttons

**If it works:** 🎉 **DEPLOYMENT COMPLETE!**

**If it doesn't work:** Check:
1. DNS: Make sure `udl-stem-lab.disruptiveexperience.com` points to your server IP
2. PM2: `pm2 status` (should show app running)
3. Nginx: `sudo systemctl status nginx` (should be active)

---

## Quick Redeploy (For Future Updates)

**When you make changes and want to update:**

**On the server:**

```bash
cd /var/www/udl-stem-lab
git pull origin main
npm install
npm run build
pm2 restart udl-stem-lab
```

**That's it!** The site will update in about 30 seconds.

---

## Troubleshooting

**App not loading?**
```bash
pm2 logs udl-stem-lab
pm2 restart udl-stem-lab
```

**Nginx errors?**
```bash
sudo nginx -t
sudo tail -f /var/log/nginx/error.log
```

**Need to check if app is running?**
```bash
pm2 status
curl http://localhost:3000
```

---

**Ready? Start with Step 1!** 🚀
