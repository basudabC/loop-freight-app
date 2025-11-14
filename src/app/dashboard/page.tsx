"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Truck, Clock, CheckCircle, AlertCircle } from "lucide-react"
import { format } from "date-fns"
import { useRouter } from "next/navigation"

interface Assignment {
  id: string
  truckNumber: string
  originCity: string
  destinationCity: string
  goodsType: string
  departureTime: string
  expectedArrivalTime: string
  status: string
}

export default function DashboardPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const [assignments, setAssignments] = useState<Assignment[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchAssignments()
  }, [session])

  const fetchAssignments = async () => {
    try {
      const url = session?.user?.role === "ADMIN" 
        ? "/api/assignments"
        : `/api/assignments?city=${session?.user?.territoryCity}`
      
      const response = await fetch(url)
      if (response.ok) {
        const data = await response.json()
        setAssignments(data)
      }
    } catch (error) {
      console.error("Error fetching assignments:", error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      ASSIGNED: { color: "bg-blue-100 text-blue-800", icon: Truck },
      INCOMING: { color: "bg-yellow-100 text-yellow-800", icon: AlertCircle },
      REASSIGNED: { color: "bg-orange-100 text-orange-800", icon: Truck },
      COMPLETED: { color: "bg-green-100 text-green-800", icon: CheckCircle },
    }

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.ASSIGNED
    const Icon = config.icon

    return (
      <Badge className={config.color}>
        <Icon className="w-3 h-3 mr-1" />
        {status}
      </Badge>
    )
  }

  const stats = {
    total: assignments.length,
    incoming: assignments.filter(a => a.status === "INCOMING").length,
    active: assignments.filter(a => a.status === "ASSIGNED" || a.status === "REASSIGNED").length,
    completed: assignments.filter(a => a.status === "COMPLETED").length,
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Total Assignments</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Active Trucks</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.active}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Incoming Trucks</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.incoming}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Completed</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.completed}</div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Assignments */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Assignments</CardTitle>
            <CardDescription>
              {session?.user?.role === "ADMIN" 
                ? "All assignments across territories"
                : `Assignments for ${session?.user?.territoryCity}`}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {assignments.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No assignments found
                </div>
              ) : (
                assignments.slice(0, 10).map((assignment) => (
                  <div
                    key={assignment.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 cursor-pointer"
                    onClick={() => router.push(`/assignments/${assignment.id}`)}
                  >
                    <div className="flex items-center space-x-4">
                      <Truck className="h-8 w-8 text-gray-400" />
                      <div>
                        <p className="font-medium">
                          {assignment.truckNumber} - {assignment.goodsType}
                        </p>
                        <p className="text-sm text-gray-500">
                          {assignment.originCity} → {assignment.destinationCity}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        <p className="text-sm text-gray-500">
                          Expected: {format(new Date(assignment.expectedArrivalTime), "MMM d, HH:mm")}
                        </p>
                      </div>
                      {getStatusBadge(assignment.status)}
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}