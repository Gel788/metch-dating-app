"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import Navbar from "@/components/Navbar"

export default function SwipePage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [showMatch, setShowMatch] = useState(false)
  const [animating, setAnimating] = useState(false)
  const [swipeDirection, setSwipeDirection] = useState<string | null>(null)
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0)
  const [showDetailModal, setShowDetailModal] = useState(false)

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin")
    } else if (status === "authenticated") {
      fetchNextProfile()
    }
  }, [status])

  const fetchNextProfile = async () => {
    try {
      setLoading(true)
      const res = await fetch("/api/swipe")
      
      if (res.status === 401) {
        router.push("/auth/signin")
        return
      }

      const data = await res.json()
      setProfile(data.profile)
      setSwipeDirection(null)
      setCurrentPhotoIndex(0)
    } catch (error) {
      console.error("Error:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleSwipe = async (action: string) => {
    if (!profile || animating) return

    setAnimating(true)
    setSwipeDirection(action)

    try {
      const res = await fetch("/api/swipe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          toUserId: profile.userId,
          action
        })
      })

      const data = await res.json()

      setTimeout(() => {
        if (data.isMatch && action !== "DISLIKE") {
          setShowMatch(true)
          setTimeout(() => {
            setShowMatch(false)
            fetchNextProfile()
          }, 3000)
        } else {
          fetchNextProfile()
        }
        setAnimating(false)
      }, 300)
    } catch (error) {
      console.error("Error:", error)
      setAnimating(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen gradient-dark">
        <Navbar />
        <div className="flex items-center justify-center h-[calc(100vh-160px)] md:h-[calc(100vh-80px)]">
          <div className="text-center">
            <div className="w-20 h-20 border-4 border-pink-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <div className="text-xl text-gray-400">Ищем анкеты...</div>
          </div>
        </div>
      </div>
    )
  }

  const age = profile?.birthDate
    ? Math.floor((new Date().getTime() - new Date(profile.birthDate).getTime()) / (365.25 * 24 * 60 * 60 * 1000))
    : "?"

  const allPhotos = profile ? [
    profile.avatarUrl,
    ...(profile.photos?.map((p: any) => p.url) || [])
  ].filter(Boolean) : []

  const currentPhoto = allPhotos[currentPhotoIndex] || null

  const nextPhoto = () => {
    if (currentPhotoIndex < allPhotos.length - 1) {
      setCurrentPhotoIndex(prev => prev + 1)
    }
  }

  const prevPhoto = () => {
    if (currentPhotoIndex > 0) {
      setCurrentPhotoIndex(prev => prev - 1)
    }
  }

  return (
    <div className="min-h-screen gradient-dark relative overflow-hidden">
      {/* Фоновые эффекты */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-96 h-96 bg-pink-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
      </div>

      <Navbar />
      
      <main className="container mx-auto px-4 py-4 md:py-6 max-w-md relative z-10">
        {!profile ? (
          <div className="text-center py-20 animate-scaleIn">
            <div className="card p-8 md:p-12">
              <div className="text-8xl mb-6">🎉</div>
              <h2 className="text-3xl font-bold text-white mb-4">
                Вы все просмотрели!
              </h2>
              <p className="text-gray-400 mb-8">
                Скоро появятся новые люди
              </p>
              <button
                onClick={() => router.push("/profiles")}
                className="btn btn-primary"
              >
                Перейти к поиску
              </button>
            </div>
          </div>
        ) : (
          <div className="pb-24 md:pb-8">
            {/* Главная карточка */}
            <div 
              className={`relative transition-all duration-300 ${
                swipeDirection === "LIKE" ? "translate-x-[150%] rotate-12 opacity-0" :
                swipeDirection === "DISLIKE" ? "-translate-x-[150%] -rotate-12 opacity-0" :
                swipeDirection === "SUPERLIKE" ? "-translate-y-[150%] scale-75 opacity-0" : "translate-x-0 rotate-0 opacity-100"
              }`}
            >
              <div className="card overflow-hidden" style={{ height: "calc(100vh - 220px)", maxHeight: "650px" }}>
                {/* Изображение */}
                <div className="absolute inset-0 bg-gradient-to-br from-pink-900/20 to-purple-900/20">
                  {currentPhoto ? (
                    <Image
                      src={currentPhoto}
                      alt={profile.name}
                      fill
                      className="object-cover"
                      priority
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <span className="text-9xl">👤</span>
                    </div>
                  )}
                </div>

                {/* Навигация по фото - невидимые зоны */}
                {allPhotos.length > 1 && (
                  <div className="absolute inset-0 flex z-10">
                    <div className="w-1/2 h-full" onClick={prevPhoto}></div>
                    <div className="w-1/2 h-full" onClick={nextPhoto}></div>
                  </div>
                )}

                {/* Индикаторы фото */}
                {allPhotos.length > 1 && (
                  <div className="absolute top-4 left-4 right-4 flex gap-1.5 z-20">
                    {allPhotos.map((_, idx) => (
                      <div 
                        key={idx}
                        className={`flex-1 h-1 rounded-full transition-all ${
                          idx === currentPhotoIndex 
                            ? "bg-white" 
                            : idx < currentPhotoIndex
                            ? "bg-white/60"
                            : "bg-white/30"
                        }`}
                      />
                    ))}
                  </div>
                )}

                {/* Верхние бейджи */}
                <div className="absolute top-16 left-0 right-0 flex justify-between items-start px-4 z-20">
                  <div className="flex flex-col gap-2">
                    {profile.user?.premium?.isActive && (
                      <div className="badge badge-gold animate-glow">
                        💎 VIP
                      </div>
                    )}
                    {allPhotos.length > 1 && (
                      <div className="glass px-3 py-1 rounded-full text-sm text-white font-medium">
                        {currentPhotoIndex + 1} / {allPhotos.length}
                      </div>
                    )}
                  </div>
                  <button
                    onClick={() => setShowDetailModal(true)}
                    className="glass w-10 h-10 rounded-full flex items-center justify-center hover:bg-white/30 transition"
                  >
                    <span className="text-white text-xl">ℹ️</span>
                  </button>
                </div>

                {/* Градиент снизу */}
                <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent pointer-events-none"></div>

                {/* Информация внизу */}
                <div className="absolute bottom-0 left-0 right-0 p-6 z-20">
                  <h2 className="text-4xl font-bold text-white mb-2 drop-shadow-lg">
                    {profile.name}, {age}
                  </h2>
                  
                  <div className="flex flex-wrap gap-2 mb-3">
                    {profile.city && (
                      <div className="glass px-3 py-1.5 rounded-full flex items-center gap-1.5">
                        <span>📍</span>
                        <span className="text-white text-sm font-medium">{profile.city}</span>
                      </div>
                    )}
                    {profile.occupation && (
                      <div className="glass px-3 py-1.5 rounded-full flex items-center gap-1.5">
                        <span>💼</span>
                        <span className="text-white text-sm font-medium">{profile.occupation}</span>
                      </div>
                    )}
                  </div>

                  {profile.bio && (
                    <p className="text-white text-sm leading-relaxed line-clamp-2 drop-shadow-lg mb-3">
                      {profile.bio}
                    </p>
                  )}

                  {profile.interests && profile.interests.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {profile.interests.slice(0, 4).map((interest: string, idx: number) => (
                        <span
                          key={idx}
                          className="glass px-2.5 py-1 rounded-full text-xs font-medium text-white border border-white/20"
                        >
                          {interest}
                        </span>
                      ))}
                      {profile.interests.length > 4 && (
                        <span className="glass px-2.5 py-1 rounded-full text-xs font-medium text-white border border-white/20">
                          +{profile.interests.length - 4}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Кнопки действий */}
            <div className="flex items-center justify-center gap-5 mt-6">
              <button
                onClick={() => handleSwipe("DISLIKE")}
                disabled={animating}
                className="w-16 h-16 rounded-full bg-gradient-to-br from-gray-700 to-gray-900 shadow-xl flex items-center justify-center disabled:opacity-50 hover:scale-110 active:scale-95 transition-all duration-200"
              >
                <span className="text-3xl filter drop-shadow-lg">✕</span>
              </button>

              <button
                onClick={() => handleSwipe("SUPERLIKE")}
                disabled={animating}
                className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 shadow-2xl flex items-center justify-center disabled:opacity-50 hover:scale-110 active:scale-95 transition-all duration-200 animate-glow"
              >
                <span className="text-4xl filter drop-shadow-lg">⭐</span>
              </button>

              <button
                onClick={() => handleSwipe("LIKE")}
                disabled={animating}
                className="w-16 h-16 rounded-full bg-gradient-to-br from-pink-500 to-pink-700 shadow-xl flex items-center justify-center disabled:opacity-50 hover:scale-110 active:scale-95 transition-all duration-200"
              >
                <span className="text-3xl filter drop-shadow-lg">❤️</span>
              </button>
            </div>
          </div>
        )}
      </main>

      {/* Детальное модальное окно */}
      {showDetailModal && profile && (
        <div className="fixed inset-0 bg-black/95 backdrop-blur-xl z-50 overflow-y-auto animate-fadeIn">
          <div className="min-h-screen py-8 px-4">
            <div className="max-w-2xl mx-auto">
              {/* Заголовок */}
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-white">Профиль</h2>
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="w-10 h-10 rounded-full glass flex items-center justify-center hover:bg-white/20 transition"
                >
                  <span className="text-white text-xl">✕</span>
                </button>
              </div>

              {/* Галерея фото */}
              {allPhotos.length > 0 && (
                <div className="mb-6">
                  <div className="grid grid-cols-3 gap-2">
                    {allPhotos.map((photo, idx) => (
                      <div 
                        key={idx} 
                        className="relative aspect-square rounded-2xl overflow-hidden group cursor-pointer"
                        onClick={() => {
                          setCurrentPhotoIndex(idx)
                          setShowDetailModal(false)
                        }}
                      >
                        <Image
                          src={photo}
                          alt={`${idx + 1}`}
                          fill
                          className="object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                        {idx === currentPhotoIndex && (
                          <div className="absolute inset-0 border-2 border-pink-500"></div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Основная информация */}
              <div className="card p-6 mb-4">
                <div className="flex items-start gap-4 mb-4">
                  <div className="relative w-20 h-20 rounded-2xl overflow-hidden flex-shrink-0">
                    {profile.avatarUrl ? (
                      <Image
                        src={profile.avatarUrl}
                        alt={profile.name}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-pink-900/20 to-purple-900/20 flex items-center justify-center text-4xl">
                        👤
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold text-white mb-1">
                      {profile.name}, {age}
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {profile.city && (
                        <span className="text-gray-400 text-sm">📍 {profile.city}</span>
                      )}
                      {profile.occupation && (
                        <span className="text-gray-400 text-sm">💼 {profile.occupation}</span>
                      )}
                    </div>
                  </div>
                </div>

                {profile.bio && (
                  <div className="glass p-4 rounded-xl mb-4">
                    <p className="text-gray-300 leading-relaxed">{profile.bio}</p>
                  </div>
                )}

                {profile.education && (
                  <div className="mb-4">
                    <div className="text-sm text-gray-400 mb-1">🎓 Образование</div>
                    <div className="text-white">{profile.education}</div>
                  </div>
                )}

                {profile.interests && profile.interests.length > 0 && (
                  <div>
                    <div className="text-sm text-gray-400 mb-2">✨ Интересы</div>
                    <div className="flex flex-wrap gap-2">
                      {profile.interests.map((interest: string, idx: number) => (
                        <span
                          key={idx}
                          className="glass px-3 py-1.5 rounded-full text-sm text-white"
                        >
                          {interest}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Дополнительная информация */}
              {(profile.height || profile.bodyType || profile.relationshipStatus || profile.children) && (
                <div className="grid grid-cols-2 gap-3 mb-6">
                  {profile.height && (
                    <div className="glass p-4 rounded-xl">
                      <div className="text-xs text-gray-400 mb-1">Рост</div>
                      <div className="text-white font-bold">{profile.height} см</div>
                    </div>
                  )}
                  {profile.bodyType && (
                    <div className="glass p-4 rounded-xl">
                      <div className="text-xs text-gray-400 mb-1">Телосложение</div>
                      <div className="text-white font-bold">{profile.bodyType}</div>
                    </div>
                  )}
                  {profile.relationshipStatus && (
                    <div className="glass p-4 rounded-xl">
                      <div className="text-xs text-gray-400 mb-1">Статус</div>
                      <div className="text-white font-bold">{profile.relationshipStatus}</div>
                    </div>
                  )}
                  {profile.children && (
                    <div className="glass p-4 rounded-xl">
                      <div className="text-xs text-gray-400 mb-1">Дети</div>
                      <div className="text-white font-bold">{profile.children}</div>
                    </div>
                  )}
                </div>
              )}

              {/* Кнопки */}
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => {
                    setShowDetailModal(false)
                    handleSwipe("DISLIKE")
                  }}
                  className="btn btn-secondary py-4"
                >
                  ✕ Пропустить
                </button>
                <button
                  onClick={() => {
                    setShowDetailModal(false)
                    handleSwipe("LIKE")
                  }}
                  className="btn btn-primary py-4"
                >
                  ❤️ Лайк
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal совпадения */}
      {showMatch && (
        <div className="fixed inset-0 bg-black/95 backdrop-blur-2xl z-50 flex items-center justify-center p-4 animate-fadeIn">
          <div className="text-center animate-scaleIn">
            <div className="text-9xl mb-6 animate-bounce">💘</div>
            <h2 className="text-5xl font-bold text-gradient mb-4">
              It's a Match!
            </h2>
            <p className="text-xl text-gray-300 mb-8">
              Вы понравились друг другу
            </p>
            <div className="flex gap-4 justify-center">
              <button
                onClick={() => {
                  setShowMatch(false)
                  fetchNextProfile()
                }}
                className="btn btn-secondary px-8"
              >
                Продолжить
              </button>
              <button
                onClick={() => router.push("/messages")}
                className="btn btn-primary px-8"
              >
                💬 Написать
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
