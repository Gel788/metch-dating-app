import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Не авторизован" },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(req.url)
    const withUserId = searchParams.get("withUserId")

    if (withUserId) {
      // Получаем переписку с конкретным пользователем
      const messages = await prisma.message.findMany({
        where: {
          OR: [
            { senderId: session.user.id, receiverId: withUserId },
            { senderId: withUserId, receiverId: session.user.id }
          ]
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
        },
        orderBy: { createdAt: "asc" }
      })

      // Отмечаем сообщения как прочитанные
      await prisma.message.updateMany({
        where: {
          senderId: withUserId,
          receiverId: session.user.id,
          isRead: false
        },
        data: {
          isRead: true,
          readAt: new Date()
        }
      })

      return NextResponse.json(messages)
    } else {
      // Получаем список всех диалогов
      const messages = await prisma.message.findMany({
        where: {
          OR: [
            { senderId: session.user.id },
            { receiverId: session.user.id }
          ]
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
        },
        orderBy: { createdAt: "desc" }
      })

      // Группируем по диалогам
      const dialogues = new Map()
      messages.forEach((msg: any) => {
        const otherUserId = msg.senderId === session.user.id ? msg.receiverId : msg.senderId
        if (!dialogues.has(otherUserId)) {
          dialogues.set(otherUserId, {
            userId: otherUserId,
            user: msg.senderId === session.user.id ? msg.receiver : msg.sender,
            lastMessage: msg,
            unreadCount: 0
          })
        }
        if (msg.receiverId === session.user.id && !msg.isRead) {
          dialogues.get(otherUserId).unreadCount++
        }
      })

      return NextResponse.json(Array.from(dialogues.values()))
    }
  } catch (error) {
    console.error("Get messages error:", error)
    return NextResponse.json(
      { error: "Ошибка получения сообщений" },
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
    const { receiverId, content } = body

    if (!receiverId || !content) {
      return NextResponse.json(
        { error: "Неверные данные" },
        { status: 400 }
      )
    }

    // Проверяем, есть ли у отправителя премиум или ограничение сообщений
    const sender = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: { premium: true }
    })

    if (!sender?.premium?.isActive) {
      // Проверяем лимит сообщений для бесплатных пользователей
      const sentToday = await prisma.message.count({
        where: {
          senderId: session.user.id,
          createdAt: {
            gte: new Date(new Date().setHours(0, 0, 0, 0))
          }
        }
      })

      if (sentToday >= 10) {
        return NextResponse.json(
          { error: "Достигнут лимит сообщений. Оформите премиум для безлимитной переписки" },
          { status: 403 }
        )
      }
    }

    const message = await prisma.message.create({
      data: {
        content,
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

    // Отправляем email уведомление получателю (в фоне)
    if (process.env.EMAIL_USER && message.receiver.email) {
      import("@/lib/email").then(async ({ sendEmail, getNewMessageEmailTemplate }) => {
        try {
          const senderName = message.sender.profile?.name || "Пользователь"
          const messagePreview = content.length > 100 ? content.substring(0, 100) + "..." : content
          
          const template = getNewMessageEmailTemplate(senderName, messagePreview)
          await sendEmail({
            to: message.receiver.email,
            ...template
          })
        } catch (error) {
          console.error("Error sending email notification:", error)
        }
      })
    }

    return NextResponse.json(message)
  } catch (error) {
    console.error("Send message error:", error)
    return NextResponse.json(
      { error: "Ошибка отправки сообщения" },
      { status: 500 }
    )
  }
}
