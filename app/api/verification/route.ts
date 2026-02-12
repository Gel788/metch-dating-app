import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

// GET - получить статус верификации
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const userId = session.user.id

    const verification = await prisma.verification.findUnique({
      where: { userId }
    })

    return NextResponse.json({ verification })
  } catch (error) {
    console.error("Error fetching verification:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

// POST - запросить верификацию
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const userId = session.user.id
    const { photoUrl, documentUrl, notes } = await req.json()

    if (!photoUrl) {
      return NextResponse.json({ error: "Photo required" }, { status: 400 })
    }

    // Создать или обновить запрос на верификацию
    const verification = await prisma.verification.upsert({
      where: { userId },
      update: {
        photoUrl,
        documentUrl,
        notes,
        status: "PENDING"
      },
      create: {
        userId,
        photoUrl,
        documentUrl,
        notes,
        status: "PENDING"
      }
    })

    return NextResponse.json({ success: true, verification })
  } catch (error) {
    console.error("Error creating verification:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
