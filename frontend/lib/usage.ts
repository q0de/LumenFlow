import { createServerClient } from "./supabase"

export interface UsageInfo {
  videosProcessed: number
  videosLimit: number
  hasReachedLimit: boolean
  tier: "free" | "pro"
  periodStart: string
  periodEnd: string
}

export async function checkUsageLimit(userId: string): Promise<UsageInfo> {
  const supabase = createServerClient()

  // Get user profile
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('subscription_tier')
    .eq('id', userId)
    .single()

  if (profileError || !profile) {
    throw new Error('Profile not found')
  }

  const tier = profile.subscription_tier as "free" | "pro"
  const isPro = tier === 'pro'

  // Calculate period start
  const now = new Date()
  const periodStart = isPro
    ? new Date(now.getFullYear(), now.getMonth(), 1) // First of month for pro
    : new Date(now.getFullYear(), now.getMonth(), now.getDate()) // Today for free

  const periodEnd = isPro
    ? new Date(now.getFullYear(), now.getMonth() + 1, 0) // Last day of month for pro
    : new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59) // End of today for free

  // Get or create usage record
  const { data: usage, error: usageError } = await supabase
    .from('usage_limits')
    .select('*')
    .eq('user_id', userId)
    .eq('period_start', periodStart.toISOString().split('T')[0])
    .single()

  let videosProcessed = 0
  const videosLimit = isPro ? 50 : 3

  if (!usage && !usageError) {
    // Create new usage record
    await supabase.from('usage_limits').insert({
      user_id: userId,
      period_start: periodStart.toISOString().split('T')[0],
      period_end: periodEnd.toISOString().split('T')[0],
      videos_processed: 0,
      videos_limit: videosLimit,
    })
  } else if (usage) {
    videosProcessed = usage.videos_processed
  }

  return {
    videosProcessed,
    videosLimit,
    hasReachedLimit: videosProcessed >= videosLimit,
    tier,
    periodStart: periodStart.toISOString(),
    periodEnd: periodEnd.toISOString(),
  }
}

export async function incrementUsage(userId: string): Promise<void> {
  const supabase = createServerClient()

  console.log('📊 Incrementing usage for user:', userId)

  // Get user profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('subscription_tier')
    .eq('id', userId)
    .single()

  if (!profile) {
    throw new Error('Profile not found')
  }

  const isPro = profile.subscription_tier === 'pro'

  // Calculate period start
  const now = new Date()
  const periodStart = isPro
    ? new Date(now.getFullYear(), now.getMonth(), 1)
    : new Date(now.getFullYear(), now.getMonth(), now.getDate())

  const periodEnd = isPro
    ? new Date(now.getFullYear(), now.getMonth() + 1, 0)
    : new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59)

  const periodStartStr = periodStart.toISOString().split('T')[0]
  const periodEndStr = periodEnd.toISOString().split('T')[0]

  console.log('📅 Period:', periodStartStr, 'to', periodEndStr)

  // Check if record exists
  const { data: existing } = await supabase
    .from('usage_limits')
    .select('*')
    .eq('user_id', userId)
    .eq('period_start', periodStartStr)
    .single()

  console.log('📊 Existing usage record:', existing)

  if (existing) {
    // Update existing record - increment by 1
    const { error } = await supabase
      .from('usage_limits')
      .update({
        videos_processed: existing.videos_processed + 1,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', userId)
      .eq('period_start', periodStartStr)

    if (error) {
      console.error('❌ Failed to increment usage:', error)
      throw error
    }
    console.log('✅ Usage incremented to:', existing.videos_processed + 1)
  } else {
    // Create new record with count of 1
    const { error } = await supabase
      .from('usage_limits')
      .insert({
        user_id: userId,
        period_start: periodStartStr,
        period_end: periodEndStr,
        videos_processed: 1,
        videos_limit: isPro ? 50 : 3,
      })

    if (error) {
      console.error('❌ Failed to create usage record:', error)
      throw error
    }
    console.log('✅ Usage record created with count: 1')
  }
}

export function shouldAddWatermark(tier: "free" | "pro"): boolean {
  return tier === "free"
}

