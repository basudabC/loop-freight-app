import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const assignment = await db.truckAssignment.findUnique({
      where: { id: params.id },
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

    if (!assignment) {
      return NextResponse.json(
        { error: "Assignment not found" },
        { status: 404 }
      )
    }

    // Check permissions
    const canView = 
      session.user.role === "ADMIN" ||
      assignment.assignedByUserId === session.user.id ||
      assignment.destinationCity === session.user.territoryCity ||
      assignment.originCity === session.user.territoryCity

    if (!canView) {
      return NextResponse.json(
        { error: "You don't have permission to view this assignment" },
        { status: 403 }
      )
    }

    return NextResponse.json(assignment)
  } catch (error) {
    console.error("Error fetching assignment:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    if (session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const body = await request.json()
    const {
      truckNumber,
      originCity,
      destinationCity,
      goodsType,
      departureTime,
      expectedArrivalTime,
      status,
    } = body

    // Check if assignment exists
    const existingAssignment = await db.truckAssignment.findUnique({
      where: { id: params.id },
    })

    if (!existingAssignment) {
      return NextResponse.json(
        { error: "Assignment not found" },
        { status: 404 }
      )
    }

    // Update assignment
    const assignment = await db.truckAssignment.update({
      where: { id: params.id },
      data: {
        truckNumber,
        originCity,
        destinationCity,
        goodsType,
        departureTime: departureTime ? new Date(departureTime) : undefined,
        expectedArrivalTime: expectedArrivalTime ? new Date(expectedArrivalTime) : undefined,
        status,
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

    return NextResponse.json(assignment)
  } catch (error) {
    console.error("Error updating assignment:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    if (session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    // Check if assignment exists
    const existingAssignment = await db.truckAssignment.findUnique({
      where: { id: params.id },
    })

    if (!existingAssignment) {
      return NextResponse.json(
        { error: "Assignment not found" },
        { status: 404 }
      )
    }

    // Delete assignment
    await db.truckAssignment.delete({
      where: { id: params.id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting assignment:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}