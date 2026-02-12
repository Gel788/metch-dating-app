import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

// GET - рассчитать совместимость с пользователем
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const userId = session.user.id
    const { searchParams } = new URL(req.url)
    const targetUserId = searchParams.get("userId")

    if (!targetUserId) {
      return NextResponse.json({ error: "Missing userId" }, { status: 400 })
    }

    // Получить оба профиля
    const [myProfile, targetProfile] = await Promise.all([
      prisma.profile.findUnique({ where: { userId } }),
      prisma.profile.findUnique({ where: { userId: targetUserId } })
    ])

    if (!myProfile || !targetProfile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 })
    }

    // Рассчитать совместимость
    let score = 0
    let maxScore = 0

    // Интересы (40 баллов)
    maxScore += 40
    const commonInterests = myProfile.interests.filter((i: string) => 
      targetProfile.interests.includes(i)
    )
    score += (commonInterests.length / Math.max(myProfile.interests.length, targetProfile.interests.length || 1)) * 40

    // Город (20 баллов)
    maxScore += 20
    if (myProfile.city && targetProfile.city && myProfile.city === targetProfile.city) {
      score += 20
    }

    // Возраст (15 баллов) - чем ближе, тем лучше
    maxScore += 15
    const myAge = Math.floor((new Date().getTime() - new Date(myProfile.birthDate).getTime()) / (365.25 * 24 * 60 * 60 * 1000))
    const targetAge = Math.floor((new Date().getTime() - new Date(targetProfile.birthDate).getTime()) / (365.25 * 24 * 60 * 60 * 1000))
    const ageDiff = Math.abs(myAge - targetAge)
    score += Math.max(0, 15 - ageDiff)

    // Образование (10 баллов)
    maxScore += 10
    if (myProfile.education && targetProfile.education) {
      score += 10
    }

    // Тип телосложения совпадает (5 баллов)
    if ('bodyType' in myProfile && 'bodyType' in targetProfile) {
      maxScore += 5
      if (myProfile.bodyType && targetProfile.bodyType && myProfile.bodyType === targetProfile.bodyType) {
        score += 5
      }
    }

    // Отношение к курению (5 баллов)
    if ('smoking' in myProfile && 'smoking' in targetProfile) {
      maxScore += 5
      if (myProfile.smoking && targetProfile.smoking && myProfile.smoking === targetProfile.smoking) {
        score += 5
      }
    }

    // Дети (5 баллов)
    if ('wantsChildren' in myProfile && 'wantsChildren' in targetProfile) {
      maxScore += 5
      if (myProfile.wantsChildren && targetProfile.wantsChildren && myProfile.wantsChildren === targetProfile.wantsChildren) {
        score += 5
      }
    }

    const compatibility = Math.round((score / maxScore) * 100)

    return NextResponse.json({
      compatibility,
      commonInterests,
      details: {
        sameCity: myProfile.city === targetProfile.city,
        ageDifference: ageDiff,
        commonInterestsCount: commonInterests.length
      }
    })
  } catch (error) {
    console.error("Error calculating compatibility:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
