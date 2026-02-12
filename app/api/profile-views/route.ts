import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

// GET - кто смотрел мой профиль
export async function GET(req: NextRequest) {
  try {
    console.log("[profile-views] Starting GET request...")
    
    const session = await getServerSession(authOptions)
    console.log("[profile-views] Session:", session?.user?.id ? "✅ Found" : "❌ Not found")
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const userId = session.user.id
    console.log("[profile-views] User ID:", userId)

    // Проверить Premium
    const premium = await prisma.premium.findUnique({
      where: { userId }
    }).catch(err => {
      console.error("[profile-views] Premium check error:", err)
      return null
    })

    const hasPremium = premium && new Date(premium.expiresAt) > new Date()
    console.log("[profile-views] Has premium:", hasPremium)

    // Получить просмотры
    console.log("[profile-views] Fetching profile views...")
    const views = await prisma.profileView.findMany({
      where: { viewedId: userId },
      orderBy: { createdAt: "desc" },
      take: hasPremium ? 100 : 5, // Premium = все, Free = 5
      include: {
        viewer: {
          include: {
            profile: {
              select: {
                name: true,
                avatarUrl: true,
                birthDate: true,
                city: true
              }
            },
            premium: true
          }
        }
      }
    }).catch((error) => {
      console.error("[profile-views] Database error:", error)
      return []
    })

    console.log("[profile-views] Found", views.length, "views")

    // Группировать по viewerId (показывать только последний просмотр)
    const uniqueViews = views.reduce((acc, view) => {
      if (!acc.find(v => v.viewerId === view.viewerId)) {
        acc.push(view)
      }
      return acc
    }, [] as typeof views)

    console.log("[profile-views] Returning", uniqueViews.length, "unique views")

    return NextResponse.json({
      views: uniqueViews,
      hasPremium,
      total: uniqueViews.length
    })
  } catch (error: any) {
    console.error("[profile-views] CRITICAL ERROR:", error?.message, error?.stack)
    return NextResponse.json(
      { error: "Internal server error", details: error?.message },
      { status: 500 }
    )
  }
}

// POST - записать просмотр
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const viewerId = session.user.id
    const { viewedId } = await req.json()

    if (!viewedId || viewedId === viewerId) {
      return NextResponse.json({ error: "Invalid user" }, { status: 400 })
    }

    // Создать запись просмотра
    await prisma.profileView.create({
      data: {
        viewerId,
        viewedId
      }
    })

    // Обновить счетчик
    await prisma.profile.update({
      where: { userId: viewedId },
      data: { viewsCount: { increment: 1 } }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    // Игнорируем ошибки дубликатов (уже просмотрено недавно)
    return NextResponse.json({ success: true })
  }
}
