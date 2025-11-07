# 🚨 URGENT: Railway npm not found - Complete Fix

## The Problem
Railway is NOT using your Dockerfile. It's trying to run `npm` in a container that doesn't have Node.js installed.

## Solution: Delete and Recreate Service

Railway sometimes gets stuck in a bad state. The fastest fix is to recreate:

### Step 1: Delete Current Service
1. In Railway dashboard, click on your "LumenFlow" service
2. Click the three dots (⋯) menu
3. Select "Delete" or "Remove"
4. Confirm deletion

### Step 2: Create New Service
1. Click "New" → "GitHub Repo"
2. Select your `q0de/LumenFlow` repository
3. **IMPORTANT:** Before clicking "Deploy", go to Settings first!

### Step 3: Configure BEFORE First Deploy
1. **Settings** → **Service**
   - Set **Root Directory**: `frontend`
   
2. **Settings** → **Build & Deploy**
   - Set **Dockerfile Path**: `frontend/Dockerfile`
   - Or toggle **"Use Dockerfile"** to ON
   - Make sure **Builder** is set to "Dockerfile" (not Nixpacks)

3. **Settings** → **Variables**
   - Add all your Supabase environment variables:
     - `NEXT_PUBLIC_SUPABASE_URL`
     - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
     - `SUPABASE_SERVICE_ROLE_KEY`
     - `NODE_ENV=production`

### Step 4: Deploy
1. Now click "Deploy"
2. Watch the **Build Logs** (not Deploy Logs)
3. You should see Docker building the image

## What You Should See in Build Logs

✅ **Good:**
```
Step 1/10 : FROM node:18-alpine
Step 2/10 : RUN apk add --no-cache ffmpeg bash
Step 3/10 : WORKDIR /app
Installing dependencies...
Building Next.js...
```

❌ **Bad (what you're seeing now):**
```
Starting Container
npm: command not found
```

## Alternative: Use Nixpacks

If Dockerfile still doesn't work after recreating:

1. **Settings** → **Build**
2. Set **Builder** to: `Nixpacks`
3. Railway will use `frontend/nixpacks.toml`
4. This should install Node.js automatically

## Why This Happens

Railway auto-detects the build method. If it sees Python files in root, it might try to use Python. By setting Root Directory to `frontend` FIRST, Railway will look at `frontend/package.json` and detect Node.js correctly.

## Key Point

**Set Root Directory BEFORE first deploy!** This is critical. If you deploy first, Railway locks in the wrong detection.

