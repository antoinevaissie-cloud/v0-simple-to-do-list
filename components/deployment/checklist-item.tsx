"use client"

import { useState } from "react"
import type { ChecklistItem } from "@/lib/checklist-types"
import { Checkbox } from "@/components/ui/checkbox"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { PlayIcon, CheckCircle2Icon } from "lucide-react"
import { cn } from "@/lib/utils"

interface ChecklistItemProps {
  item: ChecklistItem
  isCompleted: boolean
  onToggle: (id: string, completed: boolean) => void
}

export function ChecklistItemComponent({ item, isCompleted, onToggle }: ChecklistItemProps) {
  const [isRunningCheck, setIsRunningCheck] = useState(false)
  const [autoCheckResult, setAutoCheckResult] = useState<boolean | null>(null)

  const runAutomatedCheck = async () => {
    if (!item.automatedCheck) return

    setIsRunningCheck(true)
    setAutoCheckResult(null)

    try {
      const result = await item.automatedCheck()
      setAutoCheckResult(result)

      // If the check passes, mark the item as completed
      if (result) {
        onToggle(item.id, true)
      }
    } catch (error) {
      console.error(`Error running automated check for ${item.id}:`, error)
      setAutoCheckResult(false)
    } finally {
      setIsRunningCheck(false)
    }
  }

  return (
    <div
      className={cn(
        "p-4 border rounded-lg transition-colors",
        isCompleted ? "bg-muted/50 border-muted" : "bg-card border-border",
        item.critical && !isCompleted && "border-amber-500/50",
      )}
    >
      <div className="flex items-start gap-3">
        <Checkbox
          id={`checklist-item-${item.id}`}
          checked={isCompleted}
          onCheckedChange={(checked) => onToggle(item.id, checked === true)}
          className="mt-1"
        />
        <div className="flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <label
              htmlFor={`checklist-item-${item.id}`}
              className={cn("font-medium cursor-pointer", isCompleted && "line-through text-muted-foreground")}
            >
              {item.title}
            </label>

            {item.critical && (
              <Badge variant="outline" className="border-amber-500 text-amber-500">
                Critical
              </Badge>
            )}

            {item.automated && (
              <Badge variant="outline" className="border-blue-500 text-blue-500">
                Automated
              </Badge>
            )}
          </div>

          <p className="text-sm text-muted-foreground mt-1">{item.description}</p>

          {item.automated && item.automatedCheck && (
            <div className="mt-3 flex items-center gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={runAutomatedCheck}
                disabled={isRunningCheck || isCompleted}
                className="h-8"
              >
                {isRunningCheck ? (
                  <>
                    <span className="animate-spin mr-2">⟳</span>
                    Running check...
                  </>
                ) : (
                  <>
                    <PlayIcon className="h-3 w-3 mr-2" />
                    Run check
                  </>
                )}
              </Button>

              {autoCheckResult !== null && (
                <span className={cn("text-sm flex items-center", autoCheckResult ? "text-green-500" : "text-red-500")}>
                  {autoCheckResult ? (
                    <>
                      <CheckCircle2Icon className="h-4 w-4 mr-1" />
                      Check passed
                    </>
                  ) : (
                    <>
                      <span className="text-red-500 mr-1">✗</span>
                      Check failed
                    </>
                  )}
                </span>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
