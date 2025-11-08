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
      ? 'Missing Supabase environment variables on server. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in Render Environment Variables and redeploy.'
      : 'Missing Supabase environment variables in client bundle. The app needs to be rebuilt with NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY set during build time.'
    
    // For client-side, don't create a client at all - return null and let the proxy handle it
    if (typeof window !== 'undefined') {
      console.warn('⚠️ Client-side Supabase unavailable. Real-time updates disabled. Polling will be used instead.')
      // Return null - the proxy will handle this gracefully
      return null as any
    }
    
    // Server-side: throw error
    throw new Error(errorMsg)
  }

  console.log('✅ Supabase client initialized successfully', {
    url: supabaseUrl.substring(0, 30) + '...',
    hasKey: !!supabaseAnonKey,
    isServer: typeof window === 'undefined'
  })

  // Use default Supabase config (handles localStorage + cookies automatically)
  // This works for both client-side and server-side auth
  return createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true,
      flowType: 'pkce', // Use PKCE flow (more secure)
    },
  })
}

// Check if Supabase is properly configured (for client-side)
export function isSupabaseAvailable(): boolean {
  if (typeof window === 'undefined') return true // Server-side always uses createServerClient
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  return !!(url && key && !url.includes('placeholder') && !url.includes('dummy'))
}

// Create a deep no-op proxy that handles nested property access
function createNoOpProxy(): any {
  return new Proxy(() => {}, {
    get(_target, prop) {
      // Return promises that resolve to null for async methods
      if (prop === 'then' || prop === 'catch' || prop === 'finally') {
        return undefined
      }
      // Return another no-op proxy for nested access
      return createNoOpProxy()
    },
    apply() {
      // Return a promise that resolves to a failure response
      return Promise.resolve({ 
        data: null, 
        error: { message: 'Supabase not available', status: 503 } 
      })
    }
  })
}

// Client-side Supabase client (lazy initialization)
let supabaseInstance: SupabaseClient | null = null
export const supabase = new Proxy({} as SupabaseClient, {
  get(_target, prop) {
    // If Supabase isn't available, return a no-op proxy
    if (typeof window !== 'undefined' && !isSupabaseAvailable()) {
      console.warn(`⚠️ Supabase.${String(prop)} called but Supabase is not available`)
      return createNoOpProxy()
    }
    
    if (!supabaseInstance) {
      try {
        supabaseInstance = getSupabaseClient()
      } catch (error) {
        console.error('Failed to initialize Supabase client:', error)
        return createNoOpProxy()
      }
    }
    const value = (supabaseInstance as any)[prop]
    return typeof value === 'function' ? value.bind(supabaseInstance) : value
  }
}) as SupabaseClient

// Cached server-side Supabase client (singleton pattern)
let serverClientInstance: SupabaseClient | null = null

// Server-side Supabase client (for API routes)
export function createServerClient(): SupabaseClient {
  // Return cached instance if available
  if (serverClientInstance) {
    return serverClientInstance
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl) {
    const errorMsg = 'Missing NEXT_PUBLIC_SUPABASE_URL environment variable. ' +
      'Please set it in Render Environment Variables and redeploy.'
    console.error(errorMsg)
    throw new Error(errorMsg)
  }

  if (!serviceRoleKey) {
    const errorMsg = 'Missing Supabase keys. ' +
      'Please set SUPABASE_SERVICE_ROLE_KEY or NEXT_PUBLIC_SUPABASE_ANON_KEY in Render Environment Variables and redeploy.'
    console.error(errorMsg, {
      hasServiceRoleKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
      hasAnonKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    })
    throw new Error(errorMsg)
  }

  // Create and cache the client (only once per server instance)
  console.log('✅ Creating server Supabase client (singleton)')
  serverClientInstance = createClient(supabaseUrl, serviceRoleKey)
  return serverClientInstance
}

