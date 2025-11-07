# LumenFlow Monetization Setup Guide

This guide explains how to set up the complete monetization system with two separate deployments (manager version vs public version).

## Architecture Overview

- **Manager Deployment:** Simple video processing tool without payments (for your manager)
- **Public Deployment:** Full monetization with Stripe, auth, usage limits

Both deployments:
- Use the same Supabase database
- Share the same codebase (controlled by environment variables)
- Are deployed from the same GitHub repository

---

## Prerequisites

1. **Supabase Account** (Free tier is fine)
   - Database for users, subscriptions, jobs
   - Authentication enabled

2. **Stripe Account** (Test mode for development)
   - For payment processing
   - Webhooks for subscription management

3. **Render Account** (or similar hosting)
   - Will need 2 web services ($7/month each for paid tier)

---

## Step 1: Database Setup

Run the SQL schema in your Supabase SQL Editor:

```bash
# Located at: supabase/schema.sql
```

This creates:
- `profiles` table (user accounts)
- `subscriptions` table (Stripe subscriptions)
- `usage_limits` table (daily/monthly limits)
- `jobs` table (updated with user tracking)
- Helper functions for usage tracking

---

## Step 2: Stripe Setup

### Create Products

1. Go to Stripe Dashboard → Products
2. Create product "LumenFlow Pro"
   - Price: $12/month (recurring)
   - Copy the **Price ID** (starts with `price_`)

### Set up Webhook

1. Go to Developers → Webhooks → Add endpoint
2. **For local testing:**
   ```bash
   stripe listen --forward-to localhost:3000/api/stripe/webhook
   ```
   Copy the webhook signing secret

3. **For production:**
   - Endpoint URL: `https://your-domain.com/api/stripe/webhook`
   - Events to listen to:
     - `checkout.session.completed`
     - `customer.subscription.created`
     - `customer.subscription.updated`
     - `customer.subscription.deleted`
     - `invoice.payment_failed`
   - Copy the webhook signing secret

---

## Step 3: Environment Variables

### Manager Deployment (No Payments)

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Build
NEXT_PUBLIC_BUILD_ID=manager-v1

# Storage
STORAGE_PATH=/data  # Render persistent disk

# Payments: DISABLED
# NEXT_PUBLIC_ENABLE_PAYMENTS=false (or omit entirely)
```

### Public Deployment (With Payments)

```env
# Supabase (same as manager)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Stripe
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_xxxxx
STRIPE_SECRET_KEY=sk_live_xxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxx
STRIPE_PRICE_ID=price_xxxxx

# App URL
NEXT_PUBLIC_APP_URL=https://lumenflow.app

# Build
NEXT_PUBLIC_BUILD_ID=public-v1

# Storage
STORAGE_PATH=/data

# Payments: ENABLED
NEXT_PUBLIC_ENABLE_PAYMENTS=true
```

---

## Step 4: Render Deployment

### Manager Version (Simple Tool)

1. **Create New Web Service**
   - Name: `lumenflow-manager`
   - Repository: Your GitHub repo
   - Branch: `main`
   - Root Directory: `frontend`
   - Build Command: `npm install && npm run build`
   - Start Command: `npm start`

2. **Environment Variables:** Copy from "Manager Deployment" section above

3. **Persistent Disk:**
   - Mount path: `/data`
   - Size: 1GB (minimum)

4. **Deployment URL:** `https://lumenflow-manager.onrender.com`
   - Share this URL with your manager only

### Public Version (With Monetization)

1. **Create New Web Service**
   - Name: `lumenflow-public`
   - Repository: Your GitHub repo
   - Branch: `main`
   - Root Directory: `frontend`
   - Build Command: `npm install && npm run build`
   - Start Command: `npm start`

2. **Environment Variables:** Copy from "Public Deployment" section above

3. **Persistent Disk:**
   - Mount path: `/data`
   - Size: 10GB+ (depends on usage)

4. **Custom Domain** (optional):
   - Add custom domain: `lumenflow.app`
   - Update DNS records as instructed by Render

---

## Step 5: Testing

### Test Manager Version
1. Visit your manager URL
2. Should see: Simple upload tool, no pricing, no auth
3. Upload and process a video
4. Verify it works

### Test Public Version
1. Visit public URL
2. Should see: Header nav with "Sign In" and "Pricing"
3. Try uploading without logging in → Should prompt for login
4. Sign up for free account
5. Upload 5 videos → Should hit limit and prompt to upgrade
6. Test upgrade flow (use Stripe test cards)
7. Verify watermark appears on free tier, not on pro

---

## Pricing Tiers

### Free Tier
- 5 videos per day
- LumenFlow watermark
- VP8 codec (Unity optimized)
- 1354px output width

### Pro Tier ($12/month)
- 50 videos per month
- No watermark
- VP8 & VP9 codec options
- Custom resolutions (512px - 4K)
- All processing options

---

## Monitoring

### Check User Signups
```sql
SELECT COUNT(*) FROM profiles;
SELECT subscription_tier, COUNT(*) FROM profiles GROUP BY subscription_tier;
```

### Check Revenue
Go to Stripe Dashboard → Revenue

### Check Usage
```sql
SELECT 
  u.period_start,
  COUNT(DISTINCT u.user_id) as active_users,
  SUM(u.videos_processed) as total_videos
FROM usage_limits u
GROUP BY u.period_start
ORDER BY u.period_start DESC;
```

---

## Troubleshooting

### Payments not showing
- Check `NEXT_PUBLIC_ENABLE_PAYMENTS=true` is set
- Verify Stripe keys are correct
- Check browser console for errors

### Webhooks not working
- Verify webhook URL is correct
- Check webhook signing secret
- Look at Stripe Dashboard → Developers → Webhooks → Events log

### Usage tracking not working
- Run database schema again
- Check Supabase logs for errors
- Verify RLS policies are correct

---

## Cost Breakdown

**Monthly Costs:**
- Render (2 services): $14/month ($7 each for 512MB RAM)
- Supabase: Free tier (up to 500MB database)
- Stripe: 2.9% + 30¢ per transaction

**Break-even at 10 paying users:**
- Revenue: $120/month
- Costs: ~$14/month
- Profit: $106/month

---

## Security Checklist

- [ ] Supabase RLS policies enabled
- [ ] Stripe webhook signature verification active
- [ ] Environment variables not committed to git
- [ ] HTTPS enabled (automatic on Render)
- [ ] Rate limiting on API routes (future enhancement)

---

## Support

For issues or questions:
1. Check Render logs: Dashboard → Your Service → Logs
2. Check Supabase logs: Supabase Dashboard → Logs
3. Check Stripe webhooks: Stripe Dashboard → Developers → Webhooks

