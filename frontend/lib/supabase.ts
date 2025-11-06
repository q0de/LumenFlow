import { createClient, SupabaseClient } from '@supabase/supabase-js'

// Lazy initialization - only check at runtime, not build time
function getSupabaseClient(): SupabaseClient {
  // In Next.js, NEXT_PUBLIC_ vars are available at runtime on both client and server
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    // Log what we have for debugging
    console.error('Supabase env vars missing:', {
      hasUrl: !!supabaseUrl,
      hasKey: !!supabaseAnonKey,
      urlValue: supabaseUrl ? 'set' : 'missing',
      keyValue: supabaseAnonKey ? 'set' : 'missing',
      nodeEnv: process.env.NODE_ENV,
      isServer: typeof window === 'undefined'
    })
    
    // On server-side in production, throw error
    if (typeof window === 'undefined' && process.env.NODE_ENV === 'production') {
      throw new Error(
        'Missing Supabase environment variables. ' +
        'Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in Railway Variables and redeploy.'
      )
    }
    
    // For client-side or build time, create with placeholder (will fail gracefully)
    // This allows the app to build even if vars aren't set yet
    return createClient(
      supabaseUrl || 'https://placeholder.supabase.co',
      supabaseAnonKey || 'placeholder-key'
    )
  }

  return createClient(supabaseUrl, supabaseAnonKey)
}

// Client-side Supabase client (lazy initialization)
let supabaseInstance: SupabaseClient | null = null
export const supabase = new Proxy({} as SupabaseClient, {
  get(_target, prop) {
    if (!supabaseInstance) {
      supabaseInstance = getSupabaseClient()
    }
    const value = (supabaseInstance as any)[prop]
    return typeof value === 'function' ? value.bind(supabaseInstance) : value
  }
}) as SupabaseClient

// Server-side Supabase client (for API routes)
export function createServerClient(): SupabaseClient {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  // Log environment variable status for debugging
  console.log('Server Supabase client init:', {
    hasUrl: !!supabaseUrl,
    hasServiceRoleKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
    hasAnonKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    willUseServiceRole: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
    nodeEnv: process.env.NODE_ENV
  })

  if (!supabaseUrl) {
    const errorMsg = 'Missing NEXT_PUBLIC_SUPABASE_URL environment variable. ' +
      'Please set it in Railway Variables → Variables tab and redeploy.'
    console.error(errorMsg)
    throw new Error(errorMsg)
  }

  if (!serviceRoleKey) {
    const errorMsg = 'Missing Supabase keys. ' +
      'Please set SUPABASE_SERVICE_ROLE_KEY or NEXT_PUBLIC_SUPABASE_ANON_KEY in Railway Variables → Variables tab and redeploy.'
    console.error(errorMsg, {
      hasServiceRoleKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
      hasAnonKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    })
    throw new Error(errorMsg)
  }

  return createClient(supabaseUrl, serviceRoleKey)
}

