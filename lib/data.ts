export type TaskStatus = "open" | "done"
export type TaskPriority = "low" | "med" | "high"

export interface Task {
  id: string
  name: string
  description: string
  createdAt: Date
  dueAt: Date
  status: TaskStatus
  priority: TaskPriority
  projectId?: string
}

export interface Project {
  id: string
  name: string
}

// Sample projects data
export const projects: Project[] = [
  { id: "p1", name: "Website Redesign" },
  { id: "p2", name: "Mobile App Development" },
  { id: "p3", name: "Marketing Campaign" },
]

// Sample tasks data
export const tasks: Task[] = [
  {
    id: "t1",
    name: "Design homepage mockup",
    description: "Create a mockup for the new homepage design using Figma",
    createdAt: new Date(2023, 5, 1),
    dueAt: new Date(Date.now() + 86400000 * 2), // 2 days from now
    status: "open",
    priority: "high",
    projectId: "p1",
  },
  {
    id: "t2",
    name: "Implement authentication",
    description: "Set up user authentication using NextAuth.js",
    createdAt: new Date(2023, 5, 2),
    dueAt: new Date(Date.now() + 86400000 * 5), // 5 days from now
    status: "open",
    priority: "med",
    projectId: "p1",
  },
  {
    id: "t3",
    name: "Create API endpoints",
    description: "Develop RESTful API endpoints for the mobile app",
    createdAt: new Date(2023, 5, 3),
    dueAt: new Date(Date.now() + 86400000 * 3), // 3 days from now
    status: "open",
    priority: "high",
    projectId: "p2",
  },
  {
    id: "t4",
    name: "Design app icons",
    description: "Create app icons in various sizes for different platforms",
    createdAt: new Date(2023, 5, 4),
    dueAt: new Date(Date.now() + 86400000 * 1), // 1 day from now
    status: "done",
    priority: "low",
    projectId: "p2",
  },
  {
    id: "t5",
    name: "Write social media posts",
    description: "Create content for next week's social media campaign",
    createdAt: new Date(2023, 5, 5),
    dueAt: new Date(Date.now() + 86400000 * 4), // 4 days from now
    status: "open",
    priority: "med",
    projectId: "p3",
  },
  {
    id: "t6",
    name: "Analyze campaign results",
    description: "Review and analyze the results of the previous marketing campaign",
    createdAt: new Date(2023, 5, 6),
    dueAt: new Date(Date.now() - 86400000 * 2), // 2 days ago
    status: "done",
    priority: "high",
    projectId: "p3",
  },
  {
    id: "t7",
    name: "Update dependencies",
    description: "Update all project dependencies to the latest versions",
    createdAt: new Date(2023, 5, 7),
    dueAt: new Date(Date.now() + 86400000 * 6), // 6 days from now
    status: "open",
    priority: "low",
    projectId: "p1",
  },
  {
    id: "t8",
    name: "Fix navigation bug",
    description: "Fix the navigation bug on mobile devices",
    createdAt: new Date(2023, 5, 8),
    dueAt: new Date(Date.now() + 86400000 * 7), // 7 days from now
    status: "open",
    priority: "high",
    projectId: "p2",
  },
]

// Helper functions to get tasks
export function getOpenTasks() {
  return tasks.filter((task) => task.status === "open")
}

export function getCompletedTasks() {
  return tasks.filter((task) => task.status === "done")
}

export function getTasksByProject(projectId: string) {
  return tasks.filter((task) => task.projectId === projectId)
}

export function getTaskById(taskId: string) {
  return tasks.find((task) => task.id === taskId)
}

export function getProject(projectId: string) {
  return projects.find((project) => project.id === projectId)
}

// Helper function to get tasks due in the next 7 days
export function getTasksForNext7Days() {
  const result = []
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  for (let i = 0; i < 7; i++) {
    const date = new Date(today)
    date.setDate(date.getDate() + i)

    const nextDay = new Date(date)
    nextDay.setDate(nextDay.getDate() + 1)

    const tasksForDay = tasks.filter((task) => task.status === "open" && task.dueAt >= date && task.dueAt < nextDay)

    result.push({
      date: date.toISOString().split("T")[0],
      count: tasksForDay.length,
    })
  }

  return result
}

// Helper function to get open tasks per day for the last 30 days
export function getOpenTasksPerDay() {
  const result = []
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  for (let i = 29; i >= 0; i--) {
    const date = new Date(today)
    date.setDate(date.getDate() - i)

    const openTasksOnDay = tasks.filter(
      (task) =>
        task.status === "open" &&
        task.createdAt <= date &&
        (task.status === "open" || (task.status === "done" && new Date(task.dueAt) > date)),
    )

    result.push({
      date: date.toISOString().split("T")[0],
      count: openTasksOnDay.length,
    })
  }

  return result
}
