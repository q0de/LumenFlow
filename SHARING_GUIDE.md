# 🚀 Sharing LumenFlow with Friends

## ⚠️ Important: Vercel Limitation

**Current Issue:** Your app uses FFmpeg and file system operations, which **won't work on Vercel's serverless functions**.

Vercel doesn't support:
- ❌ FFmpeg execution
- ❌ Long-running processes (video processing takes time)
- ❌ File system writes (saves files to disk)

## ✅ Solutions for Sharing

### Option 1: Use Railway (Recommended for Full Stack)

**Railway supports FFmpeg and file storage!**

1. **Sign up:** [railway.app](https://railway.app)
2. **Deploy:**
   - Connect your GitHub repo
   - Set Root Directory: `frontend`
   - Add environment variables (same as Vercel)
   - Railway will auto-detect Next.js
3. **Install FFmpeg:**
   - Add a `railway.json` or use Railway's Nixpacks
   - Or add FFmpeg to your build process
4. **Share the URL:** Railway gives you a public URL like `your-app.railway.app`

**Pros:**
- ✅ Supports FFmpeg
- ✅ File system access
- ✅ Long-running processes
- ✅ Free tier available

### Option 2: Use Render

**Similar to Railway, supports FFmpeg**

1. **Sign up:** [render.com](https://render.com)
2. **Create Web Service:**
   - Connect GitHub repo
   - Root Directory: `frontend`
   - Build Command: `cd frontend && npm install && npm run build`
   - Start Command: `cd frontend && npm start`
3. **Add FFmpeg:**
   - Use Render's buildpack or install in Dockerfile
4. **Share URL:** `your-app.onrender.com`

### Option 3: Keep Frontend on Vercel, Process Locally

**Host frontend on Vercel, but process videos on your machine**

1. Deploy frontend to Vercel (works great!)
2. Keep a local server running for processing
3. Point API routes to your local server
4. Use ngrok or similar to expose local server

**Not ideal for sharing with friends** - requires your computer running.

### Option 4: Use Cloud Video Processing Service

**Outsource video processing to a service**

- Use services like Cloudinary, Mux, or AWS MediaConvert
- Modify API routes to call their APIs
- More complex but scalable

## 🎯 Recommended: Railway

**Best balance of ease and functionality**

### Quick Railway Setup:

1. **Create `railway.json` in `frontend/`:**
```json
{
  "build": {
    "builder": "NIXPACKS",
    "buildCommand": "npm install && npm run build"
  },
  "deploy": {
    "startCommand": "npm start",
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 10
  }
}
```

2. **Add FFmpeg installation:**
Create `frontend/Dockerfile`:
```dockerfile
FROM node:18-alpine

# Install FFmpeg
RUN apk add --no-cache ffmpeg

WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

EXPOSE 3000
CMD ["npm", "start"]
```

3. **Deploy on Railway:**
   - Connect GitHub
   - Railway will auto-detect Dockerfile
   - Add environment variables
   - Deploy!

## 📝 What to Share with Friends

Once deployed, share:

1. **The public URL** (e.g., `lumenflow.railway.app`)
2. **Simple instructions:**
   ```
   🎬 LumenFlow - Green Screen to Alpha WEBM
   
   1. Upload your green-screen video
   2. Adjust settings if needed
   3. Wait for processing
   4. Download your transparent WEBM!
   
   Perfect for Unity game development!
   ```

3. **Requirements:**
   - Green screen video (MP4, MOV, AVI)
   - Max file size: 100MB
   - Works best with uniform green backgrounds

## 🔒 Security Considerations

Before sharing publicly:

- [ ] Add rate limiting (prevent abuse)
- [ ] Add file size limits (already have 100MB)
- [ ] Consider authentication (optional)
- [ ] Monitor usage/costs
- [ ] Add error handling for edge cases

## 💰 Cost Estimates

- **Railway:** Free tier (500 hours/month), then ~$5-20/month
- **Render:** Free tier available, then ~$7/month
- **Vercel:** Free for frontend (but can't process videos)

## 🚀 Quick Start Checklist

- [ ] Choose hosting (Railway recommended)
- [ ] Deploy application
- [ ] Test video processing
- [ ] Get public URL
- [ ] Share with friends!
- [ ] Monitor usage

---

**Need help?** Check the deployment platform's docs or ask for specific setup help!

