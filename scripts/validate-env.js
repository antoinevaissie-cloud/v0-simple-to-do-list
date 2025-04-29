// Simple script to validate environment variables
// Run with: node scripts/validate-env.js

// Load environment variables from .env files
require("dotenv").config()

const requiredEnvVars = ["NEXT_PUBLIC_SUPABASE_URL", "NEXT_PUBLIC_SUPABASE_ANON_KEY"]

const optionalEnvVars = ["SUPABASE_SERVICE_ROLE_KEY", "SUPABASE_JWT_SECRET"]

function validateEnv() {
  const missing = []
  const empty = []
  const optionalMissing = []
  const optionalEmpty = []

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

// Run validation
const result = validateEnv()

if (!result.valid) {
  console.error("\x1b[31m%s\x1b[0m", "❌ Environment validation failed!")

  if (result.missing.length > 0) {
    console.error("\x1b[31m%s\x1b[0m", `Missing required variables: ${result.missing.join(", ")}`)
  }

  if (result.empty.length > 0) {
    console.error("\x1b[31m%s\x1b[0m", `Empty required variables: ${result.empty.join(", ")}`)
  }

  console.log("\nOptional variables:")
  if (result.optional.missing.length > 0) {
    console.log(`- Missing: ${result.optional.missing.join(", ")}`)
  }

  if (result.optional.empty.length > 0) {
    console.log(`- Empty: ${result.optional.empty.join(", ")}`)
  }

  process.exit(1)
} else {
  console.log("\x1b[32m%s\x1b[0m", "✅ Environment validation passed!")

  // Log which optional variables are set
  const setOptional = optionalEnvVars.filter((v) => process.env[v] !== undefined && process.env[v].trim() !== "")
  if (setOptional.length > 0) {
    console.log(`Optional variables set: ${setOptional.join(", ")}`)
  } else {
    console.log("No optional variables are set.")
  }
}
