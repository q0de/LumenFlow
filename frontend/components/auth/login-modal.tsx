"use client"

import { useState } from "react"
import { X, Mail, Lock, User } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { useAuth } from "@/lib/auth-context"

interface LoginModalProps {
  isOpen: boolean
  onClose: () => void
  defaultMode?: "signin" | "signup"
}

export function LoginModal({ isOpen, onClose, defaultMode = "signin" }: LoginModalProps) {
  const [mode, setMode] = useState<"signin" | "signup">(defaultMode)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [fullName, setFullName] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const { signIn, signUp } = useAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      if (mode === "signin") {
        await signIn(email, password)
      } else {
        await signUp(email, password, fullName)
      }
      onClose()
      // Reset form
      setEmail("")
      setPassword("")
      setFullName("")
    } catch (err: any) {
      setError(err.message || "An error occurred")
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="relative w-full max-w-md bg-white dark:bg-slate-800 rounded-xl shadow-2xl p-6 m-4"
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>

          {/* Header */}
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-2">
              {mode === "signin" ? "Welcome back" : "Create account"}
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              {mode === "signin" ? "Sign in to access your videos" : "Sign up to start converting videos"}
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === "signup" && (
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  <User className="inline h-4 w-4 mr-1" />
                  Full Name
                </label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="John Doe"
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                <Mail className="inline h-4 w-4 mr-1" />
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                <Lock className="inline h-4 w-4 mr-1" />
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="••••••••"
              />
            </div>

            {error && (
              <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-sm text-red-600 dark:text-red-400">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2 px-4 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white font-medium rounded-lg transition-colors"
            >
              {loading ? "Loading..." : mode === "signin" ? "Sign In" : "Sign Up"}
            </button>
          </form>

          {/* Toggle mode */}
          <div className="mt-4 text-center text-sm text-slate-600 dark:text-slate-400">
            {mode === "signin" ? (
              <>
                Don't have an account?{" "}
                <button
                  onClick={() => setMode("signup")}
                  className="text-green-600 dark:text-green-400 hover:underline font-medium"
                >
                  Sign up
                </button>
              </>
            ) : (
              <>
                Already have an account?{" "}
                <button
                  onClick={() => setMode("signin")}
                  className="text-green-600 dark:text-green-400 hover:underline font-medium"
                >
                  Sign in
                </button>
              </>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}

