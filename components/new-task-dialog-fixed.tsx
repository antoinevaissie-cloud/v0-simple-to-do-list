"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { CalendarIcon } from "lucide-react"
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
import { cn } from "@/lib/utils"
import { projects, tasks } from "@/lib/data"

export function NewTaskDialog() {
  const [open, setOpen] = useState(false)
  const router = useRouter()

  // Simple form state without react-hook-form
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    dueAt: new Date(), // Set today as the default date
    priority: "low" as "low" | "med" | "high", // Set low as the default priority
    projectId: undefined as string | undefined,
  })

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
  function onSubmit(e: React.FormEvent) {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    // Create a new task with a unique ID
    const newTask = {
      id: `t${tasks.length + 1}`,
      name: formData.name,
      description: formData.description,
      createdAt: new Date(),
      dueAt: formData.dueAt as Date,
      status: "open" as const,
      priority: formData.priority,
      projectId: formData.projectId,
    }

    // Add the new task to our tasks array
    tasks.unshift(newTask)

    // Close the dialog and reset form
    setOpen(false)
    setFormData({
      name: "",
      description: "",
      dueAt: new Date(),
      priority: "low",
      projectId: undefined,
    })
    router.refresh()
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>Add Task</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle>Create New Task</DialogTitle>
          <DialogDescription>Add a new task to your list. Fill out the details below.</DialogDescription>
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
              <Select value={formData.priority} onValueChange={(value) => handleChange("priority", value)}>
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
            <p className="text-sm text-muted-foreground">Assign this task to a project</p>
          </div>

          <DialogFooter>
            <Button type="submit">Create Task</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
