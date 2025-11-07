# 🏥 Railway Healthcheck Setup

## What I Added

1. **Healthcheck Endpoint**: `/api/health`
   - Returns app status and environment variable check
   - Helps Railway verify the app is running

2. **Upgraded to Node.js 20**
   - Fixed deprecation warning
   - Better performance

## Configure in Railway

### Step 1: Set Healthcheck Path
1. Go to Railway → Settings → Deploy
2. Find "Healthcheck Path" section
3. Click "+ Healthcheck Path"
4. Enter: `/api/health`
5. Save

### Step 2: Test the Healthcheck
After Railway redeploys:
1. Visit: `https://lumenflow-production.up.railway.app/api/health`
2. Should return JSON with status and env info
3. This confirms the app is running

## What the Healthcheck Shows

The endpoint returns:
- `status: "ok"` - App is running
- `timestamp` - Current time
- `env` - Which environment variables are set (without exposing values)

## Why This Helps

- Railway can verify the app is actually running
- Prevents Railway from killing healthy containers
- Helps diagnose environment variable issues

## After Setup

1. Railway will check `/api/health` periodically
2. If it returns 200 OK, Railway knows the app is healthy
3. Container should stay running!

---

**Next:** Set the healthcheck path in Railway Settings → Deploy → Healthcheck Path: `/api/health`

