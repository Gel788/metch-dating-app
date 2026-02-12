"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import Navbar from "@/components/Navbar"
import Link from "next/link"

export default function AnalyticsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [analytics, setAnalytics] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin")
    } else if (status === "authenticated") {
      fetchAnalytics()
    }
  }, [status])

  const fetchAnalytics = async () => {
    try {
      const res = await fetch("/api/analytics")
      const data = await res.json()
      setAnalytics(data)
    } catch (error) {
      console.error("Error:", error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen gradient-dark">
        <Navbar />
        <div className="flex items-center justify-center h-[calc(100vh-80px)]">
          <div className="text-center">
            <div className="text-6xl mb-4 animate-pulse">📊</div>
            <div className="text-xl text-gray-400">Загрузка...</div>
          </div>
        </div>
      </div>
    )
  }

  if (!analytics || !analytics.profile) {
    return (
      <div className="min-h-screen gradient-dark">
        <Navbar />
        <div className="container mx-auto px-4 py-20 text-center">
          <div className="card p-12 max-w-md mx-auto">
            <div className="text-8xl mb-6">📊</div>
            <h2 className="text-3xl font-bold text-white mb-4">Нет данных</h2>
            <Link href="/profile/me" className="btn btn-primary">
              Создать профиль
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen gradient-dark">
      <Navbar />
      
      <main className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Заголовок */}
        <div className="text-center mb-10 animate-fadeIn">
          <div className="text-7xl mb-4">📊</div>
          <h1 className="text-5xl font-bold mb-3">
            <span className="text-gradient">Аналитика профиля</span>
          </h1>
          <p className="text-xl text-gray-400">Следите за своей активностью</p>
        </div>

        {/* Основная статистика */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {[
            { icon: "👁️", value: analytics.profile?.viewsCount || 0, label: "Просмотры", color: "blue" },
            { icon: "❤️", value: analytics.profile?.likesCount || 0, label: "Лайки", color: "pink" },
            { icon: "⭐", value: analytics.swipes?.likesGiven || 0, label: "Дал лайков", color: "purple" },
            { icon: "💘", value: analytics.matchesCount || 0, label: "Совпадений", color: "gold" }
          ].map((stat, idx) => (
            <div key={idx} className="card p-6 text-center animate-slideIn" style={{ animationDelay: `${idx * 0.1}s` }}>
              <div className="text-6xl mb-3">{stat.icon}</div>
              <div className="text-4xl font-bold text-gradient mb-2">{stat.value}</div>
              <div className="text-gray-400">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Детальная статистика */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {/* Свайпы */}
          <div className="card p-8">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
              <span>💘</span>
              <span>Свайп активность</span>
            </h2>
            <div className="space-y-4">
              <div className="flex justify-between items-center glass p-4 rounded-xl">
                <span className="text-gray-300">❤️ Лайки</span>
                <span className="text-2xl font-bold text-pink-400">{analytics.swipes?.likesGiven || 0}</span>
              </div>
              <div className="flex justify-between items-center glass p-4 rounded-xl">
                <span className="text-gray-300">✕ Дизлайки</span>
                <span className="text-2xl font-bold text-gray-400">{analytics.swipes?.dislikesGiven || 0}</span>
              </div>
              <div className="flex justify-between items-center glass p-4 rounded-xl">
                <span className="text-gray-300">⭐ Супер-лайки</span>
                <span className="text-2xl font-bold text-blue-400">{analytics.swipes?.superlikesGiven || 0}</span>
              </div>
            </div>
          </div>

          {/* Популярность */}
          <div className="card p-8">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
              <span>🔥</span>
              <span>Популярность</span>
            </h2>
            <div className="space-y-4">
              <div className="flex justify-between items-center glass p-4 rounded-xl">
                <span className="text-gray-300">👁️ Просмотры профиля</span>
                <span className="text-2xl font-bold text-gradient">{analytics.profile?.viewsCount || 0}</span>
              </div>
              <div className="flex justify-between items-center glass p-4 rounded-xl">
                <span className="text-gray-300">❤️ Получено лайков</span>
                <span className="text-2xl font-bold text-gradient">{analytics.profile?.likesCount || 0}</span>
              </div>
              <div className="flex justify-between items-center glass p-4 rounded-xl">
                <span className="text-gray-300">⭐ В избранном</span>
                <span className="text-2xl font-bold text-gradient">{analytics.favoritedByCount || 0}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Рекомендации */}
        <div className="card p-8">
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
            <span>💡</span>
            <span>Рекомендации</span>
          </h2>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="glass p-6 rounded-xl">
              <div className="text-4xl mb-3">📸</div>
              <h3 className="font-bold text-white mb-2">Добавьте фото</h3>
              <p className="text-sm text-gray-400">Профили с фото получают в 5 раз больше лайков</p>
            </div>
            <div className="glass p-6 rounded-xl">
              <div className="text-4xl mb-3">✍️</div>
              <h3 className="font-bold text-white mb-2">Заполните био</h3>
              <p className="text-sm text-gray-400">Расскажите о себе интересно</p>
            </div>
            <div className="glass p-6 rounded-xl">
              <div className="text-4xl mb-3">💎</div>
              <h3 className="font-bold text-white mb-2">Premium</h3>
              <p className="text-sm text-gray-400">Получите больше возможностей</p>
            </div>
          </div>
        </div>

        {/* Premium CTA */}
        <div className="card-premium p-8 mt-8 text-center animate-scaleIn">
          <div className="text-6xl mb-4">💎</div>
          <h2 className="text-3xl font-bold mb-3">
            <span className="text-gradient">Хотите больше аналитики?</span>
          </h2>
          <p className="text-gray-300 mb-6 text-lg">
            С Premium вы получите детальную статистику и эксклюзивные инсайты
          </p>
          <Link href="/premium" className="btn btn-gold text-lg px-10 py-3 animate-glow">
            Получить Premium →
          </Link>
        </div>
      </main>
    </div>
  )
}
