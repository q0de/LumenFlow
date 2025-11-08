"use client"

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { toast } from 'sonner'

export default function AuthCallbackPage() {
  const router = useRouter()

  useEffect(() => {
    const handleCallback = async () => {
      try {
        console.log('🔄 OAuth callback started')
        console.log('📍 Current URL:', window.location.href)
        
        // Check for hash fragment tokens (implicit flow)
        const hashParams = new URLSearchParams(window.location.hash.substring(1))
        const accessToken = hashParams.get('access_token')
        const refreshToken = hashParams.get('refresh_token')
        
        console.log('🔑 Tokens found:', { hasAccess: !!accessToken, hasRefresh: !!refreshToken })

        if (accessToken && refreshToken) {
          // Set the session from hash tokens
          const { data, error } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          })

          if (error) {
            console.error('❌ Error setting session:', error)
            toast.error('Login failed', { description: error.message })
            router.push('/')
            return
          }
          
          console.log('✅ Session set successfully:', data.session?.user?.email)
          // Don't show toast here - let AuthContext handle it on SIGNED_IN event
          
          // Redirect using Next.js router (no hard reload)
          router.push('/')
          return
        }

        // Check for code param (PKCE flow)
        const urlParams = new URLSearchParams(window.location.search)
        const code = urlParams.get('code')

        if (code) {
          const { data, error } = await supabase.auth.exchangeCodeForSession(code)
          
          if (error) {
            console.error('❌ Error exchanging code for session:', error)
            toast.error('Login failed', { description: error.message })
            router.push('/')
            return
          }
          
          console.log('✅ Code exchanged for session successfully')
          // Don't show toast here - let AuthContext handle it on SIGNED_IN event
          
          router.push('/')
          return
        }

        // No tokens found
        console.warn('⚠️ No auth tokens found in callback')
        router.push('/')
      } catch (error) {
        console.error('Callback error:', error)
        toast.error('Sign in error', { description: 'Please try again' })
        router.push('/')
      }
    }

    handleCallback()
  }, [router])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-green-50 to-slate-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
        <p className="text-slate-600 dark:text-slate-400">Completing sign in...</p>
      </div>
    </div>
  )
}

