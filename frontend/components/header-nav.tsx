"use client"

import { useState, useEffect } from "react"
import { User, LogOut, CreditCard, Video } from "lucide-react"
import Link from "next/link"
import { useAuth } from "@/lib/auth-context"
import { LoginModal } from "./auth/login-modal"
import { openCustomerPortal } from "@/lib/stripe"

export function HeaderNav() {
  const { user, profile, signOut } = useAuth()
  const [showLogin, setShowLogin] = useState(false)
  const [showMenu, setShowMenu] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  // Show loading skeleton initially
  useEffect(() => {
    // Small delay to check auth state
    const timer = setTimeout(() => setIsLoading(false), 500)
    return () => clearTimeout(timer)
  }, [user])

  const handleManageSubscription = async () => {
    try {
      await openCustomerPortal()
    } catch (error) {
      console.error('Failed to open portal:', error)
    }
  }

  // Only show if payments are enabled (or in development)
  const isPaymentsEnabled = process.env.NEXT_PUBLIC_ENABLE_PAYMENTS === 'true' || process.env.NODE_ENV === 'development'
  
  if (!isPaymentsEnabled) {
    return null
  }

  return (
    <>
      <nav className="absolute top-0 right-0 p-6 z-10">
        <div className="flex items-center gap-4">
          {isLoading ? (
            <>
              {/* Loading skeletons */}
              <div className="h-10 w-20 bg-slate-200 dark:bg-slate-700 rounded-lg animate-pulse" />
              <div className="h-10 w-24 bg-slate-200 dark:bg-slate-700 rounded-lg animate-pulse" />
            </>
          ) : !user ? (
            <>
              <button
                onClick={() => setShowLogin(true)}
                className="px-4 py-2 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-100 font-medium transition-colors"
              >
                Sign In
              </button>
              <Link href="/pricing">
                <button className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors">
                  Pricing
                </button>
              </Link>
            </>
          ) : (
            <div className="relative">
              <button
                onClick={() => setShowMenu(!showMenu)}
                className="flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors"
              >
                <User className="h-4 w-4" />
                <span className="text-sm font-medium text-slate-900 dark:text-slate-100">
                  {profile?.subscription_tier === 'pro' ? 'Pro' : 'Free'}
                </span>
              </button>

              {showMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-slate-800 rounded-lg shadow-lg py-2 border border-slate-200 dark:border-slate-700">
                  <div className="px-4 py-2 border-b border-slate-200 dark:border-slate-700">
                    <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
                      {profile?.email}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {profile?.subscription_tier === 'pro' ? 'Pro Plan' : 'Free Plan'}
                    </p>
                  </div>

                  <Link href="/pricing">
                    <button className="w-full px-4 py-2 text-left text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center gap-2">
                      <Video className="h-4 w-4" />
                      {profile?.subscription_tier === 'pro' ? 'View Plans' : 'Upgrade to Pro'}
                    </button>
                  </Link>

                  {profile?.subscription_tier === 'pro' && (
                    <button
                      onClick={handleManageSubscription}
                      className="w-full px-4 py-2 text-left text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center gap-2"
                    >
                      <CreditCard className="h-4 w-4" />
                      Manage Subscription
                    </button>
                  )}

                  <button
                    onClick={() => {
                      console.log('🔄 Sign out button clicked')
                      signOut()
                      setShowMenu(false)
                      console.log('✅ Sign out initiated')
                    }}
                    className="w-full px-4 py-2 text-left text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center gap-2 border-t border-slate-200 dark:border-slate-700"
                  >
                    <LogOut className="h-4 w-4" />
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </nav>

      <LoginModal isOpen={showLogin} onClose={() => setShowLogin(false)} />
    </>
  )
}

