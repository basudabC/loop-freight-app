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

    const { searchParams } = new URL(request.url)
    const city = searchParams.get("city")

    let assignments

    if (session.user.role === "ADMIN") {
      assignments = await db.truckAssignment.findMany({
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
        orderBy: {
          createdAt: "desc",
        },
      })
    } else if (session.user.role === "TERRITORY_OFFICER") {
      if (city) {
        assignments = await db.truckAssignment.findMany({
          where: {
            OR: [
              { originCity: city },
              { destinationCity: city },
            ],
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
          orderBy: {
            createdAt: "desc",
          },
        })
      } else {
        assignments = await db.truckAssignment.findMany({
          where: {
            assignedByUserId: session.user.id,
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
          orderBy: {
            createdAt: "desc",
          },
        })
      }
    } else {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    return NextResponse.json(assignments)
  } catch (error) {
    console.error("Error fetching assignments:", error)
    return NextResponse.json(
      { error: "Internal server error", details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Check if user has permission to create assignments
    if (!session?.user?.id) {
      return NextResponse.json({ error: "User session invalid" }, { status: 401 })
    }

    if (session.user.role !== "TERRITORY_OFFICER" && session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden - Only territory officers and admins can create assignments" }, { status: 403 })
    }

    const body = await request.json()
    const {
      truckNumber,
      originCity,
      destinationCity,
      goodsType,
      departureTime,
      expectedArrivalTime,
    } = body

    // Validate input
    if (!truckNumber || !originCity || !destinationCity || !goodsType || !departureTime || !expectedArrivalTime) {
      return NextResponse.json(
        { error: "All fields are required" },
        { status: 400 }
      )
    }

    // Validate dates
    const departure = new Date(departureTime)
    const arrival = new Date(expectedArrivalTime)
    
    if (isNaN(departure.getTime()) || isNaN(arrival.getTime())) {
      return NextResponse.json(
        { error: "Invalid date format" },
        { status: 400 }
      )
    }

    if (arrival <= departure) {
      return NextResponse.json(
        { error: "Expected arrival time must be after departure time" },
        { status: 400 }
      )
    }

    // Check if truck is already assigned (optional - remove if not needed)
    const existingAssignment = await db.truckAssignment.findFirst({
      where: {
        truckNumber,
        status: {
          in: ["ASSIGNED", "INCOMING"],
        },
      },
    })

    if (existingAssignment) {
      return NextResponse.json(
        { error: "Truck is already assigned to another route" },
        { status: 400 }
      )
    }

    // Create the assignment
    const assignment = await db.truckAssignment.create({
      data: {
        truckNumber,
        originCity,
        destinationCity,
        goodsType,
        departureTime: departure,
        expectedArrivalTime: arrival,
        assignedByUserId: session.user.id,
        status: "ASSIGNED",
      },
      include: {
        assignedByUser: {
          select: {
            name: true,
            territoryCity: true,
          },
        },
      },
    })

    return NextResponse.json(assignment, { status: 201 })
  } catch (error) {
    console.error("Error creating assignment:", error)
    
    // Return detailed error for debugging
    return NextResponse.json(
      { 
        error: "Internal server error", 
        details: error instanceof Error ? error.message : String(error),
        stack: process.env.NODE_ENV === 'development' ? (error instanceof Error ? error.stack : undefined) : undefined
      },
      { status: 500 }
    )
  }
}