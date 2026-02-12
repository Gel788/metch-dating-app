"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import Navbar from "@/components/Navbar"

export default function SettingsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [settings, setSettings] = useState({
    showOnlineStatus: true,
    showLastSeen: true,
    showTyping: true,
    messagePermissions: "everyone",
    showProfileViews: true,
    theme: "dark"
  })

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin")
    }
  }, [status])

  if (status === "loading") {
    return (
      <div className="min-h-screen gradient-dark">
        <Navbar />
        <div className="flex items-center justify-center h-[calc(100vh-80px)]">
          <div className="text-center">
            <div className="text-6xl mb-4 animate-pulse">⚙️</div>
            <div className="text-xl text-gray-400">Загрузка...</div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen gradient-dark">
      <Navbar />
      
      <main className="container mx-auto px-4 py-8 max-w-3xl">
        {/* Заголовок */}
        <div className="mb-8 animate-fadeIn">
          <div className="text-7xl text-center mb-4">⚙️</div>
          <h1 className="text-5xl font-bold text-center mb-3">
            <span className="text-gradient">Настройки</span>
          </h1>
          <p className="text-gray-400 text-center text-lg">Управление приватностью и внешним видом</p>
        </div>

        {/* Приватность */}
        <div className="card p-8 mb-6 animate-slideIn">
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
            <span>🔒</span>
            <span>Приватность</span>
          </h2>
          
          <div className="space-y-4">
            <label className="flex items-center justify-between cursor-pointer p-4 glass rounded-xl hover:bg-white/5 transition">
              <div>
                <div className="font-medium text-white text-lg">Показывать онлайн статус</div>
                <div className="text-sm text-gray-400">Другие увидят когда вы онлайн</div>
              </div>
              <input
                type="checkbox"
                checked={settings.showOnlineStatus}
                onChange={(e) => setSettings({ ...settings, showOnlineStatus: e.target.checked })}
                className="w-6 h-6 text-pink-600 rounded bg-gray-800 border-gray-700"
              />
            </label>

            <label className="flex items-center justify-between cursor-pointer p-4 glass rounded-xl hover:bg-white/5 transition">
              <div>
                <div className="font-medium text-white text-lg">Показывать "был(а) недавно"</div>
                <div className="text-sm text-gray-400">Последняя активность</div>
              </div>
              <input
                type="checkbox"
                checked={settings.showLastSeen}
                onChange={(e) => setSettings({ ...settings, showLastSeen: e.target.checked })}
                className="w-6 h-6 text-pink-600 rounded bg-gray-800 border-gray-700"
              />
            </label>

            <label className="flex items-center justify-between cursor-pointer p-4 glass rounded-xl hover:bg-white/5 transition">
              <div>
                <div className="font-medium text-white text-lg">Показывать "печатает..."</div>
                <div className="text-sm text-gray-400">В чате</div>
              </div>
              <input
                type="checkbox"
                checked={settings.showTyping}
                onChange={(e) => setSettings({ ...settings, showTyping: e.target.checked })}
                className="w-6 h-6 text-pink-600 rounded bg-gray-800 border-gray-700"
              />
            </label>

            <label className="flex items-center justify-between cursor-pointer p-4 glass rounded-xl hover:bg-white/5 transition">
              <div>
                <div className="font-medium text-white text-lg">Кто видит просмотры профиля</div>
                <div className="text-sm text-gray-400">Настройка видимости</div>
              </div>
              <input
                type="checkbox"
                checked={settings.showProfileViews}
                onChange={(e) => setSettings({ ...settings, showProfileViews: e.target.checked })}
                className="w-6 h-6 text-pink-600 rounded bg-gray-800 border-gray-700"
              />
            </label>

            <div className="p-4 glass rounded-xl">
              <div className="font-medium text-white text-lg mb-3">Кто может писать</div>
              <select
                value={settings.messagePermissions}
                onChange={(e) => setSettings({ ...settings, messagePermissions: e.target.value })}
                className="input"
              >
                <option value="everyone">Все пользователи</option>
                <option value="matches">Только совпадения</option>
                <option value="premium">Только Premium</option>
              </select>
            </div>
          </div>
        </div>

        {/* Внешний вид */}
        <div className="card p-8 mb-6 animate-slideIn" style={{ animationDelay: '0.1s' }}>
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
            <span>🎨</span>
            <span>Внешний вид</span>
          </h2>
          
          <div>
            <div className="font-medium text-white text-lg mb-4">Тема оформления</div>
            <div className="grid grid-cols-3 gap-3">
              {[
                { value: "light", label: "☀️ Светлая" },
                { value: "dark", label: "🌙 Темная" },
                { value: "auto", label: "🔄 Авто" }
              ].map((theme) => (
                <button
                  key={theme.value}
                  onClick={() => setSettings({ ...settings, theme: theme.value })}
                  className={settings.theme === theme.value ? "btn btn-primary" : "btn btn-secondary"}
                >
                  {theme.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Сохранить */}
        <div className="animate-slideIn" style={{ animationDelay: '0.2s' }}>
          <button className="btn btn-primary w-full text-xl py-4">
            💾 Сохранить настройки
          </button>
        </div>
      </main>
    </div>
  )
}
