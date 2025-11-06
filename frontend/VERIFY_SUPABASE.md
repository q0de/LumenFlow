# Verify Supabase Setup

## ✅ You have `.env.local` - Great!

Now let's make sure everything is working.

## Quick Verification Steps

### 1. Check Environment Variables Are Loaded

Start your dev server and check for errors:

```bash
cd frontend
npm run dev
```

**Look for:**
- ✅ No "Missing Supabase environment variables" error
- ✅ Server starts successfully
- ✅ No red errors in terminal

### 2. Test the Connection

1. Open browser to http://localhost:3000
2. Open DevTools (F12) → Console tab
3. Upload a video
4. **Check for errors:**
   - ❌ "Missing Supabase environment variables" = env vars not loaded
   - ❌ "Failed to fetch" = Supabase connection issue
   - ✅ No errors = Working!

### 3. Check Supabase Dashboard

1. Go to Supabase dashboard
2. **Table Editor** → `jobs` table
3. Upload a video in the app
4. You should see a new row appear in the `jobs` table!

### 4. Test Real-time Updates

1. Upload a video
2. Watch the progress bar
3. **Should update in real-time** (no page refresh needed)
4. Check Supabase dashboard → `jobs` table updates automatically

## Common Issues

### "Missing Supabase environment variables"
**Fix:**
- Restart dev server (env vars only load on startup)
- Check `.env.local` is in `frontend/` folder (not root)
- Verify variable names are exact (no typos)
- Check no quotes around values

### "Failed to fetch" or connection errors
**Fix:**
- Check Supabase URL is correct (ends with `.supabase.co`)
- Verify anon key is correct
- Check Supabase project is active
- Check internet connection

### Real-time not working
**Fix:**
- Check Supabase → Database → Replication → `jobs` table enabled
- Verify schema was run (table exists)
- Check browser console for errors

## Success Indicators

✅ Server starts without errors  
✅ Can upload videos  
✅ Jobs appear in Supabase dashboard  
✅ Progress updates in real-time  
✅ No console errors  

## Next: Run Database Schema

If you haven't already, run the SQL schema:

1. Go to Supabase dashboard
2. **SQL Editor**
3. Copy/paste `supabase/schema.sql`
4. Click **Run**

Then you're all set! 🎉

