-- LumenFlow Database Schema
-- Run this in your Supabase SQL Editor

-- Create jobs table
CREATE TABLE IF NOT EXISTS jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  status TEXT NOT NULL CHECK (status IN ('uploading', 'processing', 'completed', 'error')),
  progress INTEGER DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
  filename TEXT,
  output_filename TEXT,
  error TEXT,
  options JSONB, -- Store processing options
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_jobs_status ON jobs(status);
CREATE INDEX IF NOT EXISTS idx_jobs_created_at ON jobs(created_at DESC);

-- Enable Row Level Security (optional, for future auth)
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;

-- Allow public read/write for now (you can restrict later with auth)
CREATE POLICY "Allow public access" ON jobs
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Enable real-time for jobs table
ALTER PUBLICATION supabase_realtime ADD TABLE jobs;

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to auto-update updated_at
CREATE TRIGGER update_jobs_updated_at
  BEFORE UPDATE ON jobs
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Optional: Create a cleanup function for old jobs (run periodically)
CREATE OR REPLACE FUNCTION cleanup_old_jobs()
RETURNS void AS $$
BEGIN
  DELETE FROM jobs
  WHERE created_at < NOW() - INTERVAL '7 days'
  AND status IN ('completed', 'error');
END;
$$ LANGUAGE plpgsql;

