"use client"

import { useState, useCallback, useEffect, useRef } from "react"
import { useDropzone } from "react-dropzone"
import { Upload, Video, Download, Loader2, CheckCircle2, XCircle, Settings, ChevronDown, ChevronUp, Eye, Copy, Moon, Sun, Clock, Trash2, Zap, Lock } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { supabase, isSupabaseAvailable } from "@/lib/supabase"
import { useAuth } from "@/lib/auth-context"
import { HeaderNav } from "@/components/header-nav"
import { LoginModal } from "@/components/auth/login-modal"
import { UpgradePrompt } from "@/components/upgrade-prompt"
import { toast } from "@/lib/toast-utils"
import confetti from "canvas-confetti"

interface ProcessingJob {
  id: string // Client-side ID
  serverJobId?: string // Server-side ID from Supabase
  filename: string
  status: "uploading" | "processing" | "completed" | "error"
  progress: number
  error?: string
  downloadUrl?: string
  thumbnail?: string // Video thumbnail
  startTime?: number // Track when processing started
  has_watermark?: boolean // Whether video has watermark
  fileSize?: number // File size in bytes
  duration?: number // Video duration in seconds
  resolution?: string // Video resolution (e.g., "1920x1080")
  format?: string // File format/extension
}

interface ProcessingOptions {
  quality: "fast" | "good" | "best"
  chromaTolerance: number
  processingSpeed: number
  backgroundColor: string
  enableCodecOverride: boolean
  codec: "vp8" | "vp9"
  enableResize: boolean
  outputWidth: number
}

interface RecentVideo {
  filename: string
  downloadUrl: string
  thumbnail?: string
  timestamp: number
}

const defaultOptions: ProcessingOptions = {
  quality: "good",
  chromaTolerance: 0.3,
  processingSpeed: 4,
  backgroundColor: "#00FF00",
  enableCodecOverride: false,
  codec: "vp8",
  enableResize: false,
  outputWidth: 1354
}

