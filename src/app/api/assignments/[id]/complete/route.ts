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

    // Check if assignment exists
    const assignment = await db.truckAssignment.findUnique({
      where: { id: params.id },
      include: {
        assignedByUser: true,
      },
    })

    if (!assignment) {
      return NextResponse.json(
        { error: "Assignment not found" },
        { status: 404 }
      )
    }

    // Check permissions
    const canComplete = 
      session.user.role === "ADMIN" ||
      (session.user.role === "TERRITORY_OFFICER" && (
        assignment.assignedByUserId === session.user.id ||
        assignment.destinationCity === session.user.territoryCity
      ))

    if (!canComplete) {
      return NextResponse.json(
        { error: "You don't have permission to complete this assignment" },
        { status: 403 }
      )
    }

    if (assignment.status === "COMPLETED") {
      return NextResponse.json(
        { error: "Assignment is already completed" },
        { status: 400 }
      )
    }

    // Update assignment status
    const updatedAssignment = await db.truckAssignment.update({
      where: { id: params.id },
      data: {
        status: "COMPLETED",
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
    console.error("Error completing assignment:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}