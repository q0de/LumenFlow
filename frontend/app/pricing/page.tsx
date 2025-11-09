"use client"

import { useState, useEffect } from "react"
import { Check, X, Sparkles } from "lucide-react"
import { motion } from "framer-motion"
import { useAuth } from "@/lib/auth-context"
import { createCheckoutSession } from "@/lib/stripe"
import { LoginModal } from "@/components/auth/login-modal"
import Link from "next/link"

export default function PricingPage() {
  // Set page title and meta description dynamically (client component)
  useEffect(() => {
    document.title = "Pricing — Green Screen Remover"
    
    // Update meta description
    const metaDescription = document.querySelector('meta[name="description"]')
    if (metaDescription) {
      metaDescription.setAttribute('content', 'Choose the perfect plan for your green screen removal needs. Free tier with 5 videos/day or Pro plan for unlimited processing. No watermark on Pro.')
    }
  }, [])
  const { user, profile, loading } = useAuth()
  const [checkoutLoading, setCheckoutLoading] = useState(false)
  const [showLogin, setShowLogin] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Debug logging
  useEffect(() => {
    console.log('🔍 Pricing Page State:', {
      hasUser: !!user,
      userEmail: user?.email,
      profileTier: profile?.subscription_tier,
      loading,
      checkoutLoading
    })
  }, [user, profile, loading, checkoutLoading])

  const handleUpgrade = async () => {
    setError(null)

    if (!user) {
      setShowLogin(true)
      return
    }

    setCheckoutLoading(true)
    try {
      await createCheckoutSession()
    } catch (err: any) {
      setError(err.message || "Failed to start checkout")
    } finally {
      setCheckoutLoading(false)
    }
  }

  const tiers = [
    {
      name: "Free",
      price: "$0",
      period: "forever",
      description: "Perfect for trying out the tool",
      features: [
        { text: "3 videos per day", included: true },
        { text: "Up to 100MB per video", included: true },
        { text: "Standard quality (compressed)", included: true },
        { text: "Watermark on videos", included: true },
        { text: "AI green screen removal", included: true },
        { text: "Transparent WebM export", included: true },
        { text: "VP8 & VP9 codec options", included: true },
        { text: "HD quality", included: false },
        { text: "No watermark", included: false },
        { text: "Unlimited videos", included: false },
        { text: "Up to 500MB per video", included: false },
      ],
      cta: "Get Started",
      popular: false,
    },
    {
      name: "Pro",
      price: "$12",
      period: "per month",
      description: "For serious creators and game developers",
      features: [
        { text: "Unlimited videos", included: true },
        { text: "Up to 500MB per video", included: true },
        { text: "HD quality (best compression)", included: true },
        { text: "No watermark", included: true },
        { text: "VP8 & VP9 codec options", included: true },
        { text: "Custom resolutions (512px - 4K)", included: true },
        { text: "Green screen removal", included: true },
        { text: "Priority processing", included: true },
        { text: "All quality settings", included: true },
        { text: "Cancel anytime", included: true },
      ],
      cta: profile?.subscription_tier === 'pro' ? "Current Plan" : "Upgrade to Pro",
      popular: true,
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white dark:from-slate-900 dark:to-slate-800">
      {/* Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Link href="/" className="text-green-600 dark:text-green-400 hover:underline">
          ← Back to app
        </Link>
      </div>

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-4xl sm:text-5xl font-bold text-slate-900 dark:text-slate-100 mb-4">
            Simple, Transparent Pricing
          </h1>
          <p className="text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
            Choose the plan that fits your needs. Start free, upgrade when ready.
          </p>
        </motion.div>
      </div>

      {/* Pricing Cards */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {tiers.map((tier, idx) => (
            <motion.div
              key={tier.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
              className={`relative bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-8 ${
                tier.popular ? "ring-2 ring-green-500" : ""
              }`}
            >
              {tier.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <span className="inline-flex items-center gap-1 bg-gradient-to-r from-green-500 to-emerald-500 text-white px-4 py-1 rounded-full text-sm font-medium">
                    <Sparkles className="h-4 w-4" />
                    Most Popular
                  </span>
                </div>
              )}

              {/* Tier Header */}
              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-2">
                  {tier.name}
                </h3>
                <div className="flex items-baseline justify-center gap-2 mb-2">
                  <span className="text-5xl font-bold text-slate-900 dark:text-slate-100">
                    {tier.price}
                  </span>
                  <span className="text-slate-600 dark:text-slate-400">
                    {tier.period}
                  </span>
                </div>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  {tier.description}
                </p>
              </div>

              {/* Features List */}
              <ul className="space-y-3 mb-8">
                {tier.features.map((feature) => (
                  <li key={feature.text} className="flex items-start gap-3">
                    {feature.included ? (
                      <Check className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                    ) : (
                      <X className="h-5 w-5 text-slate-300 dark:text-slate-600 flex-shrink-0 mt-0.5" />
                    )}
                    <span
                      className={`text-sm ${
                        feature.included
                          ? "text-slate-700 dark:text-slate-300"
                          : "text-slate-400 dark:text-slate-600"
                      }`}
                    >
                      {feature.text}
                    </span>
                  </li>
                ))}
              </ul>

              {/* CTA Button */}
              <button
                onClick={() => {
                  console.log('🔘 Button clicked:', tier.name, { user: !!user, profile: !!profile, loading, checkoutLoading })
                  if (tier.name === "Pro") {
                    handleUpgrade()
                  } else {
                    window.location.href = "/"
                  }
                }}
                disabled={
                  (tier.name === "Pro" && profile?.subscription_tier === 'pro') ||
                  checkoutLoading ||
                  loading
                }
                className={`w-full py-3 px-6 rounded-lg font-medium transition-colors ${
                  tier.popular
                    ? "bg-green-600 hover:bg-green-700 text-white disabled:bg-green-400 disabled:cursor-not-allowed"
                    : "bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-900 dark:text-slate-100"
                }`}
              >
                {loading ? "Loading..." : checkoutLoading && tier.name === "Pro"
                  ? "Loading..."
                  : tier.cta}
              </button>
            </motion.div>
          ))}
        </div>

        {error && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="max-w-md mx-auto mt-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-sm text-red-600 dark:text-red-400 text-center"
          >
            {error}
          </motion.div>
        )}

        {/* FAQ Section */}
        <div className="mt-16 max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 text-center mb-8">
            Frequently Asked Questions
          </h2>
          <div className="space-y-6">
            <div>
              <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-2">
                Can I cancel anytime?
              </h3>
              <p className="text-slate-600 dark:text-slate-400">
                Yes! Cancel your Pro subscription anytime. You'll keep access until the end of your billing period.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-2">
                What happens to my videos after canceling?
              </h3>
              <p className="text-slate-600 dark:text-slate-400">
                You'll switch to the free tier (5 videos/day with watermark). All previously processed videos remain downloadable.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-2">
                Do you offer refunds?
              </h3>
              <p className="text-slate-600 dark:text-slate-400">
                We offer a 7-day money-back guarantee. If you're not satisfied, contact us for a full refund.
              </p>
            </div>
          </div>
        </div>
      </div>

      <LoginModal
        isOpen={showLogin}
        onClose={() => setShowLogin(false)}
        defaultMode="signup"
      />
    </div>
  )
}

