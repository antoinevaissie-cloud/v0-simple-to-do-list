import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { AuthProvider } from "@/components/auth-provider"
import { TopNavbar } from "@/components/top-navbar"
import { Toaster } from "@/components/ui/toaster"
import { validateEnv } from "@/lib/env"
import { redirect } from "next/navigation"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Task Management App",
  description: "A comprehensive task management application",
  viewport: "width=device-width, initial-scale=1, maximum-scale=5, minimum-scale=1",
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
    <html lang="en" suppressHydrationWarning className="h-full">
      <body className={`${inter.className} h-full`}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <AuthProvider>
            <div className="min-h-[100dvh] bg-background flex flex-col">
              <TopNavbar />
              <main className="flex-1 container mx-auto py-4 px-4 sm:px-6 md:px-8 max-w-7xl">{children}</main>
              <Toaster />
            </div>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
