"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import Navbar from "@/components/Navbar"
import ProfileCard from "@/components/ProfileCard"
import Link from "next/link"

export default function FavoritesPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [favorites, setFavorites] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin")
    } else if (status === "authenticated") {
      fetchFavorites()
    }
  }, [status])

  const fetchFavorites = async () => {
    try {
      const res = await fetch("/api/favorites")
      const data = await res.json()
      setFavorites(data.favorites || [])
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
            <div className="text-6xl mb-4 animate-pulse">⭐</div>
            <div className="text-xl text-gray-400">Загрузка...</div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen gradient-dark">
      <Navbar />
      
      <main className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Заголовок */}
        <div className="text-center mb-10 animate-fadeIn">
          <div className="text-7xl mb-4">⭐</div>
          <h1 className="text-5xl font-bold mb-3">
            <span className="text-gradient">Избранное</span>
          </h1>
          <p className="text-xl text-gray-400">Профили, которые вам особенно понравились</p>
        </div>

        {favorites.length === 0 ? (
          <div className="text-center py-20 card p-12 max-w-md mx-auto">
            <div className="text-8xl mb-6">⭐</div>
            <h3 className="text-3xl font-bold text-white mb-4">Избранное пусто</h3>
            <p className="text-gray-400 mb-8 text-lg">
              Добавляйте понравившиеся профили в избранное
            </p>
            <Link href="/profiles" className="btn btn-primary">
              Найти анкеты →
            </Link>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {favorites.map((fav, idx) => {
              if (!fav.favoritedUser?.profile) return null
              
              return (
                <div key={fav.id} className="animate-slideIn" style={{ animationDelay: `${idx * 0.05}s` }}>
                  <ProfileCard
                    profile={{
                      ...fav.favoritedUser.profile,
                      userId: fav.favoritedUser.id,
                      user: fav.favoritedUser
                    }}
                  />
                </div>
              )
            })}
          </div>
        )}
      </main>
    </div>
  )
}
