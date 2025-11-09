"use client"

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { toast } from '@/lib/toast-utils'

export default function AuthCallbackPage() {
  const router = useRouter()

  useEffect(() => {
    const handleCallback = async () => {
      try {
        console.log('🔄 OAuth callback started')
        console.log('📍 Current URL:', window.location.href)
        
        // Small delay to ensure URL params are fully loaded
        await new Promise(resolve => setTimeout(resolve, 100))
        
        // Check for hash fragment tokens (implicit flow)
        const hashParams = new URLSearchParams(window.location.hash.substring(1))
        const accessToken = hashParams.get('access_token')
        const refreshToken = hashParams.get('refresh_token')
        
        console.log('🔑 Tokens found:', { hasAccess: !!accessToken, hasRefresh: !!refreshToken })
        console.log('🔑 Access token length:', accessToken?.length)
        console.log('🔑 Refresh token length:', refreshToken?.length)

        if (accessToken && refreshToken) {
          console.log('🔄 Setting session with Supabase SDK...')
          
          try {
            // Use Supabase SDK but don't await - just trigger it and redirect
            // The session will be available on next page load
            supabase.auth.setSession({
              access_token: accessToken,
              refresh_token: refreshToken,
            }).then(({ data, error }) => {
              if (error) {
                console.error('❌ Error setting session (async):', error)
              } else {
                console.log('✅ Session set successfully (async):', data.session?.user?.email)
              }
            })
            
            // Don't wait for setSession - just redirect immediately
            // The session will be picked up by AuthContext on next page
            console.log('✅ Redirecting to homepage (session will load there)...')
            
            // Small delay to let setSession start
            setTimeout(() => {
              window.location.href = '/'
            }, 500)
            
            return
          } catch (err: any) {
            console.error('❌ Exception in session flow:', err)
            router.push('/')
            return
          }
        }

        // Check for code param (PKCE flow)
        const urlParams = new URLSearchParams(window.location.search)
        const code = urlParams.get('code')
        
        console.log('🔍 Checking for PKCE code:', { hasCode: !!code, code: code?.substring(0, 10) + '...' })

        if (code) {
          console.log('🔄 Exchanging PKCE code for session...')
          
          // Exchange code with timeout (don't wait forever)
          const exchangePromise = supabase.auth.exchangeCodeForSession(code)
          const timeoutPromise = new Promise((resolve) => 
            setTimeout(() => resolve({ data: null, error: { message: 'Timeout - redirecting anyway' } }), 3000)
          )
          
          const result = await Promise.race([exchangePromise, timeoutPromise]) as any
          const { data, error } = result
          
          console.log('🔄 exchangeCodeForSession result:', { 
            hasData: !!data, 
            hasSession: !!data?.session,
            hasUser: !!data?.session?.user,
            error: error?.message 
          })
          
          if (error && !error.message.includes('Timeout')) {
            console.error('❌ Error exchanging code for session:', error)
            // Don't show toast for "code verifier" errors - these are transient
            if (!error.message.includes('code verifier') && !error.message.includes('auth code')) {
              toast.error('Login failed', { description: error.message })
            }
            router.push('/')
            return
          }
          
          if (error?.message.includes('Timeout')) {
            console.log('⚠️ Exchange timed out but session might be set - redirecting...')
          } else {
            console.log('✅ Code exchanged for session successfully:', data.session?.user?.email)
          }
          
          console.log('✅ Redirecting to homepage...')
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

