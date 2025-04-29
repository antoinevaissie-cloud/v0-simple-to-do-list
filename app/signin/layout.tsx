import type React from "react"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Sign In | Task Management App",
  description: "Sign in to your account to manage your tasks and projects efficiently.",
}

export default function SignInLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
