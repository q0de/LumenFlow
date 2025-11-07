"use client"

import { motion } from "framer-motion"
import { Sparkles, X } from "lucide-react"
import Link from "next/link"

interface UpgradePromptProps {
  isOpen: boolean
  onClose: () => void
  reason: "limit_reached" | "no_watermark"
  videosUsed?: number
  videosLimit?: number
}

export function UpgradePrompt({
  isOpen,
  onClose,
  reason,
  videosUsed = 0,
  videosLimit = 5,
}: UpgradePromptProps) {
  if (!isOpen) return null

  const messages = {
    limit_reached: {
      title: "Daily Limit Reached",
      description: `You've used ${videosUsed} of ${videosLimit} free videos today. Upgrade to Pro for 50 videos/month!`,
    },
    no_watermark: {
      title: "Remove Watermark",
      description: "Upgrade to Pro to remove the LumenFlow watermark from your videos.",
    },
  }

  const message = messages[reason]

  return (
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

        {/* Icon */}
        <div className="mx-auto w-16 h-16 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center mb-4">
          <Sparkles className="h-8 w-8 text-white" />
        </div>

        {/* Content */}
        <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 text-center mb-2">
          {message.title}
        </h2>
        <p className="text-slate-600 dark:text-slate-400 text-center mb-6">
          {message.description}
        </p>

        {/* Features */}
        <div className="bg-slate-50 dark:bg-slate-700/50 rounded-lg p-4 mb-6">
          <p className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
            Pro features:
          </p>
          <ul className="space-y-1 text-sm text-slate-600 dark:text-slate-400">
            <li>✓ 50 videos per month</li>
            <li>✓ No watermark</li>
            <li>✓ Custom resolutions (up to 4K)</li>
            <li>✓ VP8 & VP9 codec options</li>
          </ul>
        </div>

        {/* CTA Buttons */}
        <div className="space-y-3">
          <Link href="/pricing">
            <button className="w-full py-3 px-6 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors">
              Upgrade to Pro - $12/month
            </button>
          </Link>
          <button
            onClick={onClose}
            className="w-full py-2 px-6 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 font-medium transition-colors"
          >
            Maybe Later
          </button>
        </div>
      </motion.div>
    </div>
  )
}

