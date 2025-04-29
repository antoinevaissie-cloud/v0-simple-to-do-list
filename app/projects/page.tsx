import Link from "next/link"
import { redirect } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { getProjects, getTasks } from "@/app/actions"
import { NewProjectDialog } from "@/components/new-project-dialog"
import type { TaskPriority } from "@/lib/types"
import { checkAuthStatus } from "../auth-actions"

export default async function ProjectsPage() {
  // Check authentication status
  const { isAuthenticated } = await checkAuthStatus()

  // If not authenticated, redirect to sign in
  if (!isAuthenticated) {
    redirect("/signin")
  }

  const projects = await getProjects()
  const tasks = await getTasks()

  const getPriorityBadge = (priority: TaskPriority) => {
    const variants: Record<TaskPriority, string> = {
      low: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
      med: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
      high: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
    }

    return <Badge className={variants[priority]}>{priority.charAt(0).toUpperCase() + priority.slice(1)}</Badge>
  }

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    })
  }

  const isOverdue = (dueAt: Date, status: string) => {
    return new Date() > dueAt && status === "open"
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Projects</h1>
        <NewProjectDialog />
      </div>

      <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        {projects.length === 0 ? (
          <Card className="col-span-full">
            <CardContent className="pt-6">
              <p className="text-center text-muted-foreground">No projects found. Create a project to get started.</p>
            </CardContent>
          </Card>
        ) : (
          projects.map((project) => {
            const projectTasks = tasks.filter((task) => task.projectId === project.id)
            const openTasks = projectTasks.filter((task) => task.status === "open")

            return (
              <Card key={project.id} className="flex flex-col">
                <CardHeader>
                  <CardTitle className="text-xl">{project.name}</CardTitle>
                  <CardDescription>
                    {openTasks.length} open task{openTasks.length !== 1 ? "s" : ""}
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex-1">
                  <div className="space-y-4">
                    {openTasks.length === 0 ? (
                      <p className="text-muted-foreground">No open tasks for this project.</p>
                    ) : (
                      openTasks.slice(0, 3).map((task) => (
                        <div key={task.id} className="border rounded-lg p-3 hover:bg-muted/50">
                          <Link href={`/tasks/${task.id}`} className="block">
                            <h3 className="font-medium mb-1 line-clamp-1">{task.name}</h3>
                            <div className="flex flex-wrap items-center gap-2 text-sm">
                              <span
                                className={
                                  isOverdue(task.dueAt, task.status) ? "text-destructive" : "text-muted-foreground"
                                }
                              >
                                Due {formatDate(task.dueAt)}
                              </span>
                              {getPriorityBadge(task.priority)}
                            </div>
                          </Link>
                        </div>
                      ))
                    )}

                    {openTasks.length > 3 && (
                      <div className="text-center pt-2">
                        <Link href="/" className="text-sm text-primary hover:underline">
                          View all {openTasks.length} tasks
                        </Link>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )
          })
        )}
      </div>
    </div>
  )
}
