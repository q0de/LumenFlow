import { NextRequest, NextResponse } from "next/server"
import { getJob } from "@/lib/jobs-supabase"
import { createServerClient } from "@/lib/supabase"

// Disable caching for this dynamic route - we need real-time job status
export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function GET(
  request: NextRequest,
  { params }: { params: { jobId: string } }
) {
  const { jobId } = params
  
  // Get authenticated user
  const authHeader = request.headers.get('authorization')
  const token = authHeader?.replace('Bearer ', '')
  
  let userId: string | null = null
  if (token) {
    const supabase = createServerClient()
    const { data: { user } } = await supabase.auth.getUser(token)
    userId = user?.id || null
  }
  
  const job = await getJob(jobId)

  if (!job) {
    return NextResponse.json({ error: "Job not found" }, { status: 404 })
  }

  // Check if user owns this job (or if job is anonymous)
  if (job.userId && job.userId !== userId) {
    process.stderr.write(`🚫 Unauthorized access attempt - Job ${jobId} belongs to ${job.userId}, requested by ${userId}\n`)
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
  }

  // Debug logging to see what we're sending to frontend
  console.log(`📤 Sending job data to frontend:`, {
    jobId,
    status: job.status,
    progress: job.progress,
    hasDownloadUrl: !!job.downloadUrl,
    downloadUrl: job.downloadUrl,
    outputFilename: job.outputFilename,
    userId: job.userId
  })

  return NextResponse.json(job)
}

