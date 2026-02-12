"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import Navbar from "@/components/Navbar"
import Link from "next/link"

export default function AdvertisementsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [myAds, setMyAds] = useState<unknown[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (status === "authenticated") {
      fetchMyAds()
    }
  }, [status])

  const fetchMyAds = async () => {
    try {
      const res = await fetch("/api/advertisements?userOnly=true")
      const data = await res.json()
      setMyAds(data)
    } catch (error) {
      console.error("Error:", error)
    } finally {
      setLoading(false)
    }
  }

  const deleteAd = async (adId: string) => {
    if (!confirm("Удалить?")) return

    try {
      const res = await fetch(`/api/advertisements/${adId}`, { method: "DELETE" })
      if (res.ok) {
        setMyAds(myAds.filter((ad: { id: string }) => ad.id !== adId))
        alert("✅ Удалено")
      }
    } catch (error) {
      console.error("Error:", error)
    }
  }

  if (status === "unauthenticated") {
    return (
      <div className="min-h-screen gradient-dark">
        <Navbar />
        <div className="container mx-auto px-4 py-20 text-center">
          <div className="card p-12 max-w-md mx-auto">
            <div className="text-8xl mb-6">🔒</div>
            <h1 className="text-4xl font-bold mb-4 text-white">Войдите</h1>
            <p className="text-gray-400 mb-8 text-lg">Для управления объявлениями</p>
            <Link href="/auth/signin" className="btn btn-primary text-lg px-8 py-3">
              Войти →
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen gradient-dark">
      <Navbar />
      
      <main className="container mx-auto px-4 py-8 max-w-5xl">
        {/* Заголовок */}
        <div className="flex justify-between items-center mb-8 animate-fadeIn">
          <div>
            <h1 className="text-5xl font-bold mb-2">
              <span className="text-gradient">Мои объявления</span>
            </h1>
            <p className="text-gray-400 text-lg">Управляйте публикациями</p>
          </div>
          <Link href="/advertisements/create" className="btn btn-gold">
            + Создать
          </Link>
        </div>

        {/* Premium инфо */}
        <div className="card-premium p-6 mb-8 animate-slideIn">
          <div className="flex items-center gap-4">
            <div className="text-5xl">💎</div>
            <div className="flex-1">
              <p className="font-semibold text-white text-lg mb-1">
                Платные объявления - только для Premium
              </p>
              <p className="text-sm text-gray-400">Продвигайте профиль эффективно</p>
            </div>
            <Link href="/premium" className="btn btn-gold">
              Узнать →
            </Link>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-20">
            <div className="text-6xl mb-4 animate-pulse">📢</div>
            <div className="text-xl text-gray-400">Загрузка...</div>
          </div>
        ) : myAds.length === 0 ? (
          <div className="text-center py-20 card p-12 max-w-md mx-auto">
            <div className="text-8xl mb-6">📢</div>
            <h3 className="text-3xl font-bold text-white mb-3">Нет объявлений</h3>
            <p className="text-gray-400 mb-8 text-lg">Создайте первое</p>
            <Link href="/advertisements/create" className="btn btn-primary text-lg px-8 py-3">
              Создать →
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {myAds.map((ad: any, idx: number) => (
              <div key={ad.id} className="card p-6 animate-slideIn" style={{ animationDelay: `${idx * 0.05}s` }}>
                <div className="flex justify-between gap-6">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <h3 className="text-2xl font-bold text-white">{ad.title}</h3>
                      <span className={`badge ${
                        ad.isActive ? "badge-pink" : "badge-secondary"
                      }`}>
                        {ad.isActive ? "✅ Активно" : "⏸️ Неактивно"}
                      </span>
                      {ad.isPaid && (
                        <span className="badge badge-gold animate-glow">
                          💎 Premium
                        </span>
                      )}
                    </div>
                    
                    <p className="text-gray-400 mb-4 text-lg">{ad.description}</p>

                    <div className="flex flex-wrap gap-4 text-gray-400">
                      <span className="flex items-center gap-2">
                        <span>👁️</span>
                        <span>{ad.viewsCount}</span>
                      </span>
                      <span className="flex items-center gap-2">
                        <span>🖱️</span>
                        <span>{ad.clicksCount}</span>
                      </span>
                      <span className="flex items-center gap-2">
                        <span>📅</span>
                        <span>До {new Date(ad.endDate).toLocaleDateString("ru-RU")}</span>
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2">
                    <button
                      onClick={() => deleteAd(ad.id)}
                      className="btn btn-secondary"
                    >
                      🗑️ Удалить
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
