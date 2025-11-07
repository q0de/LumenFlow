# 🔧 Fix "npm: command not found" on Railway

## Problem
Railway isn't using the Dockerfile, so Node.js/npm isn't installed in the container.

## Solutions

### Solution 1: Force Dockerfile Usage (Recommended)

**In Railway Dashboard:**

1. Go to your service → **Settings**
2. Find **"Build & Deploy"** section
3. Set **"Build Command"** to: (leave empty)
4. Set **"Dockerfile Path"** to: `frontend/Dockerfile`
5. Or toggle **"Use Dockerfile"** to ON
6. **Save** and **Redeploy**

### Solution 2: Use Nixpacks (Alternative)

I've added `nixpacks.toml` which Railway can use instead of Dockerfile.

**In Railway Dashboard:**

1. Go to **Settings** → **Build**
2. Set **Builder** to: `Nixpacks`
3. Railway will use `frontend/nixpacks.toml`
4. **Save** and **Redeploy**

### Solution 3: Check Root Directory

Make sure Root Directory is set correctly:

1. **Settings** → **Service** → **Root Directory**: `frontend`
2. This ensures Railway looks in the right place for Dockerfile

### Solution 4: Manual Build Command

If Dockerfile still doesn't work:

1. **Settings** → **Build**
2. **Build Command**: 
   ```bash
   cd frontend && docker build -t lumenflow -f Dockerfile . && docker run --rm lumenflow npm --version
   ```
3. Or simpler: Just set Root Directory to `frontend` and Railway should auto-detect

## What Should Happen

After fixing, you should see in logs:

✅ **Good:**
```
Step 1/10 : FROM node:18-alpine
Step 2/10 : RUN apk add --no-cache ffmpeg
Installing dependencies...
Building Next.js...
```

❌ **Bad (current):**
```
npm: command not found
```

## Quick Checklist

- [ ] Root Directory set to `frontend`
- [ ] Dockerfile Path set to `frontend/Dockerfile` (or Use Dockerfile enabled)
- [ ] Environment variables added
- [ ] Redeployed after changes

## If Still Not Working

Try deleting and recreating the service:

1. Delete current Railway service
2. Create new service
3. **Before first deploy**, set:
   - Root Directory: `frontend`
   - Use Dockerfile: ON
   - Dockerfile Path: `frontend/Dockerfile`
4. Add environment variables
5. Deploy

The key is making sure Railway uses the Dockerfile, which installs Node.js and npm!

