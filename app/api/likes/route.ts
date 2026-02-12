import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

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
    const { receiverId } = body

    if (!receiverId) {
      return NextResponse.json(
        { error: "Неверные данные" },
        { status: 400 }
      )
    }

    // Проверяем, не лайкнули ли уже
    const existingLike = await prisma.like.findUnique({
      where: {
        giverId_receiverId: {
          giverId: session.user.id,
          receiverId
        }
      }
    })

    if (existingLike) {
      return NextResponse.json(
        { error: "Вы уже лайкнули этот профиль" },
        { status: 400 }
      )
    }

    const like = await prisma.like.create({
      data: {
        giverId: session.user.id,
        receiverId
      }
    })

    // Увеличиваем счетчик лайков у профиля
    await prisma.profile.update({
      where: { userId: receiverId },
      data: { likesCount: { increment: 1 } }
    })

    // Проверяем взаимный лайк
    const mutualLike = await prisma.like.findUnique({
      where: {
        giverId_receiverId: {
          giverId: receiverId,
          receiverId: session.user.id
        }
      }
    })

    // Отправляем email уведомления (в фоне, не блокируем ответ)
    if (process.env.EMAIL_USER) {
      import("@/lib/email").then(async ({ sendEmail, getNewLikeEmailTemplate, getMatchEmailTemplate }) => {
        try {
          const receiver = await prisma.user.findUnique({
            where: { id: receiverId },
            include: { profile: true }
          })

          const sender = await prisma.user.findUnique({
            where: { id: session.user.id },
            include: { profile: true }
          })

          if (receiver?.email && sender?.profile?.name) {
            if (mutualLike) {
              // Отправляем email о Match обоим пользователям
              const matchTemplate = getMatchEmailTemplate(sender.profile.name)
              await sendEmail({
                to: receiver.email,
                ...matchTemplate
              })

              if (sender.email) {
                const matchTemplate2 = getMatchEmailTemplate(receiver.profile?.name || "Пользователь")
                await sendEmail({
                  to: sender.email,
                  ...matchTemplate2
                })
              }
            } else {
              // Отправляем email о новом лайке
              const template = getNewLikeEmailTemplate(sender.profile.name)
              await sendEmail({
                to: receiver.email,
                ...template
              })
            }
          }
        } catch (error) {
          console.error("Error sending email notification:", error)
        }
      })
    }

    return NextResponse.json({
      like,
      mutual: !!mutualLike
    })
  } catch (error) {
    console.error("Create like error:", error)
    return NextResponse.json(
      { error: "Ошибка создания лайка" },
      { status: 500 }
    )
  }
}

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Не авторизован" },
        { status: 401 }
      )
    }

    // Получаем лайки, которые дали нам
    const receivedLikes = await prisma.like.findMany({
      where: { receiverId: session.user.id },
      include: {
        giver: {
          include: {
            profile: true
          }
        }
      },
      orderBy: { createdAt: "desc" }
    })

    return NextResponse.json(receivedLikes)
  } catch (error) {
    console.error("Get likes error:", error)
    return NextResponse.json(
      { error: "Ошибка получения лайков" },
      { status: 500 }
    )
  }
}

export async function DELETE() {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Не авторизован" },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(req.url)
    const receiverId = searchParams.get("receiverId")

    if (!receiverId) {
      return NextResponse.json(
        { error: "Неверные данные" },
        { status: 400 }
      )
    }

    await prisma.like.delete({
      where: {
        giverId_receiverId: {
          giverId: session.user.id,
          receiverId
        }
      }
    })

    // Уменьшаем счетчик лайков
    await prisma.profile.update({
      where: { userId: receiverId },
      data: { likesCount: { decrement: 1 } }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Delete like error:", error)
    return NextResponse.json(
      { error: "Ошибка удаления лайка" },
      { status: 500 }
    )
  }
}
