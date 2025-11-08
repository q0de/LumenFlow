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
        // Check for hash fragment tokens (implicit flow)
        const hashParams = new URLSearchParams(window.location.hash.substring(1))
        const accessToken = hashParams.get('access_token')
        const refreshToken = hashParams.get('refresh_token')

        if (accessToken && refreshToken) {
          // Set the session from hash tokens
          const { data, error } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          })

          if (error) {
            console.error('Session error:', error)
            toast.error('Sign in failed', { description: error.message })
          } else {
            console.log('✅ Session set successfully:', data)
            toast.success('Welcome back!', { description: 'You have successfully signed in' })
          }

          // Clean up URL and redirect
          window.location.href = '/'
          return
        }

        // Check for code param (PKCE flow)
        const urlParams = new URLSearchParams(window.location.search)
        const code = urlParams.get('code')

        if (code) {
          const { data, error } = await supabase.auth.exchangeCodeForSession(code)
          
          if (error) {
            console.error('Code exchange error:', error)
            toast.error('Sign in failed', { description: error.message })
          } else {
            console.log('✅ Code exchanged successfully:', data)
            toast.success('Welcome back!', { description: 'You have successfully signed in' })
          }

          // Redirect to home
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

