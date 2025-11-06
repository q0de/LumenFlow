# Environment Variables Setup

## ✅ You've filled out `.env.local.example` - Great!

Now you need to **copy it to `.env.local`** for Next.js to actually use it.

## Quick Fix

The `.env.local.example` file is just a template. Next.js only reads `.env.local`.

### Option 1: Manual Copy (Recommended)

1. Go to `frontend/` folder
2. Copy `.env.local.example`
3. Rename it to `.env.local`
4. Make sure your Supabase keys are in it

### Option 2: Command Line

**Windows PowerShell:**
```powershell
cd frontend
Copy-Item .env.local.example .env.local
```

**Or manually:**
1. Open `frontend/.env.local.example`
2. Copy all contents
3. Create new file `frontend/.env.local`
4. Paste contents
5. Save

## Verify It's Set Up

Your `.env.local` should look like:

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## Important Notes

- ✅ `.env.local` is in `.gitignore` (won't be committed)
- ✅ Restart dev server after creating/updating `.env.local`
- ✅ No quotes needed around values
- ✅ No spaces around `=`

## Test It

1. Make sure `.env.local` exists in `frontend/` folder
2. Restart your dev server:
   ```bash
   cd frontend
   npm run dev
   ```
3. Check for errors - if you see "Missing Supabase environment variables", the file isn't being read

## Troubleshooting

**"Missing Supabase environment variables" error:**
- Check `.env.local` exists (not just `.env.local.example`)
- Check file is in `frontend/` folder (not root)
- Restart dev server
- Check for typos in variable names

**File not found:**
- Make sure you're in the `frontend/` directory
- Check file name is exactly `.env.local` (not `.env.local.txt`)

