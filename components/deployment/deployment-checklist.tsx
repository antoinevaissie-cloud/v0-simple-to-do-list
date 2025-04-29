"use client"

import { useState, useEffect } from "react"
import { getCategoriesWithItems, DEPLOYMENT_CHECKLIST } from "@/lib/deployment-checklist"
import {
  loadChecklistState,
  updateChecklistItem,
  resetChecklistState,
  getCompletionStats,
} from "@/lib/checklist-storage"
import { ChecklistCategory } from "./checklist-category"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { CheckCircle2, DownloadCloud, RefreshCw, AlertTriangle } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

export function DeploymentChecklist() {
  const [checklistState, setChecklistState] = useState(() => loadChecklistState())
  const [categoriesWithItems] = useState(() => getCategoriesWithItems())
  const [stats, setStats] = useState(() => getCompletionStats(checklistState))
  const [resetDialogOpen, setResetDialogOpen] = useState(false)

  // Update stats when checklist state changes
  useEffect(() => {
    setStats(getCompletionStats(checklistState))
  }, [checklistState])

  // Handle item toggle
  const handleToggleItem = (id: string, completed: boolean) => {
    const newState = updateChecklistItem(id, completed)
    setChecklistState(newState)
  }

  // Handle reset
  const handleReset = () => {
    const newState = resetChecklistState()
    setChecklistState(newState)
    setResetDialogOpen(false)
  }

  // Run all automated checks
  const runAllAutomatedChecks = async () => {
    const automatedItems = DEPLOYMENT_CHECKLIST.filter((item) => item.automated && item.automatedCheck)

    for (const item of automatedItems) {
      if (item.automatedCheck) {
        try {
          const result = await item.automatedCheck()
          if (result) {
            handleToggleItem(item.id, true)
          }
        } catch (error) {
          console.error(`Error running automated check for ${item.id}:`, error)
        }
      }
    }
  }

  return (
    <div className="space-y-6">
      {/* Summary card */}
      <div className="p-6 border rounded-lg bg-card">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-2xl font-bold mb-2">Deployment Readiness</h2>
            <p className="text-muted-foreground">
              {stats.completedItems} of {stats.totalItems} tasks completed ({stats.completionPercentage}%)
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button variant="outline" onClick={runAllAutomatedChecks} className="h-9">
              <RefreshCw className="h-4 w-4 mr-2" />
              Run All Checks
            </Button>

            <Dialog open={resetDialogOpen} onOpenChange={setResetDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" className="h-9">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Reset Checklist
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Reset Deployment Checklist</DialogTitle>
                  <DialogDescription>
                    Are you sure you want to reset the entire checklist? This will mark all items as incomplete.
                  </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setResetDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button variant="destructive" onClick={handleReset}>
                    Reset
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            <Button disabled={!stats.isReadyForDeployment} className="h-9">
              <DownloadCloud className="h-4 w-4 mr-2" />
              Deploy
            </Button>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <div className="flex justify-between mb-2">
              <span className="text-sm font-medium">Overall Progress</span>
              <span className="text-sm text-muted-foreground">{stats.completionPercentage}%</span>
            </div>
            <Progress value={stats.completionPercentage} className="h-2" />
          </div>

          <div>
            <div className="flex justify-between mb-2">
              <span className="text-sm font-medium">Critical Items</span>
              <span className="text-sm text-muted-foreground">
                {stats.completedCriticalItems} of {stats.criticalItems} ({stats.criticalCompletionPercentage}%)
              </span>
            </div>
            <Progress
              value={stats.criticalCompletionPercentage}
              className="h-2"
              indicatorClassName={stats.criticalCompletionPercentage === 100 ? "bg-green-500" : "bg-amber-500"}
            />
          </div>
        </div>

        {/* Deployment readiness alert */}
        {stats.isReadyForDeployment ? (
          <Alert className="mt-6 border-green-500 bg-green-500/10">
            <CheckCircle2 className="h-4 w-4 text-green-500" />
            <AlertTitle className="text-green-500">Ready for deployment</AlertTitle>
            <AlertDescription>
              All critical items have been completed. You can proceed with deployment.
            </AlertDescription>
          </Alert>
        ) : (
          <Alert className="mt-6 border-amber-500 bg-amber-500/10">
            <AlertTriangle className="h-4 w-4 text-amber-500" />
            <AlertTitle className="text-amber-500">Not ready for deployment</AlertTitle>
            <AlertDescription>
              {stats.criticalItems - stats.completedCriticalItems} critical items still need to be completed before
              deployment.
            </AlertDescription>
          </Alert>
        )}
      </div>

      {/* Categories */}
      {categoriesWithItems.map(({ category, items }) => (
        <ChecklistCategory
          key={category.id}
          categoryId={category.id}
          items={items}
          completedItems={checklistState.items}
          onToggleItem={handleToggleItem}
        />
      ))}
    </div>
  )
}
