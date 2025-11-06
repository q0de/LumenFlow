# Test Supabase Integration

## ✅ Schema Run - Great!

Now let's verify everything is working.

## Quick Test Steps

### 1. Restart Dev Server

**Important:** Environment variables only load when the server starts!

```bash
# Stop current server (Ctrl+C)
cd frontend
npm run dev
```

**Look for:**
- ✅ No "Missing Supabase environment variables" error
- ✅ Server starts successfully
- ✅ No red errors

### 2. Check Supabase Dashboard

1. Go to Supabase dashboard
2. **Table Editor** → `jobs` table
3. Should see the table with columns:
   - id, status, progress, filename, output_filename, error, options, created_at, updated_at

### 3. Test Upload

1. Open http://localhost:3000
2. Upload a video
3. **Watch Supabase dashboard:**
   - New row should appear in `jobs` table
   - Status should update: `processing` → `completed`
   - Progress should update: 0 → 100

### 4. Test Real-time Updates

1. Upload a video
2. **Don't refresh the page**
3. Watch progress bar update automatically
4. Check Supabase dashboard - updates should appear there too

## Success Indicators

✅ Server starts without errors  
✅ Jobs table exists in Supabase  
✅ Can upload videos  
✅ Jobs appear in Supabase dashboard  
✅ Progress updates in real-time (no page refresh)  
✅ Download works  

## If Something's Wrong

### "Missing Supabase environment variables"
- Restart dev server
- Check `.env.local` is in `frontend/` folder
- Verify keys are correct (no quotes, no spaces)

### "Table doesn't exist"
- Check SQL Editor → See if schema ran successfully
- Verify `jobs` table in Table Editor
- Re-run schema if needed

### Real-time not working
- Check Database → Replication → `jobs` table enabled
- Check browser console for errors
- Verify schema included real-time setup

### Jobs not appearing
- Check Supabase dashboard → Table Editor
- Verify API keys are correct
- Check browser console for errors

## Next: Test It!

Restart your server and upload a video to see it in action! 🚀

