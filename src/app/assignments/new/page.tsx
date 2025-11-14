"use client"

import { useState } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2, AlertCircle } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { Alert, AlertDescription } from "@/components/ui/alert"

const cities = [
  "Dhaka", "Chattogram", "Rajshahi", "Khulna", "Sylhet",
  "Barishal", "Rangpur", "Mymensingh", "Narayanganj", "Cox's Bazar",
  "Gazipur", "Cumilla", "Bogura", "Jessore", "Dinajpur"
]

const goodsTypes = [
  "Electronics", "Food & Beverages", "Clothing", "Building Materials",
  "Automotive Parts", "Chemicals", "Machinery", "Textiles",
  "Furniture", "Pharmaceuticals", "Agricultural Products", "Other"
]

export default function NewAssignmentPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    truckNumber: "",
    originCity: session?.user?.territoryCity || "",
    destinationCity: "",
    goodsType: "",
    departureTime: "",
    expectedArrivalTime: "",
  })

  // Update origin city when session loads
  if (session?.user?.territoryCity && formData.originCity !== session.user.territoryCity) {
    setFormData(prev => ({ ...prev, originCity: session.user.territoryCity || "" }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    // Client-side validation
    if (!formData.truckNumber.trim()) {
      setError("Truck number is required")
      setLoading(false)
      return
    }

    if (!formData.destinationCity) {
      setError("Destination city is required")
      setLoading(false)
      return
    }

    if (!formData.goodsType) {
      setError("Goods type is required")
      setLoading(false)
      return
    }

    if (!formData.departureTime || !formData.expectedArrivalTime) {
      setError("Departure and arrival times are required")
      setLoading(false)
      return
    }

    // Validate dates
    const departureDate = new Date(formData.departureTime)
    const arrivalDate = new Date(formData.expectedArrivalTime)

    if (arrivalDate <= departureDate) {
      setError("Expected arrival time must be after departure time")
      setLoading(false)
      return
    }

    try {
      console.log("Submitting assignment:", {
        ...formData,
        departureTime: departureDate.toISOString(),
        expectedArrivalTime: arrivalDate.toISOString(),
      })

      const response = await fetch("/api/assignments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          departureTime: departureDate.toISOString(),
          expectedArrivalTime: arrivalDate.toISOString(),
        }),
      })

      const data = await response.json()
      console.log("Response:", data)

      if (response.ok) {
        toast({
          title: "Assignment Created",
          description: "Truck assignment has been created successfully.",
        })
        router.push("/dashboard")
      } else {
        const errorMessage = data.details || data.error || "Failed to create assignment"
        setError(errorMessage)
        toast({
          title: "Error",
          description: errorMessage,
          variant: "destructive",
        })
        console.error("API Error:", data)
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "An error occurred while creating the assignment"
      setError(errorMessage)
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      })
      console.error("Request Error:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    setError(null) // Clear error when user makes changes
  }

  // Show loading state while session is loading
  if (status === "loading") {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    )
  }

  // Redirect if not authenticated
  if (status === "unauthenticated") {
    router.push("/login")
    return null
  }

  return (
    <DashboardLayout>
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>Create New Assignment</CardTitle>
            <CardDescription>
              Assign a truck for transportation between cities
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="truckNumber">Truck Number *</Label>
                  <Input
                    id="truckNumber"
                    placeholder="e.g., DH-1234 or TRK-001"
                    value={formData.truckNumber}
                    onChange={(e) => handleChange("truckNumber", e.target.value)}
                    required
                    disabled={loading}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="goodsType">Goods Type *</Label>
                  <Select
                    value={formData.goodsType}
                    onValueChange={(value) => handleChange("goodsType", value)}
                    disabled={loading}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select goods type" />
                    </SelectTrigger>
                    <SelectContent>
                      {goodsTypes.map((type) => (
                        <SelectItem key={type} value={type}>
                          {type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="originCity">Origin City</Label>
                  <Input
                    id="originCity"
                    value={formData.originCity}
                    disabled
                    className="bg-gray-50 dark:bg-gray-900"
                  />
                  <p className="text-xs text-muted-foreground">
                    Your assigned territory
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="destinationCity">Destination City *</Label>
                  <Select
                    value={formData.destinationCity}
                    onValueChange={(value) => handleChange("destinationCity", value)}
                    disabled={loading}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select destination city" />
                    </SelectTrigger>
                    <SelectContent>
                      {cities
                        .filter(city => city !== formData.originCity)
                        .map((city) => (
                          <SelectItem key={city} value={city}>
                            {city}
                          </SelectItem>
                        ))
                      }
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="departureTime">Departure Time *</Label>
                  <Input
                    id="departureTime"
                    type="datetime-local"
                    value={formData.departureTime}
                    onChange={(e) => handleChange("departureTime", e.target.value)}
                    required
                    disabled={loading}
                    min={new Date().toISOString().slice(0, 16)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="expectedArrivalTime">Expected Arrival Time *</Label>
                  <Input
                    id="expectedArrivalTime"
                    type="datetime-local"
                    value={formData.expectedArrivalTime}
                    onChange={(e) => handleChange("expectedArrivalTime", e.target.value)}
                    required
                    disabled={loading}
                    min={formData.departureTime || new Date().toISOString().slice(0, 16)}
                  />
                </div>
              </div>

              <div className="text-sm text-muted-foreground">
                * Required fields
              </div>
            </CardContent>
            <CardFooter className="flex justify-end space-x-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push("/dashboard")}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  "Create Assignment"
                )}
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    </DashboardLayout>
  )
}