import { NextRequest, NextResponse } from "next/server"
import { writeFile, mkdir } from "fs/promises"
import { join } from "path"
import { v4 as uuidv4 } from "uuid"
import { exec } from "child_process"
import { promisify } from "util"
import { getJob, setJob } from "@/lib/jobs-supabase"

const execAsync = promisify(exec)

interface ProcessingOptions {
  quality: "fast" | "good" | "best"
  chromaTolerance: number
  processingSpeed: number
  backgroundColor: string
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
      backgroundColor: "#00FF00"
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
    const inputDir = join(process.cwd(), "..", "input")
    const keyedDir = join(process.cwd(), "..", "keyed")
    const webmDir = join(process.cwd(), "..", "webm")

    await mkdir(inputDir, { recursive: true })
    await mkdir(keyedDir, { recursive: true })
    await mkdir(webmDir, { recursive: true })

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
    // Then convert to yuva420p format to ensure alpha is preserved
    const keyFilter = `chromakey=0x${bgColor.toUpperCase()}:${similarity}:${blend},format=yuva420p`
    
    // One command: chroma key + WEBM conversion (much faster!)
    // CRITICAL: format filter ensures alpha channel is preserved before encoding
    const combinedCmd = `ffmpeg -i "${inputPath}" -vf "${keyFilter}" -c:v libvpx-vp9 -pix_fmt yuva420p -auto-alt-ref 0 -lag-in-frames 0 -crf ${crf} -b:v 0 -speed ${speed} -row-mt 1 -threads 8 -an -y "${webmPath}"`

    await execAsync(combinedCmd)
    
    // Store the output filename for easy retrieval
    const outputFilename = `${baseFilename}.webm`
    
    await setJob(jobId, {
      status: "completed",
      progress: 100,
      outputFilename,
    })
  } catch (error: any) {
    await setJob(jobId, {
      status: "error",
      progress: 0,
      error: error.message || "Processing failed",
    })
  }
}

