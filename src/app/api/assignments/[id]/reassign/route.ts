import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    if (session.user.role !== "TERRITORY_OFFICER") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const { reassignedByUserId } = await request.json()

    if (!reassignedByUserId) {
      return NextResponse.json(
        { error: "Reassigned by user ID is required" },
        { status: 400 }
      )
    }

    // Check if assignment exists and is in INCOMING status
    const assignment = await db.truckAssignment.findUnique({
      where: { id: params.id },
    })

    if (!assignment) {
      return NextResponse.json(
        { error: "Assignment not found" },
        { status: 404 }
      )
    }

    if (assignment.status !== "INCOMING") {
      return NextResponse.json(
        { error: "Assignment is not in incoming status" },
        { status: 400 }
      )
    }

    if (assignment.destinationCity !== session.user.territoryCity) {
      return NextResponse.json(
        { error: "You can only reassign trucks arriving at your territory" },
        { status: 403 }
      )
    }

    // Update assignment status
    const updatedAssignment = await db.truckAssignment.update({
      where: { id: params.id },
      data: {
        status: "REASSIGNED",
        reassignedByUserId,
      },
      include: {
        assignedByUser: {
          select: {
            name: true,
            territoryCity: true,
          },
        },
        reassignedByUser: {
          select: {
            name: true,
            territoryCity: true,
          },
        },
      },
    })

    return NextResponse.json(updatedAssignment)
  } catch (error) {
    console.error("Error reassigning truck:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}