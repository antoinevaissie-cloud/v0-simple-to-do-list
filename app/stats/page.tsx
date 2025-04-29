"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Skeleton } from "@/components/ui/skeleton"
import { getTasksForNext7Days, getOpenTasksPerDay } from "@/app/actions"
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"
import { useAuth } from "@/components/auth-provider"
import { useRouter } from "next/navigation"

export default function StatsPage() {
  const [activeTab, setActiveTab] = useState("open-tasks")
  const [openTasksPerDay, setOpenTasksPerDay] = useState<{ date: string; count: number }[]>([])
  const [tasksForNext7Days, setTasksForNext7Days] = useState<{ date: string; count: number }[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const { user, isLoading: authLoading } = useAuth()
  const router = useRouter()

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/signin")
    }
  }, [user, authLoading, router])

  useEffect(() => {
    async function fetchStats() {
      try {
        setIsLoading(true)
        const [openTasksData, next7DaysData] = await Promise.all([getOpenTasksPerDay(), getTasksForNext7Days()])

        setOpenTasksPerDay(openTasksData)
        setTasksForNext7Days(next7DaysData)
      } catch (error) {
        console.error("Error fetching stats:", error)
      } finally {
        setIsLoading(false)
      }
    }

    if (user) {
      fetchStats()
    }
  }, [user])

  // Format dates for better display
  const formattedOpenTasksPerDay = openTasksPerDay.map((item) => ({
    ...item,
    date: new Date(item.date).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
  }))

  const formattedTasksForNext7Days = tasksForNext7Days.map((item) => ({
    ...item,
    date: new Date(item.date).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" }),
  }))

  if (authLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Skeleton className="h-12 w-12 rounded-full" />
      </div>
    )
  }

  if (!user) {
    return null // Will redirect in useEffect
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Statistics</h1>
      </div>

      <Tabs defaultValue="open-tasks" onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="open-tasks">Open Tasks Per Day</TabsTrigger>
          <TabsTrigger value="next-7-days">Next 7 Days</TabsTrigger>
        </TabsList>

        <TabsContent value="open-tasks" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Open Tasks Per Day</CardTitle>
              <CardDescription>Number of open tasks over the last 30 days</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[400px]">
                {isLoading ? (
                  <div className="flex items-center justify-center h-full">
                    <Skeleton className="h-[350px] w-full" />
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={formattedOpenTasksPerDay}
                      margin={{
                        top: 5,
                        right: 30,
                        left: 20,
                        bottom: 5,
                      }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" tick={{ fontSize: 12 }} interval={6} />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line
                        type="monotone"
                        dataKey="count"
                        name="Open Tasks"
                        stroke="hsl(var(--primary))"
                        activeDot={{ r: 8 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="next-7-days" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Tasks Due in Next 7 Days</CardTitle>
              <CardDescription>Number of open tasks due each day for the next week</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[400px]">
                {isLoading ? (
                  <div className="flex items-center justify-center h-full">
                    <Skeleton className="h-[350px] w-full" />
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={formattedTasksForNext7Days}
                      margin={{
                        top: 5,
                        right: 30,
                        left: 20,
                        bottom: 5,
                      }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="count" name="Tasks Due" fill="hsl(var(--primary))" />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
