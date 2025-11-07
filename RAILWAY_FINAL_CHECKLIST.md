# ✅ Railway Deployment Final Checklist

## What's Already Done ✅

- [x] Builder set to Nixpacks (via railway.json)
- [x] nixpacks.toml created (installs Node.js + FFmpeg)
- [x] File paths updated for production (/tmp)
- [x] Start command configured
- [x] Procfile added
- [x] All code pushed to GitHub

## What You Need to Verify in Railway Dashboard

### 1. Root Directory
- [ ] Go to **Settings** → **Source**
- [ ] **Root Directory** should be: `frontend`
- [ ] If it says "Add Root Directory", click it and enter: `frontend`

### 2. Environment Variables
- [ ] Go to **Variables** tab
- [ ] Add these variables:
  - [ ] `NEXT_PUBLIC_SUPABASE_URL` = `https://timpxdtskgujtzpbgcvq.supabase.co`
  - [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY` = (your anon key)
  - [ ] `SUPABASE_SERVICE_ROLE_KEY` = (your service role key)
  - [ ] `NODE_ENV` = `production`

### 3. Builder (Should Auto-Detect Now)
- [ ] Go to **Settings** → **Build**
- [ ] **Builder** should show: `Nixpacks` (from railway.json)
- [ ] If it still says Dockerfile, refresh the page

### 4. Deploy
- [ ] Go to **Deployments** tab
- [ ] Click **Redeploy** or trigger new deployment
- [ ] Watch **Build Logs** (not Deploy Logs)

## What to Look For in Build Logs

✅ **Success signs:**
```
Using Nixpacks...
Installing Node.js 18...
Installing FFmpeg...
Installing dependencies...
Building Next.js...
Build complete!
```

❌ **Error signs:**
```
npm: command not found
FFmpeg not found
Build failed
```

## After Successful Deploy

1. **Get your URL:**
   - Railway will provide a URL like: `lumenflow-production.up.railway.app`
   - Or generate a custom domain

2. **Test it:**
   - Visit the URL
   - Try uploading a small test video
   - Check if processing works

3. **Share with friends:**
   - Send them the URL
   - They can use LumenFlow!

## If Build Still Fails

1. Check Build Logs for specific error
2. Verify Root Directory is `frontend`
3. Verify environment variables are set
4. Make sure Builder is Nixpacks (not Dockerfile)

---

**You're almost there!** Just verify Root Directory and add environment variables, then redeploy! 🚀

