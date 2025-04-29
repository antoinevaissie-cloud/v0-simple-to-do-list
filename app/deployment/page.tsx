import { DeploymentChecklist } from "@/components/deployment/deployment-checklist"

export const metadata = {
  title: "Deployment Checklist | Task Management App",
  description: "Pre-deployment checklist for the Task Management application",
}

export default function DeploymentPage() {
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
