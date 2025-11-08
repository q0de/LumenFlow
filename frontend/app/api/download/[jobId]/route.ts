import { NextRequest, NextResponse } from "next/server"
import { readFile, readdir, stat } from "fs/promises"
import { join } from "path"
import { getJob } from "@/lib/jobs-supabase"

export async function GET(
  request: NextRequest,
  { params }: { params: { jobId: string } }
) {
  try {
    const { jobId } = params
    // On Render: use persistent disk (same as upload, default /data)
    // On local: use ../webm
    const isProduction = process.env.NODE_ENV === "production"
    const baseDir = isProduction ? (process.env.STORAGE_PATH || "/data") : join(process.cwd(), "..")
    const webmDir = isProduction ? join(baseDir, "webm") : join(process.cwd(), "..", "webm")
    
    console.log(`Download request for job ${jobId}, webmDir: ${webmDir}`)
    
    let webmFile: string | undefined
    
    // Try to get job from Supabase
    const job = await getJob(jobId)
    console.log(`Job from Supabase:`, { 
      hasJob: !!job, 
      outputFilename: job?.outputFilename,
      status: job?.status,
      progress: job?.progress 
    })
    
    if (job?.outputFilename) {
      // Use the stored filename
      webmFile = job.outputFilename
      const filePath = join(webmDir, webmFile)
      console.log(`Trying to read file: ${filePath}`)
      try {
        await readFile(filePath) // Verify file exists
        console.log(`✅ File found: ${filePath}`)
      } catch (error) {
        console.warn(`❌ File not found at ${filePath}, error:`, error)
        webmFile = undefined // File doesn't exist, fall back to search
      }
    }
    
    // If no job or file not found, search webm directory
    if (!webmFile) {
      try {
        console.log(`Searching webm directory: ${webmDir}`)
        const files = await readdir(webmDir)
        console.log(`Found ${files.length} files in webm directory:`, files)
        
        // Try to find file by jobId (if filename contains jobId)
        webmFile = files.find((f) => 
          f.endsWith(".webm") && f.includes(jobId)
        )
        console.log(`File found by jobId search: ${webmFile || 'none'}`)
        
        // If still not found, get the most recent WEBM file
        // (likely the one just processed)
        if (!webmFile && files.length > 0) {
          const webmFiles = files.filter(f => f.endsWith(".webm"))
          console.log(`Found ${webmFiles.length} WEBM files, getting most recent`)
          if (webmFiles.length > 0) {
            // Get the most recently modified file
            const fileStats = await Promise.all(
              webmFiles.map(async (f) => {
                const fileStat = await stat(join(webmDir, f))
                return { file: f, mtime: fileStat.mtime }
              })
            )
            fileStats.sort((a, b) => b.mtime.getTime() - a.mtime.getTime())
            webmFile = fileStats[0].file
            console.log(`Most recent WEBM file: ${webmFile}`)
          }
        }
      } catch (dirError) {
        // Directory doesn't exist or can't be read
        console.error("Error reading webm directory:", dirError)
      }
    }

    if (!webmFile) {
      return NextResponse.json(
        { 
          error: "File not found. The processed video may not exist or the job may have expired.",
          jobId,
          hint: "Try processing the video again."
        },
        { status: 404 }
      )
    }

    const filePath = join(webmDir, webmFile)
    
    // Verify file exists and is readable
    try {
      const fileBuffer = await readFile(filePath)
      
      return new NextResponse(fileBuffer, {
        headers: {
          "Content-Type": "video/webm",
          "Content-Disposition": `attachment; filename="${webmFile}"`,
          "Content-Length": fileBuffer.length.toString(),
        },
      })
    } catch (fileError) {
      return NextResponse.json(
        { 
          error: "File exists but could not be read",
          file: webmFile,
          details: fileError instanceof Error ? fileError.message : String(fileError)
        },
        { status: 500 }
      )
    }
  } catch (error: any) {
    return NextResponse.json(
      { 
        error: "Download failed",
        details: error.message || String(error)
      },
      { status: 500 }
    )
  }
}

