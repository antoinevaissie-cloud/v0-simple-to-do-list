"use server"

import { revalidatePath } from "next/cache"
import { cookies } from "next/headers"
import { createServerClient } from "@supabase/ssr"
import { getServerSupabase } from "@/lib/supabase-server"
import { mapDbTaskToTask, mapDbProjectToProject } from "@/lib/types"
import type { Task, Project, TaskStatus, TaskPriority } from "@/lib/types"
import type { Database } from "@/lib/database.types"

// Helper function to get the current user ID
async function getCurrentUserId(): Promise<string | null> {
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
    data: { user },
  } = await supabase.auth.getUser()

  return user?.id || null
}

// Task Actions
export async function getTasks(): Promise<Task[]> {
  const userId = await getCurrentUserId()

  if (!userId) {
    return [] // Return empty array if not authenticated
  }

  const supabase = getServerSupabase()

  const { data, error } = await supabase
    .from("tasks")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching tasks:", error)
    throw new Error("Failed to fetch tasks")
  }

  return data.map(mapDbTaskToTask)
}

export async function getTaskById(id: string): Promise<Task | null> {
  const userId = await getCurrentUserId()

  if (!userId) {
    return null // Return null if not authenticated
  }

  const supabase = getServerSupabase()

  const { data, error } = await supabase.from("tasks").select("*").eq("id", id).eq("user_id", userId).single()

  if (error) {
    if (error.code === "PGRST116") {
      return null // Task not found
    }
    console.error("Error fetching task:", error)
    throw new Error("Failed to fetch task")
  }

  return mapDbTaskToTask(data)
}

export async function createTask(taskData: {
  name: string
  description: string
  dueAt: Date
  priority: TaskPriority
  projectId?: string | null
}): Promise<Task> {
  const userId = await getCurrentUserId()

  if (!userId) {
    throw new Error("Not authenticated")
  }

  const supabase = getServerSupabase()

  const { data, error } = await supabase
    .from("tasks")
    .insert({
      name: taskData.name,
      description: taskData.description,
      due_at: taskData.dueAt.toISOString(),
      status: "open",
      priority: taskData.priority,
      project_id: taskData.projectId || null,
      user_id: userId,
    })
    .select()
    .single()

  if (error) {
    console.error("Error creating task:", error)
    throw new Error("Failed to create task")
  }

  revalidatePath("/")
  return mapDbTaskToTask(data)
}

export async function updateTask(
  id: string,
  taskData: {
    name?: string
    description?: string
    dueAt?: Date
    status?: TaskStatus
    priority?: TaskPriority
    projectId?: string | null
  },
): Promise<Task> {
  const userId = await getCurrentUserId()

  if (!userId) {
    throw new Error("Not authenticated")
  }

  const supabase = getServerSupabase()

  // First, verify that the task belongs to the current user
  const { data: existingTask, error: fetchError } = await supabase
    .from("tasks")
    .select("id")
    .eq("id", id)
    .eq("user_id", userId)
    .single()

  if (fetchError || !existingTask) {
    console.error("Error fetching task for update:", fetchError)
    throw new Error("Task not found or you don't have permission to update it")
  }

  const updateData: any = {}
  if (taskData.name !== undefined) updateData.name = taskData.name
  if (taskData.description !== undefined) updateData.description = taskData.description
  if (taskData.dueAt !== undefined) updateData.due_at = taskData.dueAt.toISOString()
  if (taskData.status !== undefined) updateData.status = taskData.status
  if (taskData.priority !== undefined) updateData.priority = taskData.priority
  if (taskData.projectId !== undefined) updateData.project_id = taskData.projectId

  const { data, error } = await supabase.from("tasks").update(updateData).eq("id", id).select().single()

  if (error) {
    console.error("Error updating task:", error)
    throw new Error("Failed to update task")
  }

  revalidatePath("/")
  revalidatePath(`/tasks/${id}`)
  return mapDbTaskToTask(data)
}

export async function toggleTaskStatus(id: string, currentStatus: TaskStatus): Promise<Task> {
  const newStatus: TaskStatus = currentStatus === "open" ? "done" : "open"
  return updateTask(id, { status: newStatus })
}

export async function deleteTask(id: string): Promise<void> {
  const userId = await getCurrentUserId()

  if (!userId) {
    throw new Error("Not authenticated")
  }

  const supabase = getServerSupabase()

  // First, verify that the task belongs to the current user
  const { data: existingTask, error: fetchError } = await supabase
    .from("tasks")
    .select("id")
    .eq("id", id)
    .eq("user_id", userId)
    .single()

  if (fetchError || !existingTask) {
    console.error("Error fetching task for deletion:", fetchError)
    throw new Error("Task not found or you don't have permission to delete it")
  }

  const { error } = await supabase.from("tasks").delete().eq("id", id)

  if (error) {
    console.error("Error deleting task:", error)
    throw new Error("Failed to delete task")
  }

  revalidatePath("/")
}

