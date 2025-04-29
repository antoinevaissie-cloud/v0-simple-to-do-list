import { redirect } from "next/navigation"
import { DeploymentChecklist } from "@/components/deployment/deployment-checklist"
import { checkAuthStatus } from "../auth-actions"

export const metadata = {
  title: "Deployment Checklist | Task Management App",
  description: "Pre-deployment checklist for the Task Management application",
}

export default async function DeploymentPage() {
  // Check authentication status
  const { isAuthenticated } = await checkAuthStatus()

  // If not authenticated, redirect to sign in
  if (!isAuthenticated) {
    redirect("/signin")
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Deployment Checklist</h1>
      </div>

      <p className="text-muted-foreground">
        Complete all items in this checklist before deploying the application to production. Critical items must be
        completed for a successful deployment.
      </p>

      <DeploymentChecklist />
    </div>
  )
}
