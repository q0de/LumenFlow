import { createClient, SupabaseClient } from '@supabase/supabase-js'

// Lazy initialization - only check at runtime, not build time
function getSupabaseClient(): SupabaseClient {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    // During build time, return a dummy client (won't be used)
    // At runtime, this will throw if vars are missing
    if (typeof window === 'undefined' && process.env.NODE_ENV === 'production') {
      throw new Error('Missing Supabase environment variables')
    }
    // For build time, create with empty strings (will fail at runtime if not set)
    return createClient(supabaseUrl || '', supabaseAnonKey || '')
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

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error('Missing Supabase environment variables')
  }

  return createClient(supabaseUrl, serviceRoleKey)
}

