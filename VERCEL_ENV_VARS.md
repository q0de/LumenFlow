# Vercel Environment Variables Setup

## Fix Your Current Entry

You have the URL in the **Key** field and the key in the **Value** field - they're backwards!

**Delete the current entry** and add these correctly:

## Required Environment Variables

### 1. Supabase Project URL
- **Key:** `NEXT_PUBLIC_SUPABASE_URL`
- **Value:** `https://timpxdtskgujtzpbgcvq.supabase.co`
- **Environment:** Production, Preview, Development (all)

### 2. Supabase Anon Key
- **Key:** `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- **Value:** `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRpbXB4ZHRza2d1anR6cGJnY3ZxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI0NTU3ODMsImV4cCI6MjA3ODAzMTc4M30.RIrmzERb_newm2rfXI4R9v8VF2f4OTR26VgpnrwO5mI`
- **Environment:** Production, Preview, Development (all)

### 3. Supabase Service Role Key (Optional but Recommended)
- **Key:** `SUPABASE_SERVICE_ROLE_KEY`
- **Value:** `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRpbXB4ZHRza2d1anR6cGJnY3ZxIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MjQ1NTc4MywiZXhwIjoyMDc4MDMxNzgzfQ.c5FAkz0Uty3hgV7OLum10lC81qSG5xwhcduOJsnNBGQ`
- **Environment:** Production, Preview, Development (all)

## Steps to Fix

1. **Delete the incorrect entry** (the one with URL in Key field)
2. Click **"+ Add More"** three times
3. Add each variable above with:
   - **Key** = Variable name (e.g., `NEXT_PUBLIC_SUPABASE_URL`)
   - **Value** = The actual value (e.g., `https://timpxdtskgujtzpbgcvq.supabase.co`)
   - Select all environments (Production, Preview, Development)

## Quick Copy-Paste Format

```
NEXT_PUBLIC_SUPABASE_URL=https://timpxdtskgujtzpbgcvq.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRpbXB4ZHRza2d1anR6cGJnY3ZxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI0NTU3ODMsImV4cCI6MjA3ODAzMTc4M30.RIrmzERb_newm2rfXI4R9v8VF2f4OTR26VgpnrwO5mI
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRpbXB4ZHRza2d1anR6cGJnY3ZxIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MjQ1NTc4MywiZXhwIjoyMDc4MDMxNzgzfQ.c5FAkz0Uty3hgV7OLum10lC81qSG5xwhcduOJsnNBGQ
```

You can paste this into the "Import .env" section or add them one by one.

## After Adding

1. Click **"Deploy"** button
2. Vercel will rebuild with the new environment variables
3. Your app should connect to Supabase successfully!

