import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

// GET - получить следующий профиль для swipe
export async function GET(req: NextRequest) {
  try {
    console.log("[swipe] GET request started")
    const session = await getServerSession(authOptions)
    console.log("[swipe] Session user:", session?.user?.id ? "✅ Found" : "❌ Not found")
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const userId = session.user.id
    console.log("[swipe] User ID:", userId)

    // Получить ID пользователей, которых уже свайпнули
    const swipedUsers = await prisma.swipe.findMany({
      where: { fromUserId: userId },
      select: { toUserId: true }
    })

    const swipedUserIds = swipedUsers.map(s => s.toUserId)

    // Получить ID заблокированных пользователей
    const blockedUsers = await prisma.block.findMany({
      where: {
        OR: [
          { blockerId: userId },
          { blockedId: userId }
        ]
      },
      select: { blockerId: true, blockedId: true }
    })

    const blockedUserIds = blockedUsers.flatMap(b => [b.blockerId, b.blockedId])

    // Получить свой профиль для фильтрации
    const myProfile = await prisma.profile.findUnique({
      where: { userId }
    })

    // Найти случайный профиль
    // Определяем предпочитаемый пол на основе lookingFor
    type Gender = "MALE" | "FEMALE" | "OTHER"
    let preferredGender: Gender | undefined = undefined
    
    if (myProfile?.lookingFor === "SPONSOR") {
      // Ищем спонсора - обычно мужчины
      preferredGender = "MALE" as Gender
    } else if (myProfile?.lookingFor === "COMPANION") {
      // Ищем компаньона - может быть любой пол, но противоположный
      preferredGender = (myProfile.gender === "MALE" ? "FEMALE" : "MALE") as Gender
    }
    // Если RELATIONSHIP или другое - показываем всех

    // СНАЧАЛА пробуем найти по предпочтениям
    let profiles = await prisma.profile.findMany({
      where: {
        userId: {
          notIn: [...swipedUserIds, ...blockedUserIds, userId]
        },
        ...(preferredGender ? { gender: preferredGender as any } : {})
      },
      include: {
        user: {
          include: {
            premium: true
          }
        },
        photos: true
      },
      take: 20
    })

    console.log(`[swipe] Found ${profiles.length} profiles with filter for user ${userId}`)
    console.log(`[swipe] My gender: ${myProfile?.gender}, lookingFor: ${myProfile?.lookingFor}, preferredGender: ${preferredGender}`)

    // ЕСЛИ НИКОГО НЕТ - показываем ВСЕХ доступных (без фильтра по полу)
    if (profiles.length === 0) {
      console.log(`[swipe] No profiles with filter, trying without gender filter...`)
      
      profiles = await prisma.profile.findMany({
        where: {
          userId: {
            notIn: [...swipedUserIds, ...blockedUserIds, userId]
          }
        },
        include: {
          user: {
            include: {
              premium: true
            }
          },
          photos: true
        },
        take: 20
      })
      
      console.log(`[swipe] Found ${profiles.length} profiles WITHOUT filter`)
    }

    // ЕСЛИ ВСЁ ЕЩЁ ПУСТО - сбрасываем свайпы (показываем заново)
    if (profiles.length === 0 && swipedUserIds.length > 0) {
      console.log(`[swipe] All profiles swiped, resetting swipes...`)
      
      // Удаляем только DISLIKE свайпы, чтобы показать заново
      await prisma.swipe.deleteMany({
        where: {
          fromUserId: userId,
          action: "DISLIKE"
        }
      })
      
      // Пробуем снова
      profiles = await prisma.profile.findMany({
        where: {
          userId: {
            notIn: [...blockedUserIds, userId]
          }
        },
        include: {
          user: {
            include: {
              premium: true
            }
          },
          photos: true
        },
        take: 20
      })
      
      console.log(`[swipe] Found ${profiles.length} profiles after reset`)
    }

    if (profiles.length === 0) {
      return NextResponse.json({ profile: null, message: "Нет больше профилей" })
    }

    // Случайный профиль из результатов
    const randomProfile = profiles[Math.floor(Math.random() * profiles.length)]

    return NextResponse.json({ profile: randomProfile })
  } catch (error: any) {
    console.error("[swipe] Error fetching swipe profile:", error)
    console.error("[swipe] Error details:", error?.message, error?.stack)
    return NextResponse.json(
      { error: "Internal server error", details: error?.message },
      { status: 500 }
    )
  }
}

// POST - сделать swipe действие
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const userId = session.user.id
    const { toUserId, action } = await req.json()

    if (!toUserId || !action) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 })
    }

    // Проверить, не свайпнули ли уже
    const existing = await prisma.swipe.findUnique({
      where: {
        fromUserId_toUserId: {
          fromUserId: userId,
          toUserId
        }
      }
    })

    if (existing) {
      return NextResponse.json({ error: "Already swiped" }, { status: 400 })
    }

    // Создать swipe
    const swipe = await prisma.swipe.create({
      data: {
        fromUserId: userId,
        toUserId,
        action
      }
    })

    // Проверить на match (если это LIKE или SUPERLIKE)
    let isMatch = false
    if (action === "LIKE" || action === "SUPERLIKE") {
      const reverseSwipe = await prisma.swipe.findUnique({
        where: {
          fromUserId_toUserId: {
            fromUserId: toUserId,
            toUserId: userId
          }
        }
      })

      if (reverseSwipe && (reverseSwipe.action === "LIKE" || reverseSwipe.action === "SUPERLIKE")) {
        isMatch = true

        // Обновить оба swipe
        await prisma.swipe.updateMany({
          where: {
            OR: [
              { fromUserId: userId, toUserId },
              { fromUserId: toUserId, toUserId: userId }
            ]
          },
          data: { isMatch: true }
        })

        // Создать Like для совместимости со старой системой
        const existingLike = await prisma.like.findUnique({
          where: {
            giverId_receiverId: {
              giverId: userId,
              receiverId: toUserId
            }
          }
        })

        if (!existingLike) {
          await prisma.like.create({
            data: {
              giverId: userId,
              receiverId: toUserId
            }
          })

          // Обновить счетчик лайков
          await prisma.profile.update({
            where: { userId: toUserId },
            data: { likesCount: { increment: 1 } }
          })
        }
      }
    }

    return NextResponse.json({
      success: true,
      isMatch,
      swipe
    })
  } catch (error) {
    console.error("Error creating swipe:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
