# Stripe Setup Guide

This guide walks you through configuring Stripe for Green Screen Remover in both **test** and **live** environments.

---

## 1. Create a Stripe Account

1. Sign up at [https://dashboard.stripe.com/register](https://dashboard.stripe.com/register).
2. Complete onboarding (business details, bank account, etc.). You can add banking info later if you’re still testing.
3. Verify your email address to unlock API keys.

---

## 2. Find Your API Keys

### Test Mode Keys

1. Log into the Stripe dashboard.
2. Make sure **Viewing test data** (the toggle in the left sidebar) is enabled.
3. Navigate to **Developers → API keys**.
4. Copy the following keys:
   - `pk_test_...` — Test Publishable key
   - `sk_test_...` — Test Secret key

### Live Mode Keys

1. Toggle **Viewing test data** off to switch to live mode.
2. Go again to **Developers → API keys**.
3. Copy these keys:
   - `pk_live_...` — Live Publishable key
   - `sk_live_...` — Live Secret key

> **Note:** Secret keys are sensitive—never commit them to git or send them over chat. Add them directly as environment variables in your hosting provider.

---

## 3. Create Products and Prices

We use a single subscription product named **LumenFlow Pro**.

### Test Mode

1. Enable **Viewing test data**.
2. Go to **Products → Add product**.
3. Fill in:
   - **Name:** `LumenFlow Pro`
   - **Description:** `50 videos per month, no watermark, custom resolutions, priority processing`
4. Under **Pricing**, choose **Recurring**, set the price to **$12** and billing period to **Monthly**.
5. Save the product and note the **Price ID** (e.g. `price_123TestId`). This will be your test `STRIPE_PRICE_ID`.

### Live Mode

1. Turn off **Viewing test data** (live mode).
2. Option A: Use the product’s “Copy to live mode” action in the test product’s overflow menu.
   - Stripe will create the same product & price in live mode with new IDs.
2. Option B: Manually recreate the product with the same details as above.
3. Record the new **Price ID** (e.g. `price_1SRNOPA1Q0bjxXUQOk1UNB9e`).

> The live product/price IDs are different from test IDs. Make sure you set the correct one in each environment.

---

## 4. Configure the Customer Portal

Stripe requires you to save a portal configuration separately in test/live mode.

### Test Mode Portal
1. Enable **Viewing test data**.
2. Go to **Settings (gear icon) → Billing → Customer portal**.
3. Configure the options you want (invoices, payment methods, cancellations).
4. Set **Redirect link** to `http://localhost:3000/pricing`.
5. Click **Save changes**.

### Live Mode Portal
1. Switch to live mode (toggle off viewing test data).
2. Repeat the same configuration.
3. Set **Redirect link** to `https://www.greenscreenremover.com/pricing`.
4. Click **Save changes**.

If you skip this, `/api/billing-portal` will return `No configuration provided`.

---

## 5. Configure Webhooks

We rely on Stripe webhooks to update Supabase with subscription status.

### Test Mode Webhook

1. Enable **Viewing test data**.
2. Go to **Developers → Webhooks → Add endpoint**.
3. Endpoint URL: `http://localhost:3000/api/stripe/webhook` when testing locally with `stripe listen`, or your staging URL if deployed.
4. Select the following events:
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_failed`
5. Save and copy the **Signing secret** (`whsec_...`). This becomes `STRIPE_WEBHOOK_SECRET`.

> If you use `stripe listen --forward-to`, Stripe will give you a temporary signing secret. Update `STRIPE_WEBHOOK_SECRET` each time you restart the listener.

### Live Mode Webhook

1. Switch to live mode.
2. Add a new endpoint: `https://www.greenscreenremover.com/api/stripe/webhook`.
3. Subscribe to the same events as above.
4. Copy the live **Signing secret** and set it in production.

---

## 6. Update Environment Variables

Set the following env vars in your hosting platform (Render, Railway, etc.) for **each** environment.

| Variable | Test Value | Live Value |
|----------|------------|------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL | (same across envs) |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon key | (same across envs) |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service key | (same across envs) |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | `pk_test_...` | `pk_live_...` |
| `STRIPE_SECRET_KEY` | `sk_test_...` | `sk_live_...` |
| `STRIPE_PRICE_ID` | Test price ID | Live price ID (e.g. `price_1SRNOPA1Q0bjxXUQOk1UNB9e`) |
| `STRIPE_WEBHOOK_SECRET` | Test webhook secret | Live webhook secret |
| `NEXT_PUBLIC_APP_URL` | `http://localhost:3000` or staging URL | `https://www.greenscreenremover.com` |
| `NEXT_PUBLIC_ENABLE_PAYMENTS` | `true` | `true` |

> Remember to redeploy after changing environment variables. For local development, add them to `.env.local` (never commit secrets to git).

---

## 7. Test the Integration

### Test Mode

1. Start the Next.js dev server: `npm run dev`.
2. Use Stripe CLI to forward webhooks:  
   `stripe listen --forward-to localhost:3000/api/stripe/webhook`
3. Visit `http://localhost:3000/pricing`, sign in, and click **Upgrade to Pro**.
4. Use Stripe’s test card `4242 4242 4242 4242` with any CVC & future expiry.
5. Confirm:
   - The app redirects to Stripe Checkout and returns to `/success`.
   - Supabase profile `subscription_tier` is set to `pro`.
   - `/api/billing-portal` returns a portal URL.

### Live Mode

1. Deploy the app with live env vars.
2. Visit `https://www.greenscreenremover.com/pricing`.
3. Use a real card (you can refund yourself afterward).
4. Confirm the same behaviour as test mode (profile updates, portal opens, etc.).

---

## 8. Troubleshooting

- **`No token` / 401 errors:** Ensure the client waits for `supabase.auth.getSession()` and the user is signed in. The retry logic in `lib/stripe.ts` handles this.
- **`No configuration provided` from Stripe:** Save the Customer portal settings in the corresponding mode.
- **Portal returns 404 locally:** The API route wasn’t compiled (restart `next dev`) or the request didn’t include `Authorization` header.
- **Webhook 401s:** Check that you’re using the latest `STRIPE_WEBHOOK_SECRET` and the endpoint URL matches the deployed site.
- **Customer missing `stripe_customer_id`:** Verify checkout completed and the webhook fired. Refresh the profile via the app or Supabase dashboard.

---

By following this guide you’ll have Stripe running end-to-end for both testing and live billing on Green Screen Remover.

