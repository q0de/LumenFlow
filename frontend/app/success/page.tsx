"use client"

import { useEffect } from "react"
import { CheckCircle } from "lucide-react"
import { motion } from "framer-motion"
import Link from "link"
import { useAuth } from "@/lib/auth-context"

export default function SuccessPage() {
  const { refreshProfile } = useAuth()

  useEffect(() => {
    // Refresh profile to get updated subscription status
    refreshProfile()
  }, [refreshProfile])

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white dark:from-slate-900 dark:to-slate-800 flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="max-w-md w-full bg-white dark:bg-slate-800 rounded-2xl shadow-2xl p-8 text-center"
      >
        <div className="mx-auto w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mb-6">
          <CheckCircle className="h-10 w-10 text-green-600 dark:text-green-400" />
        </div>

        <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-4">
          Welcome to Pro!
        </h1>
        <p className="text-slate-600 dark:text-slate-400 mb-8">
          Your subscription is now active. Enjoy unlimited videos without watermarks!
        </p>

        <div className="space-y-3">
          <Link href="/">
            <button className="w-full py-3 px-6 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors">
              Start Converting Videos
            </button>
          </Link>
          <Link href="/account">
            <button className="w-full py-3 px-6 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-900 dark:text-slate-100 font-medium rounded-lg transition-colors">
              Manage Subscription
            </button>
          </Link>
        </div>
      </motion.div>
    </div>
  )
}

