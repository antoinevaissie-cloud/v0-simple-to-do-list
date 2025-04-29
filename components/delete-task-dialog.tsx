"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { toast } from "@/components/ui/use-toast"
import { deleteTask } from "@/app/actions"
import type { Task } from "@/lib/types"

interface DeleteTaskDialogProps {
  task: Task
  id?: string
}

export function DeleteTaskDialog({ task, id }: DeleteTaskDialogProps) {
  const [open, setOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const router = useRouter()

  const handleDelete = async () => {
    try {
      setIsDeleting(true)
      await deleteTask(task.id)

      // Show toast notification
      toast({
        title: "Task deleted",
        description: `"${task.name}" has been deleted.`,
        variant: "destructive",
        duration: 3000,
      })

      // Close the dialog
      setOpen(false)

      // If we're on the task detail page, navigate back to the dashboard
      if (window.location.pathname.includes(`/tasks/${task.id}`)) {
        router.push("/")
      }
    } catch (error) {
      console.error("Error deleting task:", error)
      toast({
        title: "Error",
        description: "Failed to delete task. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <Button
        variant="ghost"
        size="icon"
        className="h-9 w-9 text-muted-foreground hover:text-destructive"
        onClick={(e) => {
          e.stopPropagation()
          setOpen(true)
        }}
        id={id}
        aria-label="Delete task"
      >
        <Trash2 className="h-4 w-4" />
      </Button>

      <AlertDialogContent className="max-w-[90vw] w-[400px]">
        <AlertDialogHeader>
          <AlertDialogTitle>Are you sure you want to delete this task?</AlertDialogTitle>
          <AlertDialogDescription>
            This will permanently delete the task "{task.name}". This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="gap-2 sm:gap-0">
          <AlertDialogCancel className="mt-0">Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            disabled={isDeleting}
          >
            {isDeleting ? "Deleting..." : "Delete"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
