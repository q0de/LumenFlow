# 🚀 Render.com Deployment Guide

## The Issue We're Fixing

Your app is deployed but the download/preview UI isn't showing because:
1. Files are being written to `/tmp` (non-persistent storage)
2. Need to use Render's persistent disk mounted at `/data`
3. The `STORAGE_PATH` environment variable needs to be set

## Quick Fix Steps

### 1. Add Environment Variable in Render Dashboard

1. Go to your Render service dashboard
2. Click **Environment** in the left sidebar
3. Add this new variable:
   - **Key:** `STORAGE_PATH`
   - **Value:** `/data`
4. Click **Save Changes**

### 2. Add Persistent Disk (if not already added)

1. In Render dashboard, go to your service
2. Click **Disks** in the left sidebar
3. Click **Add Disk** if you haven't already
4. Configure:
   - **Name:** `lumenflow-storage`
   - **Mount Path:** `/data`
   - **Size:** 10 GB (or more if needed)
5. Click **Create**

### 3. Redeploy

1. Either:
   - Push the latest code changes to GitHub (recommended)
   - Or click **Manual Deploy** → **Deploy latest commit**

## What Changed

### Files Modified:
1. **`frontend/app/api/upload/route.ts`**
   - Now uses `STORAGE_PATH` environment variable
   - Defaults to `/data` (Render's persistent disk)
   - Added detailed logging for debugging

2. **`frontend/app/api/download/[jobId]/route.ts`**
   - Now uses same `STORAGE_PATH` for downloads
   - Ensures downloads come from persistent storage

3. **`render.yaml`** (NEW)
   - Configuration file for Render
   - Defines persistent disk mounting
   - Sets environment variables

## Verify Deployment

### 1. Check Logs After Redeploy

Look for these log messages:
```
📁 Storage paths - baseDir: /data, webmDir: /data/webm
✅ Directories created successfully
✅ FFmpeg completed successfully for job [job-id]
📦 Output file: your-video.webm
✅ File exists! Size: [size] bytes
✅ Job [job-id] marked as completed in database
```

### 2. Test the App

1. Visit your Render URL
2. Upload a test video
3. Watch for progress (should reach 100%)
4. **The download and preview buttons should now appear!**

## Troubleshooting

### Still not seeing download button?

Check the logs for:
- `❌ File not found at [path]` → Disk not mounted correctly
- `output_filename` is NULL in database → Check Supabase logs
- FFmpeg errors → Check video format compatibility

### Disk not mounting?

1. Verify disk is created in Render dashboard
2. Check Mount Path is exactly `/data`
3. Verify `STORAGE_PATH=/data` environment variable is set
4. Redeploy after making changes

### Files disappearing?

- Make sure you're using persistent disk, not `/tmp`
- Verify `STORAGE_PATH` is set correctly
- Check disk size hasn't reached capacity

## Environment Variables Summary

Make sure ALL these are set in Render:

| Variable | Value | Required |
|----------|-------|----------|
| `NODE_ENV` | `production` | Yes |
| `PORT` | `3000` | Auto-set by Render |
| `STORAGE_PATH` | `/data` | **YES - NEW!** |
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase URL | Yes |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Your anon key | Yes |
| `SUPABASE_SERVICE_ROLE_KEY` | Your service key | Yes |

## Alternative: Use render.yaml

Instead of manual configuration, you can:

1. Push the included `render.yaml` to your repo
2. Render will auto-configure from the file
3. You'll still need to add the Supabase env vars manually (they're marked as `sync: false` for security)

## Expected Behavior After Fix

1. ✅ Upload video → Shows uploading progress
2. ✅ Processing → Shows processing progress with percentage
3. ✅ Completion → Shows "Download WEBM" and "Test Transparency" buttons
4. ✅ Download → Actually downloads the processed file
5. ✅ Preview → Shows video with transparency on colored background

## Cost Note

Render persistent disks cost extra:
- 10 GB disk: ~$1/month
- Adjust size based on your needs
- Files persist between deploys

