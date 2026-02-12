import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

const createAdSchema = z.object({
  title: z.string().min(5).max(100),
  description: z.string().min(20).max(1000),
  category: z.enum(["PROFILE_PROMOTION", "ANNOUNCEMENT", "EVENT", "SERVICE"]),
  position: z.enum(["TOP_BANNER", "SIDEBAR", "FEED", "STANDARD"]),
  duration: z.number().min(1).max(90), // дни
  targetGender: z.enum(["MALE", "FEMALE", "OTHER"]).optional(),
  targetAgeMin: z.number().min(18).max(100).optional(),
  targetAgeMax: z.number().min(18).max(100).optional(),
  targetCities: z.array(z.string()).optional()
})

// Цены на рекламу (в условных единицах)
const AD_PRICES = {
  TOP_BANNER: 1000,   // за день
  SIDEBAR: 500,       // за день
  FEED: 300,          // за день
  STANDARD: 100       // за день
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const position = searchParams.get("position")
    const userOnly = searchParams.get("userOnly") === "true"

    const session = await getServerSession(authOptions)

    const where: Record<string, unknown> = {
      isActive: true,
      endDate: { gte: new Date() }
    }

    if (position) {
      where.position = position
    }

    if (userOnly && session?.user?.id) {
      where.userId = session.user.id
    }

    const ads = await prisma.advertisement.findMany({
      where,
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
      orderBy: [
        { priority: "desc" },
        { createdAt: "desc" }
      ],
      take: position === "FEED" ? 50 : 10
    })

    return NextResponse.json(ads)
  } catch (error) {
    console.error("Get ads error:", error)
    return NextResponse.json(
      { error: "Ошибка получения объявлений" },
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
    const validatedData = createAdSchema.parse(body)

    // Проверяем Premium подписку
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: { premium: true }
    })

    if (!user?.premium?.isActive) {
      return NextResponse.json(
        { error: "Размещение платных объявлений доступно только Premium пользователям" },
        { status: 403 }
      )
    }

    // Рассчитываем стоимость
    const pricePerDay = AD_PRICES[validatedData.position]
    const totalPrice = pricePerDay * validatedData.duration

    // Рассчитываем дату окончания
    const endDate = new Date()
    endDate.setDate(endDate.getDate() + validatedData.duration)

    // Создаем объявление
    const ad = await prisma.advertisement.create({
      data: {
        userId: session.user.id,
        title: validatedData.title,
        description: validatedData.description,
        category: validatedData.category,
        position: validatedData.position,
        isPaid: true,
        isActive: true,
        endDate,
        priority: validatedData.position === "TOP_BANNER" ? 100 : 
                 validatedData.position === "SIDEBAR" ? 50 : 
                 validatedData.position === "FEED" ? 30 : 10,
        targetGender: validatedData.targetGender,
        targetAgeMin: validatedData.targetAgeMin,
        targetAgeMax: validatedData.targetAgeMax,
        targetCities: validatedData.targetCities || []
      },
      include: {
        user: {
          include: {
            profile: true
          }
        }
      }
    })

    return NextResponse.json({
      ad,
      price: totalPrice,
      pricePerDay,
      message: `Объявление создано! Стоимость: ${totalPrice} ₽ за ${validatedData.duration} дней`
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Неверные данные", details: error.errors },
        { status: 400 }
      )
    }

    console.error("Create ad error:", error)
    return NextResponse.json(
      { error: "Ошибка создания объявления" },
      { status: 500 }
    )
  }
}
