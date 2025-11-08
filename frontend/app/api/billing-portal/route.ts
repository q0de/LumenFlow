import { NextRequest, NextResponse } from "next/server"
import Stripe from "stripe"
import { createClient } from "@supabase/supabase-js"

// Force dynamic rendering and Node.js runtime
export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

console.log('🔵 /api/billing-portal route module loaded at:', new Date().toISOString())

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_placeholder_for_build', {
  apiVersion: "2025-10-29.clover",
})

export async function GET() {
  console.log('🟢 GET /api/billing-portal called')
  return NextResponse.json({ 
    message: "Billing Portal route is alive (new path)",
    timestamp: new Date().toISOString(),
    env: {
      hasSupabaseUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      hasSupabaseKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      hasStripeKey: !!process.env.STRIPE_SECRET_KEY,
    }
  }, {
    headers: {
      'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0',
    }
  })
}

export async function POST(request: NextRequest) {
  console.log('🟢 POST /api/billing-portal called at:', new Date().toISOString())
  
  try {
    // Get auth token from Authorization header
    const authHeader = request.headers.get('authorization')
    console.log('🔑 Auth header present:', !!authHeader)
    const token = authHeader?.replace('Bearer ', '')
    
    if (!token) {
      console.error('❌ No auth token provided')
      return NextResponse.json({ error: "Unauthorized - No token" }, { status: 401 })
    }
    
    console.log('🔧 Creating Supabase client...')
    // Create Supabase client
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
    
    console.log('👤 Getting user from token...')
    // Get authenticated user using the token
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)
    
    if (authError || !user) {
      console.error('❌ Auth error:', authError?.message)
      return NextResponse.json({ error: "Unauthorized - Invalid token" }, { status: 401 })
    }
    
    console.log('✅ Authenticated user:', user.email, 'ID:', user.id)

    console.log('📊 Fetching profile from Supabase...')
    // Get Stripe customer ID
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('stripe_customer_id')
      .eq('id', user.id)
      .single()

    console.log('📊 Profile result:', { 
      hasProfile: !!profile, 
      hasCustomerId: !!profile?.stripe_customer_id,
      customerId: profile?.stripe_customer_id,
      error: profileError?.message 
    })

    if (!profile?.stripe_customer_id) {
      console.error('❌ No stripe_customer_id found for user:', user.id)
      return NextResponse.json({ error: "No subscription found" }, { status: 404 })
    }

    console.log('💳 Creating Stripe portal session for customer:', profile.stripe_customer_id)
    // Create portal session
    const session = await stripe.billingPortal.sessions.create({
      customer: profile.stripe_customer_id,
      return_url: `${process.env.NEXT_PUBLIC_APP_URL || request.headers.get('origin')}/pricing`,
    })

    console.log('✅ Portal session created:', session.id)
    return NextResponse.json({ url: session.url }, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
      }
    })
  } catch (error: any) {
    console.error("❌ Stripe portal error:", error.message, error.stack)
    return NextResponse.json(
      { error: error.message || "Failed to create portal session" },
      { 
        status: 500,
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0',
        }
      }
    )
  }
}
