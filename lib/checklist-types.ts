export interface ChecklistItem {
  id: string
  title: string
  description: string
  category: ChecklistCategoryType
  completed: boolean
  automated?: boolean
  automatedCheck?: () => Promise<boolean> | boolean
  critical: boolean
}

export type ChecklistCategoryType =
  | "environment"
  | "database"
  | "authentication"
  | "performance"
  | "testing"
  | "accessibility"
  | "seo"
  | "monitoring"
  | "security"
  | "documentation"

export interface ChecklistCategory {
  id: ChecklistCategoryType
  name: string
  description: string
  icon: string
}

export interface ChecklistState {
  items: Record<string, boolean> // id -> completed
  lastUpdated: string
}
