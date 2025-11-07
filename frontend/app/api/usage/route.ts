import { NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase"
import { checkUsageLimit } from "@/lib/usage"

export async function GET(request: NextRequest) {
  try {
    const supabase = createServerClient()
    
    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const usageInfo = await checkUsageLimit(user.id)

    return NextResponse.json(usageInfo)
  } catch (error: any) {
    console.error("Usage check error:", error)
    return NextResponse.json(
      { error: error.message || "Failed to check usage" },
      { status: 500 }
    )
  }
}

