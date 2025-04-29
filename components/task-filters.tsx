"use client"

import { useState, useEffect, useCallback } from "react"
import { CalendarIcon, Filter, X } from "lucide-react"
import { format, startOfDay, endOfDay, addDays, isAfter, isBefore, isEqual } from "date-fns"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { useTasksContext } from "@/components/tasks-provider"
import { getProjects } from "@/app/actions"
import type { TaskPriority, TaskStatus } from "@/lib/types"
import { ScrollArea } from "@/components/ui/scroll-area"

export function TaskFilters() {
  const { tasks, setFilteredTasks } = useTasksContext()
  const [projects, setProjects] = useState<{ id: string; name: string }[]>([])

  // Filter states
  const [priority, setPriority] = useState<TaskPriority | "all">("all")
  const [status, setStatus] = useState<TaskStatus | "all">("all")
  const [project, setProject] = useState<string | "all">("all")
  const [dueDateRange, setDueDateRange] = useState<"all" | "today" | "thisWeek" | "nextWeek" | "overdue" | "custom">(
    "all",
  )
  const [customDateRange, setCustomDateRange] = useState<{
    from: Date | undefined
    to: Date | undefined
  }>({
    from: undefined,
    to: undefined,
  })

  // Active filter count
  const [activeFilterCount, setActiveFilterCount] = useState(0)
  const [isFilterExpanded, setIsFilterExpanded] = useState(false)

  // Fetch projects
  useEffect(() => {
    async function fetchProjects() {
      try {
        const projectsData = await getProjects()
        setProjects(projectsData)
      } catch (error) {
        console.error("Error fetching projects:", error)
      }
    }

    fetchProjects()
  }, [])

  // Memoize the filter function to prevent unnecessary re-renders
  const applyFilters = useCallback(() => {
    let filteredTasks = [...tasks]
    let filterCount = 0

    // Filter by priority
    if (priority !== "all") {
      filteredTasks = filteredTasks.filter((task) => task.priority === priority)
      filterCount++
    }

    // Filter by status
    if (status !== "all") {
      filteredTasks = filteredTasks.filter((task) => task.status === status)
      filterCount++
    }

    // Filter by project
    if (project !== "all") {
      filteredTasks = filteredTasks.filter((task) => task.projectId === project)
      filterCount++
    }

    // Filter by due date range
    if (dueDateRange !== "all") {
      const today = startOfDay(new Date())

      if (dueDateRange === "today") {
        filteredTasks = filteredTasks.filter((task) => {
          const taskDate = startOfDay(new Date(task.dueAt))
          return isEqual(taskDate, today)
        })
        filterCount++
      } else if (dueDateRange === "thisWeek") {
        const endOfWeek = endOfDay(addDays(today, 6))
        filteredTasks = filteredTasks.filter((task) => {
          const taskDate = new Date(task.dueAt)
          return (
            (isAfter(taskDate, today) || isEqual(startOfDay(taskDate), today)) &&
            (isBefore(taskDate, endOfWeek) || isEqual(startOfDay(taskDate), startOfDay(endOfWeek)))
          )
        })
        filterCount++
      } else if (dueDateRange === "nextWeek") {
        const startOfNextWeek = startOfDay(addDays(today, 7))
        const endOfNextWeek = endOfDay(addDays(today, 13))
        filteredTasks = filteredTasks.filter((task) => {
          const taskDate = new Date(task.dueAt)
          return (
            (isAfter(taskDate, startOfNextWeek) || isEqual(startOfDay(taskDate), startOfNextWeek)) &&
            (isBefore(taskDate, endOfNextWeek) || isEqual(startOfDay(taskDate), startOfDay(endOfNextWeek)))
          )
        })
        filterCount++
      } else if (dueDateRange === "overdue") {
        filteredTasks = filteredTasks.filter((task) => {
          return task.status === "open" && isBefore(new Date(task.dueAt), today)
        })
        filterCount++
      } else if (dueDateRange === "custom" && (customDateRange.from || customDateRange.to)) {
        filteredTasks = filteredTasks.filter((task) => {
          const taskDate = startOfDay(new Date(task.dueAt))

          if (customDateRange.from && customDateRange.to) {
            return (
              (isAfter(taskDate, startOfDay(customDateRange.from)) ||
                isEqual(taskDate, startOfDay(customDateRange.from))) &&
              (isBefore(taskDate, startOfDay(customDateRange.to)) || isEqual(taskDate, startOfDay(customDateRange.to)))
            )
          } else if (customDateRange.from) {
            return (
              isAfter(taskDate, startOfDay(customDateRange.from)) || isEqual(taskDate, startOfDay(customDateRange.from))
            )
          } else if (customDateRange.to) {
            return (
              isBefore(taskDate, startOfDay(customDateRange.to)) || isEqual(taskDate, startOfDay(customDateRange.to))
            )
          }

          return true
        })
        filterCount++
      }
    }

    setActiveFilterCount(filterCount)
    return filteredTasks
  }, [tasks, priority, status, project, dueDateRange, customDateRange.from, customDateRange.to])

  // Apply filters when filter criteria change
  useEffect(() => {
    const filteredTasks = applyFilters()
    setFilteredTasks(filteredTasks)
  }, [applyFilters, setFilteredTasks])

  // Reset all filters
  const resetFilters = () => {
    setPriority("all")
    setStatus("all")
    setProject("all")
    setDueDateRange("all")
    setCustomDateRange({ from: undefined, to: undefined })
  }

  return (
    <div className="mb-6 space-y-4">
      {/* Mobile Filter Toggle */}
      <div className="flex items-center justify-between md:hidden">
        <Button
          variant="outline"
          className="flex items-center gap-2 h-12"
          onClick={() => setIsFilterExpanded(!isFilterExpanded)}
          aria-expanded={isFilterExpanded}
          aria-controls="filter-panel"
        >
          <Filter className="h-4 w-4" />
          <span>Filters</span>
          {activeFilterCount > 0 && (
            <Badge variant="secondary" className="ml-1">
              {activeFilterCount}
            </Badge>
          )}
        </Button>

        {activeFilterCount > 0 && (
          <Button variant="ghost" size="sm" onClick={resetFilters} className="h-10" aria-label="Clear all filters">
            <X className="mr-1 h-4 w-4" />
            Clear
          </Button>
        )}
      </div>

      {/* Mobile Filter Panel */}
      <div
        id="filter-panel"
        className={cn("space-y-4 rounded-lg border p-4 bg-card md:hidden", isFilterExpanded ? "block" : "hidden")}
      >
        <div className="grid grid-cols-2 gap-4">
          {/* Priority Filter */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Priority</label>
            <Select value={priority} onValueChange={(value) => setPriority(value as TaskPriority | "all")}>
              <SelectTrigger className="h-12 text-base">
                <SelectValue placeholder="Priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>Priority</SelectLabel>
                  <SelectItem value="all">All Priorities</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="med">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>

          {/* Status Filter */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Status</label>
            <Select value={status} onValueChange={(value) => setStatus(value as TaskStatus | "all")}>
              <SelectTrigger className="h-12 text-base">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>Status</SelectLabel>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="open">Open</SelectItem>
                  <SelectItem value="done">Completed</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Project Filter */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Project</label>
          <Select value={project} onValueChange={setProject}>
            <SelectTrigger className="h-12 text-base">
              <SelectValue placeholder="Project" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>Project</SelectLabel>
                <SelectItem value="all">All Projects</SelectItem>
                {projects.map((project) => (
                  <SelectItem key={project.id} value={project.id}>
                    {project.name}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>

        {/* Due Date Filter */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Due Date</label>
          <Select
            value={dueDateRange}
            onValueChange={(value) => {
              setDueDateRange(value as any)
              if (value !== "custom") {
                setCustomDateRange({ from: undefined, to: undefined })
              }
            }}
          >
            <SelectTrigger className="h-12 text-base">
              <SelectValue placeholder="Due Date" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>Due Date</SelectLabel>
                <SelectItem value="all">Any Time</SelectItem>
                <SelectItem value="today">Today</SelectItem>
                <SelectItem value="thisWeek">This Week</SelectItem>
                <SelectItem value="nextWeek">Next Week</SelectItem>
                <SelectItem value="overdue">Overdue</SelectItem>
                <SelectItem value="custom">Custom Range</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>

        {/* Custom Date Range */}
        {dueDateRange === "custom" && (
          <div className="space-y-2">
            <label className="text-sm font-medium">Date Range</label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "h-12 w-full justify-start text-left font-normal",
                    !customDateRange.from && !customDateRange.to && "text-muted-foreground",
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {customDateRange.from ? (
                    customDateRange.to ? (
                      <>
                        {format(customDateRange.from, "LLL dd")} - {format(customDateRange.to, "LLL dd")}
                      </>
                    ) : (
                      format(customDateRange.from, "LLL dd, y")
                    )
                  ) : (
                    "Pick dates"
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  initialFocus
                  mode="range"
                  defaultMonth={customDateRange.from}
                  selected={customDateRange}
                  onSelect={setCustomDateRange}
                  numberOfMonths={1}
                  className="rounded-md border"
                />
              </PopoverContent>
            </Popover>
          </div>
        )}
      </div>

      {/* Desktop Filters */}
      <div className="hidden md:flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium">Filters</span>
          {activeFilterCount > 0 && (
            <Badge variant="secondary" className="ml-1">
              {activeFilterCount}
            </Badge>
          )}
        </div>

        <Separator orientation="vertical" className="h-6" />

        {/* Priority Filter */}
        <Select value={priority} onValueChange={(value) => setPriority(value as TaskPriority | "all")}>
          <SelectTrigger className="h-10 min-w-[130px]">
            <SelectValue placeholder="Priority" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectLabel>Priority</SelectLabel>
              <SelectItem value="all">All Priorities</SelectItem>
              <SelectItem value="low">Low</SelectItem>
              <SelectItem value="med">Medium</SelectItem>
              <SelectItem value="high">High</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>

        {/* Status Filter */}
        <Select value={status} onValueChange={(value) => setStatus(value as TaskStatus | "all")}>
          <SelectTrigger className="h-10 min-w-[130px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectLabel>Status</SelectLabel>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="open">Open</SelectItem>
              <SelectItem value="done">Completed</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>

        {/* Project Filter */}
        <Select value={project} onValueChange={setProject}>
          <SelectTrigger className="h-10 min-w-[150px]">
            <SelectValue placeholder="Project" />
          </SelectTrigger>
          <SelectContent>
            <ScrollArea className="h-80">
              <SelectGroup>
                <SelectLabel>Project</SelectLabel>
                <SelectItem value="all">All Projects</SelectItem>
                {projects.map((project) => (
                  <SelectItem key={project.id} value={project.id}>
                    {project.name}
                  </SelectItem>
                ))}
              </SelectGroup>
            </ScrollArea>
          </SelectContent>
        </Select>

        {/* Due Date Filter */}
        <Select
          value={dueDateRange}
          onValueChange={(value) => {
            setDueDateRange(value as any)
            if (value !== "custom") {
              setCustomDateRange({ from: undefined, to: undefined })
            }
          }}
        >
          <SelectTrigger className="h-10 min-w-[150px]">
            <SelectValue placeholder="Due Date" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectLabel>Due Date</SelectLabel>
              <SelectItem value="all">Any Time</SelectItem>
              <SelectItem value="today">Today</SelectItem>
              <SelectItem value="thisWeek">This Week</SelectItem>
              <SelectItem value="nextWeek">Next Week</SelectItem>
              <SelectItem value="overdue">Overdue</SelectItem>
              <SelectItem value="custom">Custom Range</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>

        {/* Custom Date Range */}
        {dueDateRange === "custom" && (
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "h-10 justify-start text-left font-normal",
                  !customDateRange.from && !customDateRange.to && "text-muted-foreground",
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {customDateRange.from ? (
                  customDateRange.to ? (
                    <>
                      {format(customDateRange.from, "LLL dd")} - {format(customDateRange.to, "LLL dd")}
                    </>
                  ) : (
                    format(customDateRange.from, "LLL dd, y")
                  )
                ) : (
                  "Pick dates"
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                initialFocus
                mode="range"
                defaultMonth={customDateRange.from}
                selected={customDateRange}
                onSelect={setCustomDateRange}
                numberOfMonths={2}
              />
            </PopoverContent>
          </Popover>
        )}

        {/* Reset Filters */}
        {activeFilterCount > 0 && (
          <Button variant="ghost" size="sm" onClick={resetFilters} className="h-10 px-2">
            <X className="mr-1 h-4 w-4" />
            Clear filters
          </Button>
        )}
      </div>
    </div>
  )
}
