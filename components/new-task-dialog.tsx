"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { CalendarIcon, Plus } from "lucide-react"
import { format } from "date-fns"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "@/components/ui/use-toast"
import { cn } from "@/lib/utils"
import { createTask, getProjects } from "@/app/actions"
import { ScrollArea } from "@/components/ui/scroll-area"
import type { TaskPriority } from "@/lib/types"

export function NewTaskDialog() {
  const [open, setOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [projects, setProjects] = useState<{ id: string; name: string }[]>([])

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    dueAt: new Date(),
    priority: "low" as TaskPriority,
    projectId: undefined as string | undefined,
  })

  // Form validation
  const [errors, setErrors] = useState({
    name: "",
    description: "",
    dueAt: "",
  })

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

    if (open) {
      fetchProjects()
    }
  }, [open])

  // Handle form field changes
  const handleChange = (field: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))

    // Clear error when field is updated
    if (errors[field as keyof typeof errors]) {
      setErrors((prev) => ({
        ...prev,
        [field]: "",
      }))
    }
  }

  // Validate form
  const validateForm = () => {
    const newErrors = {
      name: "",
      description: "",
      dueAt: "",
    }

    let isValid = true

    if (!formData.name || formData.name.length < 2) {
      newErrors.name = "Task name must be at least 2 characters."
      isValid = false
    }

    if (!formData.description || formData.description.length < 5) {
      newErrors.description = "Description must be at least 5 characters."
      isValid = false
    }

    if (!formData.dueAt) {
      newErrors.dueAt = "A due date is required."
      isValid = false
    }

    setErrors(newErrors)
    return isValid
  }

  // Handle form submission
  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()

    if (!validateForm() || isSubmitting) {
      return
    }

    try {
      setIsSubmitting(true)

      await createTask({
        name: formData.name,
        description: formData.description,
        dueAt: formData.dueAt,
        priority: formData.priority,
        projectId: formData.projectId,
      })

      toast({
        title: "Task created",
        description: "Your new task has been created successfully.",
      })

      // Close the dialog and reset form
      setOpen(false)
      setFormData({
        name: "",
        description: "",
        dueAt: new Date(),
        priority: "low",
        projectId: undefined,
      })
    } catch (error) {
      console.error("Error creating task:", error)
      toast({
        title: "Error",
        description: "Failed to create task. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="h-12 px-4 text-base gap-2">
          <Plus className="h-5 w-5" />
          <span className="sm:inline">Add Task</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[525px] p-0 sm:p-6 overflow-auto max-h-[calc(100dvh-2rem)]">
        <DialogHeader className="p-4 sm:p-0 pb-0 sm:pb-2 sticky top-0 bg-background z-10">
          <DialogTitle className="text-xl">Create New Task</DialogTitle>
          <DialogDescription>Add a new task to your list. Fill out the details below.</DialogDescription>
        </DialogHeader>
        <form onSubmit={onSubmit} className="space-y-4 p-4 sm:p-0 sm:py-2">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-base">
              Task Name
            </Label>
            <Input
              id="name"
              placeholder="Enter task name"
              value={formData.name}
              onChange={(e) => handleChange("name", e.target.value)}
              className="h-12 text-base"
              aria-describedby={errors.name ? "name-error" : undefined}
              aria-invalid={!!errors.name}
            />
            {errors.name && (
              <p id="name-error" className="text-sm text-destructive">
                {errors.name}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description" className="text-base">
              Description
            </Label>
            <Textarea
              id="description"
              placeholder="Describe the task..."
              className="resize-none min-h-[100px] text-base"
              value={formData.description}
              onChange={(e) => handleChange("description", e.target.value)}
              aria-describedby={errors.description ? "description-error" : undefined}
              aria-invalid={!!errors.description}
            />
            {errors.description && (
              <p id="description-error" className="text-sm text-destructive">
                {errors.description}
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="dueDate" className="text-base">
                Due Date
              </Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    id="dueDate"
                    variant={"outline"}
                    className={cn("w-full h-12 pl-3 text-left font-normal", !formData.dueAt && "text-muted-foreground")}
                    aria-describedby={errors.dueAt ? "dueDate-error" : undefined}
                    aria-invalid={!!errors.dueAt}
                  >
                    {formData.dueAt ? format(formData.dueAt, "PPP") : <span>Pick a date</span>}
                    <CalendarIcon className="ml-auto h-5 w-5 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={formData.dueAt}
                    onSelect={(date) => handleChange("dueAt", date)}
                    initialFocus
                    className="rounded-md border"
                  />
                </PopoverContent>
              </Popover>
              {errors.dueAt && (
                <p id="dueDate-error" className="text-sm text-destructive">
                  {errors.dueAt}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="priority" className="text-base">
                Priority
              </Label>
              <Select value={formData.priority} onValueChange={(value) => handleChange("priority", value)}>
                <SelectTrigger id="priority" className="h-12 text-base">
                  <SelectValue placeholder="Select priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="med">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="project" className="text-base">
              Project (Optional)
            </Label>
            <Select value={formData.projectId} onValueChange={(value) => handleChange("projectId", value)}>
              <SelectTrigger id="project" className="h-12 text-base">
                <SelectValue placeholder="Select a project" />
              </SelectTrigger>
              <SelectContent>
                <ScrollArea className="h-60">
                  {projects.map((project) => (
                    <SelectItem key={project.id} value={project.id}>
                      {project.name}
                    </SelectItem>
                  ))}
                </ScrollArea>
              </SelectContent>
            </Select>
            <p className="text-sm text-muted-foreground">Assign this task to a project</p>
          </div>

          <DialogFooter className="pt-2 sm:pt-0 px-0 sticky bottom-0 bg-background pb-4 mt-6">
            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full sm:w-auto h-12 text-base"
              aria-label="Create new task"
            >
              {isSubmitting ? "Creating..." : "Create Task"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
