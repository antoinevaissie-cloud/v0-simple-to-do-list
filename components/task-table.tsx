"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { ArrowUpDown, Calendar, MoreHorizontal, CheckCircle, Circle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { toast } from "@/components/ui/use-toast"
import { useTasksContext } from "@/components/tasks-provider"
import { EditTaskDialog } from "@/components/edit-task-dialog"
import { DeleteTaskDialog } from "@/components/delete-task-dialog"
import { toggleTaskStatus, getProjects } from "@/app/actions"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import type { TaskPriority, TaskStatus, Project } from "@/lib/types"

interface TaskTableProps {
  status: TaskStatus
  title: string
}

export default function TaskTable({ status, title }: TaskTableProps) {
  const router = useRouter()
  const { getTasksByStatus } = useTasksContext()
  const [sortField, setSortField] = useState<"dueAt" | "priority">("dueAt")
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc")
  const [isUpdating, setIsUpdating] = useState<string | null>(null)
  const [projects, setProjects] = useState<Project[]>([])
  const [isLoadingProjects, setIsLoadingProjects] = useState(true)

  const tasks = getTasksByStatus(status)

  // Fetch projects for displaying project names
  useEffect(() => {
    async function fetchProjects() {
      try {
        setIsLoadingProjects(true)
        const projectsData = await getProjects()
        setProjects(projectsData)
      } catch (error) {
        console.error("Error fetching projects:", error)
      } finally {
        setIsLoadingProjects(false)
      }
    }

    fetchProjects()
  }, [])

  // Get project name by ID
  const getProjectName = (projectId: string | null) => {
    if (!projectId) return "—"
    const project = projects.find((p) => p.id === projectId)
    return project ? project.name : "—"
  }

  const handleSort = (field: "dueAt" | "priority") => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      setSortField(field)
      setSortDirection("asc")
    }
  }

  const sortedTasks = [...tasks].sort((a, b) => {
    if (sortField === "dueAt") {
      return sortDirection === "asc" ? a.dueAt.getTime() - b.dueAt.getTime() : b.dueAt.getTime() - a.dueAt.getTime()
    } else {
      const priorityValues: Record<TaskPriority, number> = {
        low: 1,
        med: 2,
        high: 3,
      }
      return sortDirection === "asc"
        ? priorityValues[a.priority] - priorityValues[b.priority]
        : priorityValues[b.priority] - priorityValues[a.priority]
    }
  })

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
      year: "numeric",
    })
  }

  const isOverdue = (dueAt: Date) => {
    return new Date() > dueAt && status === "open"
  }

  const handleRowClick = (taskId: string) => {
    router.push(`/tasks/${taskId}`)
  }

  // Toggle task status function
  const handleToggleStatus = async (taskId: string, currentStatus: TaskStatus) => {
    try {
      setIsUpdating(taskId)
      await toggleTaskStatus(taskId, currentStatus)

      const newStatus = currentStatus === "open" ? "done" : "open"
      toast({
        title: `Task ${newStatus === "done" ? "completed" : "reopened"}`,
        description: `Task has been marked as ${newStatus === "done" ? "completed" : "open"}.`,
        duration: 3000,
      })
    } catch (error) {
      console.error("Error toggling task status:", error)
      toast({
        title: "Error",
        description: "Failed to update task status. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsUpdating(null)
    }
  }

  // Responsive table rendering
  return (
    <div className="rounded-md border">
      <div className="p-4 bg-muted/50">
        <h2 className="text-xl font-semibold">{title}</h2>
      </div>

      {/* Mobile view - Card layout */}
      <div className="md:hidden">
        {sortedTasks.length === 0 ? (
          <div className="p-6 text-center text-muted-foreground">No tasks found</div>
        ) : (
          <div className="divide-y">
            {sortedTasks.map((task) => (
              <div
                key={task.id}
                className={`p-4 ${task.status === "done" ? "bg-muted/20" : ""}`}
                onClick={() => handleRowClick(task.id)}
              >
                <div className="flex items-start gap-3 mb-2">
                  <div onClick={(e) => e.stopPropagation()} className="mt-1">
                    <Checkbox
                      checked={task.status === "done"}
                      onCheckedChange={() => handleToggleStatus(task.id, task.status)}
                      disabled={isUpdating === task.id}
                      aria-label={`Mark task "${task.name}" as ${task.status === "open" ? "complete" : "incomplete"}`}
                      className="h-5 w-5"
                    />
                  </div>
                  <div className="flex-1">
                    <h3
                      className={`font-medium text-base ${task.status === "done" ? "line-through text-muted-foreground" : ""}`}
                    >
                      {task.name}
                    </h3>

                    <div className="flex flex-wrap gap-2 mt-2 text-sm">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                        <span
                          className={isOverdue(task.dueAt) ? "text-destructive font-medium" : "text-muted-foreground"}
                        >
                          {formatDate(task.dueAt)}
                          {isOverdue(task.dueAt) && " (Overdue)"}
                        </span>
                      </div>

                      {task.projectId && (
                        <div className="text-muted-foreground">
                          {isLoadingProjects ? "Loading..." : getProjectName(task.projectId)}
                        </div>
                      )}

                      <div>{getPriorityBadge(task.priority)}</div>
                    </div>
                  </div>

                  <div onClick={(e) => e.stopPropagation()}>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-10 w-10 rounded-full"
                          aria-label="Task actions"
                        >
                          <MoreHorizontal className="h-5 w-5" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-56">
                        <DropdownMenuItem onSelect={() => router.push(`/tasks/${task.id}`)}>
                          View details
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onSelect={() => handleToggleStatus(task.id, task.status)}
                          disabled={isUpdating === task.id}
                        >
                          {task.status === "open" ? (
                            <>
                              <CheckCircle className="mr-2 h-4 w-4" />
                              Mark as completed
                            </>
                          ) : (
                            <>
                              <Circle className="mr-2 h-4 w-4" />
                              Mark as open
                            </>
                          )}
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onSelect={(e) => {
                            e.preventDefault()
                            document.getElementById(`edit-task-${task.id}`)?.click()
                          }}
                        >
                          Edit task
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-destructive focus:text-destructive"
                          onSelect={(e) => {
                            e.preventDefault()
                            document.getElementById(`delete-task-${task.id}`)?.click()
                          }}
                        >
                          Delete task
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                    <div className="hidden">
                      <EditTaskDialog task={task} id={`edit-task-${task.id}`} />
                      <DeleteTaskDialog task={task} id={`delete-task-${task.id}`} />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Desktop view - Table layout */}
      <div className="hidden md:block overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[50px]">Status</TableHead>
              <TableHead className="w-[250px]">Task</TableHead>
              <TableHead>Project</TableHead>
              <TableHead>
                <Button
                  variant="ghost"
                  onClick={() => handleSort("dueAt")}
                  className="flex items-center gap-1 p-0 h-auto font-medium"
                >
                  Due Date
                  <ArrowUpDown className="h-4 w-4" />
                </Button>
              </TableHead>
              <TableHead>
                <Button
                  variant="ghost"
                  onClick={() => handleSort("priority")}
                  className="flex items-center gap-1 p-0 h-auto font-medium"
                >
                  Priority
                  <ArrowUpDown className="h-4 w-4" />
                </Button>
              </TableHead>
              <TableHead className="w-[100px] text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedTasks.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-6 text-muted-foreground">
                  No tasks found
                </TableCell>
              </TableRow>
            ) : (
              sortedTasks.map((task) => (
                <TableRow
                  key={task.id}
                  className={`cursor-pointer hover:bg-muted/50 ${task.status === "done" ? "bg-muted/20" : ""}`}
                >
                  <TableCell className="pr-0">
                    <div onClick={(e) => e.stopPropagation()}>
                      <Checkbox
                        checked={task.status === "done"}
                        onCheckedChange={() => handleToggleStatus(task.id, task.status)}
                        disabled={isUpdating === task.id}
                        aria-label={`Mark task "${task.name}" as ${task.status === "open" ? "complete" : "incomplete"}`}
                      />
                    </div>
                  </TableCell>
                  <TableCell
                    className={`font-medium ${task.status === "done" ? "line-through text-muted-foreground" : ""}`}
                    onClick={() => handleRowClick(task.id)}
                  >
                    {task.name}
                  </TableCell>
                  <TableCell onClick={() => handleRowClick(task.id)}>
                    {isLoadingProjects ? (
                      <span className="text-muted-foreground">Loading...</span>
                    ) : (
                      getProjectName(task.projectId)
                    )}
                  </TableCell>
                  <TableCell onClick={() => handleRowClick(task.id)}>
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span className={isOverdue(task.dueAt) ? "text-destructive font-medium" : ""}>
                        {formatDate(task.dueAt)}
                        {isOverdue(task.dueAt) && " (Overdue)"}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell onClick={() => handleRowClick(task.id)}>{getPriorityBadge(task.priority)}</TableCell>
                  <TableCell>
                    <div className="flex justify-end gap-1" onClick={(e) => e.stopPropagation()}>
                      <EditTaskDialog task={task} />
                      <DeleteTaskDialog task={task} />
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
