"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import Navbar from "@/components/Navbar"
import Link from "next/link"
import Image from "next/image"

interface Like {
  id: string
  sender: {
    id: string
    profile?: {
      name: string
      birthDate: string
      city?: string
      avatarUrl?: string
      photos?: Array<{ url: string }>
    }
  }
  createdAt: string
}

export default function LikesPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [likes, setLikes] = useState<Like[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin")
    } else if (status === "authenticated") {
      fetchLikes()
    }
  }, [status])

  const fetchLikes = async () => {
    try {
      const res = await fetch("/api/likes")
      const data = await res.json()
      setLikes(data.likes || [])
    } catch (error) {
      console.error("Error:", error)
    } finally {
      setLoading(false)
    }
  }

  const getAge = (birthDate: string) => {
    return Math.floor((new Date().getTime() - new Date(birthDate).getTime()) / (365.25 * 24 * 60 * 60 * 1000))
  }

  if (loading) {
    return (
      <div className="min-h-screen gradient-dark">
        <Navbar />
        <div className="flex items-center justify-center h-[calc(100vh-80px)]">
          <div className="text-center">
            <div className="text-6xl mb-4 animate-pulse">❤️</div>
            <div className="text-xl text-gray-400">Загрузка...</div>
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
          <div className="text-7xl mb-4">❤️</div>
          <h1 className="text-5xl font-bold mb-3">
            <span className="text-gradient">Ваши лайки</span>
          </h1>
          <p className="text-xl text-gray-400">Люди, которым вы понравились</p>
        </div>

        {likes.length === 0 ? (
          <div className="text-center py-20 card p-12 max-w-md mx-auto">
            <div className="text-8xl mb-6">💔</div>
            <h3 className="text-3xl font-bold text-white mb-4">Пока нет лайков</h3>
            <p className="text-gray-400 mb-8 text-lg">
              Будьте активнее - ставьте лайки!
            </p>
            <Link href="/swipe" className="btn btn-primary">
              Начать свайпать →
            </Link>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {likes.map((like, idx) => {
              if (!like.sender.profile) return null
              
              const age = getAge(like.sender.profile.birthDate)
              const imageUrl = like.sender.profile.avatarUrl || like.sender.profile.photos?.[0]?.url
              
              return (
                <Link key={like.id} href={`/profiles/${like.sender.id}`}>
                  <div className="card card-hover overflow-hidden animate-slideIn" style={{ animationDelay: `${idx * 0.05}s` }}>
                    {/* Фото */}
                    <div className="relative h-80 bg-gradient-to-br from-pink-900/20 to-purple-900/20">
                      {imageUrl ? (
                        <Image
                          src={imageUrl}
                          alt={like.sender.profile.name}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <span className="text-8xl">👤</span>
                        </div>
                      )}
                      
                      {/* Градиент */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
                      
                      {/* Лайк иконка */}
                      <div className="absolute top-4 right-4 w-14 h-14 rounded-full glass flex items-center justify-center animate-pulse">
                        <span className="text-3xl">❤️</span>
                      </div>
                      
                      {/* Информация */}
                      <div className="absolute bottom-0 left-0 right-0 p-6">
                        <h3 className="text-2xl font-bold text-white mb-2">
                          {like.sender.profile.name}, {age}
                        </h3>
                        {like.sender.profile.city && (
                          <div className="flex items-center gap-2 text-gray-200">
                            <span>📍</span>
                            <span>{like.sender.profile.city}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    {/* Кнопка */}
                    <div className="p-5 bg-gradient-to-r from-pink-900/20 to-purple-900/20">
                      <div className="btn btn-primary w-full text-center">
                        💬 Написать
                      </div>
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        )}
      </main>
    </div>
  )
}
