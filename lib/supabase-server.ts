import { cookies } from "next/headers"
import { createServerClient } from "@supabase/ssr"
import type { Database } from "@/lib/database.types"
import { env, validateEnv, getEnvErrorMessage } from "@/lib/env"

// Validate environment variables on module import
const envValidation = validateEnv()

// Server-side client (creates a new instance for each request)
export const getServerSupabase = () => {
  try {
    // Check for required environment variables
    if (!envValidation.valid) {
      const errorMessage = getEnvErrorMessage(envValidation)
      console.error(errorMessage)
      throw new Error(errorMessage)
    }

    const cookieStore = cookies()
    const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL!
    const supabaseAnonKey = env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

    return createServerClient<Database>(supabaseUrl, supabaseAnonKey, {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
        set(name: string, value: string, options: any) {
          cookieStore.set({ name, value, ...options })
        },
        remove(name: string, options: any) {
          cookieStore.set({ name, value: "", ...options })
        },
      },
    })
  } catch (error) {
    console.error("Error creating server Supabase client:", error)
    throw error
  }
}
