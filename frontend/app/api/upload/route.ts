import { NextRequest, NextResponse } from "next/server"
import { writeFile, mkdir, stat } from "fs/promises"
import { join } from "path"
import { v4 as uuidv4 } from "uuid"
import { spawn } from "child_process"
import { getJob, setJob } from "@/lib/jobs-supabase"

interface ProcessingOptions {
  quality: "fast" | "good" | "best"
  chromaTolerance: number
  processingSpeed: number
  backgroundColor: string
  codec: "vp8" | "vp9"
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
      codec: "vp8", // VP8 for Unity compatibility (default)
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
    const baseFilename = filename.replace(/\.[^/.]+$/, "")

    // Ensure directories exist
    // On Render/Railway: use persistent disk (default /data, configurable via STORAGE_PATH)
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

    // Initialize job in Supabase
    await setJob(jobId, {
      status: "processing",
      progress: 10,
      filename: filename,
      options: options,
    })

    // Process video asynchronously with options
    processVideo(jobId, inputPath, baseFilename, keyedDir, webmDir, options).catch(
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

async function processVideo(
  jobId: string,
  inputPath: string,
  baseFilename: string,
  keyedDir: string,
  webmDir: string,
  options: ProcessingOptions
) {
  return new Promise<void>(async (resolve, reject) => {
    try {
      // Map quality to CRF values
      const qualityMap = {
        fast: 40,
        good: 30,
        best: 20
      }

      const crf = qualityMap[options.quality]
      const bgColor = options.backgroundColor.replace("#", "")
      const tolerance = options.chromaTolerance
      const speed = options.processingSpeed

      // OPTIMIZED: Single-pass processing (combines chroma key + WEBM conversion)
      await setJob(jobId, { status: "processing", progress: 20 })
      const webmPath = join(webmDir, `${baseFilename}.webm`)

      // Improved chroma keying with better filter chain
      // Using chromakey filter (more reliable than colorkey)
      // similarity: 0.0-1.0 (how similar to key color, higher = removes more)
      // blend: 0.0-1.0 (edge blending, lower = sharper edges)
      // Map tolerance (0-1) to similarity range (0.15-0.5) for balanced green removal
      // Lower range prevents removing the subject
      const similarity = 0.15 + (tolerance * 0.35) // Range: 0.15 to 0.5 (balanced)
      const blend = 0.1 // Moderate blend for smoother edges
      
      // Use chromakey filter - creates alpha channel automatically
      // chromakey=color:similarity:blend
      // Resize based on user options (default 1354px for Unity)
      // Then convert to yuva420p format to ensure alpha is preserved
      const keyFilter = `chromakey=0x${bgColor.toUpperCase()}:${similarity}:${blend},scale=${options.outputWidth}:-1,format=yuva420p`
      
      // Select codec based on user options (VP8 or VP9)
      const codecLib = options.codec === "vp9" ? "libvpx-vp9" : "libvpx" // VP8 default
      
      // Build FFmpeg command with progress reporting
      // Optimizations for speed:
      // - -deadline realtime: prioritize speed over quality
      // - -cpu-used: higher = faster (already using speed parameter)
      const ffmpegArgs = [
        '-i', inputPath,
        '-vf', keyFilter,
        '-c:v', codecLib,
        '-pix_fmt', 'yuva420p',
        '-auto-alt-ref', '0',
        '-lag-in-frames', '0',
        '-deadline', 'realtime', // Prioritize speed
        '-crf', crf.toString(),
        '-b:v', '0',
        '-cpu-used', speed.toString(),
        ...(options.codec === "vp9" ? ['-row-mt', '1'] : []), // VP9 specific optimization
        '-threads', '8',
        '-an', // No audio
        '-y', // Overwrite output
        webmPath
      ]

      console.log(`Starting FFmpeg processing for job ${jobId}`)
      const ffmpeg = spawn('ffmpeg', ffmpegArgs)

      let duration: number | null = null
      let lastProgress = 20

      // Parse FFmpeg progress output
      ffmpeg.stderr.on('data', (data: Buffer) => {
        const output = data.toString()
        
        // Extract duration (only once)
        if (!duration) {
          const durationMatch = output.match(/Duration: (\d{2}):(\d{2}):(\d{2})\.(\d{2})/)
          if (durationMatch) {
            const hours = parseInt(durationMatch[1])
            const minutes = parseInt(durationMatch[2])
            const seconds = parseInt(durationMatch[3])
            const centiseconds = parseInt(durationMatch[4])
            duration = hours * 3600 + minutes * 60 + seconds + centiseconds / 100
            console.log(`Video duration: ${duration}s`)
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
          
          // Update every 1% for smooth progress bar (was 2%)
          if (progress > lastProgress) {
            lastProgress = progress
            setJob(jobId, { status: "processing", progress }).catch(err => {
              console.error('Error updating progress:', err)
            })
            console.log(`Progress: ${progress}% (${currentTime.toFixed(1)}s / ${duration.toFixed(1)}s)`)
          }
        }
      })

      // Handle FFmpeg completion
      ffmpeg.on('close', async (code) => {
        if (code === 0) {
          console.log(`✅ FFmpeg completed successfully for job ${jobId}`)
          const outputFilename = `${baseFilename}.webm`
          const fullOutputPath = join(webmDir, outputFilename)
          console.log(`📦 Output file: ${outputFilename}`)
          console.log(`📂 Full path: ${fullOutputPath}`)
          
          // Verify file exists
          try {
            const stats = await stat(fullOutputPath)
            console.log(`✅ File exists! Size: ${stats.size} bytes`)
          } catch (err) {
            console.error(`❌ File not found at ${fullOutputPath}:`, err)
          }
          
          console.log(`💾 Updating job status to completed with outputFilename: ${outputFilename}`)
          await setJob(jobId, {
            status: "completed",
            progress: 100,
            outputFilename,
          })
          console.log(`✅ Job ${jobId} marked as completed in database`)
          resolve()
        } else {
          const errorMsg = `FFmpeg exited with code ${code}`
          console.error(`❌ ${errorMsg}`)
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
        console.error('FFmpeg error:', error)
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

