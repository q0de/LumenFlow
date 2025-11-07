# 🚂 Railway Deployment Checklist

## ✅ What You Need to Configure

### 1. Root Directory
- Set to: `frontend`
- Railway Settings → Service → Root Directory

### 2. Environment Variables
Add these in Railway Dashboard → Variables:

```
NEXT_PUBLIC_SUPABASE_URL=https://timpxdtskgujtzpbgcvq.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
NODE_ENV=production
PORT=3000
```

### 3. Build Settings
Railway should auto-detect:
- **Build Command:** `npm install && npm run build`
- **Start Command:** `npm start`
- **Dockerfile:** Will use `frontend/Dockerfile` automatically

### 4. Port Configuration
- Railway automatically sets `PORT` environment variable
- Next.js will use it automatically
- No manual port configuration needed

## 🔍 Verify Deployment

After Railway deploys:

1. **Check build logs:**
   - Should see FFmpeg installation: `apk add --no-cache ffmpeg`
   - Should see Next.js build completing

2. **Test the app:**
   - Visit your Railway URL (e.g., `your-app.railway.app`)
   - Try uploading a small test video
   - Check if processing works

3. **Check for errors:**
   - Railway Dashboard → Deployments → View logs
   - Look for FFmpeg errors or file system errors

## 🐛 Common Issues

### FFmpeg not found
- **Fix:** Make sure Dockerfile is in `frontend/` folder
- **Check:** Railway logs should show FFmpeg installation

### File system errors
- **Fix:** Files are stored in `/tmp` on Railway (already configured)
- **Note:** Files may be cleared on restart (this is normal for Railway)

### Port errors
- **Fix:** Railway sets `PORT` automatically, Next.js uses it
- **Check:** Should see "Ready on port 3000" in logs

### Build fails
- **Check:** Make sure all dependencies are in `package.json`
- **Check:** Railway logs for specific error messages

## 📝 Next Steps

1. ✅ Push Dockerfile to GitHub (done)
2. ✅ Configure Railway service
3. ⏳ Add environment variables
4. ⏳ Deploy and test
5. ⏳ Share URL with friends!

## 🎉 Once Working

Your Railway URL will be something like:
- `lumenflow-production.up.railway.app`
- Or custom domain if you set one up

Share this URL with friends and they can use LumenFlow!

---

**Need help?** Check Railway logs or ask for specific troubleshooting!

