import { Suspense } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import TaskTable from "@/components/task-table"
import { NewTaskDialog } from "@/components/new-task-dialog"
import { TaskFilters } from "@/components/task-filters"
import { TaskSearch } from "@/components/task-search"
import { getTasks } from "@/app/actions"
import { TasksProvider } from "@/components/tasks-provider"
import { TasksLoading } from "@/components/tasks-loading"
import { cookies } from "next/headers"
import { createServerClient } from "@supabase/ssr"
import { redirect } from "next/navigation"
import type { Database } from "@/lib/database.types"

export default async function Dashboard() {
  try {
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

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <NewTaskDialog />
        </div>

        <Suspense fallback={<TasksLoading />}>
          <TasksContent />
        </Suspense>
      </div>
    )
  } catch (error) {
    console.error("Dashboard error:", error)
    // Show a simple error UI instead of crashing
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <div className="p-4 border rounded-md bg-destructive/10 text-destructive">
          <p>There was an error loading the dashboard. Please try refreshing the page.</p>
        </div>
      </div>
    )
  }
}

async function TasksContent() {
  try {
    const tasks = await getTasks()

    const openTasks = tasks.filter((task) => task.status === "open")
    const completedTasks = tasks.filter((task) => task.status === "done")

    return (
      <TasksProvider initialTasks={tasks}>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Tasks</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{tasks.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Open Tasks</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{openTasks.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completed Tasks</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{completedTasks.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {tasks.length > 0 ? Math.round((completedTasks.length / tasks.length) * 100) : 0}%
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          <TaskSearch />
          <TaskFilters />
        </div>

        <div className="space-y-6">
          <TaskTable status="open" title="Open Tasks" />
          <TaskTable status="done" title="Completed Tasks" />
        </div>
      </TasksProvider>
    )
  } catch (error) {
    console.error("TasksContent error:", error)
    return (
      <div className="p-4 border rounded-md bg-destructive/10 text-destructive">
        <p>There was an error loading your tasks. Please try refreshing the page.</p>
      </div>
    )
  }
}
