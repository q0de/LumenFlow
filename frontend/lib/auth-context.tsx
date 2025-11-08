"use client"

import { createContext, useContext, useEffect, useState } from "react"
import { User, Session } from "@supabase/supabase-js"
import { supabase } from "./supabase"
import { toast } from "sonner"

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

  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()

      if (error) throw error
      setProfile(data)
    } catch (error) {
      console.error('Error fetching profile:', error)
      setProfile(null)
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
          await fetchProfile(session.user.id)
        } else {
          console.log('⚠️ No session found')
        }
        
        setLoading(false)
      } catch (err) {
        console.error('❌ Error initializing session:', err)
        setLoading(false)
      }
    }
    
    initSession()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('🔄 Auth state changed:', event, session?.user?.email)
        
        setSession(session)
        setUser(session?.user ?? null)
        
        if (session?.user) {
          await fetchProfile(session.user.id)
          
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
        setLoading(false)
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
    console.log('🔄 Signing out - clearing local state immediately...')
    
    // Clear local state FIRST - don't wait for API
    setUser(null)
    setProfile(null)
    setSession(null)
    console.log('✅ Local auth state cleared')
    
    // Fire-and-forget the Supabase signOut (clears server session)
    supabase.auth.signOut().then(({ error }) => {
      if (error) {
        console.error('⚠️ Supabase signOut error (non-critical):', error)
      } else {
        console.log('✅ Supabase signOut successful (async)')
      }
    }).catch((err) => {
      console.error('⚠️ Exception during signOut (non-critical):', err)
    })
  }

  const refreshProfile = async () => {
    if (user) {
      await fetchProfile(user.id)
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

