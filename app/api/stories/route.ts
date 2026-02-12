import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

// GET - получить активные истории
export async function GET(req: NextRequest) {
  try {
    const now = new Date()

    // Получить истории, которые еще не истекли
    const stories = await prisma.story.findMany({
      where: {
        expiresAt: { gte: now }
      },
      orderBy: { createdAt: "desc" },
      include: {
        user: {
          include: {
            profile: {
              select: {
                name: true,
                avatarUrl: true
              }
            }
          }
        }
      },
      take: 50
    })

    // Группировать по пользователям
    const groupedStories = stories.reduce((acc, story) => {
      const userId = story.userId
      if (!acc[userId]) {
        acc[userId] = {
          user: story.user,
          stories: []
        }
      }
      acc[userId].stories.push(story)
      return acc
    }, {} as Record<string, any>)

    return NextResponse.json({ stories: Object.values(groupedStories) })
  } catch (error) {
    console.error("Error fetching stories:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

// POST - создать историю
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const userId = session.user.id
    const { mediaUrl, mediaType, caption } = await req.json()

    if (!mediaUrl || !mediaType) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 })
    }

    const now = new Date()
    const expiresAt = new Date(now.getTime() + 24 * 60 * 60 * 1000) // +24 часа

    // Создать историю
    const story = await prisma.story.create({
      data: {
        userId,
        mediaUrl,
        mediaType,
        caption,
        expiresAt
      }
    })

    return NextResponse.json({ success: true, story })
  } catch (error) {
    console.error("Error creating story:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

// DELETE - удалить историю
export async function DELETE(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const userId = session.user.id
    const { searchParams } = new URL(req.url)
    const storyId = searchParams.get("id")

    if (!storyId) {
      return NextResponse.json({ error: "Missing storyId" }, { status: 400 })
    }

    // Удалить только свою историю
    await prisma.story.deleteMany({
      where: {
        id: storyId,
        userId
      }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting story:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
