/**
 * Environment variable validation utility
 * Validates required environment variables on application startup
 */

// Define the required environment variables for the application
const requiredEnvVars = ["NEXT_PUBLIC_SUPABASE_URL", "NEXT_PUBLIC_SUPABASE_ANON_KEY"] as const

// Optional environment variables (will be checked but not required)
const optionalEnvVars = ["SUPABASE_SERVICE_ROLE_KEY", "SUPABASE_JWT_SECRET"] as const

type RequiredEnvVar = (typeof requiredEnvVars)[number]
type OptionalEnvVar = (typeof optionalEnvVars)[number]
type EnvVar = RequiredEnvVar | OptionalEnvVar

// Environment variable validation result
interface ValidationResult {
  valid: boolean
  missing: RequiredEnvVar[]
  empty: RequiredEnvVar[]
  optional: {
    missing: OptionalEnvVar[]
    empty: OptionalEnvVar[]
  }
}

/**
 * Validates that all required environment variables are set
 * @returns Validation result with details about missing variables
 */
export function validateEnv(): ValidationResult {
  const missing: RequiredEnvVar[] = []
  const empty: RequiredEnvVar[] = []
  const optionalMissing: OptionalEnvVar[] = []
  const optionalEmpty: OptionalEnvVar[] = []

  // Check required environment variables
  for (const envVar of requiredEnvVars) {
    const value = process.env[envVar]
    if (value === undefined) {
      missing.push(envVar)
    } else if (value.trim() === "") {
      empty.push(envVar)
    }
  }

  // Check optional environment variables
  for (const envVar of optionalEnvVars) {
    const value = process.env[envVar]
    if (value === undefined) {
      optionalMissing.push(envVar)
    } else if (value.trim() === "") {
      optionalEmpty.push(envVar)
    }
  }

  return {
    valid: missing.length === 0 && empty.length === 0,
    missing,
    empty,
    optional: {
      missing: optionalMissing,
      empty: optionalEmpty,
    },
  }
}

/**
 * Gets a formatted error message for missing environment variables
 * @param result Validation result from validateEnv()
 * @returns Formatted error message
 */
export function getEnvErrorMessage(result: ValidationResult): string {
  const messages: string[] = []

  if (result.missing.length > 0) {
    messages.push(`Missing required environment variables: ${result.missing.join(", ")}`)
  }

  if (result.empty.length > 0) {
    messages.push(`Empty required environment variables: ${result.empty.join(", ")}`)
  }

  return messages.join("\n")
}

/**
 * Gets a specific environment variable with validation
 * @param key Environment variable name
 * @param required Whether the variable is required
 * @returns The environment variable value or undefined if not set
 * @throws Error if the variable is required but not set
 */
export function getEnv(key: EnvVar, required = true): string | undefined {
  const value = process.env[key]

  if (required && (value === undefined || value.trim() === "")) {
    throw new Error(`Required environment variable ${key} is not set`)
  }

  return value
}

/**
 * Safe access to environment variables with proper typing
 */
export const env = {
  NEXT_PUBLIC_SUPABASE_URL: getEnv("NEXT_PUBLIC_SUPABASE_URL"),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: getEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY"),
  SUPABASE_SERVICE_ROLE_KEY: getEnv("SUPABASE_SERVICE_ROLE_KEY", false),
  SUPABASE_JWT_SECRET: getEnv("SUPABASE_JWT_SECRET", false),
} as const
