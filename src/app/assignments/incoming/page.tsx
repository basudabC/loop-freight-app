"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Truck, Clock, MapPin, Package } from "lucide-react"
import { format } from "date-fns"
import { useRouter } from "next/navigation"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"
import { useToast } from "@/components/ui/use-toast"

interface Assignment {
  id: string
  truckNumber: string
  originCity: string
  destinationCity: string
  goodsType: string
  departureTime: string
  expectedArrivalTime: string
  status: string
  assignedByUser: {
    name: string
    territoryCity: string
  }
}

export default function IncomingAssignmentsPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const { toast } = useToast()
  const [assignments, setAssignments] = useState<Assignment[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null)

  useEffect(() => {
    fetchIncomingAssignments()
  }, [session])

  const fetchIncomingAssignments = async () => {
    try {
      const response = await fetch(`/api/assignments/incoming?city=${session?.user?.territoryCity}`)
      if (response.ok) {
        const data = await response.json()
        setAssignments(data)
      }
    } catch (error) {
      console.error("Error fetching incoming assignments:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleReassign = async (assignment: Assignment) => {
    setSelectedAssignment(assignment)
  }

  const confirmReassign = async () => {
    if (!selectedAssignment) return

    try {
      const response = await fetch(`/api/assignments/${selectedAssignment.id}/reassign`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          reassignedByUserId: session?.user?.id,
        }),
      })

      if (response.ok) {
        toast({
          title: "Truck Reassigned",
          description: `Truck ${selectedAssignment.truckNumber} is now available for reassignment.`,
        })
        fetchIncomingAssignments()
      } else {
        toast({
          title: "Error",
          description: "Failed to reassign truck",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An error occurred while reassigning the truck",
        variant: "destructive",
      })
    } finally {
      setSelectedAssignment(null)
    }
  }

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      ASSIGNED: { color: "bg-blue-100 text-blue-800" },
      INCOMING: { color: "bg-yellow-100 text-yellow-800" },
      REASSIGNED: { color: "bg-orange-100 text-orange-800" },
      COMPLETED: { color: "bg-green-100 text-green-800" },
    }

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.ASSIGNED

    return (
      <Badge className={config.color}>
        {status}
      </Badge>
    )
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
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">Incoming Trucks</h1>
          <p className="text-sm text-gray-500">
            Trucks arriving at {session?.user?.territoryCity}
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Available for Reassignment</CardTitle>
            <CardDescription>
              Trucks that have arrived or are arriving at your territory
            </CardDescription>
          </CardHeader>
          <CardContent>
            {assignments.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No incoming trucks at the moment
              </div>
            ) : (
              <div className="space-y-4">
                {assignments.map((assignment) => (
                  <div
                    key={assignment.id}
                    className="p-4 border rounded-lg hover:bg-gray-50"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <Truck className="h-8 w-8 text-gray-400" />
                        <div>
                          <p className="font-medium">
                            {assignment.truckNumber} - {assignment.goodsType}
                          </p>
                          <div className="flex items-center space-x-4 mt-1 text-sm text-gray-500">
                            <span className="flex items-center">
                              <MapPin className="w-4 h-4 mr-1" />
                              {assignment.originCity} → {assignment.destinationCity}
                            </span>
                            <span className="flex items-center">
                              <Package className="w-4 h-4 mr-1" />
                              {assignment.goodsType}
                            </span>
                            <span className="flex items-center">
                              <Clock className="w-4 h-4 mr-1" />
                              Expected: {format(new Date(assignment.expectedArrivalTime), "MMM d, HH:mm")}
                            </span>
                          </div>
                          <p className="text-xs text-gray-400 mt-1">
                            Assigned by: {assignment.assignedByUser.name} ({assignment.assignedByUser.territoryCity})
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        {getStatusBadge(assignment.status)}
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              size="sm"
                              onClick={() => handleReassign(assignment)}
                            >
                              Reassign
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Reassign Truck</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to reassign truck {selectedAssignment?.truckNumber}? 
                                This will make it available for new assignments from {session?.user?.territoryCity}.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={confirmReassign}>
                                Reassign Truck
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}