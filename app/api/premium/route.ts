import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

const PREMIUM_PLANS = {
  BASIC: { months: 1, price: 500 },
  STANDARD: { months: 3, price: 1200 },
  PREMIUM: { months: 6, price: 2000 },
  VIP: { months: 12, price: 3500 }
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
    const { plan } = body

    if (!plan || !PREMIUM_PLANS[plan as keyof typeof PREMIUM_PLANS]) {
      return NextResponse.json(
        { error: "Неверный план" },
        { status: 400 }
      )
    }

    const planData = PREMIUM_PLANS[plan as keyof typeof PREMIUM_PLANS]
    const endDate = new Date()
    endDate.setMonth(endDate.getMonth() + planData.months)

    // Проверяем, есть ли уже активная подписка
    const existingPremium = await prisma.premium.findUnique({
      where: { userId: session.user.id }
    })

    if (existingPremium && existingPremium.isActive) {
      // Продлеваем существующую подписку
      const premium = await prisma.premium.update({
        where: { userId: session.user.id },
        data: {
          plan,
          endDate,
          isActive: true
        }
      })

      return NextResponse.json({
        message: "Подписка продлена",
        premium
      })
    } else {
      // Создаем новую подписку
      const premium = await prisma.premium.create({
        data: {
          userId: session.user.id,
          plan,
          endDate,
          isActive: true
        }
      })

      return NextResponse.json({
        message: "Премиум активирован",
        premium
      })
    }
  } catch (error) {
    console.error("Activate premium error:", error)
    return NextResponse.json(
      { error: "Ошибка активации премиум" },
      { status: 500 }
    )
  }
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Не авторизован" },
        { status: 401 }
      )
    }

    const premium = await prisma.premium.findUnique({
      where: { userId: session.user.id }
    })

    return NextResponse.json({
      premium,
      plans: PREMIUM_PLANS
    })
  } catch (error) {
    console.error("Get premium error:", error)
    return NextResponse.json(
      { error: "Ошибка получения информации о премиум" },
      { status: 500 }
    )
  }
}
