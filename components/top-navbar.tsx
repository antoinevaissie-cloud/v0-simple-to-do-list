"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Menu, X, Home, LogIn, UserPlus, Key, FolderKanban, BarChart3, Rocket, LogOut } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { ModeToggle } from "@/components/mode-toggle"
import { useAuth } from "@/components/auth-provider"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

// Define navigation links with icons
const navLinks = [
  { href: "/", label: "Home", icon: Home },
  { href: "/signin", label: "Sign In", icon: LogIn, authOnly: "unauthenticated" },
  { href: "/signup", label: "Sign Up", icon: UserPlus, authOnly: "unauthenticated" },
  { href: "/reset-password", label: "Reset Password", icon: Key, authOnly: "unauthenticated" },
  // Projects link is specifically marked for authenticated users only
  { href: "/projects", label: "Projects", icon: FolderKanban, authOnly: "authenticated" },
  { href: "/stats", label: "Stats", icon: BarChart3, authOnly: "authenticated" },
  { href: "/deployment", label: "Deployment", icon: Rocket, authOnly: "authenticated" },
]

export function TopNavbar() {
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const { user, signOut, isLoading } = useAuth()

  // Handle scroll effect for navbar
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10)
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  // Filter links based on Supabase authentication status
  const filteredLinks = navLinks.filter((link) => {
    // No auth requirement, show to everyone
    if (!link.authOnly) return true

    // Auth-only links: only show if user is authenticated via Supabase
    if (link.authOnly === "authenticated") {
      return !!user // Only show if user object exists (authenticated)
    }

    // Unauthenticated-only links: only show if user is NOT authenticated
    if (link.authOnly === "unauthenticated") {
      return !user // Only show if user object doesn't exist (not authenticated)
    }

    return false
  })

  return (
    <header
      className={cn(
        "sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur transition-all duration-200",
        scrolled ? "shadow-md" : "",
      )}
    >
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-2">
              <span className="text-xl font-bold">Task Manager</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-1 lg:space-x-2">
            {!isLoading &&
              filteredLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors",
                    pathname === link.href
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:text-foreground hover:bg-accent",
                  )}
                >
                  <link.icon className="mr-2 h-4 w-4" />
                  {link.label}
                </Link>
              ))}

            {/* User dropdown for desktop */}
            {user && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="ml-2">
                    Account
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">My Account</p>
                      <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => signOut()} className="cursor-pointer">
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Sign out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}

            <div className="ml-2">
              <ModeToggle />
            </div>
          </nav>

          {/* Mobile Navigation */}
          <div className="flex items-center md:hidden">
            <ModeToggle />
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="ml-2 h-10 w-10" aria-label="Menu">
                  <Menu className="h-6 w-6" />
                  <span className="sr-only">Toggle menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[75vw] sm:w-[350px] p-0">
                <div className="flex flex-col h-full">
                  <div className="flex items-center justify-between p-4 border-b">
                    <Link href="/" className="text-lg font-bold" onClick={() => setIsOpen(false)}>
                      Task Manager
                    </Link>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setIsOpen(false)}
                      className="h-10 w-10"
                      aria-label="Close menu"
                    >
                      <X className="h-5 w-5" />
                      <span className="sr-only">Close menu</span>
                    </Button>
                  </div>
                  <nav className="flex-1 overflow-auto py-4">
                    <div className="flex flex-col space-y-1 px-4">
                      {!isLoading &&
                        filteredLinks.map((link) => (
                          <Link
                            key={link.href}
                            href={link.href}
                            className={cn(
                              "flex items-center px-4 py-3 text-base font-medium rounded-md transition-colors",
                              pathname === link.href
                                ? "bg-primary/10 text-primary"
                                : "text-muted-foreground hover:text-foreground hover:bg-accent",
                            )}
                            onClick={() => setIsOpen(false)}
                          >
                            <link.icon className="mr-3 h-5 w-5" />
                            {link.label}
                          </Link>
                        ))}
                    </div>
                  </nav>
                  {user && (
                    <div className="border-t p-4">
                      <div className="text-sm text-muted-foreground mb-2">
                        Signed in as: <span className="font-medium text-foreground">{user.email}</span>
                      </div>
                      <Button
                        variant="outline"
                        className="w-full justify-center h-10"
                        onClick={() => {
                          signOut()
                          setIsOpen(false)
                        }}
                      >
                        <LogOut className="mr-2 h-4 w-4" />
                        Sign Out
                      </Button>
                    </div>
                  )}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  )
}
