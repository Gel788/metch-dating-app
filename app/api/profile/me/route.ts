import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

// GET - получить свой профиль
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const userId = session.user.id

    const profile = await prisma.profile.findUnique({
      where: { userId },
      include: {
        photos: true,
        user: {
          select: {
            id: true,
            email: true,
            premium: true
          }
        }
      }
    })

    if (!profile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 })
    }

    return NextResponse.json(profile)
  } catch (error) {
    console.error("Error fetching profile:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

// PUT - обновить свой профиль
export async function PUT(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const userId = session.user.id
    const data = await req.json()

    const updatedProfile = await prisma.profile.update({
      where: { userId },
      data: {
        name: data.name,
        bio: data.bio,
        city: data.city,
        country: data.country,
        occupation: data.occupation,
        education: data.education,
        interests: data.interests,
        showOnline: data.showOnline,
        avatarUrl: data.avatarUrl
      },
      include: {
        photos: true,
        user: {
          select: {
            id: true,
            email: true,
            premium: true
          }
        }
      }
    })

    return NextResponse.json(updatedProfile)
  } catch (error) {
    console.error("Error updating profile:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
