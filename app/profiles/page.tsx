"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import Navbar from "@/components/Navbar"
import ProfileCard from "@/components/ProfileCard"

export default function ProfilesPage() {
  const { data: session } = useSession()
  const [profiles, setProfiles] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showFilters, setShowFilters] = useState(false)
  const [filters, setFilters] = useState({
    gender: "",
    lookingFor: "",
    ageMin: "",
    ageMax: "",
    city: ""
  })

  useEffect(() => {
    fetchProfiles()
  }, [])

  const fetchProfiles = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, value)
      })

      const res = await fetch(`/api/profiles?${params}`)
      const data = await res.json()
      setProfiles(data.profiles || [])
    } catch (error) {
      console.error("Error:", error)
    } finally {
      setLoading(false)
    }
  }

  const resetFilters = () => {
    setFilters({ gender: "", lookingFor: "", ageMin: "", ageMax: "", city: "" })
    fetchProfiles()
  }

  return (
    <div className="min-h-screen gradient-dark">
      <Navbar />
      
      <main className="container mx-auto px-4 py-6 md:py-8 max-w-7xl pb-20 md:pb-8">
        {/* Заголовок */}
        <div className="text-center mb-6 md:mb-10 animate-fadeIn">
          <h1 className="text-3xl md:text-5xl font-bold mb-2 md:mb-3">
            <span className="text-gradient">Поиск</span> <span className="text-white">анкет</span>
          </h1>
          <p className="text-base md:text-xl text-gray-400">Найди свою идеальную пару</p>
        </div>

        {/* Фильтры - мобильная кнопка */}
        <div className="mb-6 md:mb-8">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="btn btn-secondary w-full md:hidden mb-4"
          >
            🔍 {showFilters ? "Скрыть фильтры" : "Показать фильтры"}
          </button>

          <div className={`card p-4 md:p-6 animate-slideIn ${showFilters ? "block" : "hidden md:block"}`}>
            <h2 className="font-bold text-white mb-4 flex items-center gap-2 text-base md:text-lg">
              <span>🔍</span>
              <span>Фильтры</span>
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3 md:gap-4">
              <select
                value={filters.gender}
                onChange={(e) => setFilters({ ...filters, gender: e.target.value })}
                className="input text-sm md:text-base"
              >
                <option value="">Пол</option>
                <option value="MALE">Мужчина</option>
                <option value="FEMALE">Женщина</option>
              </select>

              <select
                value={filters.lookingFor}
                onChange={(e) => setFilters({ ...filters, lookingFor: e.target.value })}
                className="input text-sm md:text-base"
              >
                <option value="">Цель знакомства</option>
                <option value="RELATIONSHIP">Отношения</option>
                <option value="SPONSOR">Спонсор</option>
                <option value="COMPANION">Компаньон</option>
              </select>

              <input
                type="number"
                placeholder="Возраст от"
                value={filters.ageMin}
                onChange={(e) => setFilters({ ...filters, ageMin: e.target.value })}
                className="input text-sm md:text-base"
              />

              <input
                type="number"
                placeholder="Возраст до"
                value={filters.ageMax}
                onChange={(e) => setFilters({ ...filters, ageMax: e.target.value })}
                className="input text-sm md:text-base"
              />

              <input
                type="text"
                placeholder="Город"
                value={filters.city}
                onChange={(e) => setFilters({ ...filters, city: e.target.value })}
                className="input text-sm md:text-base"
              />
            </div>
            <div className="flex gap-3 mt-4">
              <button onClick={fetchProfiles} className="btn btn-primary flex-1 md:flex-initial text-sm md:text-base">
                🔍 Искать
              </button>
              <button
                onClick={resetFilters}
                className="btn btn-secondary flex-1 md:flex-initial text-sm md:text-base"
              >
                ✕ Сбросить
              </button>
            </div>
          </div>
        </div>

        {/* Список профилей */}
        {loading ? (
          <div className="text-center py-12 md:py-20">
            <div className="text-5xl md:text-6xl mb-4 animate-pulse">💕</div>
            <div className="text-lg md:text-xl text-gray-400">Загрузка...</div>
          </div>
        ) : profiles.length === 0 ? (
          <div className="text-center py-12 md:py-20 card p-8 md:p-12 max-w-md mx-auto">
            <div className="text-6xl md:text-8xl mb-6">🔍</div>
            <h3 className="text-xl md:text-2xl font-bold text-white mb-3">Никого не найдено</h3>
            <p className="text-gray-400 mb-6">
              Попробуйте изменить фильтры
            </p>
            <button
              onClick={resetFilters}
              className="btn btn-primary"
            >
              Сбросить фильтры
            </button>
          </div>
        ) : (
          <>
            <div className="text-sm md:text-base text-gray-400 mb-4">
              Найдено: <span className="text-white font-semibold">{profiles.length}</span> анкет
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 md:gap-6">
              {profiles.map((profile, idx) => (
                <div key={profile.id} className="animate-slideIn" style={{ animationDelay: `${idx * 0.03}s` }}>
                  <ProfileCard profile={profile} />
                </div>
              ))}
            </div>
          </>
        )}
      </main>
    </div>
  )
}
