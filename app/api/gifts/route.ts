import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

// Каталог виртуальных подарков
const GIFT_CATALOG = [
  { id: "rose", name: "Роза", imageUrl: "/gifts/rose.svg", price: 10 },
  { id: "bouquet", name: "Букет цветов", imageUrl: "/gifts/bouquet.svg", price: 50 },
  { id: "chocolate", name: "Шоколад", imageUrl: "/gifts/chocolate.svg", price: 30 },
  { id: "teddy", name: "Плюшевый мишка", imageUrl: "/gifts/teddy.svg", price: 100 },
  { id: "champagne", name: "Шампанское", imageUrl: "/gifts/champagne.svg", price: 150 },
  { id: "diamond", name: "Бриллиант", imageUrl: "/gifts/diamond.svg", price: 500 },
]

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const catalog = searchParams.get("catalog")
    const userId = searchParams.get("userId")

    if (catalog === "true") {
      // Возвращаем каталог подарков
      return NextResponse.json(GIFT_CATALOG)
    }

    if (userId) {
      // Получаем подарки конкретного пользователя
      const gifts = await prisma.gift.findMany({
        where: { receiverId: userId },
        include: {
          sender: {
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
        orderBy: { createdAt: "desc" }
      })

      return NextResponse.json(gifts)
    }

    return NextResponse.json([])
  } catch (error) {
    console.error("Get gifts error:", error)
    return NextResponse.json(
      { error: "Ошибка получения подарков" },
      { status: 500 }
    )
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Не авторизован" },
        { status: 401 }
      )
    }

    const body = await req.json()
    const { receiverId, giftId } = body

    if (!receiverId || !giftId) {
      return NextResponse.json(
        { error: "Неверные данные" },
        { status: 400 }
      )
    }

    // Находим подарок в каталоге
    const giftData = GIFT_CATALOG.find(g => g.id === giftId)

    if (!giftData) {
      return NextResponse.json(
        { error: "Подарок не найден" },
        { status: 404 }
      )
    }

    // Проверяем, есть ли у пользователя премиум
    const sender = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: { premium: true }
    })

    if (!sender?.premium?.isActive) {
      return NextResponse.json(
        { error: "Отправка подарков доступна только премиум-пользователям" },
        { status: 403 }
      )
    }

    // Создаем подарок
    const gift = await prisma.gift.create({
      data: {
        name: giftData.name,
        imageUrl: giftData.imageUrl,
        price: giftData.price,
        senderId: session.user.id,
        receiverId
      },
      include: {
        sender: {
          include: {
            profile: {
              select: {
                name: true,
                avatarUrl: true
              }
            }
          }
        },
        receiver: {
          include: {
            profile: {
              select: {
                name: true,
                avatarUrl: true
              }
            }
          }
        }
      }
    })

    return NextResponse.json(gift)
  } catch (error) {
    console.error("Send gift error:", error)
    return NextResponse.json(
      { error: "Ошибка отправки подарка" },
      { status: 500 }
    )
  }
}
