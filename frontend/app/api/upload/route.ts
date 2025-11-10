import { NextRequest, NextResponse } from "next/server"
import { writeFile, mkdir, stat } from "fs/promises"
import { join } from "path"
import { v4 as uuidv4 } from "uuid"
import { spawn } from "child_process"
import { getJob, setJob } from "@/lib/jobs-supabase"
import { createServerClient } from "@/lib/supabase"
import { incrementUsage, shouldAddWatermark } from "@/lib/usage"

interface ProcessingOptions {
  quality: "fast" | "good" | "best"
  chromaTolerance: number
  processingSpeed: number
  backgroundColor: string
  autoDetectColor?: boolean // Optional - defaults to false
  enableCodecOverride: boolean
  codec: "vp8" | "vp9"
  enableResize: boolean
  outputWidth: number
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get("file") as File
    const optionsJson = formData.get("options") as string

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    // Parse options or use defaults
    let options: ProcessingOptions = {
      quality: "good",
      chromaTolerance: 0.1,
      processingSpeed: 4,
      backgroundColor: "#00FF00",
      enableCodecOverride: true, // Enable codec selection by default
      codec: "vp8", // VP8 for Unity compatibility (default)
      enableResize: true, // Enable resize by default
      outputWidth: 1354 // Unity optimized width (default)
    }

    if (optionsJson) {
      try {
        options = { ...options, ...JSON.parse(optionsJson) }
      } catch (e) {
        // Invalid options, use defaults
      }
    }

    // Generate job ID
    const jobId = uuidv4()
    const filename = file.name
    const fileExtension = filename.split(".").pop()
    // Sanitize filename: remove special characters, replace spaces with hyphens
    const sanitizedFilename = filename
      .replace(/\.[^/.]+$/, "") // Remove extension
      .replace(/[^\w\s-]/g, "") // Remove special chars except spaces, hyphens, underscores
      .replace(/\s+/g, '-') // Replace spaces with hyphens
      .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen
      .toLowerCase()
    
    const baseFilename = sanitizedFilename || `video-${Date.now()}`

    // Ensure directories exist
    // On Render: use persistent disk (default /data, configurable via STORAGE_PATH)
    // On local: use ../input, ../keyed, ../webm
    const isProduction = process.env.NODE_ENV === "production"
    const baseDir = isProduction ? (process.env.STORAGE_PATH || "/data") : join(process.cwd(), "..")
    const inputDir = join(baseDir, "input")
    const keyedDir = join(baseDir, "keyed")
    const webmDir = join(baseDir, "webm")

    console.log(`📁 Storage paths - baseDir: ${baseDir}, webmDir: ${webmDir}`)
    await mkdir(inputDir, { recursive: true })
    await mkdir(keyedDir, { recursive: true })
    await mkdir(webmDir, { recursive: true })
    console.log(`✅ Directories created successfully`)

    // Save uploaded file
    const inputPath = join(inputDir, `${jobId}.${fileExtension}`)
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    await writeFile(inputPath, buffer)

    // Check authentication (optional for first upload)
    process.stderr.write('🔐 Checking authentication...\n')
    
    // Get auth token from header
    const authHeader = request.headers.get('authorization')
    const token = authHeader?.replace('Bearer ', '')
    process.stderr.write(`🔑 Auth header present: ${!!authHeader}\n`)
    process.stderr.write(`🔑 Token present: ${!!token}\n`)
    
    const supabase = createServerClient()
    const { data: { user } } = token 
      ? await supabase.auth.getUser(token)
      : { data: { user: null } }
    
    let userId: string | null = null
    let userTier: "free" | "pro" = "free"
    let addWatermark = true // Always watermark for free/anonymous users

    if (user) {
      process.stderr.write(`✅ User authenticated: ${user.email}\n`)
      userId = user.id
      
      // Get user profile to check tier
      const { data: profile } = await supabase
        .from('profiles')
        .select('subscription_tier')
        .eq('id', user.id)
        .single()
      
      process.stderr.write(`📊 Profile: ${JSON.stringify(profile)}\n`)
      
      if (profile) {
        userTier = profile.subscription_tier as "free" | "pro"
        addWatermark = shouldAddWatermark(userTier)
        
        process.stderr.write(`🎯 User tier: ${userTier}\n`)
        process.stderr.write(`🖼️ Add watermark?: ${addWatermark}\n`)
        
        // Increment usage count for authenticated users
        await incrementUsage(user.id).catch(err => {
          console.error('Failed to increment usage:', err)
        })
      }
    } else {
      process.stderr.write(`👤 Anonymous user - allowing trial upload\n`)
      addWatermark = true // Always watermark for anonymous users
    }

