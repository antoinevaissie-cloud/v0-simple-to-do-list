import type React from "react"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Reset Password | Task Management App",
  description: "Reset your password to regain access to your task management account.",
}

export default function ResetPasswordLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
