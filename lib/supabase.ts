import { createClient } from "@supabase/supabase-js"
import type { Database } from "@/lib/database.types"
import { validateEnv, getEnvErrorMessage } from "@/lib/env"

// Validate environment variables on module import
const envValidation = validateEnv()

// This will throw an error during build time if environment variables are missing
if (!envValidation.valid) {
  const errorMessage = getEnvErrorMessage(envValidation)
  throw new Error(`Build Error: ${errorMessage}`)
}

// Create a single Supabase client for the entire application (client-side)
const createSupabaseClient = () => {
  // Only check for runtime environment vars in the browser
  if (typeof window !== "undefined") {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      throw new Error(
        "Runtime Error: NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY must be set in environment variables",
      )
    }
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ""
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""

  return createClient<Database>(supabaseUrl, supabaseAnonKey)
}

// Client-side singleton to prevent multiple instances
let clientSideClient: ReturnType<typeof createSupabaseClient> | null = null

export const getClientSupabase = () => {
  if (typeof window === "undefined") {
    throw new Error("getClientSupabase should only be called in client components")
  }

  if (!clientSideClient) {
    clientSideClient = createSupabaseClient()
  }
  return clientSideClient
}
