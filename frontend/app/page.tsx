"use client"

import { useState, useCallback, useEffect, useRef } from "react"
import { useDropzone } from "react-dropzone"
import { Upload, Video, Download, Loader2, CheckCircle2, XCircle, Settings, ChevronDown, ChevronUp, Eye } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { supabase, isSupabaseAvailable } from "@/lib/supabase"

interface ProcessingJob {
  id: string // Client-side ID
  serverJobId?: string // Server-side ID from Supabase
  filename: string
  status: "uploading" | "processing" | "completed" | "error"
  progress: number
  error?: string
  downloadUrl?: string
}

interface ProcessingOptions {
  quality: "fast" | "good" | "best"
  chromaTolerance: number
  processingSpeed: number
  backgroundColor: string
}

const defaultOptions: ProcessingOptions = {
  quality: "good",
  chromaTolerance: 0.3, // Balanced default - adjust if green remains or person is removed
  processingSpeed: 4,
  backgroundColor: "#00FF00"
}

export default function Home() {
  const [jobs, setJobs] = useState<ProcessingJob[]>([])
  const [isUploading, setIsUploading] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [options, setOptions] = useState<ProcessingOptions>(defaultOptions)
  const [expandedPreview, setExpandedPreview] = useState<string | null>(null)

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
  }, [])

  // Save options to localStorage when changed
  useEffect(() => {
    localStorage.setItem("lumenflow-options", JSON.stringify(options))
  }, [options])

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    for (const file of acceptedFiles) {
      if (!file.type.startsWith("video/")) {
        alert(`${file.name} is not a video file`)
        continue
      }

      const jobId = `job-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
      const newJob: ProcessingJob = {
        id: jobId,
        filename: file.name,
        status: "uploading",
        progress: 0,
      }

      setJobs((prev) => [...prev, newJob])
      setIsUploading(true)

      try {
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
      } catch (error) {
        setJobs((prev) =>
          prev.map((job) =>
            job.id === jobId
              ? { ...job, status: "error", error: String(error) }
              : job
          )
        )
      } finally {
        setIsUploading(false)
      }
    }
  }, [options])

  // Use Supabase real-time subscriptions with polling fallback
  const channelsRef = useRef<Map<string, any>>(new Map())
  const pollingIntervalsRef = useRef<Map<string, NodeJS.Timeout>>(new Map())

  // Polling fallback function
  const pollJobStatus = useCallback(async (serverJobId: string, clientJobId: string) => {
    try {
      const response = await fetch(`/api/jobs/${serverJobId}`)
      if (response.ok) {
        const job = await response.json()
        setJobs((prev) =>
          prev.map((j) => {
            if (j.id === clientJobId) {
              const status = job.status as ProcessingJob['status']
              const isCompleted = status === "completed"
              
              if (isCompleted || status === "error") {
                // Stop polling when done
                const interval = pollingIntervalsRef.current.get(clientJobId)
                if (interval) {
                  clearInterval(interval)
                  pollingIntervalsRef.current.delete(clientJobId)
                }
              }
              
              return {
                ...j,
                status,
                progress: job.progress ?? j.progress, // Use nullish coalescing to handle 0 properly
                error: job.error,
                downloadUrl: isCompleted ? `/api/download/${serverJobId}` : j.downloadUrl,
              }
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
      // Try real-time subscription
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
                    if (status === "completed") {
                      // Clean up subscription
                      const ch = channelsRef.current.get(clientJobId)
                      if (ch) {
                        supabase.removeChannel(ch)
                        channelsRef.current.delete(clientJobId)
                      }
                      return {
                        ...job,
                        status: "completed",
                        progress: 100,
                        downloadUrl: `/api/download/${serverJobId}`,
                      }
                    } else if (status === "error") {
                      // Clean up subscription
                      const ch = channelsRef.current.get(clientJobId)
                      if (ch) {
                        supabase.removeChannel(ch)
                        channelsRef.current.delete(clientJobId)
                      }
                      return {
                        ...job,
                        status: "error",
                        error: updatedJob.error || "Processing failed",
                      }
                    } else {
                      return {
                        ...job,
                        status,
                        progress: updatedJob.progress ?? job.progress,
                      }
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

    // Always start polling (works as primary method or backup)
    const pollInterval = setInterval(() => {
      pollJobStatus(serverJobId, clientJobId)
    }, 2000) // Poll every 2 seconds
    pollingIntervalsRef.current.set(clientJobId, pollInterval)
    
    // Also do an immediate poll to get current status
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
    }
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "video/*": [".mp4", ".mov", ".avi"],
    },
    maxSize: 100 * 1024 * 1024, // 100MB
  })

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-green-50 to-slate-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <div className="container mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
              🎬 LumenFlow
            </h1>
            <p className="text-xl text-slate-600 dark:text-slate-400">
              Transparent Actor Video Pipeline
            </p>
            <p className="text-sm text-slate-500 dark:text-slate-500 mt-2">
              AI-generated green-screen → Alpha WEBM for Unity
            </p>
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
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      Quality Preset
                    </label>
                    <select
                      value={options.quality}
                      onChange={(e) =>
                        setOptions({ ...options, quality: e.target.value as "fast" | "good" | "best" })
                      }
                      className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-green-500"
                    >
                      <option value="fast">Fast (Lower quality, faster processing)</option>
                      <option value="good">Good (Balanced - Recommended)</option>
                      <option value="best">Best (Higher quality, slower processing)</option>
                    </select>
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

                  {/* Reset Button */}
                  <button
                    onClick={() => setOptions(defaultOptions)}
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
              transition-all duration-300
              ${
                isDragActive
                  ? "border-green-500 bg-green-50 dark:bg-green-900/20"
                  : "border-slate-300 dark:border-slate-700 hover:border-green-400 dark:hover:border-green-600"
              }
            `}
          >
            <input {...getInputProps()} />
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

        {/* Jobs List */}
        <div className="max-w-4xl mx-auto">
          <AnimatePresence>
            {jobs.map((job) => (
              <motion.div
                key={job.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-white dark:bg-slate-800 rounded-lg shadow-lg p-6 mb-4"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <Video className="h-5 w-5 text-slate-400" />
                    <span className="font-medium text-slate-900 dark:text-slate-100">
                      {job.filename}
                    </span>
                  </div>
                  {job.status === "completed" && (
                    <CheckCircle2 className="h-5 w-5 text-green-500" />
                  )}
                  {job.status === "error" && (
                    <XCircle className="h-5 w-5 text-red-500" />
                  )}
                  {job.status === "processing" && (
                    <Loader2 className="h-5 w-5 text-blue-500 animate-spin" />
                  )}
                </div>

                {/* Progress Bar */}
                {(job.status === "uploading" || job.status === "processing") && (
                  <div className="mb-4">
                    <div className="flex justify-between text-sm text-slate-600 dark:text-slate-400 mb-2">
                      <span>
                        {job.status === "uploading" ? "Uploading..." : "Processing..."}
                      </span>
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
                    <div className="flex items-center gap-3">
                      <a
                        href={job.downloadUrl}
                        download
                        className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
                      >
                        <Download className="h-4 w-4" />
                        Download WEBM
                      </a>
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
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Info Footer */}
        {jobs.length === 0 && (
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
      </div>
    </div>
  )
}

