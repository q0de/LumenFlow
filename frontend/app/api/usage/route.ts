import { NextRequest, NextResponse } from "next/server"
import { cookies } from 'next/headers'
import { createClient } from '@supabase/supabase-js'
import { checkUsageLimit } from "@/lib/usage"

export async function GET(request: NextRequest) {
  try {
    // Create Supabase client with cookie-based auth
    const cookieStore = cookies()
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        auth: {
          storage: {
            getItem: (key: string) => {
              const cookie = cookieStore.get(key)
              return cookie?.value ?? null
            },
            setItem: () => {},
            removeItem: () => {},
          },
        },
      }
    )
    
    // Get authenticated user from session
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      console.log('⚠️ Usage API: No authenticated user', { authError: authError?.message })
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    console.log('✅ Usage API: User authenticated:', user.email)
    const usageInfo = await checkUsageLimit(user.id)

    return NextResponse.json(usageInfo)
  } catch (error: any) {
    console.error("❌ Usage check error:", error)
    return NextResponse.json(
      { error: error.message || "Failed to check usage" },
      { status: 500 }
    )
  }
}

