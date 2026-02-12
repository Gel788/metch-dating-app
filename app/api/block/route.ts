import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

// GET - получить заблокированных пользователей
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const userId = session.user.id

    const blocks = await prisma.block.findMany({
      where: { blockerId: userId },
      orderBy: { createdAt: "desc" },
      include: {
        blocked: {
          include: {
            profile: true
          }
        }
      }
    })

    return NextResponse.json({ blocks })
  } catch (error) {
    console.error("Error fetching blocks:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

// POST - заблокировать пользователя
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const blockerId = session.user.id
    const { blockedId, reason } = await req.json()

    if (!blockedId || blockedId === blockerId) {
      return NextResponse.json({ error: "Invalid user" }, { status: 400 })
    }

    // Создать блокировку
    const block = await prisma.block.create({
      data: {
        blockerId,
        blockedId,
        reason
      }
    })

    return NextResponse.json({ success: true, block })
  } catch (error) {
    console.error("Error blocking user:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

// DELETE - разблокировать
export async function DELETE(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const blockerId = session.user.id
    const { searchParams } = new URL(req.url)
    const blockedId = searchParams.get("userId")

    if (!blockedId) {
      return NextResponse.json({ error: "Missing userId" }, { status: 400 })
    }

    await prisma.block.deleteMany({
      where: {
        blockerId,
        blockedId
      }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error unblocking user:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
