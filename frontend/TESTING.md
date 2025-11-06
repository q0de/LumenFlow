# Testing LumenFlow

## Quick Test Checklist

### 1. **Start the Server**
```powershell
cd frontend
npm run dev
```
Wait for: `✓ Ready in X.Xs` and `Local: http://localhost:3000`

### 2. **Test in Browser**

#### A. Upload Test
1. Open http://localhost:3000
2. Click "Processing Options" to expand settings
3. Adjust settings (optional)
4. Drag & drop a green-screen video
5. Watch progress bar

#### B. Download Test
1. Wait for processing to complete (green checkmark)
2. Click "Download WEBM" button
3. **Check browser downloads:**
   - ✅ Should download `.webm` file
   - ❌ Should NOT download `.json` file

### 3. **Browser DevTools Check**

Open DevTools (F12) → Network tab:

1. **Upload Request:**
   - Look for `POST /api/upload`
   - Status: `200 OK`
   - Response: `{ "jobId": "...", "filename": "..." }`

2. **Job Status Polling:**
   - Look for `GET /api/jobs/[jobId]`
   - Should see progress updates
   - Final response: `{ "status": "completed", "progress": 100, "downloadUrl": "..." }`

3. **Download Request:**
   - Look for `GET /api/download/[jobId]`
   - Status: `200 OK`
   - Content-Type: `video/webm`
   - Should download actual file, not JSON

### 4. **Console Errors Check**

Open DevTools → Console tab:
- Should see no red errors
- Any errors will show what's wrong

### 5. **File System Check**

After processing, verify files exist:

```powershell
# Check input folder
ls input/

# Check webm folder  
ls webm/
```

Should see:
- Input: Original uploaded file
- Webm: Processed `.webm` file

### 6. **Manual API Test**

Test the download endpoint directly:

```powershell
# Replace JOB_ID with actual job ID from browser
$jobId = "your-job-id-here"
Invoke-WebRequest -Uri "http://localhost:3000/api/download/$jobId" -OutFile "test-download.webm"
```

Check if `test-download.webm` exists and is a valid video file.

## Common Issues

### ❌ Download returns JSON instead of file
**Fix:** Job not found or file doesn't exist. Check:
- Job completed successfully
- File exists in `webm/` folder
- Job ID matches

### ❌ "File not found" error
**Fix:** 
- Check `webm/` folder has the file
- Verify filename matches what's stored in job

### ❌ Processing stuck at 20%
**Fix:**
- Check FFmpeg is installed: `ffmpeg -version`
- Check terminal for FFmpeg errors
- Verify input video is valid

### ❌ Settings not saving
**Fix:**
- Check browser localStorage (DevTools → Application → Local Storage)
- Should see `lumenflow-options` key

## Success Indicators

✅ Upload completes without errors  
✅ Progress bar reaches 100%  
✅ Download button appears  
✅ Download gets `.webm` file (not `.json`)  
✅ File plays in video player  
✅ File has transparency (check in video editor)

