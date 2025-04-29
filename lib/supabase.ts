import { createClient } from "@supabase/supabase-js"
import type { Database } from "@/lib/database.types"
import { env, validateEnv, getEnvErrorMessage } from "@/lib/env"

// Validate environment variables on module import
const envValidation = validateEnv()

// Create a single supabase client for the entire application (client-side)
const createSupabaseClient = () => {
  // Check for required environment variables
  if (!envValidation.valid) {
    console.error(getEnvErrorMessage(envValidation))

    // In development, throw an error to make the issue obvious
    if (process.env.NODE_ENV === "development") {
      throw new Error(getEnvErrorMessage(envValidation))
    }

    // In production, return a dummy client that won't cause runtime errors
    // but log the error for debugging
    return createClient("https://placeholder-url.supabase.co", "placeholder-key")
  }

  const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL!
  const supabaseAnonKey = env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

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