    process.stderr.write(`🎨 FINAL DECISION: addWatermark = ${addWatermark}, userId = ${userId || 'anonymous'}\n`)

    // Initialize job in Supabase with user ownership
    await setJob(jobId, {
      status: "processing",
      progress: 10,
      filename: filename,
      options: options,
      has_watermark: addWatermark,
      userId: userId, // Associate job with user
    })

    // Process video asynchronously with options
    processVideo(jobId, inputPath, baseFilename, keyedDir, webmDir, options, addWatermark, userTier).catch(
      async (error) => {
        await setJob(jobId, {
          status: "error",
          progress: 0,
          error: error.message,
        })
      }
    )

    return NextResponse.json({ jobId, filename })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Upload failed" },
      { status: 500 }
    )
  }
}

// Auto-detect dominant green color from video
async function detectGreenScreenColor(inputPath: string): Promise<string> {
  return new Promise((resolve, reject) => {
    process.stderr.write(`🎨 Auto-detecting green screen color from video...\n`)
    
    // Sample from corners and edges where green screen is most pure
    // We'll take multiple samples and find the most saturated green
    // This avoids sampling the subject and lighting variations
    const ffmpeg = spawn('ffmpeg', [
      '-i', inputPath,
      '-vf', 'crop=200:200:0:0,scale=1:1', // Sample top-left corner 200x200, average to 1 pixel
      '-vframes', '1',
      '-f', 'rawvideo',
      '-pix_fmt', 'rgb24',
      'pipe:1'
    ])

    let colorData = Buffer.alloc(0)

    ffmpeg.stdout.on('data', (data: Buffer) => {
      colorData = Buffer.concat([colorData, data])
    })

    ffmpeg.stderr.on('data', (data: Buffer) => {
      // Suppress FFmpeg stderr for color detection
    })

    ffmpeg.on('close', (code) => {
      if (code !== 0 || colorData.length < 3) {
        process.stderr.write(`⚠️ Color detection failed, using default green\n`)
        resolve('#00FF00') // Fallback to default
        return
      }

      // Get RGB values from the averaged pixel
      const r = colorData[0]
      const g = colorData[1]
      const b = colorData[2]

      // Validate it's actually green-ish (G should be significantly higher than R and B)
      // More strict validation: green must be at least 30% higher than red and blue
      if (g < r * 1.3 || g < b * 1.3 || g < 80) {
        process.stderr.write(`⚠️ Detected color is not green enough (R:${r}, G:${g}, B:${b}), using default\n`)
        resolve('#00FF00') // Fallback to default green
        return
      }

      // Normalize the color to avoid overly specific detection
      // This makes the chroma key more forgiving
      // Boost green channel slightly and reduce red/blue for cleaner keying
      const normalizedR = Math.max(0, Math.min(255, Math.floor(r * 0.8)))
      const normalizedG = Math.max(0, Math.min(255, Math.floor(g * 1.05)))
      const normalizedB = Math.max(0, Math.min(255, Math.floor(b * 0.8)))

      // Convert to hex
      const hex = `#${normalizedR.toString(16).padStart(2, '0')}${normalizedG.toString(16).padStart(2, '0')}${normalizedB.toString(16).padStart(2, '0')}`.toUpperCase()
      
      process.stderr.write(`✅ Detected green screen color: ${hex} (Original: R:${r}, G:${g}, B:${b}, Normalized: R:${normalizedR}, G:${normalizedG}, B:${normalizedB})\n`)
      resolve(hex)
    })

    ffmpeg.on('error', (error) => {
      process.stderr.write(`⚠️ Color detection error: ${error.message}, using default\n`)
      resolve('#00FF00') // Fallback
    })
  })
}

