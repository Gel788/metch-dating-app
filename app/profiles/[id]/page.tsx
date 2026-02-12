"use client"

import { useState, useEffect, useCallback } from "react"
import { useSession } from "next-auth/react"
import { useRouter, useParams } from "next/navigation"
import Image from "next/image"
import Navbar from "@/components/Navbar"

export default function ProfileDetailPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const params = useParams()
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [liked, setLiked] = useState(false)
  const [isFavorite, setIsFavorite] = useState(false)
  const [showReportModal, setShowReportModal] = useState(false)
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0)

  const fetchProfile = useCallback(async () => {
    if (!params?.id) return
    
    try {
      const res = await fetch(`/api/profiles/${params.id}`)
      const data = await res.json()
      setProfile(data)
      
      if (session?.user?.id && data.userId !== session.user.id) {
        fetch("/api/profile-views", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ viewedId: data.userId })
        }).catch(() => {})
      }
    } catch (error) {
      console.error("Error:", error)
    } finally {
      setLoading(false)
    }
  }, [params?.id, session?.user?.id])

  useEffect(() => {
    if (params?.id) {
      fetchProfile()
    }
  }, [params?.id, fetchProfile])

  const handleLike = async () => {
    if (!session) {
      router.push("/auth/signin")
      return
    }

    try {
      const res = await fetch("/api/likes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ receiverId: profile.userId })
      })

      if (res.ok) {
        setLiked(true)
        const data = await res.json()
        if (data.mutual) {
          alert("💘 Взаимная симпатия!")
        }
      }
    } catch (error) {
      console.error("Error:", error)
    }
  }

  const handleFavorite = async () => {
    if (!session) {
      router.push("/auth/signin")
      return
    }

    try {
      if (isFavorite) {
        await fetch(`/api/favorites?userId=${profile.userId}`, { method: "DELETE" })
        setIsFavorite(false)
      } else {
        await fetch("/api/favorites", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ favoritedUserId: profile.userId })
        })
        setIsFavorite(true)
      }
    } catch (error) {
      console.error("Error:", error)
    }
  }

  const handleBlock = async () => {
    if (!session) return
    if (!confirm("Заблокировать?")) return

    try {
      await fetch("/api/block", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ blockedId: profile.userId, reason: "Blocked" })
      })
      alert("✅ Заблокирован")
      router.push("/profiles")
    } catch (error) {
      console.error("Error:", error)
    }
  }

  const handleReport = async (reason: string, description: string) => {
    if (!session) return

    try {
      await fetch("/api/report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          reportedId: profile.userId, 
          reason, 
          description 
        })
      })
      setShowReportModal(false)
      alert("✅ Жалоба отправлена")
      router.push("/profiles")
    } catch (error) {
      console.error("Error:", error)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen gradient-dark">
        <Navbar />
        <div className="flex items-center justify-center h-[calc(100vh-160px)] md:h-[calc(100vh-80px)]">
          <div className="text-center">
            <div className="text-7xl mb-4 animate-pulse">👤</div>
            <div className="text-xl text-gray-400">Загрузка...</div>
          </div>
        </div>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="min-h-screen gradient-dark">
        <Navbar />
        <div className="flex flex-col items-center justify-center h-[calc(100vh-160px)] md:h-[calc(100vh-80px)]">
          <div className="text-8xl mb-6">🔍</div>
          <h2 className="text-3xl font-bold text-white mb-4">Профиль не найден</h2>
          <button onClick={() => router.push("/profiles")} className="btn btn-primary">
            Вернуться к поиску
          </button>
        </div>
      </div>
    )
  }

  // ИСПРАВЛЕНО: Правильный расчет возраста с проверкой
  const getAge = () => {
    if (!profile?.birthDate) return null
    try {
      const birthDate = new Date(profile.birthDate)
      if (isNaN(birthDate.getTime())) return null
      const age = Math.floor((new Date().getTime() - birthDate.getTime()) / (365.25 * 24 * 60 * 60 * 1000))
      return age > 0 && age < 150 ? age : null
    } catch {
      return null
    }
  }

  const age = getAge()
  const allPhotos = profile.photos && profile.photos.length > 0 ? profile.photos : (profile.avatarUrl ? [{ url: profile.avatarUrl }] : [])
  const currentPhoto = allPhotos[currentPhotoIndex]?.url

  return (
    <div className="min-h-screen gradient-dark pb-20 md:pb-8">
      <Navbar />
      
      <main className="container mx-auto px-4 py-6 md:py-8 max-w-5xl">
        <div className="animate-fadeIn">
          {/* Главная карточка профиля */}
          <div className="card overflow-hidden mb-6">
            <div className="relative h-[500px] md:h-[700px] bg-gradient-to-br from-pink-900/20 to-purple-900/20">
              {currentPhoto ? (
                <Image
                  src={currentPhoto}
                  alt={profile.name || "Profile"}
                  fill
                  className="object-cover"
                  priority
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <span className="text-9xl">👤</span>
                </div>
              )}

              {/* Градиент оверлей */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent"></div>

              {/* VIP бейдж */}
              {profile.user?.premium?.isActive && (
                <div className="absolute top-6 right-6 badge badge-gold animate-glow">
                  💎 VIP
                </div>
              )}

              {/* Индикаторы фото */}
              {allPhotos.length > 1 && (
                <div className="absolute top-6 left-6 right-6 flex gap-2">
                  {allPhotos.map((_: any, idx: number) => (
                    <button
                      key={idx}
                      className={`flex-1 h-1 rounded-full transition-all ${
                        idx === currentPhotoIndex ? "bg-white" : "bg-white/30"
                      }`}
                      onClick={() => setCurrentPhotoIndex(idx)}
                    />
                  ))}
                </div>
              )}

              {/* Кнопки навигации фото */}
              {allPhotos.length > 1 && (
                <>
                  <button
                    onClick={() => setCurrentPhotoIndex(Math.max(0, currentPhotoIndex - 1))}
                    className="absolute left-4 top-1/2 -translate-y-1/2 glass w-12 h-12 rounded-full flex items-center justify-center disabled:opacity-30 hover:bg-white/20 transition"
                    disabled={currentPhotoIndex === 0}
                  >
                    <span className="text-white text-2xl">←</span>
                  </button>
                  <button
                    onClick={() => setCurrentPhotoIndex(Math.min(allPhotos.length - 1, currentPhotoIndex + 1))}
                    className="absolute right-4 top-1/2 -translate-y-1/2 glass w-12 h-12 rounded-full flex items-center justify-center disabled:opacity-30 hover:bg-white/20 transition"
                    disabled={currentPhotoIndex === allPhotos.length - 1}
                  >
                    <span className="text-white text-2xl">→</span>
                  </button>
                </>
              )}

              {/* Информация внизу */}
              <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8">
                <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
                  {profile.name}{age ? `, ${age}` : ""}
                </h1>
                
                <div className="flex flex-wrap gap-3 mb-4">
                  {profile.city && (
                    <div className="glass px-4 py-2 rounded-full flex items-center gap-2">
                      <span className="text-xl">📍</span>
                      <span className="text-white font-medium">{profile.city}</span>
                    </div>
                  )}
                  {profile.occupation && (
                    <div className="glass px-4 py-2 rounded-full flex items-center gap-2">
                      <span className="text-xl">💼</span>
                      <span className="text-white font-medium">{profile.occupation}</span>
                    </div>
                  )}
                </div>

                {/* Статистика */}
                <div className="flex gap-6 text-white">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">👁️</span>
                    <span className="font-semibold">{profile.viewsCount || 0}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xl">❤️</span>
                    <span className="font-semibold">{profile.likesCount || 0}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Кнопки действий */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-6">
            <button
              onClick={handleLike}
              disabled={liked}
              className={`btn text-sm md:text-base ${liked ? "btn-secondary opacity-50" : "btn-primary"}`}
            >
              {liked ? "✅ Лайкнули" : "❤️ Нравится"}
            </button>
            
            <button
              onClick={() => router.push(`/messages?userId=${profile.userId}`)}
              className="btn btn-primary text-sm md:text-base"
            >
              💬 Написать
            </button>
            
            <button
              onClick={() => router.push(`/gifts?userId=${profile.userId}`)}
              className="btn btn-gold text-sm md:text-base"
            >
              🎁 Подарок
            </button>
            
            <button
              onClick={handleFavorite}
              className={`btn text-sm md:text-base ${isFavorite ? "btn-gold" : "btn-secondary"}`}
            >
              {isFavorite ? "⭐ Избранное" : "☆ Избранное"}
            </button>
          </div>

          {/* О себе */}
          {profile.bio && (
            <div className="card p-6 md:p-8 mb-6">
              <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
                <span>📝</span>
                <span>О себе</span>
              </h2>
              <p className="text-gray-300 leading-relaxed text-lg">{profile.bio}</p>
            </div>
          )}

          {/* Интересы */}
          {profile.interests && profile.interests.length > 0 && (
            <div className="card p-6 md:p-8 mb-6">
              <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
                <span>✨</span>
                <span>Интересы</span>
              </h2>
              <div className="flex flex-wrap gap-3">
                {profile.interests.map((interest: string, idx: number) => (
                  <span
                    key={idx}
                    className="px-4 py-2 rounded-full text-sm md:text-base font-medium bg-pink-500/20 text-pink-300 border border-pink-500/30"
                  >
                    {interest}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Дополнительно */}
          <div className="card p-6 md:p-8">
            <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <span>⚙️</span>
              <span>Дополнительно</span>
            </h3>
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => setShowReportModal(true)}
                className="btn btn-secondary text-sm md:text-base"
              >
                🚫 Пожаловаться
              </button>
              <button
                onClick={handleBlock}
                className="btn btn-secondary text-sm md:text-base"
              >
                🚷 Заблокировать
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* Modal жалобы */}
      {showReportModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="card p-6 md:p-8 max-w-md w-full animate-scaleIn">
            <h3 className="text-2xl md:text-3xl font-bold mb-6 text-white flex items-center gap-2">
              <span>🚫</span>
              <span>Пожаловаться</span>
            </h3>
            <div className="space-y-3">
              {[
                { reason: "FAKE_PROFILE", text: "🎭 Фейковый профиль" },
                { reason: "INAPPROPRIATE_CONTENT", text: "⚠️ Неприемлемый контент" },
                { reason: "SPAM", text: "📧 Спам" },
                { reason: "HARASSMENT", text: "😡 Домогательства" },
                { reason: "OTHER", text: "🔴 Другое" }
              ].map(({ reason, text }) => (
                <button
                  key={reason}
                  onClick={() => handleReport(reason, text)}
                  className="w-full text-left px-4 py-3 glass hover:bg-white/10 rounded-xl font-medium text-white transition"
                >
                  {text}
                </button>
              ))}
              <button
                onClick={() => setShowReportModal(false)}
                className="w-full px-4 py-3 bg-red-500/20 text-red-400 hover:bg-red-500/30 rounded-xl font-semibold transition"
              >
                ✕ Отмена
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
