import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { AuthProvider } from "@/components/auth-provider"
import Navbar from "@/components/navbar"
import { Toaster } from "@/components/ui/toaster"
import { validateEnv } from "@/lib/env"
import { redirect } from "next/navigation"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Task Management App",
  description: "A comprehensive task management application",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  // Check environment variables on server-side render
  const envValidation = validateEnv()

  // If environment variables are missing, redirect to the error page
  // This only happens on the server side
  if (!envValidation.valid && typeof window === "undefined") {
    redirect("/env-error")
  }

  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <AuthProvider>
            <div className="min-h-screen bg-background">
              <Navbar />
              <main className="container mx-auto py-4 px-4">{children}</main>
              <Toaster />
            </div>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
