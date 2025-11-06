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
    const webmDir = join(process.cwd(), "..", "webm")
    
    let webmFile: string | undefined
    
    // Try to get job from Supabase
    const job = await getJob(jobId)
    
    if (job?.outputFilename) {
      // Use the stored filename
      webmFile = job.outputFilename
      const filePath = join(webmDir, webmFile)
      try {
        await readFile(filePath) // Verify file exists
      } catch {
        webmFile = undefined // File doesn't exist, fall back to search
      }
    }
    
    // If no job or file not found, search webm directory
    if (!webmFile) {
      try {
        const files = await readdir(webmDir)
        
        // Try to find file by jobId (if filename contains jobId)
        webmFile = files.find((f) => 
          f.endsWith(".webm") && f.includes(jobId)
        )
        
        // If still not found, get the most recent WEBM file
        // (likely the one just processed)
        if (!webmFile && files.length > 0) {
          const webmFiles = files.filter(f => f.endsWith(".webm"))
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

