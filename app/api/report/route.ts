import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

// POST - пожаловаться на пользователя
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const reporterId = session.user.id
    const { reportedId, reason, description } = await req.json()

    if (!reportedId || !reason || reportedId === reporterId) {
      return NextResponse.json({ error: "Invalid data" }, { status: 400 })
    }

    // Создать жалобу
    const report = await prisma.report.create({
      data: {
        reporterId,
        reportedId,
        reason,
        description
      }
    })

    // Автоматически заблокировать пользователя
    await prisma.block.create({
      data: {
        blockerId: reporterId,
        blockedId: reportedId,
        reason: `Жалоба: ${reason}`
      }
    }).catch(() => {}) // Игнорировать ошибку если уже заблокирован

    return NextResponse.json({ success: true, report })
  } catch (error) {
    console.error("Error creating report:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
