"use client"

import { createContext, useContext, useEffect, useState } from "react"
import { User, Session } from "@supabase/supabase-js"
import { supabase } from "./supabase"
import { toast } from "sonner"

function withTimeout<T>(promiseLike: Promise<T> | PromiseLike<T>, timeoutMs = 4000): Promise<T> {
  let timeoutId: ReturnType<typeof setTimeout> | undefined

  const timeoutPromise = new Promise<T>((_, reject) => {
    timeoutId = setTimeout(() => {
      reject(new Error('Profile fetch timed out'))
    }, timeoutMs)
  })

  const promise = Promise.resolve(promiseLike)

  return Promise.race([promise, timeoutPromise]).finally(() => {
    if (timeoutId) {
      clearTimeout(timeoutId)
    }
  })
}

interface Profile {
  id: string
  email: string
  full_name: string | null
  subscription_tier: "free" | "pro"
  stripe_customer_id: string | null
}

interface AuthContextType {
  user: User | null
  profile: Profile | null
  session: Session | null
  loading: boolean
  signUp: (email: string, password: string, fullName?: string) => Promise<void>
  signIn: (email: string, password: string) => Promise<void>
  signOut: () => Promise<void>
  refreshProfile: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchProfile = async (userId: string, userEmail?: string) => {
    try {
      console.log('🔄 Fetching profile for user:', userId)
      const { data, error } = await withTimeout(
        supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()
      )

      if (error) {
        console.error('❌ Profile fetch error:', error)
        // If profile doesn't exist, create a default one
        if (error.code === 'PGRST116') {
          console.log('⚠️ Profile not found, user needs to be created in database')
        }
        throw error
      }
      
      console.log('✅ Profile loaded:', data?.subscription_tier)
      setProfile(data)
    } catch (error) {
      console.error('❌ Error fetching profile:', error)
      // Set a default profile if fetch fails
      setProfile({
        id: userId,
        email: userEmail || 'unknown@example.com',
        full_name: null,
        subscription_tier: 'free',
        stripe_customer_id: null
      })
    }
  }

  useEffect(() => {
    // Get initial session with retry logic
    const initSession = async () => {
      console.log('🔄 Initializing auth session...')
      
      try {
        const { data: { session }, error } = await supabase.auth.getSession()
        
        console.log('🔑 Initial session:', { 
          hasSession: !!session, 
          hasUser: !!session?.user,
          email: session?.user?.email,
          error: error?.message 
        })
        
        setSession(session)
        setUser(session?.user ?? null)

        if (session?.user) {
          console.log('✅ User found, fetching profile...')
          // Fetch profile but don't let loading depend on it (Supabase can hang)
          fetchProfile(session.user.id, session.user.email)
            .catch((error) => {
              console.error('❌ Failed to fetch profile during init (async):', error)
            })
        } else {
          console.log('⚠️ No session found')
        }
      } catch (err) {
        console.error('❌ Error initializing session:', err)
      } finally {
        setLoading(false)
      }
    }
    
    initSession()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('🔄 Auth state changed:', event, session?.user?.email)
        
        // Update state immediately
        setSession(session)
        setUser(session?.user ?? null)
        setLoading(false) // Set loading false IMMEDIATELY after user state
        
        console.log('✅ Auth state updated:', { 
          hasUser: !!session?.user, 
          email: session?.user?.email,
          loading: false 
        })

        if (session?.user) {
          // Fetch profile asynchronously (don't block UI)
          fetchProfile(session.user.id, session.user.email)
            .catch((error) => {
              console.error('❌ Failed to fetch profile in auth change (async):', error)
            })
          
          // Show welcome toast on sign in
          if (event === 'SIGNED_IN') {
            toast.success('Welcome back!', { description: 'You have successfully signed in' })
          }
        } else {
          setProfile(null)
          
          // Show sign out toast
          if (event === 'SIGNED_OUT') {
            toast.success('Signed out successfully')
          }
        }
      }
    )

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  const signUp = async (email: string, password: string, fullName?: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName || '',
        },
      },
    })

    if (error) throw error
    
    // Profile is created automatically by database trigger
    if (data.user) {
      await fetchProfile(data.user.id)
    }
  }

  const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) throw error
    
    if (data.user) {
      await fetchProfile(data.user.id)
    }
  }

  const signOut = async () => {
    console.log('🔄 Signing out - clearing state immediately...')
    
    // Clear local state FIRST (don't wait for slow API)
    setUser(null)
    setProfile(null)
    setSession(null)
    console.log('✅ Local auth state cleared')
    
    // Fire-and-forget: trigger Supabase signOut in background
    supabase.auth.signOut().then(({ error }) => {
      if (error) {
        console.log('⚠️ Supabase signOut error (non-critical):', error)
      } else {
        console.log('✅ Supabase signOut completed (async)')
      }
    })
  }

  const refreshProfile = async () => {
    if (user) {
      await fetchProfile(user.id, user.email)
    }
  }

  return (
    <AuthContext.Provider value={{
      user,
      profile,
      session,
      loading,
      signUp,
      signIn,
      signOut,
      refreshProfile,
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

