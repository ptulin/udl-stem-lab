# Static Export Deployment (No Node.js Required!)

Perfect solution for shared hosting without Node.js support.

---

## How It Works

1. **Build locally** on your Mac (where you have Node.js)
2. **Export as static HTML files** (like your portfolio)
3. **Upload to server** via cPanel File Manager or FTP
4. **Works immediately** - no server-side code needed!

---

## STEP 1: Build Static Files Locally

**On your Mac, in Terminal:**

```bash
cd /Users/patu/Documents/Projects/KatApp
npm install
npm run build
```

**Expected:** 
- Will create an `out/` directory
- Contains all static HTML, CSS, JS files
- Ready to upload!

**What gets created:**
```
out/
├── index.html
├── onboarding/
│   └── index.html
├── modules/
│   └── index.html
├── lab/
│   └── circuits-intro/
│       └── index.html
├── _next/
│   └── static/  (all CSS, JS, assets)
└── data/
    └── contentPack.json
```

---

## STEP 2: Upload to Server

### Option A: cPanel File Manager (Easiest)

**In cPanel:**
1. Go to **Files** → **File Manager**
2. Navigate to `/home1/moose/public_html/`
3. Create folder: `udl-stem-lab` (if it doesn't exist)
4. Open that folder
5. Click **Upload** button
6. Select **all files** from the `out/` directory on your Mac
7. Wait for upload to complete

**Or use drag-and-drop:**
- Open `out/` folder on your Mac
- Drag all contents into cPanel File Manager

### Option B: FTP (Faster for large uploads)

**Using an FTP client (like FileZilla):**
1. Connect to `disruptiveexperience.com`
2. Username: `moose`
3. Navigate to `/public_html/udl-stem-lab/`
4. Upload all files from `out/` directory

---

## STEP 3: Set Permissions

**In cPanel File Manager:**
1. Select all files in `/public_html/udl-stem-lab/`
2. Right-click → **Change Permissions**
3. Set:
   - Files: `644`
   - Folders: `755`

**Or in Terminal (if you have access):**
```bash
cd /home1/moose/public_html/udl-stem-lab
find . -type f -exec chmod 644 {} \;
find . -type d -exec chmod 755 {} \;
```

---

## STEP 4: Test the Site

**In your browser:**
- Go to: `https://disruptiveexperience.com/udl-stem-lab`

**Expected:** Should load the UDL STEM Lab landing page!

---

## STEP 5: Set Up Auto-Deploy (Like Portfolio)

### Create `.cpanel.yml` for Auto-Deployment

**In your project root, create `.cpanel.yml`:**

```yaml
---
deployment:
  tasks:
    - /bin/cp -rf out/* /home1/moose/public_html/udl-stem-lab/
    - find /home1/moose/public_html/udl-stem-lab -type f -exec chmod 644 {} \;
    - find /home1/moose/public_html/udl-stem-lab -type d -exec chmod 755 {} \;
```

### Set Up Git Repository in cPanel

**In cPanel:**
1. Go to **Files** → **Git™ Version Control**
2. Click **Create**
3. **Repository Name:** `udl-stem-lab`
4. **Repository Path:** `/home1/moose/repositories/udl-stem-lab` (auto-fills)
5. **Clone URL:** `https://github.com/ptulin/udl-stem-lab.git`
6. **Branch:** `main`
7. Click **Create**

**Note:** The `.cpanel.yml` will automatically deploy the `out/` folder when you push to GitHub!

---

## Future Updates (Quick Deploy)

**On your Mac:**
```bash
cd /Users/patu/Documents/Projects/KatApp
# Make your changes
npm run build
# Upload the new out/ folder to server
```

**Or use Git + cPanel auto-deploy:**
```bash
# Make changes
npm run build
git add .
git commit -m "Update app"
git push origin main
# cPanel will auto-deploy from out/ folder
```

---

## Advantages of Static Export

✅ **No Node.js needed on server**  
✅ **Works on any shared hosting**  
✅ **Fast loading** (pre-rendered HTML)  
✅ **Easy to deploy** (just upload files)  
✅ **Same as portfolio** (you already know this!)  
✅ **Free SSL** (via cPanel)  

---

## Important Notes

- **LocalStorage still works** (runs in browser)
- **All interactivity works** (React runs client-side)
- **Analytics still work** (stored in browser localStorage)
- **No API routes** (which is fine - we don't need them!)

---

## Troubleshooting

**404 errors?**
- Make sure you uploaded the `out/` folder contents, not the `out/` folder itself
- Check file permissions (644 for files, 755 for folders)

**Styles not loading?**
- Check that `_next/static/` folder was uploaded
- Verify file permissions

**JavaScript not working?**
- Check browser console for errors
- Verify all files in `_next/static/` were uploaded

---

**This is the same approach as your portfolio - simple and reliable!** 🚀
