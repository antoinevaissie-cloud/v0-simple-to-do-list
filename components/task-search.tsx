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
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Search tasks by name or description..."
          className="pl-8 pr-10"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        {searchQuery && (
          <Button
            variant="ghost"
            size="sm"
            className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
            onClick={handleClearSearch}
          >
            <X className="h-4 w-4 text-muted-foreground" />
            <span className="sr-only">Clear search</span>
          </Button>
        )}
      </div>
    </div>
  )
}
