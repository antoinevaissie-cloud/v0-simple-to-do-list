import type React from "react"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Update Password | Task Management App",
  description: "Create a new password for your task management account.",
}

export default function UpdatePasswordLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
