import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const ad = await prisma.advertisement.findUnique({
      where: { id: params.id },
      include: {
        user: {
          include: {
            profile: true
          }
        }
      }
    })

    if (!ad) {
      return NextResponse.json(
        { error: "Объявление не найдено" },
        { status: 404 }
      )
    }

    // Увеличиваем счетчик просмотров
    await prisma.advertisement.update({
      where: { id: params.id },
      data: { viewsCount: { increment: 1 } }
    })

    return NextResponse.json(ad)
  } catch (error) {
    console.error("Get ad error:", error)
    return NextResponse.json(
      { error: "Ошибка получения объявления" },
      { status: 500 }
    )
  }
}

export async function DELETE(
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

    const ad = await prisma.advertisement.findUnique({
      where: { id: params.id }
    })

    if (!ad || ad.userId !== session.user.id) {
      return NextResponse.json(
        { error: "Объявление не найдено или нет доступа" },
        { status: 403 }
      )
    }

    await prisma.advertisement.delete({
      where: { id: params.id }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Delete ad error:", error)
    return NextResponse.json(
      { error: "Ошибка удаления объявления" },
      { status: 500 }
    )
  }
}

// Увеличение счетчика кликов
export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await req.json()
    
    if (body.action === "click") {
      await prisma.advertisement.update({
        where: { id: params.id },
        data: { clicksCount: { increment: 1 } }
      })

      return NextResponse.json({ success: true })
    }

    return NextResponse.json(
      { error: "Неизвестное действие" },
      { status: 400 }
    )
  } catch (error) {
    console.error("Update ad error:", error)
    return NextResponse.json(
      { error: "Ошибка обновления объявления" },
      { status: 500 }
    )
  }
}
