import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"
import { z } from "zod"

const signupSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  name: z.string().min(2),
  gender: z.enum(["MALE", "FEMALE", "OTHER"]),
  birthDate: z.string(),
  lookingFor: z.enum(["SPONSOR", "COMPANION", "FRIENDSHIP", "RELATIONSHIP"])
})

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const validatedData = signupSchema.parse(body)

    // Проверяем, существует ли пользователь
    const existingUser = await prisma.user.findUnique({
      where: { email: validatedData.email }
    })

    if (existingUser) {
      return NextResponse.json(
        { error: "Пользователь с таким email уже существует" },
        { status: 400 }
      )
    }

    // Хешируем пароль
    const hashedPassword = await bcrypt.hash(validatedData.password, 10)

    // Создаем пользователя и профиль
    const user = await prisma.user.create({
      data: {
        email: validatedData.email,
        password: hashedPassword,
        profile: {
          create: {
            name: validatedData.name,
            gender: validatedData.gender,
            birthDate: new Date(validatedData.birthDate),
            lookingFor: validatedData.lookingFor
          }
        }
      },
      include: {
        profile: true
      }
    })

    // Отправляем приветственный email (в фоне)
    if (process.env.EMAIL_USER) {
      import("@/lib/email").then(async ({ sendEmail, getWelcomeEmailTemplate }) => {
        try {
          const template = getWelcomeEmailTemplate(validatedData.name)
          await sendEmail({
            to: user.email,
            ...template
          })
        } catch (error) {
          console.error("Error sending welcome email:", error)
        }
      })
    }

    return NextResponse.json({
      message: "Регистрация успешна",
      user: {
        id: user.id,
        email: user.email,
        profile: user.profile
      }
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Неверные данные", details: error.errors },
        { status: 400 }
      )
    }

    console.error("Signup error:", error)
    return NextResponse.json(
      { error: "Ошибка регистрации" },
      { status: 500 }
    )
  }
}
