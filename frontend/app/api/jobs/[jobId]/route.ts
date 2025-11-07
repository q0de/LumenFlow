import { NextRequest, NextResponse } from "next/server"
import { getJob } from "@/lib/jobs-supabase"

// Disable caching for this dynamic route - we need real-time job status
export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function GET(
  request: NextRequest,
  { params }: { params: { jobId: string } }
) {
  const { jobId } = params
  const job = await getJob(jobId)

  if (!job) {
    return NextResponse.json({ error: "Job not found" }, { status: 404 })
  }

  // Debug logging to see what we're sending to frontend
  console.log(`📤 Sending job data to frontend:`, {
    jobId,
    status: job.status,
    progress: job.progress,
    hasDownloadUrl: !!job.downloadUrl,
    downloadUrl: job.downloadUrl,
    outputFilename: job.outputFilename
  })

  return NextResponse.json(job)
}

