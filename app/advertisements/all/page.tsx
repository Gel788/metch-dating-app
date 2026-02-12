"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import Navbar from "@/components/Navbar"
import Link from "next/link"
import Image from "next/image"

interface Advertisement {
  id: string
  userId: string
  title: string
  description: string
  category: string
  isPaid: boolean
  isActive: boolean
  position: string
  priority: number
  startDate: string
  endDate: string
  viewsCount: number
  clicksCount: number
  user: {
    profile?: {
      name: string
      avatarUrl?: string
    }
  }
}

export default function AllAdvertisementsPage() {
  const { data: session } = useSession()
  const [ads, setAds] = useState<Advertisement[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState("all")

  useEffect(() => {
    fetchAds()
  }, [filter])

  const fetchAds = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      if (filter !== "all") params.append("position", filter)

      const res = await fetch(`/api/advertisements?${params}`)
      const data = await res.json()
      setAds(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error("Error:", error)
      setAds([])
    } finally {
      setLoading(false)
    }
  }

  const getPositionLabel = (position: string) => {
    const labels: any = {
      TOP_BANNER: { label: "🔝 Верхний баннер", price: "1000₽/день" },
      SIDEBAR: { label: "📌 Боковая панель", price: "500₽/день" },
      FEED: { label: "📰 В ленте", price: "300₽/день" },
      STANDARD: { label: "📢 Стандарт", price: "100₽/день" }
    }
    return labels[position] || labels.STANDARD
  }

  return (
    <div className="min-h-screen gradient-dark">
      <Navbar />
      
      <main className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Заголовок */}
        <div className="text-center mb-10 animate-fadeIn">
          <div className="text-7xl mb-4">💰</div>
          <h1 className="text-5xl font-bold mb-3">
            <span className="text-gradient">Платные объявления</span>
          </h1>
          <p className="text-xl text-gray-400 mb-6">
            Интересные предложения от пользователей
          </p>
          
          {session && (
            <Link href="/advertisements/create" className="btn btn-gold">
              ✨ Создать объявление
            </Link>
          )}
        </div>

        {/* Фильтры */}
        <div className="card p-6 mb-8">
          <h2 className="font-bold text-white mb-4 text-lg">🔍 Фильтры</h2>
          <div className="flex flex-wrap gap-3">
            {[
              { value: "all", label: "Все" },
              { value: "TOP_BANNER", label: "🔝 Верхний" },
              { value: "SIDEBAR", label: "📌 Боковой" },
              { value: "FEED", label: "📰 Лента" }
            ].map((f) => (
              <button
                key={f.value}
                onClick={() => setFilter(f.value)}
                className={filter === f.value ? "btn btn-primary" : "btn btn-secondary"}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* Список */}
        {loading ? (
          <div className="text-center py-20">
            <div className="text-6xl mb-4 animate-pulse">💰</div>
            <div className="text-xl text-gray-400">Загрузка...</div>
          </div>
        ) : ads.length === 0 ? (
          <div className="text-center py-20 card p-12 max-w-md mx-auto">
            <div className="text-8xl mb-6">📢</div>
            <h3 className="text-3xl font-bold text-white mb-3">Нет объявлений</h3>
            <p className="text-gray-400 mb-6 text-lg">Станьте первым!</p>
            {session && (
              <Link href="/advertisements/create" className="btn btn-primary">
                Создать
              </Link>
            )}
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {ads.map((ad, idx) => {
              const posInfo = getPositionLabel(ad.position)
              
              return (
                <div key={ad.id} className="card card-hover overflow-hidden animate-slideIn" style={{ animationDelay: `${idx * 0.05}s` }}>
                  {ad.isPaid && (
                    <div className="absolute top-3 right-3 z-10 badge badge-gold animate-glow">
                      💎 Premium
                    </div>
                  )}

                  {/* Автор */}
                  <div className="bg-gradient-to-r from-pink-900/30 to-purple-900/30 p-4 flex items-center gap-3">
                    <div className="relative w-12 h-12 rounded-full overflow-hidden bg-gradient-to-br from-pink-900/20 to-purple-900/20">
                      {ad.user.profile?.avatarUrl ? (
                        <Image
                          src={ad.user.profile.avatarUrl}
                          alt={ad.user.profile?.name || "User"}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-2xl">
                          👤
                        </div>
                      )}
                    </div>
                    <div>
                      <div className="font-semibold text-white">
                        {ad.user.profile?.name || "Пользователь"}
                      </div>
                      <div className="text-xs text-gray-400">Автор</div>
                    </div>
                  </div>

                  <div className="p-5">
                    {/* Бейджи */}
                    <div className="flex gap-2 mb-3">
                      <span className="badge badge-purple text-xs">
                        {posInfo.label}
                      </span>
                      <span className="badge badge-gold text-xs">
                        {posInfo.price}
                      </span>
                    </div>

                    {/* Заголовок */}
                    <h3 className="text-lg font-bold text-white mb-2 line-clamp-2">{ad.title}</h3>
                    <p className="text-gray-400 text-sm mb-4 line-clamp-3">{ad.description}</p>

                    {/* Статистика */}
                    <div className="grid grid-cols-3 gap-2 mb-4">
                      <div className="glass rounded-lg p-2 text-center">
                        <div className="font-bold text-blue-400">{ad.viewsCount}</div>
                        <div className="text-xs text-gray-500">Просмотры</div>
                      </div>
                      <div className="glass rounded-lg p-2 text-center">
                        <div className="font-bold text-green-400">{ad.clicksCount}</div>
                        <div className="text-xs text-gray-500">Клики</div>
                      </div>
                      <div className="glass rounded-lg p-2 text-center">
                        <div className="font-bold text-purple-400">{ad.priority}</div>
                        <div className="text-xs text-gray-500">Приоритет</div>
                      </div>
                    </div>

                    {/* Кнопка */}
                    <Link
                      href={`/messages?userId=${ad.userId}`}
                      className="btn btn-primary w-full text-center block"
                    >
                      💬 Связаться
                    </Link>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </main>
    </div>
  )
}
