"use client"

import { useState, useEffect, useCallback } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import Navbar from "@/components/Navbar"
import Image from "next/image"
import PhotoUpload from "@/components/PhotoUpload"
import Link from "next/link"

export default function MyProfilePage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    bio: "",
    city: "",
    country: "",
    occupation: "",
    education: "",
    interests: [] as string[],
    showOnline: true
  })

  const fetchProfile = useCallback(async () => {
    try {
      const res = await fetch("/api/profile/me")
      
      if (!res.ok) {
        console.error("Failed to fetch profile:", res.status)
        setLoading(false)
        return
      }
      
      const myProfile = await res.json()
      
      if (myProfile && !myProfile.error) {
        setProfile(myProfile)
        setFormData({
          name: myProfile.name || "",
          bio: myProfile.bio || "",
          city: myProfile.city || "",
          country: myProfile.country || "",
          occupation: myProfile.occupation || "",
          education: myProfile.education || "",
          interests: myProfile.interests || [],
          showOnline: myProfile.showOnline ?? true
        })
      }
    } catch (error) {
      console.error("Error fetching profile:", error)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin")
    } else if (status === "authenticated") {
      fetchProfile()
    }
  }, [status, router, fetchProfile])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!profile) return

    try {
      const res = await fetch("/api/profile/me", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      })

      if (res.ok) {
        const updatedProfile = await res.json()
        setProfile(updatedProfile)
        setEditing(false)
        alert("✅ Профиль обновлен!")
      }
    } catch (error) {
      console.error("Error updating profile:", error)
    }
  }

  if (status === "loading" || loading) {
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
        <div className="flex flex-col items-center justify-center h-[calc(100vh-160px)] md:h-[calc(100vh-80px)] px-4">
          <div className="card p-8 md:p-12 max-w-md mx-auto text-center">
            <div className="text-8xl mb-6">😔</div>
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">Профиль не найден</h2>
            <p className="text-gray-400 mb-8">Пожалуйста, войдите в систему</p>
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => router.push("/auth/signin")}
                className="btn btn-primary"
              >
                Войти
              </button>
              <button
                onClick={() => router.push("/")}
                className="btn btn-secondary"
              >
                На главную
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

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
  const imageUrl = profile.avatarUrl || profile.photos?.[0]?.url

  return (
    <div className="min-h-screen gradient-dark pb-24 md:pb-8">
      <Navbar />
      
      <main className="container mx-auto px-4 py-6 md:py-8">
        <div className="max-w-5xl mx-auto">
          {/* Шапка профиля */}
          <div className="card overflow-hidden mb-6 animate-fadeIn">
            <div className="relative h-48 md:h-64 bg-gradient-to-r from-pink-600/30 via-purple-600/30 to-blue-600/30">
              {/* Фон градиент */}
              <div className="absolute inset-0">
                <div className="absolute top-10 left-10 w-40 h-40 bg-pink-500/30 rounded-full blur-3xl animate-pulse"></div>
                <div className="absolute bottom-10 right-10 w-40 h-40 bg-purple-500/30 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '0.5s' }}></div>
              </div>
              
              {/* Аватар */}
              <div className="absolute -bottom-16 left-6 md:left-10">
                <div className="relative w-32 h-32 md:w-40 md:h-40 rounded-full overflow-hidden border-4 border-gray-900 bg-gradient-to-br from-pink-900/20 to-purple-900/20">
                  {imageUrl ? (
                    <Image
                      src={imageUrl}
                      alt={profile.name}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-6xl md:text-7xl">
                      👤
                    </div>
                  )}
                </div>
              </div>

              {/* Кнопка редактировать */}
              <div className="absolute bottom-4 right-6">
                <button
                  onClick={() => setEditing(!editing)}
                  className={`btn ${editing ? "btn-secondary" : "btn-primary"} text-sm md:text-base`}
                >
                  {editing ? "✕ Отменить" : "✏️ Редактировать"}
                </button>
              </div>
            </div>

            <div className="pt-20 md:pt-24 px-6 md:px-10 pb-6 md:pb-8">
              <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
                {profile.name}{age ? `, ${age}` : ""}
              </h1>
              <div className="flex flex-wrap gap-3 md:gap-4 mb-6">
                {profile.city && (
                  <div className="glass px-4 py-2 rounded-full flex items-center gap-2">
                    <span>📍</span>
                    <span className="text-white">{profile.city}</span>
                  </div>
                )}
                {profile.occupation && (
                  <div className="glass px-4 py-2 rounded-full flex items-center gap-2">
                    <span>💼</span>
                    <span className="text-white">{profile.occupation}</span>
                  </div>
                )}
              </div>
              
              {/* Статистика */}
              <div className="grid grid-cols-3 gap-4">
                <div className="glass p-4 rounded-xl text-center">
                  <div className="text-3xl md:text-4xl font-bold text-gradient mb-1">{profile.viewsCount || 0}</div>
                  <div className="text-xs md:text-sm text-gray-400">Просмотры</div>
                </div>
                <div className="glass p-4 rounded-xl text-center">
                  <div className="text-3xl md:text-4xl font-bold text-gradient mb-1">{profile.likesCount || 0}</div>
                  <div className="text-xs md:text-sm text-gray-400">Лайки</div>
                </div>
                <div className="glass p-4 rounded-xl text-center">
                  <div className="text-3xl md:text-4xl font-bold text-gradient mb-1">{profile.photos?.length || 0}</div>
                  <div className="text-xs md:text-sm text-gray-400">Фото</div>
                </div>
              </div>
            </div>
          </div>

          {/* Редактирование фото */}
          {editing && (
            <div className="card p-6 md:p-8 mb-6 animate-slideIn">
              <h3 className="text-xl md:text-2xl font-bold text-white mb-6 flex items-center gap-2">
                <span>📸</span>
                <span>Загрузка фото</span>
              </h3>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-sm font-medium text-gray-300 mb-3">Аватар</h4>
                  <PhotoUpload
                    currentPhotoUrl={profile.avatarUrl}
                    isAvatar={true}
                    onUploadSuccess={(url) => {
                      setProfile({ ...profile, avatarUrl: url })
                    }}
                  />
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-300 mb-3">Добавить в галерею</h4>
                  <PhotoUpload
                    isAvatar={false}
                    onUploadSuccess={() => {
                      fetchProfile()
                    }}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Форма или информация */}
          {editing ? (
            <form onSubmit={handleSubmit} className="card p-6 md:p-8 space-y-6 animate-slideIn">
              <h3 className="text-2xl font-bold text-white mb-6">Редактирование профиля</h3>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Имя
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="input"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  О себе
                </label>
                <textarea
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  rows={4}
                  className="input resize-none"
                  placeholder="Расскажите о себе..."
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Город
                  </label>
                  <input
                    type="text"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    className="input"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Страна
                  </label>
                  <input
                    type="text"
                    value={formData.country}
                    onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                    className="input"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Профессия
                  </label>
                  <input
                    type="text"
                    value={formData.occupation}
                    onChange={(e) => setFormData({ ...formData, occupation: e.target.value })}
                    className="input"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Образование
                  </label>
                  <input
                    type="text"
                    value={formData.education}
                    onChange={(e) => setFormData({ ...formData, education: e.target.value })}
                    className="input"
                  />
                </div>
              </div>

              <div className="flex items-center gap-3 glass p-4 rounded-xl">
                <input
                  type="checkbox"
                  id="showOnline"
                  checked={formData.showOnline}
                  onChange={(e) => setFormData({ ...formData, showOnline: e.target.checked })}
                  className="w-5 h-5 text-pink-600 bg-gray-800 border-gray-700 rounded"
                />
                <label htmlFor="showOnline" className="text-sm text-gray-300">
                  Показывать онлайн статус
                </label>
              </div>

              <button
                type="submit"
                className="btn btn-primary w-full text-lg py-4"
              >
                💾 Сохранить изменения
              </button>
            </form>
          ) : (
            <div className="space-y-6">
              {/* О себе */}
              {profile.bio && (
                <div className="card p-6 md:p-8 animate-slideIn">
                  <h3 className="text-xl md:text-2xl font-bold text-white mb-4 flex items-center gap-2">
                    <span>📝</span>
                    <span>О себе</span>
                  </h3>
                  <p className="text-gray-300 leading-relaxed text-base md:text-lg">{profile.bio}</p>
                </div>
              )}

              {/* Детали */}
              <div className="grid md:grid-cols-2 gap-6">
                {profile.occupation && (
                  <div className="card p-6 md:p-8 animate-slideIn">
                    <h3 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
                      <span>💼</span>
                      <span>Профессия</span>
                    </h3>
                    <p className="text-gray-300 text-base">{profile.occupation}</p>
                  </div>
                )}

                {profile.education && (
                  <div className="card p-6 md:p-8 animate-slideIn" style={{ animationDelay: '0.1s' }}>
                    <h3 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
                      <span>🎓</span>
                      <span>Образование</span>
                    </h3>
                    <p className="text-gray-300 text-base">{profile.education}</p>
                  </div>
                )}
              </div>

              {/* Интересы */}
              {profile.interests && profile.interests.length > 0 && (
                <div className="card p-6 md:p-8 animate-slideIn" style={{ animationDelay: '0.2s' }}>
                  <h3 className="text-xl md:text-2xl font-bold text-white mb-4 flex items-center gap-2">
                    <span>✨</span>
                    <span>Интересы</span>
                  </h3>
                  <div className="flex flex-wrap gap-2 md:gap-3">
                    {profile.interests.map((interest: string, idx: number) => (
                      <span
                        key={idx}
                        className="px-3 md:px-4 py-2 rounded-full text-sm md:text-base font-medium bg-pink-500/20 text-pink-300 border border-pink-500/30"
                      >
                        {interest}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Быстрые действия */}
              <div className="grid md:grid-cols-3 gap-4 animate-slideIn" style={{ animationDelay: '0.3s' }}>
                <Link href="/analytics" className="card card-hover p-6 text-center">
                  <div className="text-5xl mb-3">📊</div>
                  <div className="text-white font-bold mb-1">Аналитика</div>
                  <div className="text-gray-400 text-sm">Ваша статистика</div>
                </Link>
                <Link href="/profile-views" className="card card-hover p-6 text-center">
                  <div className="text-5xl mb-3">👁️</div>
                  <div className="text-white font-bold mb-1">Просмотры</div>
                  <div className="text-gray-400 text-sm">Кто смотрел</div>
                </Link>
                <Link href="/premium" className="card card-hover p-6 text-center bg-gradient-to-br from-yellow-500/10 to-amber-500/10 border border-yellow-500/30">
                  <div className="text-5xl mb-3">💎</div>
                  <div className="text-gradient font-bold mb-1">Premium</div>
                  <div className="text-gray-400 text-sm">Больше функций</div>
                </Link>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
