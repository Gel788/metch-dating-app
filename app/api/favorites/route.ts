import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

// GET - получить избранные профили
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const userId = session.user.id

    const favorites = await prisma.favorite.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      include: {
        favoritedUser: {
          include: {
            profile: {
              include: {
                photos: {
                  take: 1
                }
              }
            },
            premium: true
          }
        }
      }
    })

    return NextResponse.json({ favorites })
  } catch (error) {
    console.error("Error fetching favorites:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

// POST - добавить в избранное
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const userId = session.user.id
    const { favoritedUserId } = await req.json()

    if (!favoritedUserId || favoritedUserId === userId) {
      return NextResponse.json({ error: "Invalid user" }, { status: 400 })
    }

    // Создать избранное
    const favorite = await prisma.favorite.create({
      data: {
        userId,
        favoritedUserId
      }
    })

    return NextResponse.json({ success: true, favorite })
  } catch (error) {
    console.error("Error adding favorite:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

// DELETE - удалить из избранного
export async function DELETE(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const userId = session.user.id
    const { searchParams } = new URL(req.url)
    const favoritedUserId = searchParams.get("userId")

    if (!favoritedUserId) {
      return NextResponse.json({ error: "Missing userId" }, { status: 400 })
    }

    await prisma.favorite.deleteMany({
      where: {
        userId,
        favoritedUserId
      }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error removing favorite:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