async function processVideo(
  jobId: string,
  inputPath: string,
  baseFilename: string,
  keyedDir: string,
  webmDir: string,
  options: ProcessingOptions,
  addWatermark: boolean = false,
  userTier: "free" | "pro" = "free"
) {
  return new Promise<void>(async (resolve, reject) => {
    try {
      // Map quality to CRF values - FREE TIER GETS LOWER QUALITY
      // Lower CRF = better quality, Higher CRF = more compression
      // CRF scale: 0 (lossless) to 63 (worst quality)
      // Recommended: 15-35 for good quality, 40+ for heavy compression
      const qualityMap = userTier === "free" 
        ? {
            fast: 45,   // Free tier: heavily compressed
            good: 45,   // Free tier: locked to same quality
            best: 45    // Free tier: locked to same quality
          }
        : {
            fast: 15,   // Pro: high quality
            good: 10,   // Pro: excellent quality (recommended)
            best: 4     // Pro: near-lossless quality
          }

      const crf = qualityMap[options.quality]
      
      // Pro users get better encoding settings for higher quality
      // Free users: fast encoding (realtime deadline, cpu-used 4)
      // Pro users: quality encoding (good deadline, cpu-used 0-1)
      const deadline = userTier === "pro" ? "good" : "realtime"
      const cpuUsed = userTier === "pro" 
        ? (options.quality === "best" ? 0 : 1)  // 0 = slowest/best, 1 = very good
        : 4  // 4 = fast for free tier
      
      process.stderr.write(`🎬 Quality settings - Tier: ${userTier}, CRF: ${crf}, Deadline: ${deadline}, CPU: ${cpuUsed}, Selected: ${options.quality}\n`)
      
      // Auto-detect green screen color if enabled
      let detectedColor = options.backgroundColor
      if (options.autoDetectColor === true) {
        detectedColor = await detectGreenScreenColor(inputPath)
        process.stderr.write(`🎨 Using auto-detected color: ${detectedColor}\n`)
      } else {
        process.stderr.write(`🎨 Using manual color: ${detectedColor}\n`)
      }
      
      const bgColor = detectedColor.replace("#", "")
      const tolerance = options.chromaTolerance

      // OPTIMIZED: Single-pass processing (combines chroma key + WEBM conversion)
      await setJob(jobId, { status: "processing", progress: 20 })
      const webmPath = join(webmDir, `${baseFilename}.webm`)

      // Improved chroma keying with better filter chain
      // Using colorkey filter for more predictable results that match preview
      // similarity: 0.0-1.0 (color distance threshold, higher = removes more)
      // blend: 0.0-1.0 (edge blending for smooth transitions)
      // Convert tolerance (0.1-0.5) to similarity (0.01-0.5) for better control
      // This should match the client-side Euclidean distance calculation
      const similarity = tolerance // Direct mapping for consistency with preview
      const blend = 0.1 // Moderate blend for smooth edges
      
      // Use colorkey filter - more predictable color distance matching
      // colorkey=color:similarity:blend
      // Optionally resize based on user options
      // Add watermark for free tier users
      // Then convert to yuva420p format to ensure alpha is preserved
      const filters = [
        `colorkey=0x${bgColor.toUpperCase()}:${similarity}:${blend}`,
        ...(options.enableResize ? [`scale=${options.outputWidth}:-1`] : []),
        ...(addWatermark ? [
          // Diagonal repeating watermark pattern (waterfall effect)
          // Multiple rows and columns of semi-transparent text
          // Using DejaVu Sans font (installed in Dockerfile)
          `drawtext=text='GreenScreenRemover.com':fontfile=/usr/share/fonts/ttf-dejavu/DejaVuSans.ttf:fontsize=28:fontcolor=white@0.25:x=50:y=50`,
          `drawtext=text='GreenScreenRemover.com':fontfile=/usr/share/fonts/ttf-dejavu/DejaVuSans.ttf:fontsize=28:fontcolor=white@0.25:x=50:y=200`,
          `drawtext=text='GreenScreenRemover.com':fontfile=/usr/share/fonts/ttf-dejavu/DejaVuSans.ttf:fontsize=28:fontcolor=white@0.25:x=50:y=350`,
          `drawtext=text='GreenScreenRemover.com':fontfile=/usr/share/fonts/ttf-dejavu/DejaVuSans.ttf:fontsize=28:fontcolor=white@0.25:x=50:y=500`,
          `drawtext=text='GreenScreenRemover.com':fontfile=/usr/share/fonts/ttf-dejavu/DejaVuSans.ttf:fontsize=28:fontcolor=white@0.25:x=50:y=650`,
          `drawtext=text='GreenScreenRemover.com':fontfile=/usr/share/fonts/ttf-dejavu/DejaVuSans.ttf:fontsize=28:fontcolor=white@0.25:x=50:y=800`,
          `drawtext=text='GreenScreenRemover.com':fontfile=/usr/share/fonts/ttf-dejavu/DejaVuSans.ttf:fontsize=28:fontcolor=white@0.25:x=400:y=125`,
          `drawtext=text='GreenScreenRemover.com':fontfile=/usr/share/fonts/ttf-dejavu/DejaVuSans.ttf:fontsize=28:fontcolor=white@0.25:x=400:y=275`,
          `drawtext=text='GreenScreenRemover.com':fontfile=/usr/share/fonts/ttf-dejavu/DejaVuSans.ttf:fontsize=28:fontcolor=white@0.25:x=400:y=425`,
          `drawtext=text='GreenScreenRemover.com':fontfile=/usr/share/fonts/ttf-dejavu/DejaVuSans.ttf:fontsize=28:fontcolor=white@0.25:x=400:y=575`,
          `drawtext=text='GreenScreenRemover.com':fontfile=/usr/share/fonts/ttf-dejavu/DejaVuSans.ttf:fontsize=28:fontcolor=white@0.25:x=400:y=725`,
          `drawtext=text='GreenScreenRemover.com':fontfile=/usr/share/fonts/ttf-dejavu/DejaVuSans.ttf:fontsize=28:fontcolor=white@0.25:x=750:y=50`,
          `drawtext=text='GreenScreenRemover.com':fontfile=/usr/share/fonts/ttf-dejavu/DejaVuSans.ttf:fontsize=28:fontcolor=white@0.25:x=750:y=200`,
          `drawtext=text='GreenScreenRemover.com':fontfile=/usr/share/fonts/ttf-dejavu/DejaVuSans.ttf:fontsize=28:fontcolor=white@0.25:x=750:y=350`,
          `drawtext=text='GreenScreenRemover.com':fontfile=/usr/share/fonts/ttf-dejavu/DejaVuSans.ttf:fontsize=28:fontcolor=white@0.25:x=750:y=500`,
          `drawtext=text='GreenScreenRemover.com':fontfile=/usr/share/fonts/ttf-dejavu/DejaVuSans.ttf:fontsize=28:fontcolor=white@0.25:x=750:y=650`,
          `drawtext=text='GreenScreenRemover.com':fontfile=/usr/share/fonts/ttf-dejavu/DejaVuSans.ttf:fontsize=28:fontcolor=white@0.25:x=750:y=800`,
          `drawtext=text='GreenScreenRemover.com':fontfile=/usr/share/fonts/ttf-dejavu/DejaVuSans.ttf:fontsize=28:fontcolor=white@0.25:x=1100:y=125`,
          `drawtext=text='GreenScreenRemover.com':fontfile=/usr/share/fonts/ttf-dejavu/DejaVuSans.ttf:fontsize=28:fontcolor=white@0.25:x=1100:y=275`,
          `drawtext=text='GreenScreenRemover.com':fontfile=/usr/share/fonts/ttf-dejavu/DejaVuSans.ttf:fontsize=28:fontcolor=white@0.25:x=1100:y=425`,
          `drawtext=text='GreenScreenRemover.com':fontfile=/usr/share/fonts/ttf-dejavu/DejaVuSans.ttf:fontsize=28:fontcolor=white@0.25:x=1100:y=575`,
          `drawtext=text='GreenScreenRemover.com':fontfile=/usr/share/fonts/ttf-dejavu/DejaVuSans.ttf:fontsize=28:fontcolor=white@0.25:x=1100:y=725`
        ] : []),
        'format=yuva420p'
      ]
      const keyFilter = filters.join(',')
      
      console.log('🎬 FFmpeg filters:', filters)
      console.log('🎬 Watermark in filters?:', filters.some(f => f.includes('drawtext')))
      
      // Select codec based on user options (VP8 default, VP9 if overridden)
      const codecLib = (options.enableCodecOverride && options.codec === "vp9") ? "libvpx-vp9" : "libvpx" // VP8 default
      
      // Build FFmpeg command with progress reporting
      // Pro users: quality encoding (good deadline, low cpu-used)
      // Free users: fast encoding (realtime deadline, high cpu-used)
      const ffmpegArgs = [
        '-i', inputPath,
        '-vf', keyFilter,
        '-c:v', codecLib,
        '-pix_fmt', 'yuva420p',
        '-auto-alt-ref', '0',
        '-lag-in-frames', '0',
        '-deadline', deadline,
        '-crf', crf.toString(),
        '-b:v', '0',
        '-cpu-used', cpuUsed.toString(),
        ...(options.enableCodecOverride && options.codec === "vp9" ? ['-row-mt', '1'] : []), // VP9 specific optimization
        '-threads', '8',
        '-an', // No audio
        '-y', // Overwrite output
        webmPath
      ]

      process.stderr.write(`🎬 Starting FFmpeg processing for job ${jobId}\n`)
      process.stderr.write(`🎬 FFmpeg command: ffmpeg ${ffmpegArgs.join(' ')}\n`)
      const ffmpeg = spawn('ffmpeg', ffmpegArgs)

      let duration: number | null = null
      let lastProgress = 20

      // Parse FFmpeg progress output
      ffmpeg.stderr.on('data', (data: Buffer) => {
        const output = data.toString()
        
        // Log ALL FFmpeg output for debugging
        if (output.includes('Error') || output.includes('error') || output.includes('Invalid') || output.includes('failed')) {
          process.stderr.write(`🔴 FFmpeg Error Output: ${output}\n`)
        }
        
        // Extract duration (only once)
        if (!duration) {
          const durationMatch = output.match(/Duration: (\d{2}):(\d{2}):(\d{2})\.(\d{2})/)
          if (durationMatch) {
            const hours = parseInt(durationMatch[1])
            const minutes = parseInt(durationMatch[2])
            const seconds = parseInt(durationMatch[3])
            const centiseconds = parseInt(durationMatch[4])
            duration = hours * 3600 + minutes * 60 + seconds + centiseconds / 100
            process.stderr.write(`📹 Video duration: ${duration.toFixed(1)}s\n`)
          }
        }

        // Extract current time
        const timeMatch = output.match(/time=(\d{2}):(\d{2}):(\d{2})\.(\d{2})/)
        if (timeMatch && duration) {
          const hours = parseInt(timeMatch[1])
          const minutes = parseInt(timeMatch[2])
          const seconds = parseInt(timeMatch[3])
          const centiseconds = parseInt(timeMatch[4])
          const currentTime = hours * 3600 + minutes * 60 + seconds + centiseconds / 100
          
          // Calculate progress (20% to 95% - leave 5% for finalization)
          const progress = Math.min(20 + Math.floor((currentTime / duration) * 75), 95)
          
          // Update every 5% for cleaner logs (was 1%)
          if (progress >= lastProgress + 5 || progress === 95) {
            lastProgress = progress
            setJob(jobId, { status: "processing", progress }).catch(err => {
              process.stderr.write(`❌ Error updating progress: ${err}\n`)
            })
            process.stderr.write(`⏳ Progress: ${progress}% (${currentTime.toFixed(1)}s / ${duration.toFixed(1)}s)\n`)
          }
        }
      })

      // Handle FFmpeg completion
      ffmpeg.on('close', async (code) => {
        if (code === 0) {
          process.stderr.write(`✅ FFmpeg completed successfully for job ${jobId}\n`)
          const outputFilename = `${baseFilename}.webm`
          const fullOutputPath = join(webmDir, outputFilename)
          process.stderr.write(`📦 Output file: ${outputFilename}\n`)
          process.stderr.write(`📂 Full path: ${fullOutputPath}\n`)
          
          // Verify file exists
          try {
            const stats = await stat(fullOutputPath)
            process.stderr.write(`✅ File exists! Size: ${stats.size} bytes\n`)
          } catch (err) {
            process.stderr.write(`❌ File not found at ${fullOutputPath}: ${err}\n`)
          }
          
          process.stderr.write(`💾 Updating job status to completed with outputFilename: ${outputFilename}\n`)
          await setJob(jobId, {
            status: "completed",
            progress: 100,
            outputFilename,
          })
          process.stderr.write(`✅ Job ${jobId} marked as completed in database\n`)
          resolve()
        } else {
          const errorMsg = `FFmpeg exited with code ${code}`
          process.stderr.write(`❌ ${errorMsg}\n`)
          await setJob(jobId, {
            status: "error",
            progress: 0,
            error: errorMsg,
          })
          reject(new Error(errorMsg))
        }
      })

      // Handle FFmpeg errors
      ffmpeg.on('error', async (error) => {
        process.stderr.write(`❌ FFmpeg error: ${error.message}\n`)
        await setJob(jobId, {
          status: "error",
          progress: 0,
          error: error.message || "FFmpeg processing failed",
        })
        reject(error)
      })

    } catch (error: any) {
      await setJob(jobId, {
        status: "error",
        progress: 0,
        error: error.message || "Processing failed",
      })
      reject(error)
    }
  })
}

