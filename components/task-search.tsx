"use client"

import { useState, useEffect, useCallback } from "react"
import { Search, X } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useTasksContext } from "@/components/tasks-provider"

export function TaskSearch() {
  const { tasks, setSearchResults } = useTasksContext()
  const [searchQuery, setSearchQuery] = useState("")
  const [isSearching, setIsSearching] = useState(false)

  // Memoize the search function to prevent unnecessary re-renders
  const performSearch = useCallback(
    (query: string) => {
      if (!query.trim()) {
        setSearchResults(tasks)
        return
      }

      setIsSearching(true)

      // Normalize the search query for case-insensitive search
      const normalizedQuery = query.toLowerCase().trim()

      // Search in task name and description
      const results = tasks.filter(
        (task) =>
          task.name.toLowerCase().includes(normalizedQuery) ||
          (task.description && task.description.toLowerCase().includes(normalizedQuery)),
      )

      setSearchResults(results)
      setIsSearching(false)
    },
    [tasks, setSearchResults],
  )

  // Perform search when query changes
  useEffect(() => {
    // Add a small delay to avoid searching on every keystroke
    const handler = setTimeout(() => {
      performSearch(searchQuery)
    }, 300)

    return () => {
      clearTimeout(handler)
    }
  }, [searchQuery, performSearch])

  // Clear search
  const handleClearSearch = () => {
    setSearchQuery("")
    setSearchResults(tasks)
  }

  return (
    <div className="relative">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Search tasks by name or description..."
          className="pl-10 pr-10 h-12 text-base"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          inputMode="search"
          aria-label="Search tasks"
        />
        {searchQuery && (
          <Button
            variant="ghost"
            size="sm"
            className="absolute right-1 top-1/2 -translate-y-1/2 h-10 w-10 p-0 hover:bg-transparent"
            onClick={handleClearSearch}
            aria-label="Clear search"
          >
            <X className="h-5 w-5 text-muted-foreground" />
          </Button>
        )}
      </div>
    </div>
  )
}
