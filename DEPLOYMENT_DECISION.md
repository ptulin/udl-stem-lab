# Deployment Method Decision Guide

## TL;DR: Use Subdomain

**Recommended:** `udl-stem-lab.disruptiveexperience.com` (subdomain)
- ✅ No Next.js configuration needed
- ✅ Works immediately after nginx setup
- ✅ Standard proxy configuration
- ✅ Easier to maintain and troubleshoot

**Advanced:** `/udl-stem-lab` (subpath)
- ⚠️ Requires `basePath` configuration
- ⚠️ Requires rebuild after setting environment variable
- ⚠️ More complex nginx setup
- ⚠️ Potential issues with static assets

---

## Why Subdomain is Recommended

### Subdomain Deployment

**Pros:**
- Next.js runs at root path (`/`) - no configuration needed
- Standard nginx proxy setup
- No rebuild required after nginx configuration
- Static assets work automatically
- Internal routing works out of the box
- Easier to debug (standard Next.js behavior)

**Cons:**
- Requires DNS configuration for subdomain
- Separate SSL certificate (or wildcard)

**Setup Complexity:** ⭐ Low

### Subpath Deployment

**Pros:**
- Uses main domain (no DNS changes)
- Can share SSL certificate with main site

**Cons:**
- Requires `basePath` in `next.config.js`
- Must set `NEXT_PUBLIC_BASE_PATH=/udl-stem-lab` environment variable
- Must rebuild app after setting basePath: `npm run build`
- All internal links must respect basePath (Next.js router handles this, but assets need configuration)
- More complex nginx location block configuration
- Potential issues with:
  - Static assets (images, fonts, etc.)
  - API routes (if added later)
  - WebSocket connections
  - Service workers (if added later)

**Setup Complexity:** ⭐⭐⭐ Medium-High

---

## Technical Details

### Subdomain Setup

1. Configure DNS: `udl-stem-lab.disruptiveexperience.com` → server IP
2. Create nginx config (see `nginx-subdomain.conf`)
3. Enable site: `sudo ln -s ...`
4. Test nginx: `sudo nginx -t`
5. Reload nginx: `sudo systemctl reload nginx`
6. Get SSL: `sudo certbot --nginx -d udl-stem-lab.disruptiveexperience.com`
7. **Done!** No Next.js changes needed.

### Subpath Setup

1. Edit main nginx config (see `nginx-subpath.conf`)
2. Set environment variable: `echo "NEXT_PUBLIC_BASE_PATH=/udl-stem-lab" > .env.production.local`
3. **Rebuild app:** `npm run build` (required!)
4. Restart PM2: `pm2 restart udl-stem-lab`
5. Test nginx: `sudo nginx -t`
6. Reload nginx: `sudo systemctl reload nginx`
7. Get SSL: `sudo certbot --nginx -d disruptiveexperience.com`
8. **Verify:** Check that all assets load correctly

---

## Decision Matrix

| Factor | Subdomain | Subpath |
|--------|-----------|---------|
| Setup Time | 5 minutes | 15-20 minutes |
| Next.js Config | None | Required |
| Rebuild Required | No | Yes |
| DNS Changes | Yes | No |
| SSL Complexity | Separate cert | Shared cert |
| Maintenance | Easy | Medium |
| Troubleshooting | Standard | Custom |
| Static Assets | Works | Needs config |
| Future API Routes | Works | Needs config |

---

## Recommendation

**For MVP/Demo:** Use **Subdomain** (`udl-stem-lab.disruptiveexperience.com`)

**Only use Subpath if:**
- You cannot create subdomains
- You have specific requirements for subpath
- You're comfortable with Next.js basePath configuration
- You're willing to rebuild after every config change

---

## Quick Start Commands

### Subdomain (Recommended)
```bash
# 1. Configure nginx (see nginx-subdomain.conf)
# 2. Enable site
sudo ln -s /etc/nginx/sites-available/udl-stem-lab.disruptiveexperience.com /etc/nginx/sites-enabled/
# 3. Test and reload
sudo nginx -t && sudo systemctl reload nginx
# 4. Get SSL
sudo certbot --nginx -d udl-stem-lab.disruptiveexperience.com
# Done!
```

### Subpath (Advanced)
```bash
# 1. Configure nginx (see nginx-subpath.conf)
# 2. Set basePath
echo "NEXT_PUBLIC_BASE_PATH=/udl-stem-lab" > .env.production.local
# 3. REBUILD (required!)
npm run build
# 4. Restart
pm2 restart udl-stem-lab
# 5. Test and reload nginx
sudo nginx -t && sudo systemctl reload nginx
# 6. Get SSL
sudo certbot --nginx -d disruptiveexperience.com
# 7. Verify assets load correctly
```

---

**Bottom Line:** Unless you have a specific reason to use subpath, use subdomain. It's simpler, faster, and less error-prone.
