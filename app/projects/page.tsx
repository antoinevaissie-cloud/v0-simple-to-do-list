import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { getProjects, getTasks } from "@/app/actions"
import { NewProjectDialog } from "@/components/new-project-dialog"
import type { TaskPriority } from "@/lib/types"
import { cookies } from "next/headers"
import { createServerClient } from "@supabase/ssr"
import { redirect } from "next/navigation"
import type { Database } from "@/lib/database.types"

export default async function ProjectsPage() {
  // Check authentication status
  const cookieStore = cookies()
  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
      },
    },
  )

  const {
    data: { session },
  } = await supabase.auth.getSession()

  // If not authenticated, redirect to sign in
  if (!session) {
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
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Projects</h1>
        <NewProjectDialog />
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {projects.length === 0 ? (
          <Card>
            <CardContent className="pt-6">
              <p className="text-center text-muted-foreground">No projects found. Create a project to get started.</p>
            </CardContent>
          </Card>
        ) : (
          projects.map((project) => {
            const projectTasks = tasks.filter((task) => task.projectId === project.id)
            const openTasks = projectTasks.filter((task) => task.status === "open")

            return (
              <Card key={project.id}>
                <CardHeader>
                  <CardTitle>{project.name}</CardTitle>
                  <CardDescription>
                    {openTasks.length} open task{openTasks.length !== 1 ? "s" : ""}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {openTasks.length === 0 ? (
                      <p className="text-muted-foreground">No open tasks for this project.</p>
                    ) : (
                      openTasks.map((task) => (
                        <div key={task.id} className="border rounded-lg p-3 hover:bg-muted/50">
                          <Link href={`/tasks/${task.id}`} className="block">
                            <h3 className="font-medium mb-1">{task.name}</h3>
                            <div className="flex items-center justify-between text-sm">
                              <div className="flex items-center gap-2">
                                <span
                                  className={
                                    isOverdue(task.dueAt, task.status) ? "text-destructive" : "text-muted-foreground"
                                  }
                                >
                                  Due {formatDate(task.dueAt)}
                                </span>
                                {getPriorityBadge(task.priority)}
                              </div>
                            </div>
                          </Link>
                        </div>
                      ))
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
