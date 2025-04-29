"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { CalendarIcon, PencilIcon } from "lucide-react"
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
import { updateTask, getProjects } from "@/app/actions"
import type { Task, TaskStatus, TaskPriority } from "@/lib/types"

interface EditTaskDialogProps {
  task: Task
}

export function EditTaskDialog({ task }: EditTaskDialogProps) {
  const [open, setOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [projects, setProjects] = useState<{ id: string; name: string }[]>([])

  // Form state
  const [formData, setFormData] = useState({
    name: task.name,
    description: task.description || "",
    dueAt: task.dueAt,
    priority: task.priority,
    projectId: task.projectId || undefined,
    status: task.status,
  })

  // Update form data when task changes
  useEffect(() => {
    setFormData({
      name: task.name,
      description: task.description || "",
      dueAt: task.dueAt,
      priority: task.priority,
      projectId: task.projectId || undefined,
      status: task.status,
    })
  }, [task])

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

  const [errors, setErrors] = useState({
    name: "",
    description: "",
    dueAt: "",
  })

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

      await updateTask(task.id, {
        name: formData.name,
        description: formData.description,
        dueAt: formData.dueAt,
        status: formData.status,
        priority: formData.priority,
        projectId: formData.projectId,
      })

      toast({
        title: "Task updated",
        description: "Your task has been updated successfully.",
      })

      // Close the dialog
      setOpen(false)
    } catch (error) {
      console.error("Error updating task:", error)
      toast({
        title: "Error",
        description: "Failed to update task. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild onClick={(e) => e.stopPropagation()}>
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <PencilIcon className="h-4 w-4" />
          <span className="sr-only">Edit task</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle>Edit Task</DialogTitle>
          <DialogDescription>Make changes to your task here.</DialogDescription>
        </DialogHeader>
        <form onSubmit={onSubmit} className="space-y-4 py-2">
          <div className="space-y-2">
            <Label htmlFor="name">Task Name</Label>
            <Input
              id="name"
              placeholder="Enter task name"
              value={formData.name}
              onChange={(e) => handleChange("name", e.target.value)}
            />
            {errors.name && <p className="text-sm text-destructive">{errors.name}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Describe the task..."
              className="resize-none"
              value={formData.description}
              onChange={(e) => handleChange("description", e.target.value)}
            />
            {errors.description && <p className="text-sm text-destructive">{errors.description}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="dueDate">Due Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    id="dueDate"
                    variant={"outline"}
                    className={cn("w-full pl-3 text-left font-normal", !formData.dueAt && "text-muted-foreground")}
                  >
                    {formData.dueAt ? format(formData.dueAt, "PPP") : <span>Pick a date</span>}
                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={formData.dueAt}
                    onSelect={(date) => handleChange("dueAt", date)}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              {errors.dueAt && <p className="text-sm text-destructive">{errors.dueAt}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="priority">Priority</Label>
              <Select
                value={formData.priority}
                onValueChange={(value) => handleChange("priority", value as TaskPriority)}
              >
                <SelectTrigger id="priority">
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

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="project">Project (Optional)</Label>
              <Select value={formData.projectId} onValueChange={(value) => handleChange("projectId", value)}>
                <SelectTrigger id="project">
                  <SelectValue placeholder="Select a project" />
                </SelectTrigger>
                <SelectContent>
                  {projects.map((project) => (
                    <SelectItem key={project.id} value={project.id}>
                      {project.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select value={formData.status} onValueChange={(value) => handleChange("status", value as TaskStatus)}>
                <SelectTrigger id="status">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="open">Open</SelectItem>
                  <SelectItem value="done">Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
