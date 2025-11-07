import { NextRequest, NextResponse } from "next/server"
import Stripe from "stripe"
import { createServerClient } from "@/lib/supabase"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-10-29.clover",
})

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!

export async function POST(request: NextRequest) {
  const body = await request.text()
  const signature = request.headers.get("stripe-signature")!

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
  } catch (err: any) {
    console.error(`Webhook signature verification failed: ${err.message}`)
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 })
  }

  const supabase = createServerClient()

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session
        const userId = session.metadata?.supabase_user_id

        if (!userId) {
          throw new Error("No user ID in session metadata")
        }

        // Update user to pro tier
        await supabase
          .from('profiles')
          .update({ subscription_tier: 'pro' })
          .eq('id', userId)

        console.log(`✅ User ${userId} upgraded to pro tier`)
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
        console.log(`Unhandled event type: ${event.type}`)
    }

    return NextResponse.json({ received: true })
  } catch (error: any) {
    console.error(`Webhook handler error: ${error.message}`)
    return NextResponse.json(
      { error: "Webhook handler failed" },
      { status: 500 }
    )
  }
}

