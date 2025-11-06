// Shared job storage (in production, use Redis or database)
export interface Job {
  status: "uploading" | "processing" | "completed" | "error"
  progress: number
  error?: string
  downloadUrl?: string
  outputFilename?: string  // Store the actual output filename
}

const jobs = new Map<string, Job>()

export function getJob(jobId: string): Job | undefined {
  return jobs.get(jobId)
}

export function setJob(jobId: string, job: Job): void {
  jobs.set(jobId, job)
}

export function deleteJob(jobId: string): void {
  jobs.delete(jobId)
}

