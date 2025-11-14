import { PrismaClient } from "@prisma/client"
import bcrypt from "bcryptjs"

const prisma = new PrismaClient()

async function main() {
  console.log("🌱 Seeding database...")

  // Create admin user
  const adminPassword = await bcrypt.hash("admin123", 12)
  const admin = await prisma.user.upsert({
    where: { email: "admin@loopfreight.io" },
    update: {},
    create: {
      name: "System Administrator",
      email: "admin@loopfreight.io",
      password: adminPassword,
      role: "ADMIN",
    },
  })

  // Create territory officers
  const territoryOfficers = [
    {
      name: "John Smith",
      email: "john.smith@loopfreight.io",
      territoryCity: "New York",
      password: "officer123",
    },
    {
      name: "Sarah Johnson",
      email: "sarah.johnson@loopfreight.io",
      territoryCity: "Los Angeles",
      password: "officer123",
    },
    {
      name: "Michael Brown",
      email: "michael.brown@loopfreight.io",
      territoryCity: "Chicago",
      password: "officer123",
    },
    {
      name: "Emily Davis",
      email: "emily.davis@loopfreight.io",
      territoryCity: "Houston",
      password: "officer123",
    },
    {
      name: "David Wilson",
      email: "david.wilson@loopfreight.io",
      territoryCity: "Phoenix",
      password: "officer123",
    },
  ]

  for (const officer of territoryOfficers) {
    const hashedPassword = await bcrypt.hash(officer.password, 12)
    await prisma.user.upsert({
      where: { email: officer.email },
      update: {},
      create: {
        name: officer.name,
        email: officer.email,
        password: hashedPassword,
        role: "TERRITORY_OFFICER",
        territoryCity: officer.territoryCity,
      },
    })
  }

  // Get all users to create assignments
  const users = await prisma.user.findMany({
    where: {
      role: "TERRITORY_OFFICER",
    },
  })

  const cities = ["New York", "Los Angeles", "Chicago", "Houston", "Phoenix"]
  const goodsTypes = [
    "Electronics",
    "Food & Beverages",
    "Clothing",
    "Building Materials",
    "Automotive Parts",
  ]
  const truckNumbers = ["TRK-001", "TRK-002", "TRK-003", "TRK-004", "TRK-005"]

  // Create sample assignments
  for (let i = 0; i < 10; i++) {
    const originCity = cities[Math.floor(Math.random() * cities.length)]
    let destinationCity = cities[Math.floor(Math.random() * cities.length)]
    while (destinationCity === originCity) {
      destinationCity = cities[Math.floor(Math.random() * cities.length)]
    }

    const user = users.find(u => u.territoryCity === originCity) || users[0]
    const departureTime = new Date()
    departureTime.setDate(departureTime.getDate() - Math.floor(Math.random() * 7))
    
    const expectedArrivalTime = new Date(departureTime)
    expectedArrivalTime.setHours(expectedArrivalTime.getHours() + 8 + Math.floor(Math.random() * 16))

    await prisma.truckAssignment.create({
      data: {
        truckNumber: truckNumbers[Math.floor(Math.random() * truckNumbers.length)],
        originCity,
        destinationCity,
        goodsType: goodsTypes[Math.floor(Math.random() * goodsTypes.length)],
        departureTime,
        expectedArrivalTime,
        status: Math.random() > 0.5 ? "COMPLETED" : "ASSIGNED",
        assignedByUserId: user.id,
      },
    })
  }

  console.log("✅ Database seeded successfully!")
  console.log("🔑 Admin Login:")
  console.log("   Email: admin@loopfreight.io")
  console.log("   Password: admin123")
  console.log("\n👥 Territory Officer Logins:")
  territoryOfficers.forEach((officer, index) => {
    console.log(`   ${index + 1}. ${officer.email} / ${officer.password} (${officer.territoryCity})`)
  })
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })