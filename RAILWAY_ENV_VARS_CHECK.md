# 🔍 Check Railway Environment Variables

## The Error
"Error: supabaseUrl is required" means the Supabase environment variables aren't being read in Railway.

## Quick Fix

### Step 1: Verify Variables in Railway
1. Go to Railway Dashboard → Your Service
2. Click **"Variables"** tab
3. Make sure these are set:
   - `NEXT_PUBLIC_SUPABASE_URL` = `https://timpxdtskgujtzpbgcvq.supabase.co`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` = (your anon key)
   - `SUPABASE_SERVICE_ROLE_KEY` = (your service role key)

### Step 2: Check Variable Names
Make sure the names are **exactly**:
- `NEXT_PUBLIC_SUPABASE_URL` (not `SUPABASE_URL`)
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` (not `SUPABASE_ANON_KEY`)
- `SUPABASE_SERVICE_ROLE_KEY`

### Step 3: Verify Values
- No quotes around values
- No spaces around `=`
- Values are not empty
- Copy-paste directly from Supabase dashboard

### Step 4: Redeploy
After adding/fixing variables:
1. Go to **Deployments** tab
2. Click **Redeploy**
3. Wait for deployment to complete
4. Try uploading again

## Common Issues

### Variables Not Set
- Railway auto-detected them but they're empty
- Click "Add" to actually set them

### Wrong Names
- Must be exactly `NEXT_PUBLIC_SUPABASE_URL` (case-sensitive)
- The `NEXT_PUBLIC_` prefix is required for client-side access

### Not Redeployed
- Variables only load when the app starts
- Must redeploy after adding/changing variables

## Test After Fix

1. Visit your Railway URL
2. Try uploading a video
3. Should work now!

If it still doesn't work, check Railway Logs for the specific error message.

