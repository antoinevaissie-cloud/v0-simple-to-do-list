"use client"

import type React from "react"

import { createContext, useContext, useState, useEffect, useMemo, useCallback } from "react"
import type { Task, TaskStatus } from "@/lib/types"

interface TasksContextType {
  tasks: Task[]
  filteredTasks: Task[]
  setFilteredTasks: (tasks: Task[]) => void
  searchResults: Task[]
  setSearchResults: (tasks: Task[]) => void
  finalTasks: Task[]
  getTasksByStatus: (status: TaskStatus) => Task[]
}

const TasksContext = createContext<TasksContextType | null>(null)

export function useTasksContext() {
  const context = useContext(TasksContext)
  if (!context) {
    throw new Error("useTasksContext must be used within a TasksProvider")
  }
  return context
}

interface TasksProviderProps {
  initialTasks: Task[]
  children: React.ReactNode
}

export function TasksProvider({ initialTasks, children }: TasksProviderProps) {
  const [tasks, setTasks] = useState<Task[]>(initialTasks)
  const [filteredTasks, setFilteredTasks] = useState<Task[]>(initialTasks)
  const [searchResults, setSearchResults] = useState<Task[]>(initialTasks)

  // Update tasks when initialTasks changes (e.g., after server revalidation)
  useEffect(() => {
    setTasks(initialTasks)
    setFilteredTasks(initialTasks)
    setSearchResults(initialTasks)
  }, [initialTasks])

  // Compute the final tasks to display (intersection of filters and search)
  const finalTasks = useMemo(() => {
    return filteredTasks.filter((task) => searchResults.some((searchTask) => searchTask.id === task.id))
  }, [filteredTasks, searchResults])

  // Helper function to get tasks by status
  const getTasksByStatus = useCallback(
    (status: TaskStatus) => {
      return finalTasks.filter((task) => task.status === status)
    },
    [finalTasks],
  )

  const value = {
    tasks,
    filteredTasks,
    setFilteredTasks,
    searchResults,
    setSearchResults,
    finalTasks,
    getTasksByStatus,
  }

  return <TasksContext.Provider value={value}>{children}</TasksContext.Provider>
}
