import type { ChecklistState } from "./checklist-types"
import { DEPLOYMENT_CHECKLIST } from "./deployment-checklist"

const STORAGE_KEY = "deployment-checklist-state"

// Initialize the checklist state
export function initializeChecklistState(): ChecklistState {
  const initialState: ChecklistState = {
    items: {},
    lastUpdated: new Date().toISOString(),
  }

  // Set all items to uncompleted by default
  DEPLOYMENT_CHECKLIST.forEach((item) => {
    initialState.items[item.id] = false
  })

  return initialState
}

// Load the checklist state from localStorage
export function loadChecklistState(): ChecklistState {
  if (typeof window === "undefined") {
    return initializeChecklistState()
  }

  try {
    const savedState = localStorage.getItem(STORAGE_KEY)
    if (!savedState) {
      return initializeChecklistState()
    }

    const parsedState = JSON.parse(savedState) as ChecklistState

    // Ensure all items exist in the state
    const state = { ...parsedState }
    DEPLOYMENT_CHECKLIST.forEach((item) => {
      if (state.items[item.id] === undefined) {
        state.items[item.id] = false
      }
    })

    return state
  } catch (error) {
    console.error("Error loading checklist state:", error)
    return initializeChecklistState()
  }
}

// Save the checklist state to localStorage
export function saveChecklistState(state: ChecklistState): void {
  if (typeof window === "undefined") {
    return
  }

  try {
    const stateToSave = {
      ...state,
      lastUpdated: new Date().toISOString(),
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(stateToSave))
  } catch (error) {
    console.error("Error saving checklist state:", error)
  }
}

// Update an item's completion status
export function updateChecklistItem(id: string, completed: boolean): ChecklistState {
  const state = loadChecklistState()
  state.items[id] = completed
  state.lastUpdated = new Date().toISOString()
  saveChecklistState(state)
  return state
}

// Reset the checklist state
export function resetChecklistState(): ChecklistState {
  const state = initializeChecklistState()
  saveChecklistState(state)
  return state
}

// Get completion statistics
export function getCompletionStats(state: ChecklistState) {
  const totalItems = DEPLOYMENT_CHECKLIST.length
  const completedItems = Object.values(state.items).filter(Boolean).length
  const completionPercentage = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0

  const criticalItems = DEPLOYMENT_CHECKLIST.filter((item) => item.critical)
  const completedCriticalItems = criticalItems.filter((item) => state.items[item.id]).length
  const criticalCompletionPercentage =
    criticalItems.length > 0 ? Math.round((completedCriticalItems / criticalItems.length) * 100) : 0

  return {
    totalItems,
    completedItems,
    completionPercentage,
    criticalItems: criticalItems.length,
    completedCriticalItems,
    criticalCompletionPercentage,
    isReadyForDeployment: completedCriticalItems === criticalItems.length,
  }
}
