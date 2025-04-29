"use client"

import { useState } from "react"
import type { ChecklistItem } from "@/lib/checklist-types"
import { CHECKLIST_CATEGORIES } from "@/lib/deployment-checklist"
import { ChecklistItemComponent } from "./checklist-item"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChevronDown, ChevronUp } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import * as Icons from "lucide-react"

interface ChecklistCategoryProps {
  categoryId: string
  items: ChecklistItem[]
  completedItems: Record<string, boolean>
  onToggleItem: (id: string, completed: boolean) => void
}

export function ChecklistCategory({ categoryId, items, completedItems, onToggleItem }: ChecklistCategoryProps) {
  const [isExpanded, setIsExpanded] = useState(true)
  const category = CHECKLIST_CATEGORIES[categoryId as keyof typeof CHECKLIST_CATEGORIES]

  if (!category) return null

  // Get the icon component
  const IconComponent = Icons[category.icon as keyof typeof Icons] || Icons.CheckSquare

  // Calculate completion stats
  const totalItems = items.length
  const completedCount = items.filter((item) => completedItems[item.id]).length
  const completionPercentage = totalItems > 0 ? Math.round((completedCount / totalItems) * 100) : 0

  return (
    <Card className="mb-6">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between cursor-pointer" onClick={() => setIsExpanded(!isExpanded)}>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-md bg-primary/10">
              <IconComponent className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle>{category.name}</CardTitle>
              <CardDescription>{category.description}</CardDescription>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-sm text-muted-foreground">
              {completedCount} of {totalItems} completed ({completionPercentage}%)
            </div>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
              {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </Button>
          </div>
        </div>

        {/* Progress bar */}
        <div className="h-2 w-full bg-muted rounded-full mt-2 overflow-hidden">
          <div
            className={cn(
              "h-full transition-all duration-300",
              completionPercentage === 100 ? "bg-green-500" : "bg-primary",
            )}
            style={{ width: `${completionPercentage}%` }}
          />
        </div>
      </CardHeader>

      {isExpanded && (
        <CardContent className="pt-2">
          <div className="space-y-3">
            {items.map((item) => (
              <ChecklistItemComponent
                key={item.id}
                item={item}
                isCompleted={!!completedItems[item.id]}
                onToggle={onToggleItem}
              />
            ))}
          </div>
        </CardContent>
      )}
    </Card>
  )
}
