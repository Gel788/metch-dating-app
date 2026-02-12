import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

// GET - получить активный boost
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const userId = session.user.id
    const now = new Date()

    const activeBoost = await prisma.boost.findFirst({
      where: {
        userId,
        endTime: { gte: now }
      },
      orderBy: { endTime: "desc" }
    })

    return NextResponse.json({ boost: activeBoost })
  } catch (error) {
    console.error("Error fetching boost:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

// POST - активировать boost
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const userId = session.user.id
    const { duration } = await req.json() // минуты: 30, 60, 180

    if (!duration || ![30, 60, 180].includes(duration)) {
      return NextResponse.json({ error: "Invalid duration" }, { status: 400 })
    }

    // Проверить Premium
    const premium = await prisma.premium.findUnique({
      where: { userId }
    })

    const hasPremium = premium && premium.isActive && new Date(premium.endDate) > new Date()

    if (!hasPremium) {
      return NextResponse.json({ error: "Premium required" }, { status: 403 })
    }

    const now = new Date()
    const endTime = new Date(now.getTime() + duration * 60 * 1000)

    // Создать boost
    const boost = await prisma.boost.create({
      data: {
        userId,
        duration,
        startTime: now,
        endTime
      }
    })

    return NextResponse.json({ success: true, boost })
  } catch (error) {
    console.error("Error creating boost:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
