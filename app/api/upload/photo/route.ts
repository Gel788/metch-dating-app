import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { writeFile, mkdir } from "fs/promises"
import { join } from "path"
import { existsSync } from "fs"

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Не авторизован" },
        { status: 401 }
      )
    }

    const formData = await req.formData()
    const file = formData.get("file") as File
    const isAvatar = formData.get("isAvatar") === "true"

    if (!file) {
      return NextResponse.json(
        { error: "Файл не найден" },
        { status: 400 }
      )
    }

    // Проверка типа файла
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"]
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: "Неподдерживаемый формат файла. Используйте JPG, PNG или WebP" },
        { status: 400 }
      )
    }

    // Проверка размера файла (макс 5MB)
    const maxSize = 5 * 1024 * 1024
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: "Файл слишком большой. Максимальный размер: 5MB" },
        { status: 400 }
      )
    }

    // Создаем директорию для загрузок если её нет
    const uploadsDir = join(process.cwd(), "public", "uploads", "photos")
    if (!existsSync(uploadsDir)) {
      await mkdir(uploadsDir, { recursive: true })
    }

    // Генерируем уникальное имя файла
    const timestamp = Date.now()
    const ext = file.name.split(".").pop()
    const filename = `${session.user.id}_${timestamp}.${ext}`
    const filepath = join(uploadsDir, filename)

    // Сохраняем файл
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    await writeFile(filepath, buffer)

    const photoUrl = `/uploads/photos/${filename}`

    // Находим профиль пользователя
    const profile = await prisma.profile.findUnique({
      where: { userId: session.user.id }
    })

    if (!profile) {
      return NextResponse.json(
        { error: "Профиль не найден" },
        { status: 404 }
      )
    }

    if (isAvatar) {
      // Обновляем аватар
      await prisma.profile.update({
        where: { id: profile.id },
        data: { avatarUrl: photoUrl }
      })

      return NextResponse.json({
        url: photoUrl,
        isAvatar: true,
        message: "Аватар успешно обновлен"
      })
    } else {
      // Добавляем в галерею
      const photosCount = await prisma.photo.count({
        where: { profileId: profile.id }
      })

      const photo = await prisma.photo.create({
        data: {
          url: photoUrl,
          profileId: profile.id,
          order: photosCount,
          isApproved: false // Требует модерации
        }
      })

      return NextResponse.json({
        photo,
        message: "Фото добавлено в галерею и ожидает модерации"
      })
    }
  } catch (error) {
    console.error("Upload photo error:", error)
    return NextResponse.json(
      { error: "Ошибка загрузки фото" },
      { status: 500 }
    )
  }
}

// Удаление фото
export async function DELETE(req: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Не авторизован" },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(req.url)
    const photoId = searchParams.get("photoId")

    if (!photoId) {
      return NextResponse.json(
        { error: "ID фото не указан" },
        { status: 400 }
      )
    }

    // Проверяем, что фото принадлежит пользователю
    const photo = await prisma.photo.findUnique({
      where: { id: photoId },
      include: { profile: true }
    })

    if (!photo || photo.profile.userId !== session.user.id) {
      return NextResponse.json(
        { error: "Фото не найдено или нет доступа" },
        { status: 403 }
      )
    }

    await prisma.photo.delete({
      where: { id: photoId }
    })

    return NextResponse.json({
      success: true,
      message: "Фото удалено"
    })
  } catch (error) {
    console.error("Delete photo error:", error)
    return NextResponse.json(
      { error: "Ошибка удаления фото" },
      { status: 500 }
    )
  }
}
