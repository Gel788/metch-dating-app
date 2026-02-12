"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import Navbar from "@/components/Navbar"
import Link from "next/link"
import Image from "next/image"

interface ProfileView {
  id: string
  viewer: {
    id: string
    profile?: {
      name: string
      birthDate: string
      city?: string
      avatarUrl?: string
    }
  }
  createdAt: string
}

export default function ProfileViewsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [views, setViews] = useState<ProfileView[]>([])
  const [hasPremium, setHasPremium] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin")
    } else if (status === "authenticated") {
      fetchViews()
    }
  }, [status])

  const fetchViews = async () => {
    try {
      const res = await fetch("/api/profile-views")
      if (!res.ok) return
      const data = await res.json()
      if (data.error) return
      setViews(data.views || [])
      setHasPremium(data.hasPremium || false)
    } catch (error) {
      console.error("Error:", error)
    } finally {
      setLoading(false)
    }
  }

  const getAge = (birthDate: string) => {
    return Math.floor((new Date().getTime() - new Date(birthDate).getTime()) / (365.25 * 24 * 60 * 60 * 1000))
  }

  const getTimeAgo = (date: string) => {
    const seconds = Math.floor((new Date().getTime() - new Date(date).getTime()) / 1000)
    
    if (seconds < 60) return "только что"
    if (seconds < 3600) return `${Math.floor(seconds / 60)} мин назад`
    if (seconds < 86400) return `${Math.floor(seconds / 3600)} ч назад`
    return `${Math.floor(seconds / 86400)} дн назад`
  }

  if (loading) {
    return (
      <div className="min-h-screen gradient-dark">
        <Navbar />
        <div className="flex items-center justify-center h-[calc(100vh-80px)]">
          <div className="text-center">
            <div className="text-6xl mb-4 animate-pulse">👁️</div>
            <div className="text-xl text-gray-400">Загрузка...</div>
          </div>
        </div>
      </div>
    )
  }

  const visibleViews = hasPremium ? views : views.slice(0, 5)
  const hiddenCount = views.length - visibleViews.length

  return (
    <div className="min-h-screen gradient-dark">
      <Navbar />
      
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Заголовок */}
        <div className="text-center mb-10 animate-fadeIn">
          <div className="text-7xl mb-4">👁️</div>
          <h1 className="text-5xl font-bold mb-3">
            <span className="text-gradient">Просмотры профиля</span>
          </h1>
          <p className="text-xl text-gray-400">Узнайте, кто проявил к вам интерес</p>
        </div>

        {views.length === 0 ? (
          <div className="text-center py-20 card p-12 max-w-md mx-auto">
            <div className="text-8xl mb-6">👁️</div>
            <h3 className="text-3xl font-bold text-white mb-4">Пока нет просмотров</h3>
            <p className="text-gray-400 mb-8 text-lg">
              Улучшите свой профиль и будьте активнее
            </p>
            <Link href="/profile/me" className="btn btn-primary">
              Редактировать профиль →
            </Link>
          </div>
        ) : (
          <>
            <div className="space-y-4 mb-8">
              {visibleViews.map((view, idx) => {
                if (!view?.viewer?.profile) return null
                
                const age = view.viewer.profile.birthDate ? getAge(view.viewer.profile.birthDate) : "?"
                
                return (
                  <Link key={view.id} href={`/profiles/${view.viewer.id}`}>
                    <div className="card card-hover p-6 flex items-center gap-4 animate-slideIn" style={{ animationDelay: `${idx * 0.05}s` }}>
                      {/* Аватар */}
                      <div className="relative w-20 h-20 rounded-full overflow-hidden bg-gradient-to-br from-pink-900/20 to-purple-900/20 flex-shrink-0">
                        {view.viewer.profile.avatarUrl ? (
                          <Image
                            src={view.viewer.profile.avatarUrl}
                            alt={view.viewer.profile.name}
                            fill
                            className="object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-4xl">
                            👤
                          </div>
                        )}
                      </div>
                      
                      {/* Информация */}
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-white mb-1">
                          {view.viewer.profile.name}, {age}
                        </h3>
                        {view.viewer.profile.city && (
                          <p className="text-gray-400 flex items-center gap-2">
                            <span>📍</span>
                            <span>{view.viewer.profile.city}</span>
                          </p>
                        )}
                      </div>
                      
                      {/* Время */}
                      <div className="text-right">
                        <div className="text-sm text-gray-500 mb-2">{getTimeAgo(view.createdAt)}</div>
                        <div className="text-3xl">👁️</div>
                      </div>
                    </div>
                  </Link>
                )
              })}
            </div>

            {/* Premium блокировка */}
            {!hasPremium && hiddenCount > 0 && (
              <div className="card-premium p-10 text-center animate-scaleIn">
                <div className="text-8xl mb-6">💎</div>
                <h2 className="text-4xl font-bold mb-3">
                  <span className="text-gradient">+{hiddenCount} скрытых просмотров</span>
                </h2>
                <p className="text-gray-300 mb-8 text-lg">
                  Получите Premium чтобы увидеть всех
                </p>
                <Link href="/premium" className="btn btn-gold text-lg px-10 py-3 animate-glow">
                  Открыть Premium →
                </Link>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  )
}
