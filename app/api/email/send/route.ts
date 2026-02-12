import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { sendEmail } from "@/lib/email"

// Этот endpoint для внутреннего использования или для тестирования
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
    const { to, subject, html, text } = body

    if (!to || !subject || !html) {
      return NextResponse.json(
        { error: "Недостаточно данных" },
        { status: 400 }
      )
    }

    const result = await sendEmail({ to, subject, html, text })

    if (!result.success) {
      return NextResponse.json(
        { error: "Ошибка отправки email" },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      messageId: result.messageId
    })
  } catch (error) {
    console.error("Send email error:", error)
    return NextResponse.json(
      { error: "Ошибка отправки email" },
      { status: 500 }
    )
  }
}
