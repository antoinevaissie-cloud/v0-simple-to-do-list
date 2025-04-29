import type React from "react"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Sign Up | Task Management App",
  description: "Create a new account to start managing your tasks and projects with our powerful task management tool.",
}

export default function SignUpLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
