import Link from "next/link"
import { validateEnv, getEnvErrorMessage } from "@/lib/env"

export default function EnvErrorPage() {
  const envValidation = validateEnv()
  const errorMessage = getEnvErrorMessage(envValidation)

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4 text-center">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h1 className="text-3xl font-bold">Environment Configuration Error</h1>
          <p className="mt-2 text-muted-foreground">
            The application cannot start because some required environment variables are missing.
          </p>
        </div>

        <div className="bg-destructive/10 p-4 rounded-md text-left">
          <h2 className="font-semibold mb-2">Missing Environment Variables:</h2>
          <pre className="whitespace-pre-wrap text-sm text-destructive">{errorMessage}</pre>
        </div>

        <div className="bg-muted p-4 rounded-md text-left">
          <h2 className="font-semibold mb-2">How to fix this:</h2>
          <ol className="list-decimal list-inside space-y-2 text-sm">
            <li>
              Create or update your <code className="bg-muted-foreground/20 px-1 rounded">.env.local</code> file with
              the missing variables
            </li>
            <li>If deploying to Vercel, add these variables in your project settings</li>
            <li>Restart your development server or redeploy your application</li>
          </ol>
        </div>

        <div className="pt-4">
          <Link
            href="/"
            className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
          >
            Try Again
          </Link>
        </div>
      </div>
    </div>
  )
}
