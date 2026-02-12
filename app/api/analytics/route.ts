import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const userId = session.user.id
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)

    // Получить профиль
    const profile = await prisma.profile.findUnique({
      where: { userId },
      select: {
        viewsCount: true,
        likesCount: true
      }
    })

    // Просмотры за неделю
    const viewsLastWeek = await prisma.profileView.count({
      where: {
        viewedId: userId,
        createdAt: { gte: weekAgo }
      }
    })

    // Лайки за неделю
    const likesLastWeek = await prisma.like.count({
      where: {
        receiverId: userId,
        createdAt: { gte: weekAgo }
      }
    })

    // Сообщения за неделю
    const messagesLastWeek = await prisma.message.count({
      where: {
        receiverId: userId,
        createdAt: { gte: weekAgo }
      }
    })

    return NextResponse.json({
      profile,
      viewsLastWeek,
      likesLastWeek,
      messagesLastWeek
    })
  } catch (error) {
    console.error("Error fetching analytics:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
