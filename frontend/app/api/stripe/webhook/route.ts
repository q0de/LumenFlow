import { NextRequest, NextResponse } from "next/server"
import Stripe from "stripe"
import { createServerClient } from "@/lib/supabase"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_placeholder_for_build', {
  apiVersion: "2025-10-29.clover",
})

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET

export async function POST(request: NextRequest) {
  // Log webhook receipt for debugging
  process.stderr.write(`🔔 Stripe webhook received at ${new Date().toISOString()}\n`)
  
  // Check if webhook secret is configured
  if (!webhookSecret) {
    process.stderr.write(`❌ STRIPE_WEBHOOK_SECRET is not configured!\n`)
    return NextResponse.json(
      { error: "Webhook secret not configured" },
      { status: 500 }
    )
  }

  const body = await request.text()
  const signature = request.headers.get("stripe-signature")

  if (!signature) {
    process.stderr.write(`❌ No stripe-signature header found\n`)
    return NextResponse.json({ error: "No signature" }, { status: 400 })
  }

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
    process.stderr.write(`✅ Webhook signature verified: ${event.type}\n`)
  } catch (err: any) {
    process.stderr.write(`❌ Webhook signature verification failed: ${err.message}\n`)
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 })
  }

  const supabase = createServerClient()

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session
        const userId = session.metadata?.supabase_user_id

        if (!userId) {
          process.stderr.write(`❌ No user ID in checkout session metadata\n`)
          throw new Error("No user ID in session metadata")
        }

        process.stderr.write(`💳 Processing checkout.session.completed for user ${userId}\n`)

        // Update user to pro tier
        const { error } = await supabase
          .from('profiles')
          .update({ subscription_tier: 'pro' })
          .eq('id', userId)

        if (error) {
          process.stderr.write(`❌ Failed to upgrade user ${userId}: ${error.message}\n`)
          throw error
        }

        process.stderr.write(`✅ User ${userId} upgraded to pro tier\n`)
        break
      }

      case "customer.subscription.created":
      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription
        const customerId = subscription.customer as string

        // Get user ID from customer
        const { data: profile } = await supabase
          .from('profiles')
          .select('id')
          .eq('stripe_customer_id', customerId)
          .single()

        if (!profile) {
          throw new Error(`No profile found for customer ${customerId}`)
        }

        // Upsert subscription
        await supabase
          .from('subscriptions')
          .upsert({
            user_id: profile.id,
            stripe_subscription_id: subscription.id,
            stripe_price_id: subscription.items.data[0].price.id,
            status: subscription.status,
            current_period_start: new Date((subscription as any).current_period_start * 1000).toISOString(),
            current_period_end: new Date((subscription as any).current_period_end * 1000).toISOString(),
            cancel_at_period_end: (subscription as any).cancel_at_period_end,
          }, {
            onConflict: 'stripe_subscription_id'
          })

        // Update profile tier based on status
        const tier = subscription.status === 'active' ? 'pro' : 'free'
        await supabase
          .from('profiles')
          .update({ subscription_tier: tier })
          .eq('id', profile.id)

        console.log(`✅ Subscription ${subscription.id} updated for user ${profile.id}`)
        break
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription
        const customerId = subscription.customer as string

        // Get user ID from customer
        const { data: profile } = await supabase
          .from('profiles')
          .select('id')
          .eq('stripe_customer_id', customerId)
          .single()

        if (!profile) {
          throw new Error(`No profile found for customer ${customerId}`)
        }

        // Downgrade to free tier
        await supabase
          .from('profiles')
          .update({ subscription_tier: 'free' })
          .eq('id', profile.id)

        // Update subscription status
        await supabase
          .from('subscriptions')
          .update({ status: 'canceled' })
          .eq('stripe_subscription_id', subscription.id)

        console.log(`✅ User ${profile.id} downgraded to free tier`)
        break
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice
        const customerId = invoice.customer as string

        // Get user ID from customer
        const { data: profile } = await supabase
          .from('profiles')
          .select('id')
          .eq('stripe_customer_id', customerId)
          .single()

        if (profile) {
          // Update subscription status to past_due
          await supabase
            .from('subscriptions')
            .update({ status: 'past_due' })
            .eq('user_id', profile.id)

          console.log(`⚠️ Payment failed for user ${profile.id}`)
        }
        break
      }

      default:
        process.stderr.write(`ℹ️ Unhandled event type: ${event.type}\n`)
    }

    process.stderr.write(`✅ Webhook processed successfully: ${event.type}\n`)
    return NextResponse.json({ received: true }, { status: 200 })
  } catch (error: any) {
    process.stderr.write(`❌ Webhook handler error: ${error.message}\n`)
    process.stderr.write(`Stack trace: ${error.stack}\n`)
    // Still return 200 to prevent Stripe from retrying on our app errors
    // Log the error but acknowledge receipt
    return NextResponse.json(
      { received: true, error: error.message },
      { status: 200 }
    )
  }
}

