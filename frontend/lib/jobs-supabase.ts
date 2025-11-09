// Supabase-based job storage
import { createServerClient } from './supabase'

export interface Job {
  id: string
  userId?: string | null
  status: "uploading" | "processing" | "completed" | "error"
  progress: number
  error?: string
  downloadUrl?: string
  outputFilename?: string
  filename?: string
  options?: any
  has_watermark?: boolean
  created_at?: string
  updated_at?: string
}

export async function getJob(jobId: string): Promise<Job | null> {
  const supabase = createServerClient()
  const { data, error } = await supabase
    .from('jobs')
    .select('*')
    .eq('id', jobId)
    .single()

  if (error) {
    console.error('Error fetching job:', error)
    return null
  }

  if (!data) return null

  return {
    id: data.id,
    userId: data.user_id,
    status: data.status,
    progress: data.progress,
    error: data.error,
    outputFilename: data.output_filename,
    filename: data.filename,
    options: data.options,
    has_watermark: data.has_watermark,
    created_at: data.created_at,
    updated_at: data.updated_at,
    downloadUrl: data.output_filename ? `/api/download/${jobId}` : undefined,
  }
}

export async function setJob(jobId: string, job: Partial<Job>): Promise<void> {
  const supabase = createServerClient()
  const { error } = await supabase
    .from('jobs')
    .upsert({
      id: jobId,
      user_id: job.userId !== undefined ? job.userId : undefined,
      status: job.status,
      progress: job.progress ?? 0,
      error: job.error || null,
      output_filename: job.outputFilename || null,
      filename: job.filename || null,
      options: job.options || null,
      has_watermark: job.has_watermark ?? null,
    }, {
      onConflict: 'id'
    })

  if (error) {
    console.error('Error updating job:', error)
    throw error
  }
}

export async function deleteJob(jobId: string): Promise<void> {
  const supabase = createServerClient()
  const { error } = await supabase
    .from('jobs')
    .delete()
    .eq('id', jobId)

  if (error) {
    console.error('Error deleting job:', error)
    throw error
  }
}

