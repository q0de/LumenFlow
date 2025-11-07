-- LumenFlow Database Schema
-- Run this in your Supabase SQL Editor

-- =============================================================================
-- PROFILES TABLE (extends auth.users)
-- =============================================================================
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  subscription_tier TEXT DEFAULT 'free' CHECK (subscription_tier IN ('free', 'pro')),
  stripe_customer_id TEXT UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for faster lookups
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_stripe_customer ON profiles(stripe_customer_id);

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Users can read their own profile
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- =============================================================================
-- SUBSCRIPTIONS TABLE
-- =============================================================================
CREATE TABLE IF NOT EXISTS subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  stripe_subscription_id TEXT UNIQUE NOT NULL,
  stripe_price_id TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('active', 'canceled', 'past_due', 'incomplete')),
  current_period_start TIMESTAMP WITH TIME ZONE NOT NULL,
  current_period_end TIMESTAMP WITH TIME ZONE NOT NULL,
  cancel_at_period_end BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for faster lookups
CREATE INDEX IF NOT EXISTS idx_subscriptions_user ON subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_stripe ON subscriptions(stripe_subscription_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON subscriptions(status);

-- Enable RLS
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

-- Users can view their own subscriptions
CREATE POLICY "Users can view own subscriptions" ON subscriptions
  FOR SELECT USING (auth.uid() = user_id);

-- =============================================================================
-- USAGE LIMITS TABLE (tracks daily/monthly usage)
-- =============================================================================
CREATE TABLE IF NOT EXISTS usage_limits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  videos_processed INTEGER DEFAULT 0,
  videos_limit INTEGER NOT NULL, -- 150 for free (5/day * 30), 50 for pro
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, period_start)
);

-- Index for faster lookups
CREATE INDEX IF NOT EXISTS idx_usage_user_period ON usage_limits(user_id, period_start);

-- Enable RLS
ALTER TABLE usage_limits ENABLE ROW LEVEL SECURITY;

-- Users can view their own usage
CREATE POLICY "Users can view own usage" ON usage_limits
  FOR SELECT USING (auth.uid() = user_id);

-- =============================================================================
-- JOBS TABLE (updated with user tracking)
-- =============================================================================
CREATE TABLE IF NOT EXISTS jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE SET NULL, -- NULL for anonymous users
  status TEXT NOT NULL CHECK (status IN ('uploading', 'processing', 'completed', 'error')),
  progress INTEGER DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
  filename TEXT,
  output_filename TEXT,
  has_watermark BOOLEAN DEFAULT false, -- Track if video has watermark (free tier)
  error TEXT,
  options JSONB, -- Store processing options
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_jobs_status ON jobs(status);
CREATE INDEX IF NOT EXISTS idx_jobs_created_at ON jobs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_jobs_user ON jobs(user_id);

-- Enable Row Level Security
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;

-- Allow public read/write for anonymous users (backward compatibility)
CREATE POLICY "Allow public access for anonymous" ON jobs
  FOR ALL
  USING (user_id IS NULL)
  WITH CHECK (user_id IS NULL);

-- Users can manage their own jobs
CREATE POLICY "Users can manage own jobs" ON jobs
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

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

-- =============================================================================
-- HELPER FUNCTIONS
-- =============================================================================

-- Function to check if user has reached their usage limit
CREATE OR REPLACE FUNCTION check_usage_limit(p_user_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  v_tier TEXT;
  v_usage INTEGER;
  v_limit INTEGER;
  v_period_start DATE;
BEGIN
  -- Get user tier
  SELECT subscription_tier INTO v_tier
  FROM profiles
  WHERE id = p_user_id;
  
  -- Calculate current period (monthly for pro, daily for free)
  IF v_tier = 'pro' THEN
    v_period_start := DATE_TRUNC('month', NOW());
  ELSE
    v_period_start := CURRENT_DATE;
  END IF;
  
  -- Get or create usage record
  INSERT INTO usage_limits (user_id, period_start, period_end, videos_limit)
  VALUES (
    p_user_id,
    v_period_start,
    CASE WHEN v_tier = 'pro' THEN DATE_TRUNC('month', NOW()) + INTERVAL '1 month' - INTERVAL '1 day'
         ELSE CURRENT_DATE END,
    CASE WHEN v_tier = 'pro' THEN 50 ELSE 5 END
  )
  ON CONFLICT (user_id, period_start) DO NOTHING;
  
  -- Get current usage
  SELECT videos_processed, videos_limit INTO v_usage, v_limit
  FROM usage_limits
  WHERE user_id = p_user_id AND period_start = v_period_start;
  
  -- Return true if under limit
  RETURN v_usage < v_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to increment usage count
CREATE OR REPLACE FUNCTION increment_usage(p_user_id UUID)
RETURNS void AS $$
DECLARE
  v_tier TEXT;
  v_period_start DATE;
BEGIN
  -- Get user tier
  SELECT subscription_tier INTO v_tier
  FROM profiles
  WHERE id = p_user_id;
  
  -- Calculate current period
  IF v_tier = 'pro' THEN
    v_period_start := DATE_TRUNC('month', NOW());
  ELSE
    v_period_start := CURRENT_DATE;
  END IF;
  
  -- Increment usage
  UPDATE usage_limits
  SET videos_processed = videos_processed + 1,
      updated_at = NOW()
  WHERE user_id = p_user_id AND period_start = v_period_start;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to create profile on signup (trigger)
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', '')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile on signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();

-- Cleanup function for old jobs (run periodically)
CREATE OR REPLACE FUNCTION cleanup_old_jobs()
RETURNS void AS $$
BEGIN
  DELETE FROM jobs
  WHERE created_at < NOW() - INTERVAL '7 days'
  AND status IN ('completed', 'error');
END;
$$ LANGUAGE plpgsql;

