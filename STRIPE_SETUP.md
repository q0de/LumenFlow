# Stripe + Supabase Integration Setup

This guide will help you integrate Stripe subscriptions with your Supabase database.

## Prerequisites

- Stripe account (test mode for development)
- Supabase project with database tables set up
- Application deployed to Render (or local with ngrok for testing)

## Step 1: Get Stripe API Keys

1. Go to [Stripe Dashboard](https://dashboard.stripe.com/test/apikeys)
2. Copy your **Publishable key** (starts with `pk_test_`)
3. Copy your **Secret key** (starts with `sk_test_`)

## Step 2: Create a Stripe Product & Price

1. Go to [Stripe Products](https://dashboard.stripe.com/test/products)
2. Click **+ Add Product**
3. Fill in:
   - **Name**: Pro Plan
   - **Description**: 50 videos/month, no watermark, priority processing
   - **Pricing**: Recurring, $12/month
4. Click **Save product**
5. Copy the **Price ID** (starts with `price_`)

## Step 3: Set Up Stripe Webhook

### For Production (Render)

1. Go to [Stripe Webhooks](https://dashboard.stripe.com/test/webhooks)
2. Click **+ Add endpoint**
3. Set **Endpoint URL**: `https://www.greenscreenremover.com/api/stripe/webhook`
4. Click **Select events** and choose:
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_failed`
5. Click **Add endpoint**
6. Copy the **Signing secret** (starts with `whsec_`)

### For Local Development (with ngrok)

1. Install [ngrok](https://ngrok.com/download)
2. Run your dev server: `npm run dev`
3. In another terminal, run: `ngrok http 3000`
4. Copy the ngrok URL (e.g., `https://abc123.ngrok.io`)
5. In Stripe Dashboard, add webhook endpoint: `https://abc123.ngrok.io/api/stripe/webhook`
6. Select the same events as above
7. Copy the signing secret

## Step 4: Configure Environment Variables

### In Render Dashboard

1. Go to your Render service
2. Navigate to **Environment** tab
3. Add these variables:

```bash
# Stripe Keys
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PRICE_ID=price_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Enable payments
NEXT_PUBLIC_ENABLE_PAYMENTS=true
```

4. Click **Save Changes**
5. Render will automatically redeploy

### For Local Development

Add to `frontend/.env.local`:

```bash
# Stripe Keys
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PRICE_ID=price_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Enable payments
NEXT_PUBLIC_ENABLE_PAYMENTS=true

# Supabase (already set)
NEXT_PUBLIC_SUPABASE_URL=https://...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
```

## Step 5: Test the Integration

### Test Checkout Flow

1. Sign in to your app
2. Go to `/pricing`
3. Click **Upgrade to Pro**
4. Use Stripe test card: `4242 4242 4242 4242`
   - Expiry: Any future date
   - CVC: Any 3 digits
   - ZIP: Any 5 digits
5. Complete checkout
6. You should be redirected to `/success`
7. Check Supabase database:
   - `profiles` table: `subscription_tier` should be `'pro'`
   - `subscriptions` table: New row with subscription details

### Test Webhook Events

1. Go to [Stripe Webhooks](https://dashboard.stripe.com/test/webhooks)
2. Click on your webhook endpoint
3. Check **Recent deliveries** - should show successful events
4. If any failed, click to see error details

### Test Subscription Cancellation

1. Go to [Stripe Customers](https://dashboard.stripe.com/test/customers)
2. Find your test customer
3. Click on their subscription
4. Click **Cancel subscription**
5. Choose **Cancel immediately**
6. Check Supabase:
   - `profiles.subscription_tier` should be `'free'`
   - `subscriptions.status` should be `'canceled'`

## Step 6: Monitor Logs

### Render Logs

```bash
# View recent logs
render logs

# Follow logs in real-time
render logs --tail
```

Look for:
- `✅ User upgraded to pro tier`
- `✅ Subscription updated for user`
- `✅ User downgraded to free tier`

### Stripe Webhook Logs

In Stripe Dashboard → Webhooks → Your endpoint:
- Check **Recent deliveries**
- All events should show **200 OK**
- If errors, click event to see details

## Troubleshooting

### Webhook Returns 401 Unauthorized

**Issue**: Webhook can't authenticate with Supabase

**Fix**: Make sure `SUPABASE_SERVICE_ROLE_KEY` is set in Render environment variables (not just `NEXT_PUBLIC_SUPABASE_ANON_KEY`)

### Webhook Returns 500 Error

**Issue**: Database query failed

**Fix**: 
1. Check Render logs for specific error
2. Verify database tables exist (run migration)
3. Check that `stripe_customer_id` is being saved to profiles

### User Not Upgraded After Payment

**Issue**: Webhook not firing or failing silently

**Fix**:
1. Check Stripe webhook logs
2. Verify webhook URL is correct
3. Test webhook manually in Stripe Dashboard
4. Check Render logs for errors

### Local Webhooks Not Working

**Issue**: Stripe can't reach localhost

**Fix**:
1. Use ngrok: `ngrok http 3000`
2. Update webhook URL in Stripe to ngrok URL
3. Restart dev server after adding webhook secret

## Database Schema

The webhook updates these tables:

### `profiles`
- `subscription_tier`: `'free'` or `'pro'`
- `stripe_customer_id`: Stripe customer ID

### `subscriptions`
- `user_id`: Links to profiles
- `stripe_subscription_id`: Stripe subscription ID
- `status`: `'active'`, `'canceled'`, `'past_due'`, etc.
- `current_period_start`: Subscription period start
- `current_period_end`: Subscription period end
- `cancel_at_period_end`: Boolean

## Production Checklist

Before going live:

- [ ] Switch to Stripe **live mode** keys
- [ ] Create live webhook endpoint with production URL
- [ ] Update environment variables in Render
- [ ] Test full flow with real card (then refund)
- [ ] Set up Stripe email notifications
- [ ] Configure customer portal for self-service
- [ ] Add terms of service and privacy policy links
- [ ] Set up monitoring/alerts for failed webhooks

## Customer Portal

Users can manage their subscription at `/api/stripe/portal`:

```typescript
// Already implemented in lib/stripe.ts
export async function openCustomerPortal() {
  const response = await fetch('/api/stripe/portal', { method: 'POST' })
  const { url } = await response.json()
  window.location.href = url
}
```

This allows users to:
- Update payment method
- View invoices
- Cancel subscription
- Update billing information

## Support

- [Stripe Documentation](https://stripe.com/docs)
- [Stripe Webhooks Guide](https://stripe.com/docs/webhooks)
- [Supabase Auth](https://supabase.com/docs/guides/auth)

