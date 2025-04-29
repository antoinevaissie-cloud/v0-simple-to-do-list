import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { createServerClient } from "@supabase/ssr"

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()

  // Skip middleware for not-found page and static assets
  if (
    req.nextUrl.pathname === "/not-found" ||
    req.nextUrl.pathname.startsWith("/_next/") ||
    req.nextUrl.pathname.startsWith("/favicon.ico")
  ) {
    return res
  }

  try {
    // Create a Supabase client for the middleware
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return req.cookies.get(name)?.value
          },
          set(name: string, value: string, options: any) {
            res.cookies.set({
              name,
              value,
              ...options,
            })
          },
          remove(name: string, options: any) {
            res.cookies.set({
              name,
              value: "",
              ...options,
            })
          },
        },
      },
    )

    const {
      data: { session },
    } = await supabase.auth.getSession()

    // Check if the user is authenticated
    const isAuthenticated = !!session
    const isAuthPage =
      req.nextUrl.pathname === "/signin" ||
      req.nextUrl.pathname === "/signup" ||
      req.nextUrl.pathname === "/reset-password" ||
      req.nextUrl.pathname === "/update-password"

    // If the user is on an auth page but is already authenticated, redirect to the dashboard
    // Exception: Don't redirect from update-password even if authenticated
    if (isAuthPage && isAuthenticated && req.nextUrl.pathname !== "/update-password") {
      return NextResponse.redirect(new URL("/", req.url))
    }

    // If the user is not authenticated and not on an auth page, redirect to the signin page
    if (!isAuthenticated && !isAuthPage) {
      return NextResponse.redirect(new URL("/signin", req.url))
    }

    return res
  } catch (error) {
    console.error("Middleware error:", error)
    // If there's an error in the middleware, allow the request to continue
    // This prevents the app from breaking if there's an issue with Supabase
    return res
  }
}

// Only run middleware on specific paths, excluding static files and API routes
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     * - api routes
     * - not-found page
     */
    "/((?!_next/static|_next/image|favicon.ico|public|api|not-found).*)",
  ],
}
