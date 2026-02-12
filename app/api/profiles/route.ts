import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    const { searchParams } = new URL(req.url)

    // Фильтры
    const gender = searchParams.get("gender")
    const lookingFor = searchParams.get("lookingFor")
    const minAge = searchParams.get("minAge")
    const maxAge = searchParams.get("maxAge")
    const city = searchParams.get("city")
    const nearby = searchParams.get("nearby")
    const height = searchParams.get("height")
    const bodyType = searchParams.get("bodyType")
    const smoking = searchParams.get("smoking")
    const drinking = searchParams.get("drinking")
    const relationship = searchParams.get("relationship")
    const hasChildren = searchParams.get("hasChildren")
    const wantsChildren = searchParams.get("wantsChildren")
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "20")

    const where: Record<string, unknown> = {}

    // Исключаем текущего пользователя
    if (session?.user?.id) {
      where.userId = { not: session.user.id }
    }

    if (gender) {
      where.gender = gender
    }

    if (lookingFor) {
      where.lookingFor = lookingFor
    }

    if (city) {
      where.city = { contains: city, mode: "insensitive" }
    }

    // Расширенные фильтры
    if (height) {
      const [minHeight, maxHeight] = height.split("-").map(Number)
      where.height = { gte: minHeight, lte: maxHeight }
    }

    if (bodyType) {
      where.bodyType = bodyType
    }

    if (smoking) {
      where.smoking = smoking
    }

    if (drinking) {
      where.drinking = drinking
    }

    if (relationship) {
      where.relationship = relationship
    }

    if (hasChildren) {
      where.hasChildren = hasChildren
    }

    if (wantsChildren) {
      where.wantsChildren = wantsChildren
    }

    // Геолокация "Рядом" (если есть координаты пользователя)
    if (nearby === "true") {
      const session = await getServerSession(authOptions)
      if (session?.user?.id) {
        const myProfile = await prisma.profile.findUnique({
          where: { userId: session.user.id },
          select: { latitude: true, longitude: true }
        })

        if (myProfile?.latitude && myProfile?.longitude) {
          // Фильтр по радиусу ~50км (примерно 0.5 градуса)
          where.latitude = {
            gte: myProfile.latitude - 0.5,
            lte: myProfile.latitude + 0.5
          }
          where.longitude = {
            gte: myProfile.longitude - 0.5,
            lte: myProfile.longitude + 0.5
          }
        }
      }
    }

    // Фильтр по возрасту
    if (minAge || maxAge) {
      const now = new Date()
      const birthDateFilter: any = {}
      
      if (maxAge) {
        const minBirthDate = new Date(now.getFullYear() - parseInt(maxAge), now.getMonth(), now.getDate())
        birthDateFilter.gte = minBirthDate
      }
      if (minAge) {
        const maxBirthDate = new Date(now.getFullYear() - parseInt(minAge), now.getMonth(), now.getDate())
        birthDateFilter.lte = maxBirthDate
      }
      
      where.birthDate = birthDateFilter
    }

    // Получаем профили с сортировкой (премиум и топ сначала)
    const profiles = await prisma.profile.findMany({
      where,
      include: {
        photos: {
          take: 1
        },
        user: {
          select: {
            id: true,
            createdAt: true,
            premium: {
              select: {
                isActive: true
              }
            }
          }
        }
      },
      orderBy: [
        { createdAt: "desc" }
      ],
      skip: (page - 1) * limit,
      take: limit
    })

    const total = await prisma.profile.count({ where })

    return NextResponse.json({
      profiles,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error("Get profiles error:", error)
    return NextResponse.json(
      { error: "Ошибка получения профилей" },
      { status: 500 }
    )
  }
}
