"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2 } from "lucide-react"
import { getClientSupabase } from "@/lib/supabase"

export default function UpdatePassword() {
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [validationError, setValidationError] = useState<string | null>(null)
  const router = useRouter()

  // Check if the user is authenticated via a recovery token
  useEffect(() => {
    const checkSession = async () => {
      const supabase = getClientSupabase()
      const { data } = await supabase.auth.getSession()

      // If no session or not in recovery mode, redirect to sign in
      if (!data.session) {
        router.push("/signin?message=Password reset link is invalid or has expired")
      }
    }

    checkSession()
  }, [router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setMessage(null)
    setError(null)
    setValidationError(null)

    // Validate passwords
    if (password !== confirmPassword) {
      setValidationError("Passwords do not match")
      setIsLoading(false)
      return
    }

    if (password.length < 6) {
      setValidationError("Password must be at least 6 characters")
      setIsLoading(false)
      return
    }

    try {
      const supabase = getClientSupabase()
      const { error } = await supabase.auth.updateUser({ password })

      if (error) {
        throw error
      }

      setMessage("Password updated successfully. Redirecting to sign in...")

      // Redirect after a short delay
      setTimeout(() => {
        router.push("/signin?message=Password has been updated successfully")
      }, 2000)
    } catch (error: any) {
      setError(error.message || "An error occurred while updating your password.")
      console.error("Password update error:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-[calc(100dvh-4rem)] flex-col items-center justify-center py-6 px-4 sm:py-12">
      <div className="w-full max-w-md">
        {message && (
          <Alert className="mb-6 bg-green-50 text-green-800 dark:bg-green-900 dark:text-green-100">
            <AlertDescription>{message}</AlertDescription>
          </Alert>
        )}

        {(error || validationError) && (
          <Alert className="mb-6 bg-destructive/15 text-destructive">
            <AlertDescription>{error || validationError}</AlertDescription>
          </Alert>
        )}

        <Card className="w-full shadow-lg">
          <CardHeader className="space-y-1 pb-6">
            <CardTitle className="text-2xl font-bold">Update Password</CardTitle>
            <CardDescription>Enter your new password</CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-6">
              <div className="space-y-3">
                <Label htmlFor="password" className="text-base">
                  New Password
                </Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={isLoading}
                  className="h-12 text-base px-4"
                  autoComplete="new-password"
                  minLength={6}
                  aria-describedby="password-requirements"
                />
                <p id="password-requirements" className="text-xs text-muted-foreground">
                  Password must be at least 6 characters long
                </p>
              </div>
              <div className="space-y-3">
                <Label htmlFor="confirmPassword" className="text-base">
                  Confirm New Password
                </Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  disabled={isLoading}
                  className="h-12 text-base px-4"
                  autoComplete="new-password"
                />
              </div>
            </CardContent>
            <CardFooter className="pt-2 pb-6">
              <Button
                type="submit"
                className="w-full h-12 text-base font-medium"
                disabled={isLoading}
                aria-label="Update your password"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Updating...
                  </>
                ) : (
                  "Update Password"
                )}
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  )
}
