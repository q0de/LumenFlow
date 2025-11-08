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

export async function createCheckoutSession() {
  const toastId = toast.loading('Preparing checkout...', { description: 'Setting up your payment' })
  
  try {
    // Get current session token
    const { data: { session } } = await supabase.auth.getSession()
    
    if (!session?.access_token) {
      toast.error('Please sign in', { 
        id: toastId,
        description: 'You must be signed in to upgrade'
      })
      throw new Error('Not authenticated')
    }
    
    const response = await fetch('/api/stripe/checkout', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.access_token}`,
      },
    })

    if (!response.ok) {
      const error = await response.json()
      toast.error('Checkout failed', { 
        id: toastId,
        description: error.error || 'Failed to create checkout session'
      })
      throw new Error(error.error || 'Failed to create checkout session')
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
    // Get current session token
    const { data: { session } } = await supabase.auth.getSession()
    
    if (!session?.access_token) {
      throw new Error('Not authenticated')
    }
    
    const response = await fetch('/api/stripe/billing-portal', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.access_token}`,
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
    throw error
  }
}

