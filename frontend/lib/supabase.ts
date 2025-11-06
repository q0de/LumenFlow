import { createClient, SupabaseClient } from '@supabase/supabase-js'

// Lazy initialization - only check at runtime, not build time
function getSupabaseClient(): SupabaseClient {
  // In Next.js, NEXT_PUBLIC_ vars are embedded at build time for client-side
  // They should be available at runtime if set during build
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    // Log what we have for debugging
    const errorDetails = {
      hasUrl: !!supabaseUrl,
      hasKey: !!supabaseAnonKey,
      urlValue: supabaseUrl || 'MISSING',
      keyValue: supabaseAnonKey ? 'SET (hidden)' : 'MISSING',
      nodeEnv: process.env.NODE_ENV,
      isServer: typeof window === 'undefined',
      allEnvKeys: Object.keys(process.env).filter(k => k.includes('SUPABASE'))
    }
    
    console.error('❌ Supabase environment variables missing!', errorDetails)
    
    // NEVER use placeholders - fail loudly instead
    const errorMsg = typeof window === 'undefined' 
      ? 'Missing Supabase environment variables on server. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in Railway Variables and redeploy.'
      : 'Missing Supabase environment variables in client bundle. The app needs to be rebuilt with NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY set during build time.'
    
    // For client-side, we can't throw (would crash the app), but we can log and return a dummy client
    // The polling fallback will handle updates
    if (typeof window !== 'undefined') {
      console.warn('⚠️ Client-side Supabase unavailable. Real-time updates disabled. Polling will be used instead.')
      // Return a dummy client that will fail gracefully
      // The polling fallback in page.tsx will handle job updates
      return createClient('https://dummy.supabase.co', 'dummy-key')
    }
    
    // Server-side: throw error
    throw new Error(errorMsg)
  }

  console.log('✅ Supabase client initialized successfully', {
    url: supabaseUrl.substring(0, 30) + '...',
    hasKey: !!supabaseAnonKey,
    isServer: typeof window === 'undefined'
  })

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

