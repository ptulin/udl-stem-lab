# cPanel Auto-Deployment Setup (Like Portfolio)

## ✅ What's Already Done

1. ✅ Code pushed to GitHub: https://github.com/ptulin/udl-stem-lab
2. ✅ `.cpanel.yml` created (auto-deploys `out/` folder)
3. ✅ Static export configured (builds to `out/` folder)

---

## STEP 1: Build Static Files Locally

**On your Mac, in Terminal:**

```bash
cd /Users/patu/Documents/Projects/KatApp
npm run build
```

**Expected:** Creates `out/` folder with all static files.

**Important:** Commit and push the `out/` folder to GitHub so cPanel can deploy it.

---

## STEP 2: Commit and Push out/ Folder

**On your Mac:**

```bash
cd /Users/patu/Documents/Projects/KatApp
git add out/
git commit -m "Add static build files"
git push origin main
```

**This uploads the built files to GitHub so cPanel can deploy them.**

---

## STEP 3: Set Up Git Repository in cPanel

**In cPanel:**

1. Go to **Files** → **Git™ Version Control**
2. Click **Create** button
3. Fill in:
   - **Repository Name:** `udl-stem-lab`
   - **Repository Path:** `/home1/moose/repositories/udl-stem-lab` (auto-fills)
   - **Clone URL:** `https://github.com/ptulin/udl-stem-lab.git`
   - **Branch:** `main`
4. Click **Create**

**Expected:** cPanel will clone the repository and detect `.cpanel.yml`

---

## STEP 4: Initial Deployment

**In cPanel Git Version Control:**

1. Find your `udl-stem-lab` repository
2. Click **Manage**
3. Click **Pull or Deploy**
4. Click **Deploy HEAD Commit**

**Expected:** 
- Will pull latest from GitHub
- Run `.cpanel.yml` deployment script
- Copy files from `out/` to `/home1/moose/public_html/udl-stem-lab/`
- Set correct permissions

**Takes 10-30 seconds.**

---

## STEP 5: Test the Site

**In your browser:**
- Go to: `https://disruptiveexperience.com/udl-stem-lab`

**Expected:** Should load the UDL STEM Lab landing page!

---

## Future Updates (Auto-Deploy)

**When you make changes:**

1. **On your Mac:**
```bash
cd /Users/patu/Documents/Projects/KatApp
# Make your changes
npm run build
git add .
git commit -m "Update app"
git push origin main
```

2. **cPanel will auto-deploy:**
   - Detects the push (via polling, takes 2-5 minutes)
   - Pulls latest from GitHub
   - Runs `.cpanel.yml`
   - Deploys new files

**Or manually trigger:**
- cPanel → Git Version Control → Manage → Update from Remote → Deploy HEAD Commit

---

## How It Works

1. **You build locally** → Creates `out/` folder
2. **You commit `out/` to GitHub** → Files stored in repo
3. **cPanel pulls from GitHub** → Gets latest code + `out/` folder
4. **`.cpanel.yml` runs** → Copies `out/*` to `public_html/udl-stem-lab/`
5. **Site is live!** → No Node.js needed on server!

---

## Troubleshooting

**Files not deploying?**
- Check `.cpanel.yml` exists in repo root
- Verify `out/` folder was committed to GitHub
- Check cPanel deployment logs: `~/.cpanel/logs/`

**Site not loading?**
- Verify files in `/home1/moose/public_html/udl-stem-lab/`
- Check file permissions (644 for files, 755 for folders)
- Hard refresh browser (Cmd+Shift+R)

---

**Same workflow as portfolio - simple and reliable!** 🚀
