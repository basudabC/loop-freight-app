import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    if (session.user.role !== "TERRITORY_OFFICER") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const city = searchParams.get("city")

    if (!city) {
      return NextResponse.json(
        { error: "City parameter is required" },
        { status: 400 }
      )
    }

    // Get current time
    const now = new Date()
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000) // 1 hour ago

    // Update assignments that have arrived
    await db.truckAssignment.updateMany({
      where: {
        destinationCity: city,
        expectedArrivalTime: {
          lte: now,
        },
        status: "ASSIGNED",
      },
      data: {
        status: "INCOMING",
      },
    })

    // Fetch incoming assignments
    const incomingAssignments = await db.truckAssignment.findMany({
      where: {
        destinationCity: city,
        status: {
          in: ["INCOMING", "REASSIGNED"],
        },
      },
      include: {
        assignedByUser: {
          select: {
            name: true,
            territoryCity: true,
          },
        },
      },
      orderBy: {
        expectedArrivalTime: "asc",
      },
    })

    return NextResponse.json(incomingAssignments)
  } catch (error) {
    console.error("Error fetching incoming assignments:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}