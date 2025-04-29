import Link from "next/link"
import { notFound, redirect } from "next/navigation"
import { Calendar, CheckCircle2, ChevronLeft, Circle } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { DeleteTaskDialog } from "@/components/delete-task-dialog"
import { getTaskById, getProject } from "@/app/actions"
import type { TaskPriority } from "@/lib/types"
import { checkAuthStatus } from "../../auth-actions"

interface TaskPageProps {
  params: { id: string }
}

export default async function TaskPage({ params }: TaskPageProps) {
  // Check authentication status
  const { isAuthenticated } = await checkAuthStatus()

  // If not authenticated, redirect to sign in
  if (!isAuthenticated) {
    redirect("/signin")
  }

  const task = await getTaskById(params.id)

  if (!task) {
    notFound()
  }

  const project = task.projectId ? await getProject(task.projectId) : null

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
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric",
    })
  }

  const isOverdue = (dueAt: Date) => {
    return new Date() > dueAt && task.status === "open"
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" asChild className="h-9 w-9">
            <Link href="/">
              <ChevronLeft className="h-4 w-4" />
            </Link>
          </Button>
          <h1 className="text-xl sm:text-3xl font-bold tracking-tight line-clamp-1">{task.name}</h1>
        </div>
        <DeleteTaskDialog task={task} />
      </div>

      <div className="grid gap-6 grid-cols-1 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Task Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-1">Description</h3>
              <p className="whitespace-pre-line">{task.description}</p>
            </div>

            {project && (
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-1">Project</h3>
                <p>{project.name}</p>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-1">Created At</h3>
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span>{formatDate(task.createdAt)}</span>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-1">Due Date</h3>
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className={isOverdue(task.dueAt) ? "text-destructive font-medium" : ""}>
                    {formatDate(task.dueAt)}
                    {isOverdue(task.dueAt) && " (Overdue)"}
                  </span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-1">Priority</h3>
                {getPriorityBadge(task.priority)}
              </div>

              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-1">Status</h3>
                <div className="flex items-center gap-1">
                  {task.status === "open" ? (
                    <>
                      <Circle className="h-4 w-4 text-muted-foreground" />
                      <span>Open</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                      <span>Completed</span>
                    </>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Timeline</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="relative pl-6 border-l">
              <div className="mb-8 relative">
                <div className="absolute -left-[25px] p-1 rounded-full bg-primary">
                  <Circle className="h-3 w-3 text-primary-foreground" />
                </div>
                <h3 className="text-sm font-medium">Task Created</h3>
                <time className="text-sm text-muted-foreground">{formatDate(task.createdAt)}</time>
              </div>

              <div className="mb-8 relative">
                <div
                  className={`absolute -left-[25px] p-1 rounded-full ${
                    isOverdue(task.dueAt) ? "bg-destructive" : "bg-primary"
                  }`}
                >
                  <Calendar
                    className={`h-3 w-3 ${
                      isOverdue(task.dueAt) ? "text-destructive-foreground" : "text-primary-foreground"
                    }`}
                  />
                </div>
                <h3 className="text-sm font-medium">Due Date</h3>
                <time
                  className={`text-sm ${
                    isOverdue(task.dueAt) ? "text-destructive font-medium" : "text-muted-foreground"
                  }`}
                >
                  {formatDate(task.dueAt)}
                  {isOverdue(task.dueAt) && " (Overdue)"}
                </time>
              </div>

              {task.status === "done" && (
                <div className="relative">
                  <div className="absolute -left-[25px] p-1 rounded-full bg-green-500">
                    <CheckCircle2 className="h-3 w-3 text-white" />
                  </div>
                  <h3 className="text-sm font-medium">Completed</h3>
                  <time className="text-sm text-muted-foreground">Recently</time>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