export default function Home() {
  const { user, profile } = useAuth()
  const [jobs, setJobs] = useState<ProcessingJob[]>([])
  const [isUploading, setIsUploading] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [options, setOptions] = useState<ProcessingOptions>(defaultOptions)
  const [expandedPreview, setExpandedPreview] = useState<string | null>(null)
  const [showLogin, setShowLogin] = useState(false)
  const [showUpgrade, setShowUpgrade] = useState(false)
  const [upgradeReason, setUpgradeReason] = useState<"limit_reached" | "no_watermark">("limit_reached")
  const [usageInfo, setUsageInfo] = useState<{used: number, limit: number} | null>(null)
  const [recentVideos, setRecentVideos] = useState<RecentVideo[]>([])
  const [isDarkMode, setIsDarkMode] = useState(false)
  
  // Progress smoothing - track last update time for interpolation
  const progressTimestampsRef = useRef<Map<string, { progress: number, timestamp: number }>>(new Map())

  // Initialize dark mode from localStorage (default to light)
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme')
    const shouldBeDark = savedTheme === 'dark' // Only dark if explicitly set
    
    setIsDarkMode(shouldBeDark)
    if (shouldBeDark) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [])

  // Toggle dark mode
  const toggleDarkMode = () => {
    const newMode = !isDarkMode
    setIsDarkMode(newMode)
    
    if (newMode) {
      document.documentElement.classList.add('dark')
      localStorage.setItem('theme', 'dark')
      toast.success('Dark mode enabled')
    } else {
      document.documentElement.classList.remove('dark')
      localStorage.setItem('theme', 'light')
      toast.success('Light mode enabled')
    }
  }

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      // Escape to close modals
      if (e.key === 'Escape') {
        setShowLogin(false)
        setShowUpgrade(false)
        setExpandedPreview(null)
      }
      
      // Ctrl+D to toggle dark mode
      if ((e.ctrlKey || e.metaKey) && e.key === 'd') {
        e.preventDefault()
        toggleDarkMode()
      }
    }

    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [isDarkMode, toggleDarkMode])

  // Load options from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem("lumenflow-options")
    if (saved) {
      try {
        setOptions({ ...defaultOptions, ...JSON.parse(saved) })
      } catch (e) {
        // Invalid saved data, use defaults
      }
    }
    
    // Load recent videos
    const savedRecent = localStorage.getItem("recent-videos")
    if (savedRecent) {
      try {
        const recent = JSON.parse(savedRecent)
        // Filter out videos older than 24 hours
        const filtered = recent.filter((v: RecentVideo) => 
          Date.now() - v.timestamp < 24 * 60 * 60 * 1000
        )
        setRecentVideos(filtered)
      } catch (e) {
        // Invalid data
      }
    }
  }, [])

  // Save options to localStorage when changed
  useEffect(() => {
    localStorage.setItem("lumenflow-options", JSON.stringify(options))
  }, [options])

  // Fetch usage info when user logs in (if payments enabled)
  useEffect(() => {
    if (process.env.NEXT_PUBLIC_ENABLE_PAYMENTS === 'true' && user) {
      fetchUsageInfo()
    }
  }, [user])

  const fetchUsageInfo = async () => {
    try {
      const response = await fetch('/api/usage')
      if (response.ok) {
        const data = await response.json()
        setUsageInfo({
          used: data.videosProcessed,
          limit: data.videosLimit
        })
      } else if (response.status === 401) {
        // User not authenticated on server-side, this is okay
        // Profile data loaded via client-side auth
        console.log('ℹ️ Usage API requires server-side session (optional)')
      }
    } catch (error) {
      // Silently fail - usage info is optional
      console.log('ℹ️ Usage check skipped')
    }
  }

  const checkUsageBeforeUpload = () => {
    // If payments not enabled, allow upload
    if (process.env.NEXT_PUBLIC_ENABLE_PAYMENTS !== 'true') {
      return true
    }

    // If user not logged in, show login
    if (!user) {
      setShowLogin(true)
      toast.error('Please sign in to continue', { description: 'Sign in required to process videos' })
      return false
    }

    // Check usage limit
    if (usageInfo && usageInfo.used >= usageInfo.limit) {
      setUpgradeReason("limit_reached")
      setShowUpgrade(true)
      toast.error('Usage limit reached', { description: 'Upgrade to process more videos' })
      return false
    }

    return true
  }

  // Generate video thumbnail
  const generateThumbnail = (videoFile: File): Promise<string> => {
    return new Promise((resolve) => {
      const video = document.createElement('video')
      const canvas = document.createElement('canvas')
      video.preload = 'metadata'
      
      video.onloadeddata = () => {
        video.currentTime = 1 // Capture at 1 second
      }
      
      video.onseeked = () => {
        canvas.width = video.videoWidth
        canvas.height = video.videoHeight
        const ctx = canvas.getContext('2d')
        if (ctx) {
          ctx.drawImage(video, 0, 0)
          resolve(canvas.toDataURL('image/jpeg', 0.7))
        }
      }
      
      video.src = URL.createObjectURL(videoFile)
    })
  }

  // Extract video metadata
  const extractVideoMetadata = (file: File): Promise<{ duration: number, resolution: string }> => {
    return new Promise((resolve, reject) => {
      const video = document.createElement('video')
      video.preload = 'metadata'
      video.muted = true
      
      video.onloadedmetadata = () => {
        const duration = Math.round(video.duration)
        const resolution = `${video.videoWidth}x${video.videoHeight}`
        URL.revokeObjectURL(video.src)
        resolve({ duration, resolution })
      }
      
      video.onerror = () => {
        URL.revokeObjectURL(video.src)
        reject(new Error('Failed to load video metadata'))
      }
      
      video.src = URL.createObjectURL(file)
    })
  }

  // Format file size for display
  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B'
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
  }

  // Format duration for display
  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  // Save to recent videos
  const saveToRecent = (filename: string, downloadUrl: string, thumbnail?: string) => {
    const recent: RecentVideo = {
      filename,
      downloadUrl,
      thumbnail,
      timestamp: Date.now()
    }
    
    const updated = [recent, ...recentVideos.slice(0, 9)] // Keep last 10
    setRecentVideos(updated)
    localStorage.setItem("recent-videos", JSON.stringify(updated))
  }

  // Remove from recent videos
  const removeFromRecent = (index: number) => {
    const updated = recentVideos.filter((_, i) => i !== index)
    setRecentVideos(updated)
    localStorage.setItem("recent-videos", JSON.stringify(updated))
    toast.success('Removed from recent videos')
  }

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    // Require authentication before upload
    if (!user) {
      toast.error('Sign in required', {
        description: 'Please sign in to upload videos',
        action: {
          label: 'Sign In',
          onClick: () => setShowLogin(true)
        }
      })
      setShowLogin(true)
      return
    }

    // Check usage before processing
    if (!checkUsageBeforeUpload()) {
      return
    }

    toast.success(`${acceptedFiles.length} video(s) added to queue`, { 
      description: 'Starting upload...' 
    })

    for (const file of acceptedFiles) {
      if (!file.type.startsWith("video/")) {
        toast.error(`${file.name} is not a video file`, { description: 'Please upload MP4, MOV, or AVI files' })
        continue
      }

      const jobId = `job-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
      
      // Generate thumbnail
      let thumbnail: string | undefined
      try {
        thumbnail = await generateThumbnail(file)
      } catch (e) {
        console.error('Failed to generate thumbnail:', e)
      }

      // Extract video metadata
      let duration: number | undefined
      let resolution: string | undefined
      try {
        const metadata = await extractVideoMetadata(file)
        duration = metadata.duration
        resolution = metadata.resolution
      } catch (e) {
        console.error('Failed to extract video metadata:', e)
      }

      // Get file extension
      const format = file.name.split('.').pop()?.toUpperCase()

      const newJob: ProcessingJob = {
        id: jobId,
        filename: file.name,
        status: "uploading",
        progress: 0,
        thumbnail,
        startTime: Date.now(),
        fileSize: file.size,
        duration,
        resolution,
        format
      }

      setJobs((prev) => [...prev, newJob])
      setIsUploading(true)
      
      toast.promise(
        (async () => {
          // Upload file with options
          const formData = new FormData()
          formData.append("file", file)
          formData.append("options", JSON.stringify(options))

          const uploadResponse = await fetch("/api/upload", {
            method: "POST",
            body: formData,
          })

          if (!uploadResponse.ok) {
            throw new Error("Upload failed")
          }

          const { jobId: serverJobId } = await uploadResponse.json()

          // Update job status and store serverJobId
          setJobs((prev) =>
            prev.map((job) =>
              job.id === jobId
                ? { ...job, serverJobId, status: "processing", progress: 10 }
                : job
            )
          )

          // Subscribe to real-time updates
          subscribeToJob(serverJobId, jobId)
        })(),
        {
          loading: `Uploading ${file.name}...`,
          success: `Processing ${file.name}`,
          error: `Failed to upload ${file.name}`,
        }
      )
    }
    
    setIsUploading(false)
  }, [options, checkUsageBeforeUpload])

  // Use Supabase real-time subscriptions with polling fallback
  const channelsRef = useRef<Map<string, any>>(new Map())
  const pollingIntervalsRef = useRef<Map<string, NodeJS.Timeout>>(new Map())
  const extraPollingRef = useRef<Map<string, boolean>>(new Map())

  // Polling fallback function with progress smoothing
  const pollJobStatus = useCallback(async (serverJobId: string, clientJobId: string) => {
    try {
      const response = await fetch(`/api/jobs/${serverJobId}`)
      if (response.ok) {
        const job = await response.json()
        
        setJobs((prev) =>
          prev.map((j) => {
            if (j.id === clientJobId) {
              const status = job.status as ProcessingJob['status']
              
              // Progress smoothing: track when we receive updates
              if (status === "processing" && job.progress) {
                progressTimestampsRef.current.set(clientJobId, {
                  progress: job.progress,
                  timestamp: Date.now()
                })
              }
              
              // Use the complete job data from API, keeping only client-side fields
              const updatedJob = {
                ...job,
                id: j.id,
                serverJobId: j.serverJobId,
                filename: j.filename,
                thumbnail: j.thumbnail,
                startTime: j.startTime,
                // Preserve metadata fields
                fileSize: j.fileSize,
                duration: j.duration,
                resolution: j.resolution,
                format: j.format
              }
              
              // Handle completion
              if (status === "completed" && !extraPollingRef.current.get(clientJobId)) {
                extraPollingRef.current.set(clientJobId, true)
                
                // Trigger confetti!
                confetti({
                  particleCount: 100,
                  spread: 70,
                  origin: { y: 0.6 }
                })
                
                // Show success toast
                toast.success(`${j.filename} is ready!`, { 
                  description: 'Click to download your video',
                  action: updatedJob.downloadUrl ? {
                    label: 'Download',
                    onClick: () => {
                      const a = document.createElement('a')
                      a.href = updatedJob.downloadUrl!
                      a.download = j.filename.replace(/\.[^/.]+$/, ".webm")
                      a.click()
                    }
                  } : undefined
                })
                
                // Save to recent
                if (updatedJob.downloadUrl) {
                  saveToRecent(j.filename, updatedJob.downloadUrl, j.thumbnail)
                }
                
                // Stop polling after a delay
                setTimeout(() => {
                  const mainInterval = pollingIntervalsRef.current.get(clientJobId)
                  if (mainInterval) {
                    clearInterval(mainInterval)
                    pollingIntervalsRef.current.delete(clientJobId)
                  }
                  progressTimestampsRef.current.delete(clientJobId)
                  extraPollingRef.current.delete(clientJobId)
                }, 1500)
              }
              
              if (status === "error") {
                // Stop polling immediately on error
                const interval = pollingIntervalsRef.current.get(clientJobId)
                if (interval) {
                  clearInterval(interval)
                  pollingIntervalsRef.current.delete(clientJobId)
                }
                progressTimestampsRef.current.delete(clientJobId)
                
                toast.error(`${j.filename} failed to process`, { 
                  description: job.error || 'An error occurred' 
                })
              }
              
              return updatedJob
            }
            return j
          })
        )
      }
    } catch (error) {
      console.error('Error polling job status:', error)
    }
  }, [])

  const subscribeToJob = useCallback((serverJobId: string, clientJobId: string) => {
    // Clean up existing subscription if any
    const existingChannel = channelsRef.current.get(clientJobId)
    if (existingChannel) {
      supabase.removeChannel(existingChannel)
      channelsRef.current.delete(clientJobId)
    }

    // Clean up existing polling if any
    const existingInterval = pollingIntervalsRef.current.get(clientJobId)
    if (existingInterval) {
      clearInterval(existingInterval)
      pollingIntervalsRef.current.delete(clientJobId)
    }

    // Check if Supabase is available before trying real-time
    if (isSupabaseAvailable()) {
      try {
        const channel = supabase
          .channel(`job:${serverJobId}`)
          .on(
            'postgres_changes',
            {
              event: 'UPDATE',
              schema: 'public',
              table: 'jobs',
              filter: `id=eq.${serverJobId}`,
            },
            (payload) => {
              const updatedJob = payload.new as any
              setJobs((prev) =>
                prev.map((job) => {
                  if (job.id === clientJobId) {
                    const status = updatedJob.status as ProcessingJob['status']
                    
                    if (status === "completed" || status === "error") {
                      const ch = channelsRef.current.get(clientJobId)
                      if (ch) {
                        supabase.removeChannel(ch)
                        channelsRef.current.delete(clientJobId)
                      }
                    }
                    
                    return {
                      ...job,
                      status: updatedJob.status,
                      progress: updatedJob.progress ?? job.progress,
                      error: updatedJob.error,
                      downloadUrl: updatedJob.output_filename ? `/api/download/${serverJobId}` : job.downloadUrl,
                    }
                  }
                  return job
                })
              )
            }
          )
          .subscribe()

        channelsRef.current.set(clientJobId, channel)
      } catch (error) {
        console.error('Failed to create Supabase subscription:', error)
      }
    }

    // Always start polling
    const pollInterval = setInterval(() => {
      pollJobStatus(serverJobId, clientJobId)
    }, 300)
    pollingIntervalsRef.current.set(clientJobId, pollInterval)
    
    pollJobStatus(serverJobId, clientJobId)
  }, [pollJobStatus])

  // Cleanup subscriptions and polling on unmount
  useEffect(() => {
    return () => {
      channelsRef.current.forEach((channel) => {
        supabase.removeChannel(channel)
      })
      channelsRef.current.clear()
      
      pollingIntervalsRef.current.forEach((interval) => {
        clearInterval(interval)
      })
      pollingIntervalsRef.current.clear()
      
      progressTimestampsRef.current.clear()
      extraPollingRef.current.clear()
    }
  }, [])

  const { getRootProps, getInputProps, isDragActive, open } = useDropzone({
    onDrop,
    accept: {
      "video/*": [".mp4", ".mov", ".avi"],
    },
    maxSize: 100 * 1024 * 1024, // 100MB
    noClick: false, // Allow clicking
    noKeyboard: false
  })

  // Copy download link
  const copyDownloadLink = (url: string, filename: string) => {
    navigator.clipboard.writeText(window.location.origin + url)
    toast.success('Link copied!', { description: `Share link for ${filename}` })
  }

  // Calculate estimated time remaining
  const getEstimatedTime = (job: ProcessingJob): string | null => {
    if (!job.startTime || job.progress === 0) return null
    
    const elapsed = (Date.now() - job.startTime) / 1000 // seconds
    const estimated = (100 - job.progress) * (elapsed / job.progress)
    
    if (estimated < 60) {
      return `~${Math.round(estimated)}s remaining`
    } else {
      return `~${Math.round(estimated / 60)}m remaining`
    }
  }

  // Remove job from list
  const removeJob = (jobId: string) => {
    setJobs((prev) => prev.filter((j) => j.id !== jobId))
    toast.success('Job removed')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-green-50 to-slate-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      {/* Header Navigation */}
      <HeaderNav />
      
      {/* Dark Mode Toggle */}
      <button
        onClick={toggleDarkMode}
        className="fixed top-6 left-6 z-10 p-3 bg-white dark:bg-slate-800 rounded-lg shadow-lg hover:shadow-xl transition-all"
        title={`Switch to ${isDarkMode ? 'light' : 'dark'} mode (Ctrl+D)`}
      >
        {isDarkMode ? (
          <Sun className="h-5 w-5 text-yellow-500" />
        ) : (
          <Moon className="h-5 w-5 text-slate-700" />
        )}
      </button>
      
      <div className="container mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="relative"
          >
            {/* Title with Icon */}
            <div className="flex items-center justify-center gap-4 mb-4">
              <div className="p-3 bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-lg">
                <Video className="h-8 w-8 text-white" />
              </div>
              
              <h1 className="text-5xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                Green Screen Remover
              </h1>
            </div>

            <p className="text-xl text-slate-600 dark:text-slate-400 mt-4">
              <span 
                className="relative inline-block px-2 py-0.5 border-2 border-dashed border-slate-400 dark:border-slate-500 rounded font-semibold"
                style={{
                  background: `
                    repeating-linear-gradient(
                      45deg,
                      transparent,
                      transparent 5px,
                      rgba(156, 163, 175, 0.15) 5px,
                      rgba(156, 163, 175, 0.15) 10px
                    )
                  `,
                  animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite'
                }}
              >
                Remove
              </span> Green Screens from Your Videos
            </p>
            <p className="text-sm text-slate-500 dark:text-slate-500 mt-2">
              Fast, automatic background removal with transparent WebM export
            </p>
            
            {/* Keyboard shortcuts hint */}
            <div className="mt-4 flex items-center justify-center gap-4 text-xs text-slate-400">
              <div className="flex items-center gap-1">
                <kbd className="px-2 py-1 bg-slate-200 dark:bg-slate-700 rounded">Ctrl+D</kbd>
                <span>Dark Mode</span>
              </div>
              <div className="flex items-center gap-1">
                <kbd className="px-2 py-1 bg-slate-200 dark:bg-slate-700 rounded">Esc</kbd>
                <span>Close</span>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Settings Panel */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-4xl mx-auto mb-6"
        >
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="w-full flex items-center justify-between p-4 bg-white dark:bg-slate-800 rounded-lg shadow-md hover:shadow-lg transition-shadow"
          >
            <div className="flex items-center gap-2">
              <Settings className="h-5 w-5 text-slate-600 dark:text-slate-400" />
              <span className="font-medium text-slate-900 dark:text-slate-100">
                Processing Options
              </span>
            </div>
            {showSettings ? (
              <ChevronUp className="h-5 w-5 text-slate-600 dark:text-slate-400" />
            ) : (
              <ChevronDown className="h-5 w-5 text-slate-600 dark:text-slate-400" />
            )}
          </button>

          <AnimatePresence>
            {showSettings && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="mt-2 p-6 bg-white dark:bg-slate-800 rounded-lg shadow-md space-y-6">
                  {/* Quality Preset */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                        Quality Preset
                      </label>
                      {profile?.subscription_tier === 'free' && (
                        <span className="text-xs text-amber-600 dark:text-amber-400 flex items-center gap-1">
                          <Lock className="h-3 w-3" />
                          Upgrade for HD quality
                        </span>
                      )}
                    </div>
                    <div className="relative">
                      <select
                        value={options.quality}
                        onChange={(e) => {
                          if (profile?.subscription_tier === 'free') {
                            toast.info('Quality locked to Standard', {
                              description: 'Upgrade to Pro for HD quality options',
                              action: {
                                label: 'Upgrade',
                                onClick: () => window.location.href = '/pricing'
                              }
                            })
                            return
                          }
                          setOptions({ ...options, quality: e.target.value as "fast" | "good" | "best" })
                          toast.success('Quality preset updated')
                        }}
                        disabled={profile?.subscription_tier === 'free'}
                        className={`w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-green-500 ${
                          profile?.subscription_tier === 'free' ? 'opacity-60 cursor-not-allowed' : ''
                        }`}
                      >
                        <option value="fast">
                          {profile?.subscription_tier === 'free' ? 'Standard (Free Tier)' : 'Fast (Lower quality, faster processing)'}
                        </option>
                        <option value="good" disabled={profile?.subscription_tier === 'free'}>
                          {profile?.subscription_tier === 'free' ? '🔒 Good (Pro Only)' : 'Good (Balanced - Recommended)'}
                        </option>
                        <option value="best" disabled={profile?.subscription_tier === 'free'}>
                          {profile?.subscription_tier === 'free' ? '🔒 Best (Pro Only)' : 'Best (Higher quality, slower processing)'}
                        </option>
                      </select>
                      {profile?.subscription_tier === 'free' && (
                        <div className="absolute inset-y-0 right-10 flex items-center pointer-events-none">
                          <Lock className="h-4 w-4 text-slate-400" />
                        </div>
                      )}
                    </div>
                    {profile?.subscription_tier === 'free' && (
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                        Free tier uses standard quality. <a href="/pricing" className="text-green-600 dark:text-green-400 hover:underline">Upgrade to Pro</a> for HD quality options.
                      </p>
                    )}
                  </div>

                  {/* Chroma Tolerance */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      Chroma Tolerance: {options.chromaTolerance.toFixed(2)}
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.01"
                      value={options.chromaTolerance}
                      onChange={(e) =>
                        setOptions({ ...options, chromaTolerance: parseFloat(e.target.value) })
                      }
                      className="w-full"
                    />
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                      Adjust if green screen isn't uniform. Higher = removes more green (recommended: 0.2-0.4).
                    </p>
                  </div>

                  {/* Processing Speed */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      Processing Speed: {options.processingSpeed}
                    </label>
                    <input
                      type="range"
                      min="1"
                      max="5"
                      step="1"
                      value={options.processingSpeed}
                      onChange={(e) =>
                        setOptions({ ...options, processingSpeed: parseInt(e.target.value) })
                      }
                      className="w-full"
                    />
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                      Higher = faster encoding, lower quality. Recommended: 4
                    </p>
                  </div>

                  {/* Background Color */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      Green Screen Color
                    </label>
                    <div className="flex items-center gap-3">
                      <input
                        type="color"
                        value={options.backgroundColor}
                        onChange={(e) =>
                          setOptions({ ...options, backgroundColor: e.target.value })
                        }
                        className="h-10 w-20 rounded border border-slate-300 dark:border-slate-600 cursor-pointer"
                      />
                      <input
                        type="text"
                        value={options.backgroundColor}
                        onChange={(e) =>
                          setOptions({ ...options, backgroundColor: e.target.value })
                        }
                        className="flex-1 px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-green-500"
                        placeholder="#00FF00"
                      />
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                      Use if your green screen isn't pure green (#00FF00)
                    </p>
                  </div>

                  {/* Codec Selection */}
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <input
                        type="checkbox"
                        id="enableCodec"
                        checked={options.enableCodecOverride}
                        onChange={(e) =>
                          setOptions({ ...options, enableCodecOverride: e.target.checked })
                        }
                        className="w-4 h-4 rounded border-slate-300 dark:border-slate-600"
                      />
                      <label htmlFor="enableCodec" className="text-sm font-medium text-slate-700 dark:text-slate-300 cursor-pointer">
                        Override Video Codec
                      </label>
                    </div>
                    {options.enableCodecOverride && (
                      <select
                        value={options.codec}
                        onChange={(e) =>
                          setOptions({ ...options, codec: e.target.value as "vp8" | "vp9" })
                        }
                        className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-green-500"
                      >
                        <option value="vp8">VP8 (Unity optimized, default)</option>
                        <option value="vp9">VP9 (Higher quality, larger files)</option>
                      </select>
                    )}
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                      {options.enableCodecOverride 
                        ? "VP8 is recommended for Unity games. VP9 offers better compression."
                        : "Uses VP8 by default. Enable to choose VP9."}
                    </p>
                  </div>

                  {/* Output Width */}
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <input
                        type="checkbox"
                        id="enableResize"
                        checked={options.enableResize}
                        onChange={(e) =>
                          setOptions({ ...options, enableResize: e.target.checked })
                        }
                        className="w-4 h-4 rounded border-slate-300 dark:border-slate-600"
                      />
                      <label htmlFor="enableResize" className="text-sm font-medium text-slate-700 dark:text-slate-300 cursor-pointer">
                        Resize Output
                      </label>
                    </div>
                    {options.enableResize && (
                      <>
                        <input
                          type="range"
                          min="512"
                          max="3840"
                          step="2"
                          value={options.outputWidth}
                          onChange={(e) =>
                            setOptions({ ...options, outputWidth: parseInt(e.target.value) })
                          }
                          className="w-full"
                        />
                        <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400 mt-1">
                          <span>512px</span>
                          <span>{options.outputWidth}px</span>
                          <span>3840px (4K)</span>
                        </div>
                      </>
                    )}
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                      {options.enableResize
                        ? "Height scales automatically to maintain aspect ratio."
                        : "Keeps original video dimensions. Enable to resize."}
                    </p>
                  </div>

                  {/* Reset Button */}
                  <button
                    onClick={() => {
                      setOptions(defaultOptions)
                      toast.success('Settings reset to defaults')
                    }}
                    className="w-full px-4 py-2 text-sm text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 border border-slate-300 dark:border-slate-600 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                  >
                    Reset to Defaults
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Upload Zone */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="max-w-4xl mx-auto mb-8"
        >
          <div
            {...getRootProps()}
            className={`
              border-2 border-dashed rounded-xl p-12 text-center cursor-pointer
              transition-all duration-300 relative overflow-hidden
              ${
                isDragActive
                  ? "border-green-500 bg-green-50 dark:bg-green-900/20 scale-105 shadow-2xl"
                  : "border-slate-300 dark:border-slate-700 hover:border-green-400 dark:hover:border-green-600"
              }
            `}
          >
            <input {...getInputProps()} />
            
            {/* Animated upload icon on drag */}
            <AnimatePresence>
              {isDragActive && (
                <motion.div
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0 }}
                  className="absolute inset-0 flex items-center justify-center bg-green-500/10 backdrop-blur-sm"
                >
                  <motion.div
                    animate={{ y: [0, -20, 0] }}
                    transition={{ repeat: Infinity, duration: 1 }}
                  >
                    <Upload className="h-24 w-24 text-green-500" />
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
            
            <Upload className="mx-auto h-16 w-16 text-slate-400 mb-4" />
            {isDragActive ? (
              <p className="text-lg font-semibold text-green-600 dark:text-green-400">
                Drop your video here...
              </p>
            ) : (
              <>
                <p className="text-lg font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  Drag & drop your green-screen video
                </p>
                <p className="text-sm text-slate-500 dark:text-slate-500">
                  or click to browse (MP4, MOV, AVI up to 100MB)
                </p>
              </>
            )}
          </div>
        </motion.div>

        {/* Jobs List with Queue UI */}
        <div className="max-w-4xl mx-auto">
          <AnimatePresence>
            {jobs.map((job) => (
              <motion.div
                key={job.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-white dark:bg-slate-800 rounded-lg shadow-lg p-6 mb-4 relative"
              >
                {/* Remove button */}
                <button
                  onClick={() => removeJob(job.id)}
                  className="absolute top-4 right-4 p-2 text-slate-400 hover:text-red-500 transition-colors"
                  title="Remove from list"
                >
                  <Trash2 className="h-4 w-4" />
                </button>

                <div className="flex items-start gap-4">
                  {/* Thumbnail */}
                  {job.thumbnail && (
                    <img
                      src={job.thumbnail}
                      alt={job.filename}
                      className="w-24 h-24 object-cover rounded-lg"
                    />
                  )}
                  
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <Video className="h-5 w-5 text-slate-400" />
                      <span className="font-medium text-slate-900 dark:text-slate-100">
                        {job.filename}
                      </span>
                      {/* Status icons next to filename */}
                      {job.status === "completed" && (
                        <CheckCircle2 className="h-5 w-5 text-green-500" />
                      )}
                      {job.status === "error" && (
                        <XCircle className="h-5 w-5 text-red-500" />
                      )}
                      {job.status === "processing" && (
                        <Loader2 className="h-5 w-5 text-blue-500 animate-spin" />
                      )}
                      {job.status === "uploading" && (
                        <Loader2 className="h-5 w-5 text-blue-500 animate-spin" />
                      )}
                    </div>

                    {/* Video metadata */}
                    {(job.fileSize || job.duration || job.resolution || job.format) && (
                      <div className="flex flex-wrap items-center gap-3 mb-4 text-xs text-slate-500 dark:text-slate-400">
                        {job.format && (
                          <span className="px-2 py-1 bg-slate-100 dark:bg-slate-700 rounded">
                            {job.format}
                          </span>
                        )}
                        {job.fileSize && (
                          <span>{formatFileSize(job.fileSize)}</span>
                        )}
                        {job.duration && (
                          <span>{formatDuration(job.duration)}</span>
                        )}
                        {job.resolution && (
                          <span>{job.resolution}</span>
                        )}
                      </div>
                    )}

                    {/* Progress Bar */}
                    {(job.status === "uploading" || job.status === "processing") && (
                      <div className="mb-4">
                        <div className="flex justify-between text-sm text-slate-600 dark:text-slate-400 mb-2">
                          <div className="flex items-center gap-2">
                            <span>
                              {job.status === "uploading" ? "Uploading..." : "Processing..."}
                            </span>
                            {job.status === "processing" && (
                              <span className="flex items-center gap-1 text-xs text-slate-500">
                                <Clock className="h-3 w-3" />
                                {getEstimatedTime(job)}
                              </span>
                            )}
                          </div>
                          <span>{Math.round(job.progress)}%</span>
                        </div>
                        <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                          <motion.div
                            className="bg-gradient-to-r from-green-500 to-emerald-500 h-2 rounded-full"
                            initial={{ width: 0 }}
                            animate={{ width: `${job.progress}%` }}
                            transition={{ duration: 0.3 }}
                          />
                        </div>
                      </div>
                    )}

                    {/* Error Message */}
                    {job.status === "error" && job.error && (
                      <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded text-sm text-red-700 dark:text-red-400">
                        {job.error}
                      </div>
                    )}

                    {/* Download Button & Preview */}
                    {job.status === "completed" && job.downloadUrl && (
                      <div className="space-y-4">
                        {/* Watermark notice for free tier */}
                        {job.has_watermark && (
                          <div className="flex items-center justify-between p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
                            <div className="flex items-center gap-2">
                              <Zap className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                              <span className="text-sm text-amber-800 dark:text-amber-200">
                                This video includes a watermark
                              </span>
                            </div>
                            <button
                              onClick={() => {
                                setUpgradeReason("no_watermark")
                                setShowUpgrade(true)
                              }}
                              className="text-sm font-medium text-amber-600 dark:text-amber-400 hover:text-amber-700 dark:hover:text-amber-300 underline"
                            >
                              Remove watermark
                            </button>
                          </div>
                        )}
                        
                        <div className="flex items-center gap-3 flex-wrap">
                          <a
                            href={job.downloadUrl}
                            download
                            className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
                          >
                            <Download className="h-4 w-4" />
                            Download WEBM
                          </a>
                          <button
                            onClick={() => copyDownloadLink(job.downloadUrl!, job.filename)}
                            className="inline-flex items-center gap-2 px-4 py-2 bg-slate-600 hover:bg-slate-700 text-white rounded-lg transition-colors"
                          >
                            <Copy className="h-4 w-4" />
                            Copy Link
                          </button>
                          <button
                            onClick={() => setExpandedPreview(expandedPreview === job.id ? null : job.id)}
                            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                          >
                            <Eye className="h-4 w-4" />
                            {expandedPreview === job.id ? "Hide" : "Test"} Transparency
                          </button>
                        </div>

                        {/* Transparency Test Preview */}
                        {expandedPreview === job.id && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            className="mt-4 p-4 bg-slate-50 dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-700"
                          >
                            <div className="mb-3">
                              <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">
                                Transparency Test
                              </h3>
                              <p className="text-xs text-slate-500 dark:text-slate-400">
                                The checkerboard background should show through transparent areas. If you see green, adjust chroma tolerance.
                              </p>
                            </div>
                            <div
                              className="relative rounded-lg overflow-hidden"
                              style={{
                                background: "repeating-linear-gradient(45deg, #ff6b6b, #ff6b6b 20px, #4ecdc4 20px, #4ecdc4 40px)",
                                padding: "20px",
                              }}
                            >
                              <video
                                src={job.downloadUrl}
                                controls
                                autoPlay
                                loop
                                className="w-full h-auto rounded-lg shadow-lg"
                                style={{ maxHeight: "400px" }}
                              >
                                Your browser does not support the video tag.
                              </video>
                            </div>
                          </motion.div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Recently Processed Videos */}
        {recentVideos.length > 0 && jobs.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-4xl mx-auto mt-8"
          >
            <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4 flex items-center gap-2">
              <Zap className="h-5 w-5 text-green-500" />
              Recent Videos
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {recentVideos.slice(0, 8).map((video, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: idx * 0.1 }}
                  className="relative group cursor-pointer bg-white dark:bg-slate-800 rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-all"
                >
                  {/* Remove button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      removeFromRecent(idx)
                    }}
                    className="absolute top-2 right-2 z-10 p-1.5 bg-red-500/80 hover:bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    title="Remove"
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>

                  {video.thumbnail ? (
                    <img
                      src={video.thumbnail}
                      alt={video.filename}
                      className="w-full h-32 object-cover"
                    />
                  ) : (
                    <div className="w-full h-32 bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center">
                      <Video className="h-12 w-12 text-white" />
                    </div>
                  )}
                  <div className="p-2">
                    <p className="text-xs text-slate-600 dark:text-slate-400 truncate">
                      {video.filename}
                    </p>
                  </div>
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <a
                      href={video.downloadUrl}
                      download
                      className="px-3 py-2 bg-green-600 hover:bg-green-700 text-white text-sm rounded-lg"
                      onClick={(e) => {
                        e.preventDefault()
                        const a = document.createElement('a')
                        a.href = video.downloadUrl
                        a.download = video.filename.replace(/\.[^/.]+$/, ".webm")
                        a.click()
                        toast.success('Downloading...', { description: video.filename })
                      }}
                    >
                      Download
                    </a>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Info Footer */}
        {jobs.length === 0 && recentVideos.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="max-w-2xl mx-auto mt-12 text-center text-sm text-slate-500 dark:text-slate-400"
          >
            <p>
              Upload a green-screen video to automatically process it into an
              alpha-enabled WEBM file ready for Unity.
            </p>
          </motion.div>
        )}
        
        {/* Build Version Footer */}
        <div className="fixed bottom-2 right-2 text-xs text-slate-400 dark:text-slate-600 bg-slate-100/80 dark:bg-slate-800/80 px-2 py-1 rounded backdrop-blur-sm">
          Build: {process.env.NEXT_PUBLIC_BUILD_ID || 'dev'}
        </div>
      </div>

      {/* Modals */}
      <LoginModal isOpen={showLogin} onClose={() => setShowLogin(false)} />
      <UpgradePrompt
        isOpen={showUpgrade}
        onClose={() => setShowUpgrade(false)}
        reason={upgradeReason}
        videosUsed={usageInfo?.used}
        videosLimit={usageInfo?.limit}
      />
    </div>
  )
}
