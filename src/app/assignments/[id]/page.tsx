"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { useParams, useRouter } from "next/navigation"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"
import { Truck, MapPin, Package, Clock, User, AlertCircle } from "lucide-react"
import { format } from "date-fns"
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
  reassignedByUser?: {
    name: string
    territoryCity: string
  }
  createdAt: string
  updatedAt: string
}

export default function AssignmentDetailPage() {
  const { data: session } = useSession()
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const [assignment, setAssignment] = useState<Assignment | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchAssignment()
  }, [params.id])

  const fetchAssignment = async () => {
    try {
      const response = await fetch(`/api/assignments/${params.id}`)
      if (response.ok) {
        const data = await response.json()
        setAssignment(data)
      } else {
        router.push("/dashboard")
      }
    } catch (error) {
      console.error("Error fetching assignment:", error)
      router.push("/dashboard")
    } finally {
      setLoading(false)
    }
  }

  const handleComplete = async () => {
    try {
      const response = await fetch(`/api/assignments/${params.id}/complete`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
      })

      if (response.ok) {
        toast({
          title: "Assignment Completed",
          description: "The truck assignment has been marked as completed.",
        })
        fetchAssignment()
      } else {
        toast({
          title: "Error",
          description: "Failed to complete assignment",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An error occurred while completing the assignment",
        variant: "destructive",
      })
    }
  }

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      ASSIGNED: { color: "bg-blue-100 text-blue-800", icon: Truck },
      INCOMING: { color: "bg-yellow-100 text-yellow-800", icon: AlertCircle },
      REASSIGNED: { color: "bg-orange-100 text-orange-800", icon: Truck },
      COMPLETED: { color: "bg-green-100 text-green-800", icon: Clock },
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

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
        </div>
      </DashboardLayout>
    )
  }

  if (!assignment) {
    return (
      <DashboardLayout>
        <div className="text-center py-8">
          <h2 className="text-2xl font-bold text-gray-900">Assignment Not Found</h2>
          <Button onClick={() => router.push("/dashboard")} className="mt-4">
            Back to Dashboard
          </Button>
        </div>
      </DashboardLayout>
    )
  }

  const canComplete = 
    session?.user?.role === "ADMIN" || 
    (session?.user?.role === "TERRITORY_OFFICER" && 
     (assignment.assignedByUser.name === session.user.name || 
      assignment.destinationCity === session.user.territoryCity))

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">
            Assignment Details
          </h1>
          <Button
            variant="outline"
            onClick={() => router.push("/dashboard")}
          >
            Back to Dashboard
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Truck className="h-6 w-6" />
              {assignment.truckNumber}
            </CardTitle>
            <CardDescription>
              Assignment ID: {assignment.id}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <div className="flex items-center text-sm text-gray-500 mb-1">
                    <MapPin className="w-4 h-4 mr-2" />
                    Route
                  </div>
                  <p className="font-medium">
                    {assignment.originCity} → {assignment.destinationCity}
                  </p>
                </div>
                
                <div>
                  <div className="flex items-center text-sm text-gray-500 mb-1">
                    <Package className="w-4 h-4 mr-2" />
                    Goods Type
                  </div>
                  <p className="font-medium">{assignment.goodsType}</p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <div className="flex items-center text-sm text-gray-500 mb-1">
                    <Clock className="w-4 h-4 mr-2" />
                    Departure Time
                  </div>
                  <p className="font-medium">
                    {format(new Date(assignment.departureTime), "MMM d, yyyy HH:mm")}
                  </p>
                </div>
                
                <div>
                  <div className="flex items-center text-sm text-gray-500 mb-1">
                    <Clock className="w-4 h-4 mr-2" />
                    Expected Arrival
                  </div>
                  <p className="font-medium">
                    {format(new Date(assignment.expectedArrivalTime), "MMM d, yyyy HH:mm")}
                  </p>
                </div>
              </div>
            </div>

            <div className="border-t pt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <div className="flex items-center text-sm text-gray-500 mb-1">
                    <User className="w-4 h-4 mr-2" />
                    Assigned By
                  </div>
                  <p className="font-medium">
                    {assignment.assignedByUser.name} ({assignment.assignedByUser.territoryCity})
                  </p>
                </div>

                {assignment.reassignedByUser && (
                  <div>
                    <div className="flex items-center text-sm text-gray-500 mb-1">
                      <User className="w-4 h-4 mr-2" />
                      Reassigned By
                    </div>
                    <p className="font-medium">
                      {assignment.reassignedByUser.name} ({assignment.reassignedByUser.territoryCity})
                    </p>
                  </div>
                )}
              </div>
            </div>

            <div className="border-t pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm text-gray-500 mb-1">Status</div>
                  {getStatusBadge(assignment.status)}
                </div>
                <div className="text-right">
                  <div className="text-sm text-gray-500 mb-1">Last Updated</div>
                  <p className="text-sm">
                    {format(new Date(assignment.updatedAt), "MMM d, yyyy HH:mm")}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
          
          {canComplete && assignment.status !== "COMPLETED" && (
            <CardFooter className="flex justify-end">
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button>
                    Mark as Completed
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Complete Assignment</AlertDialogTitle>
                    <AlertDialogDescription>
                      Are you sure you want to mark this assignment as completed? 
                      This action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleComplete}>
                      Complete Assignment
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </CardFooter>
          )}
        </Card>
      </div>
    </DashboardLayout>
  )
}