// Project Actions
export async function getProjects(): Promise<Project[]> {
  const userId = await getCurrentUserId()

  if (!userId) {
    return [] // Return empty array if not authenticated
  }

  const supabase = getServerSupabase()

  const { data, error } = await supabase.from("projects").select("*").eq("user_id", userId).order("name")

  if (error) {
    console.error("Error fetching projects:", error)
    throw new Error("Failed to fetch projects")
  }

  return data.map(mapDbProjectToProject)
}

export async function getProject(id: string): Promise<Project | null> {
  const userId = await getCurrentUserId()

  if (!userId) {
    return null // Return null if not authenticated
  }

  const supabase = getServerSupabase()

  const { data, error } = await supabase.from("projects").select("*").eq("id", id).eq("user_id", userId).single()

  if (error) {
    if (error.code === "PGRST116") {
      return null // Project not found
    }
    console.error("Error fetching project:", error)
    throw new Error("Failed to fetch project")
  }

  return mapDbProjectToProject(data)
}

export async function createProject(name: string): Promise<Project> {
  const userId = await getCurrentUserId()

  if (!userId) {
    throw new Error("Not authenticated")
  }

  const supabase = getServerSupabase()

  const { data, error } = await supabase.from("projects").insert({ name, user_id: userId }).select().single()

  if (error) {
    console.error("Error creating project:", error)
    throw new Error("Failed to create project")
  }

  revalidatePath("/")
  revalidatePath("/projects")
  return mapDbProjectToProject(data)
}

export async function updateProject(id: string, name: string): Promise<Project> {
  const userId = await getCurrentUserId()

  if (!userId) {
    throw new Error("Not authenticated")
  }

  const supabase = getServerSupabase()

  // First, verify that the project belongs to the current user
  const { data: existingProject, error: fetchError } = await supabase
    .from("projects")
    .select("id")
    .eq("id", id)
    .eq("user_id", userId)
    .single()

  if (fetchError || !existingProject) {
    console.error("Error fetching project for update:", fetchError)
    throw new Error("Project not found or you don't have permission to update it")
  }

  const { data, error } = await supabase.from("projects").update({ name }).eq("id", id).select().single()

  if (error) {
    console.error("Error updating project:", error)
    throw new Error("Failed to update project")
  }

  revalidatePath("/")
  revalidatePath("/projects")
  return mapDbProjectToProject(data)
}

export async function deleteProject(id: string): Promise<void> {
  const userId = await getCurrentUserId()

  if (!userId) {
    throw new Error("Not authenticated")
  }

  const supabase = getServerSupabase()

  // First, verify that the project belongs to the current user
  const { data: existingProject, error: fetchError } = await supabase
    .from("projects")
    .select("id")
    .eq("id", id)
    .eq("user_id", userId)
    .single()

  if (fetchError || !existingProject) {
    console.error("Error fetching project for deletion:", fetchError)
    throw new Error("Project not found or you don't have permission to delete it")
  }

  const { error } = await supabase.from("projects").delete().eq("id", id)

  if (error) {
    console.error("Error deleting project:", error)
    throw new Error("Failed to delete project")
  }

  revalidatePath("/")
  revalidatePath("/projects")
}

// Helper functions for statistics
export async function getTasksForNext7Days(): Promise<{ date: string; count: number }[]> {
  const userId = await getCurrentUserId()

  if (!userId) {
    return Array(7)
      .fill(0)
      .map((_, i) => {
        const date = new Date()
        date.setDate(date.getDate() + i)
        return {
          date: date.toISOString().split("T")[0],
          count: 0,
        }
      }) // Return empty data if not authenticated
  }

  const supabase = getServerSupabase()
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const result = []

  for (let i = 0; i < 7; i++) {
    const date = new Date(today)
    date.setDate(date.getDate() + i)

    const nextDay = new Date(date)
    nextDay.setDate(nextDay.getDate() + 1)

    const { data, error } = await supabase
      .from("tasks")
      .select("id")
      .eq("status", "open")
      .eq("user_id", userId)
      .gte("due_at", date.toISOString())
      .lt("due_at", nextDay.toISOString())

    if (error) {
      console.error("Error fetching tasks for date:", error)
      throw new Error("Failed to fetch tasks for statistics")
    }

    result.push({
      date: date.toISOString().split("T")[0],
      count: data.length,
    })
  }

  return result
}

export async function getOpenTasksPerDay(): Promise<{ date: string; count: number }[]> {
  const userId = await getCurrentUserId()

  if (!userId) {
    return Array(30)
      .fill(0)
      .map((_, i) => {
        const date = new Date()
        date.setDate(date.getDate() - (29 - i))
        return {
          date: date.toISOString().split("T")[0],
          count: 0,
        }
      }) // Return empty data if not authenticated
  }

  const supabase = getServerSupabase()
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const result = []

  for (let i = 29; i >= 0; i--) {
    const date = new Date(today)
    date.setDate(date.getDate() - i)

    const { data, error } = await supabase
      .from("tasks")
      .select("id")
      .eq("status", "open")
      .eq("user_id", userId)
      .lte("created_at", date.toISOString())

    if (error) {
      console.error("Error fetching open tasks for date:", error)
      throw new Error("Failed to fetch tasks for statistics")
    }

    result.push({
      date: date.toISOString().split("T")[0],
      count: data.length,
    })
  }

  return result
}
