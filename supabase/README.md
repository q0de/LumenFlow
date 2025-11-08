# Local Supabase Development Setup

This directory contains the Supabase local development configuration and database migrations.

## 🚀 Quick Start

### Prerequisites

1. **Docker Desktop** (required for local Supabase)
   - Download: https://www.docker.com/products/docker-desktop
   - Install and start Docker Desktop

2. **Supabase CLI**
   
   **Windows (via Scoop - RECOMMENDED):**
   ```powershell
   # Close and reopen PowerShell as Administrator after Scoop installation
   scoop bucket add supabase https://github.com/supabase/scoop-bucket.git
   scoop install supabase
   ```
   
   **Alternative (Manual Download):**
   - Download from: https://github.com/supabase/cli/releases
   - Extract and add to PATH

---

## 📦 Initial Setup

```bash
# Navigate to project root
cd C:\Users\micha\Projects\webm-alpha-GhostStage

# Start local Supabase (first time will download Docker images)
supabase start

# This will give you local URLs:
# - API URL: http://localhost:54321
# - Studio URL: http://localhost:54323
# - DB URL: postgresql://postgres:postgres@localhost:54322/postgres
```

**Save the output!** It contains your local `anon key` and `service_role key`.

---

## 🔧 Update Local Environment Variables

After starting Supabase, update `frontend/.env.local`:

```env
# Local Supabase
NEXT_PUBLIC_SUPABASE_URL=http://localhost:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon_key_from_supabase_start>

# OAuth (use production keys or create test apps)
SUPABASE_AUTH_DISCORD_CLIENT_ID=your_discord_client_id
SUPABASE_AUTH_DISCORD_SECRET=your_discord_secret
SUPABASE_AUTH_GITHUB_CLIENT_ID=your_github_client_id
SUPABASE_AUTH_GITHUB_SECRET=your_github_secret
SUPABASE_AUTH_GOOGLE_CLIENT_ID=your_google_client_id
SUPABASE_AUTH_GOOGLE_SECRET=your_google_secret

# Stripe (same as production or use test keys)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_stripe_key
STRIPE_SECRET_KEY=your_stripe_secret
STRIPE_PRICE_ID=your_price_id
NEXT_PUBLIC_ENABLE_PAYMENTS=true
```

---

## 🗄️ Database Migrations

### View Applied Migrations
```bash
supabase migration list
```

### Create New Migration
```bash
# Creates a new migration file with timestamp
supabase migration new add_feature_name
```

### Apply Migrations Locally
```bash
# Apply all pending migrations
supabase db reset
```

### Push Migrations to Production
```bash
# Link to production (one-time)
supabase link --project-ref timpxdtskgujtzpbgcvq

# Push migrations
supabase db push
```

---

## 📁 Directory Structure

```
supabase/
├── config.toml                          # Local Supabase configuration
├── migrations/                          # Database migrations (version controlled)
│   └── 20251108000000_initial_schema.sql  # Initial schema
├── seed.sql                             # (Optional) Seed data for development
└── README.md                            # This file
```

---

## 🔄 Common Workflows

### Starting Development

```bash
# Terminal 1: Start Supabase
supabase start

# Terminal 2: Start Next.js
cd frontend
npm run dev
```

### Making Database Changes

```bash
# 1. Create migration
supabase migration new add_new_feature

# 2. Edit the migration file in supabase/migrations/

# 3. Apply locally
supabase db reset

# 4. Test in your app

# 5. Commit migration
git add supabase/migrations/
git commit -m "feat: add new database feature"

# 6. Push to production when ready
supabase db push
```

### Viewing Local Database

```bash
# Open Supabase Studio (web UI)
# Navigate to: http://localhost:54323

# Or connect with any SQL client:
# Host: localhost
# Port: 54322
# Database: postgres
# User: postgres
# Password: postgres
```

---

## 🐛 Troubleshooting

### "Docker is not running"
- Start Docker Desktop and wait for it to fully start
- Check Docker is running: `docker ps`

### "Port already in use"
- Stop existing Supabase: `supabase stop`
- Or change ports in `config.toml`

### "Migration failed"
- Check syntax in migration file
- View logs: `supabase logs`
- Reset and try again: `supabase db reset`

### OAuth Not Working Locally
1. Update redirect URIs in OAuth provider to include:
   - `http://localhost:54321/auth/v1/callback`
2. Update `config.toml` with correct client IDs
3. Restart Supabase: `supabase stop && supabase start`

---

## 🎯 Benefits of Local Development

✅ **Fast Iteration** - No need to push to production to test  
✅ **Version Control** - All database changes in git  
✅ **Team Collaboration** - Everyone has same schema  
✅ **Safe Testing** - Break things without affecting users  
✅ **Offline Development** - Work without internet  

---

## 📚 Useful Commands

```bash
# Start Supabase
supabase start

# Stop Supabase
supabase stop

# Reset database (reapply all migrations)
supabase db reset

# View logs
supabase logs

# Check status
supabase status

# Generate TypeScript types from database
supabase gen types typescript --local > frontend/types/database.ts
```

---

## 🔗 Resources

- [Supabase CLI Docs](https://supabase.com/docs/guides/cli)
- [Local Development Guide](https://supabase.com/docs/guides/cli/local-development)
- [Database Migrations](https://supabase.com/docs/guides/cli/managing-config)

---

## 🚀 Next Steps

1. ✅ Install Docker Desktop
2. ✅ Install Supabase CLI (close/reopen terminal after Scoop)
3. ✅ Run `supabase start`
4. ✅ Update `.env.local` with local Supabase URL and keys
5. ✅ Start your Next.js app: `npm run dev`
6. ✅ Make database changes via migrations
7. ✅ Test locally, then push to production when ready!

**The AI assistant can now help you create and manage migrations!** 🎉
