# UDL STEM Lab - Shared cPanel Server Setup

## Server Info
- **cPanel User:** `moose`
- **Home Directory:** `/home1/moose`
- **Server Type:** Shared cPanel hosting
- **Terminal Access:** Available via cPanel → Advanced → Terminal

---

## STEP 1: Access Terminal

**In cPanel:**
1. Go to **Advanced** section
2. Click **Terminal**
3. You should see a command prompt

**Expected:** You'll see something like:
```
[moose@server ~]$
```

**✅ Step 1 Complete!**

---

## STEP 2: Check if Node.js is Already Installed

**In Terminal, run:**
```bash
node --version
```

**If you see a version (like `v20.x.x`):** ✅ Node.js is installed! Skip to Step 4.

**If you see "command not found":** Continue to Step 3.

---

## STEP 3: Install Node.js via nvm (Node Version Manager)

**On shared hosting, we install Node.js in your home directory (no sudo needed):**

```bash
# Install nvm
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
```

**Expected:** Will download and install nvm.

**Then reload your shell:**
```bash
source ~/.bashrc
```

**Or close and reopen Terminal in cPanel.**

**Then install Node.js 20:**
```bash
nvm install 20
nvm use 20
nvm alias default 20
```

**Verify:**
```bash
node --version
npm --version
```

**Expected:** Should show Node.js v20.x.x and npm version.

**✅ Step 3 Complete!**

---

## STEP 4: Install PM2

**In Terminal, run:**
```bash
npm install -g pm2
```

**Note:** On shared hosting, this installs PM2 in your user's npm directory (not system-wide). That's fine!

**Verify:**
```bash
pm2 --version
```

**Expected:** Should show PM2 version.

**✅ Step 4 Complete!**

---

## STEP 5: Create Project Directory

**In Terminal, run:**
```bash
mkdir -p ~/udl-stem-lab
cd ~/udl-stem-lab
```

**Expected:** Should create directory and change into it.

**✅ Step 5 Complete!**

---

## STEP 6: Clone Repository from GitHub

**In Terminal (you should be in `~/udl-stem-lab`):**
```bash
git clone https://github.com/ptulin/udl-stem-lab.git .
```

**Note:** The `.` at the end clones into current directory.

**Expected:** Should download files.

**Verify:**
```bash
ls -la
```

**Expected:** Should show `package.json`, `app/`, `components/`, etc.

**✅ Step 6 Complete!**

---

## STEP 7: Install Dependencies

**In Terminal (still in `~/udl-stem-lab`):**
```bash
npm install
```

**Expected:** Will take 30-60 seconds, showing package installation.

**Wait for it to finish.** You'll see "added XXX packages" at the end.

**✅ Step 7 Complete!**

---

## STEP 8: Build the Application

**In Terminal:**
```bash
npm run build
```

**Expected:** Will take 30-60 seconds. Should show:
- "Compiled successfully"
- Route sizes
- "Linting and checking validity of types"

**If you see errors:** Stop and let me know. Otherwise, continue.

**✅ Step 8 Complete!**

---

## STEP 9: Start with PM2

**In Terminal:**
```bash
pm2 start npm --name "udl-stem-lab" -- start
```

**Expected:** Should show:
```
[PM2] Starting in fork_mode
[PM2] Successfully started
```

**Then save PM2 config:**
```bash
pm2 save
```

**Verify it's running:**
```bash
pm2 status
```

**Expected:** Should show `udl-stem-lab` with status "online" (green).

**✅ Step 9 Complete!**

---

## STEP 10: Test App is Running

**In Terminal:**
```bash
curl http://localhost:3000
```

**Expected:** Should return HTML (a long string starting with `<!DOCTYPE html>`).

**If you see HTML:** ✅ App is running! Continue to Step 11.

**If you see an error:** Check PM2 logs:
```bash
pm2 logs udl-stem-lab --lines 20
```

**✅ Step 10 Complete!**

---

## STEP 11: Set Up Reverse Proxy (Choose One Method)

Since this is shared hosting, we need to route traffic from the web server to your Node.js app. We have two options:

### Option A: Subdomain (Recommended - Easier)

