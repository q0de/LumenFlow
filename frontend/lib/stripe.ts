import { loadStripe, Stripe } from "@stripe/stripe-js"
import { toast } from "sonner"
import { supabase } from "./supabase"

let stripePromise: Promise<Stripe | null>

export const getStripe = () => {
  if (!stripePromise) {
    const key = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
    if (!key) {
      console.warn('Stripe publishable key not found')
      return Promise.resolve(null)
    }
    stripePromise = loadStripe(key)
  }
  return stripePromise
}

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

async function getAccessTokenWithRetry(maxAttempts = 5, delayMs = 300) {
  let lastError: Error | undefined

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    const { data: { session }, error } = await supabase.auth.getSession()

    if (error) {
      console.warn('⚠️ Supabase getSession error:', error)
      lastError = error
      break
    }

    if (session?.access_token) {
      if (attempt > 1) {
        console.log('✅ Supabase session restored on retry', { attempt })
      }
      return session.access_token
    }

    console.log('⌛ Waiting for Supabase session restore...', { attempt })
    await sleep(delayMs)
  }

  throw lastError || new Error('Not authenticated')
}

export async function createCheckoutSession() {
  const toastId = toast.loading('Preparing checkout...', { description: 'Setting up your payment' })
  
  try {
    let accessToken: string
    try {
      accessToken = await getAccessTokenWithRetry()
    } catch (error) {
      toast.error('Please sign in', { 
        id: toastId,
        description: 'You must be signed in to upgrade'
      })
      throw error
    }

    const response = await fetch('/api/stripe/checkout', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
      },
    })

    if (!response.ok) {
      const error = await response.json()
      toast.error('Checkout failed', { 
        id: toastId,
        description: error.error || 'Failed to create checkout session'
      })
      const message = error.error || 'Failed to create checkout session'
      toast.error('Checkout failed', { 
        id: toastId,
        description: message
      })
      throw new Error(message)
    }

    const { url } = await response.json()
    
    toast.success('Redirecting to checkout...', { id: toastId })
    
    // Redirect to Stripe Checkout
    window.location.href = url
  } catch (error: any) {
    console.error('Checkout error:', error)
    toast.dismiss(toastId)
    throw error
  }
}

export async function openCustomerPortal() {
  try {
    const accessToken = await getAccessTokenWithRetry()

    // Add cache-busting timestamp to bypass Cloudflare cache
    const timestamp = Date.now()
    const response = await fetch(`/api/billing-portal?t=${timestamp}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
      },
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to open customer portal')
    }

    const { url } = await response.json()
    window.location.href = url
  } catch (error: any) {
    console.error('Portal error:', error)
    toast.error('Unable to open customer portal', {
      description: error?.message || 'Please try again in a moment',
    })
    throw error
  }
}

