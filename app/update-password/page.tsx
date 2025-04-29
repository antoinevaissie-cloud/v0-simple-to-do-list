"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
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
    <div className="flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center py-12">
      <div className="w-full max-w-md">
        {message && (
          <Alert className="mb-4 bg-green-50 text-green-800 dark:bg-green-900 dark:text-green-100">
            <AlertDescription>{message}</AlertDescription>
          </Alert>
        )}

        {(error || validationError) && (
          <Alert className="mb-4 bg-destructive/15 text-destructive">
            <AlertDescription>{error || validationError}</AlertDescription>
          </Alert>
        )}

        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Update Password</CardTitle>
            <CardDescription>Enter your new password</CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="password">New Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm New Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              </div>
            </CardContent>
            <CardFooter>
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Updating..." : "Update Password"}
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  )
}