**We'll set up:** `udl-stem-lab.disruptiveexperience.com`

**This requires:**
1. Creating a subdomain in cPanel
2. Adding a `.htaccess` file to proxy to localhost:3000

**Continue to Step 11A below.**

### Option B: Subpath (More Complex)

**We'll set up:** `disruptiveexperience.com/udl-stem-lab`

**This requires:**
1. Modifying main site's `.htaccess`
2. Setting Next.js basePath
3. Rebuilding the app

**Continue to Step 11B below.**

---

## STEP 11A: Subdomain Setup (Recommended)

### 11A.1: Create Subdomain in cPanel

**In cPanel (not Terminal):**
1. Go to **Domains** section
2. Click **Subdomains**
3. **Subdomain:** `udl-stem-lab`
4. **Domain:** `disruptiveexperience.com` (should auto-fill)
5. **Document Root:** `/home1/moose/public_html/udl-stem-lab` (or let it auto-fill)
6. Click **Create**

**Expected:** Should create subdomain and directory.

### 11A.2: Create Proxy .htaccess

**In cPanel:**
1. Go to **Files** → **File Manager**
2. Navigate to `/home1/moose/public_html/udl-stem-lab/`
3. Click **+ File** (create new file)
4. Name it: `.htaccess`
5. Click the file to edit it
6. Paste this content:

```apache
RewriteEngine On
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule ^(.*)$ http://localhost:3000/$1 [P,L]
```

7. Save the file

**✅ Step 11A Complete!**

**Skip Step 11B and go to Step 12.**

---

## STEP 11B: Subpath Setup (Advanced)

### 11B.1: Set Next.js basePath

**In Terminal:**
```bash
cd ~/udl-stem-lab
echo "NEXT_PUBLIC_BASE_PATH=/udl-stem-lab" > .env.production.local
```

**Then rebuild:**
```bash
npm run build
pm2 restart udl-stem-lab
```

### 11B.2: Create Proxy Directory

**In cPanel File Manager:**
1. Navigate to `/home1/moose/public_html/`
2. Create folder: `udl-stem-lab` (if it doesn't exist)
3. Create file: `.htaccess` inside that folder
4. Paste this content:

```apache
RewriteEngine On
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule ^(.*)$ http://localhost:3000/udl-stem-lab/$1 [P,L]
```

**✅ Step 11B Complete!**

**Continue to Step 12.**

---

## STEP 12: Test the Site

**In your browser:**
- **Subdomain:** Go to `http://udl-stem-lab.disruptiveexperience.com`
- **Subpath:** Go to `http://disruptiveexperience.com/udl-stem-lab`

**Expected:** Should load the UDL STEM Lab landing page.

**If it works:** 🎉 **DEPLOYMENT COMPLETE!**

**If it doesn't work:** Check:
1. PM2 status: `pm2 status` (should show app running)
2. PM2 logs: `pm2 logs udl-stem-lab`
3. .htaccess file exists and has correct content

---

## STEP 13: Set Up SSL (HTTPS)

**In cPanel:**
1. Go to **Security** section
2. Click **SSL/TLS Status**
3. Find your subdomain or domain
4. Click **Run AutoSSL** or use **Let's Encrypt**

**Or use Terminal:**
```bash
# If certbot is available
certbot --nginx -d udl-stem-lab.disruptiveexperience.com
```

**Note:** On shared hosting, SSL is usually managed through cPanel's SSL/TLS tools.

---

## Quick Redeploy (For Future Updates)

**In Terminal:**
```bash
cd ~/udl-stem-lab
git pull origin main
npm install
npm run build
pm2 restart udl-stem-lab
```

---

## Troubleshooting

**App not loading?**
```bash
pm2 logs udl-stem-lab
pm2 restart udl-stem-lab
```

**PM2 not persisting after logout?**
```bash
# Set up PM2 startup (may need hosting provider support)
pm2 startup
# Follow the command it outputs
pm2 save
```

**Port 3000 not accessible?**
- Some shared hosts block custom ports
- Contact hosting provider to allow port 3000
- Or use a different port (update PM2 start command)

---

**Ready? Start with Step 1!** 🚀
