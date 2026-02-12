import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const profile = await prisma.profile.findUnique({
      where: { id: params.id },
      include: {
        photos: {
          where: { isApproved: true },
          orderBy: { order: "asc" }
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
      }
    })

    if (!profile) {
      return NextResponse.json(
        { error: "Профиль не найден" },
        { status: 404 }
      )
    }

    // Увеличиваем счетчик просмотров
    await prisma.profile.update({
      where: { id: params.id },
      data: { viewsCount: { increment: 1 } }
    })

    return NextResponse.json(profile)
  } catch (error) {
    console.error("Get profile error:", error)
    return NextResponse.json(
      { error: "Ошибка получения профиля" },
      { status: 500 }
    )
  }
}

export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Не авторизован" },
        { status: 401 }
      )
    }

    const body = await req.json()

    // Проверяем, что пользователь редактирует свой профиль
    const profile = await prisma.profile.findUnique({
      where: { id: params.id }
    })

    if (!profile || profile.userId !== session.user.id) {
      return NextResponse.json(
        { error: "Нет доступа" },
        { status: 403 }
      )
    }

    const updatedProfile = await prisma.profile.update({
      where: { id: params.id },
      data: {
        name: body.name,
        bio: body.bio,
        city: body.city,
        country: body.country,
        interests: body.interests,
        occupation: body.occupation,
        education: body.education,
        showOnline: body.showOnline
      },
      include: {
        photos: true
      }
    })

    return NextResponse.json(updatedProfile)
  } catch (error) {
    console.error("Update profile error:", error)
    return NextResponse.json(
      { error: "Ошибка обновления профиля" },
      { status: 500 }
    )
  }
}
