"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import Navbar from "@/components/Navbar"

const AD_PRICES = {
  TOP_BANNER: 1000,
  SIDEBAR: 500,
  FEED: 300,
  STANDARD: 100
}

export default function CreateAdvertisementPage() {
  const { status } = useSession()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "PROFILE_PROMOTION",
    position: "STANDARD",
    duration: 7,
    targetGender: "",
    targetAgeMin: "",
    targetAgeMax: "",
    targetCities: ""
  })

  const calculatePrice = () => {
    const pricePerDay = AD_PRICES[formData.position as keyof typeof AD_PRICES]
    return pricePerDay * formData.duration
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      const res = await fetch("/api/advertisements", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          targetAgeMin: formData.targetAgeMin ? parseInt(formData.targetAgeMin) : undefined,
          targetAgeMax: formData.targetAgeMax ? parseInt(formData.targetAgeMax) : undefined,
          targetCities: formData.targetCities ? formData.targetCities.split(",").map(c => c.trim()) : []
        })
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || "Ошибка создания объявления")
      }

      alert(data.message)
      router.push("/advertisements")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ошибка создания объявления")
    } finally {
      setLoading(false)
    }
  }

  if (status === "unauthenticated") {
    router.push("/auth/signin")
    return null
  }

  const totalPrice = calculatePrice()

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50">
      <Navbar />
      
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto">
          <div className="bg-white rounded-xl shadow-xl p-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Создать платное объявление</h1>
            <p className="text-gray-600 mb-6">Продвигайте свой профиль или размещайте объявления</p>

            <div className="bg-gradient-to-r from-yellow-400 to-yellow-600 text-white rounded-lg p-4 mb-6">
              <p className="font-semibold">💎 Требуется Premium подписка</p>
              <p className="text-sm mt-1">Платные объявления доступны только для Premium пользователей</p>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Заголовок *
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500"
                  placeholder="Например: VIP профиль для серьезных знакомств"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Описание *
                </label>
                <textarea
                  required
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500"
                  placeholder="Подробное описание объявления (минимум 20 символов)"
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Категория *
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500"
                  >
                    <option value="PROFILE_PROMOTION">Продвижение профиля</option>
                    <option value="ANNOUNCEMENT">Объявление</option>
                    <option value="EVENT">Мероприятие</option>
                    <option value="SERVICE">Услуга</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Позиция размещения *
                  </label>
                  <select
                    value={formData.position}
                    onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500"
                  >
                    <option value="TOP_BANNER">Верхний баннер (1000₽/день)</option>
                    <option value="SIDEBAR">Боковая панель (500₽/день)</option>
                    <option value="FEED">В ленте профилей (300₽/день)</option>
                    <option value="STANDARD">Стандарт (100₽/день)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Длительность (дней) *
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  max="90"
                  value={formData.duration}
                  onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) || 1 })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500"
                />
                <p className="text-sm text-gray-500 mt-1">От 1 до 90 дней</p>
              </div>

              <div className="bg-pink-50 border border-pink-200 rounded-lg p-4">
                <h3 className="font-semibold mb-2">💰 Стоимость размещения:</h3>
                <p className="text-2xl font-bold text-pink-600">{totalPrice} ₽</p>
                <p className="text-sm text-gray-600">
                  {AD_PRICES[formData.position as keyof typeof AD_PRICES]} ₽/день × {formData.duration} дней
                </p>
              </div>

              <div className="border-t pt-6">
                <h3 className="font-semibold mb-4">🎯 Таргетинг (опционально)</h3>
                
                <div className="grid md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Целевой пол
                    </label>
                    <select
                      value={formData.targetGender}
                      onChange={(e) => setFormData({ ...formData, targetGender: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500"
                    >
                      <option value="">Любой</option>
                      <option value="MALE">Мужчины</option>
                      <option value="FEMALE">Женщины</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Возраст от
                    </label>
                    <input
                      type="number"
                      value={formData.targetAgeMin}
                      onChange={(e) => setFormData({ ...formData, targetAgeMin: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500"
                      placeholder="18"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Возраст до
                    </label>
                    <input
                      type="number"
                      value={formData.targetAgeMax}
                      onChange={(e) => setFormData({ ...formData, targetAgeMax: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500"
                      placeholder="99"
                    />
                  </div>
                </div>

                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Целевые города (через запятую)
                  </label>
                  <input
                    type="text"
                    value={formData.targetCities}
                    onChange={(e) => setFormData({ ...formData, targetCities: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500"
                    placeholder="Москва, Санкт-Петербург, Екатеринбург"
                  />
                </div>
              </div>

              <div className="flex gap-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-gradient-to-r from-pink-600 to-purple-600 text-white py-3 rounded-lg font-semibold hover:shadow-lg transition disabled:opacity-50"
                >
                  {loading ? "Создание..." : `Создать за ${totalPrice} ₽`}
                </button>
                <button
                  type="button"
                  onClick={() => router.back()}
                  className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                >
                  Отмена
                </button>
              </div>
            </form>
          </div>

          {/* Информация о размещении */}
          <div className="mt-8 bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-bold mb-4">Преимущества платных объявлений</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold mb-2">🎯 Таргетированный показ</h3>
                <p className="text-gray-600 text-sm">Показывайте объявления только целевой аудитории</p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">📊 Статистика</h3>
                <p className="text-gray-600 text-sm">Отслеживайте просмотры и клики</p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">⭐ Приоритет</h3>
                <p className="text-gray-600 text-sm">Ваше объявление будет показано первым</p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">💎 Premium функция</h3>
                <p className="text-gray-600 text-sm">Доступно только для Premium подписчиков</p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
