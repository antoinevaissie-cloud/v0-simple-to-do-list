export type TaskStatus = "open" | "done"
export type TaskPriority = "low" | "med" | "high"

export interface Task {
  id: string
  name: string
  description: string | null
  createdAt: Date
  dueAt: Date
  status: TaskStatus
  priority: TaskPriority
  projectId: string | null
  userId: string
}

export interface Project {
  id: string
  name: string
  createdAt: Date
  userId: string
}

// Helper function to convert database task to frontend task
export function mapDbTaskToTask(dbTask: any): Task {
  return {
    id: dbTask.id,
    name: dbTask.name,
    description: dbTask.description || "",
    createdAt: new Date(dbTask.created_at),
    dueAt: new Date(dbTask.due_at),
    status: dbTask.status as TaskStatus,
    priority: dbTask.priority as TaskPriority,
    projectId: dbTask.project_id,
    userId: dbTask.user_id,
  }
}

// Helper function to convert database project to frontend project
export function mapDbProjectToProject(dbProject: any): Project {
  return {
    id: dbProject.id,
    name: dbProject.name,
    createdAt: new Date(dbProject.created_at),
    userId: dbProject.user_id,
  }
}
