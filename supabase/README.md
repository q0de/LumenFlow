# Supabase Setup for LumenFlow

## Quick Start

### 1. Create Supabase Project

1. Go to [https://supabase.com](https://supabase.com)
2. Sign up / Log in
3. Click "New Project"
4. Fill in:
   - **Name**: LumenFlow (or your choice)
   - **Database Password**: (save this!)
   - **Region**: Choose closest to you
5. Wait for project to be created (~2 minutes)

### 2. Get Your API Keys

1. Go to **Settings** → **API**
2. Copy:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon/public key** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role key** → `SUPABASE_SERVICE_ROLE_KEY` (optional, for server-side)

### 3. Run Database Schema

1. Go to **SQL Editor** in Supabase dashboard
2. Copy contents of `supabase/schema.sql`
3. Paste and click **Run**
4. Verify table was created:
   - Go to **Table Editor**
   - You should see `jobs` table

### 4. Enable Real-time

1. Go to **Database** → **Replication**
2. Find `jobs` table
3. Toggle **Enable** (should be on by default after running schema)

### 5. Set Environment Variables

1. Copy `.env.local.example` to `.env.local`:
   ```bash
   cp frontend/.env.local.example frontend/.env.local
   ```

2. Edit `frontend/.env.local` and add your keys:
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
   ```

### 6. Install Dependencies

```bash
cd frontend
npm install
```

### 7. Test It!

1. Start dev server: `npm run dev`
2. Upload a video
3. Watch real-time progress updates! 🎉

## Database Schema

The `jobs` table stores:
- `id` - UUID (primary key)
- `status` - uploading | processing | completed | error
- `progress` - 0-100
- `filename` - Original filename
- `output_filename` - Processed WEBM filename
- `error` - Error message if failed
- `options` - Processing options (JSON)
- `created_at` - Timestamp
- `updated_at` - Auto-updated timestamp

## Real-time Updates

Jobs automatically update in real-time via Supabase subscriptions. No polling needed!

## Troubleshooting

### "Missing Supabase environment variables"
- Check `.env.local` exists
- Verify keys are correct
- Restart dev server after adding env vars

### "Table doesn't exist"
- Run `schema.sql` in SQL Editor
- Check Table Editor to verify

### "Real-time not working"
- Check Replication settings
- Verify `ALTER PUBLICATION supabase_realtime ADD TABLE jobs;` ran
- Check browser console for errors

### "Permission denied"
- Check Row Level Security policies
- Verify anon key is correct
- Check if service role key is needed for server-side

## Next Steps

- Add authentication (optional)
- Set up file storage in Supabase Storage
- Add job cleanup cron job
- Monitor usage in Supabase dashboard

