"use client"

import { useState } from "react"
import { signIn } from "next-auth/react"
import { useRouter } from "next/navigation"
import Link from "next/link"

export default function SignInPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({ email: "", password: "" })
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      const result = await signIn("credentials", {
        email: formData.email,
        password: formData.password,
        redirect: false
      })

      if (result?.error) {
        setError("Неверный email или пароль")
      } else {
        router.push("/swipe")
      }
    } catch (error) {
      setError("Произошла ошибка")
    } finally {
      setLoading(false)
    }
  }

  const quickLogin = (email: string) => {
    setFormData({ email, password: "password123" })
    setTimeout(() => {
      handleSubmit({ preventDefault: () => {} } as React.FormEvent)
    }, 100)
  }

  return (
    <div className="min-h-screen gradient-dark flex items-center justify-center p-4 relative overflow-hidden">
      {/* Фоновые эффекты */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-96 h-96 bg-pink-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
      </div>

      <div className="w-full max-w-md relative z-10">
        {/* Логотип */}
        <div className="text-center mb-8 animate-fadeIn">
          <Link href="/">
            <div className="text-7xl mb-4 animate-pulse">❤️</div>
            <h1 className="text-4xl font-bold text-gradient mb-2">Metch</h1>
          </Link>
          <p className="text-gray-400">Рады видеть вас снова!</p>
        </div>

        {/* Форма */}
        <div className="card p-8 animate-scaleIn">
          <h2 className="text-2xl font-bold mb-6 text-white text-center">Вход</h2>
          
          {error && (
            <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-xl mb-4 animate-slideIn">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Email</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="input"
                placeholder="your@email.com"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Пароль</label>
              <input
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="input"
                placeholder="••••••••"
                required
              />
            </div>

            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2 text-gray-400">
                <input type="checkbox" className="rounded bg-gray-800 border-gray-700" />
                <span>Запомнить</span>
              </label>
              <Link href="/auth/forgot-password" className="text-pink-400 hover:text-pink-300 font-medium">
                Забыли пароль?
              </Link>
            </div>

            <button type="submit" disabled={loading} className="btn btn-primary w-full">
              {loading ? "Вход..." : "Войти"}
            </button>
          </form>

          {/* Быстрый вход */}
          <div className="mt-6 p-4 glass-dark border border-blue-500/30 rounded-xl">
            <p className="text-sm font-semibold text-blue-400 mb-3 text-center">
              🚀 Быстрый вход для тестирования
            </p>
            <div className="space-y-2">
              <button
                onClick={() => quickLogin("anna.petrova@example.com")}
                className="w-full btn btn-purple"
              >
                👩 Войти как Анна
              </button>
              <button
                onClick={() => quickLogin("victor.sokolov@example.com")}
                className="w-full btn btn-purple"
              >
                👨 Войти как Виктор
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-2 text-center">
              Пароль: password123
            </p>
          </div>

          {/* Регистрация */}
          <div className="mt-6 text-center">
            <p className="text-gray-400">
              Нет аккаунта?{" "}
              <Link href="/auth/signup" className="text-pink-400 hover:text-pink-300 font-semibold">
                Зарегистрироваться
              </Link>
            </p>
          </div>
        </div>

        <div className="text-center mt-6">
          <Link href="/" className="text-gray-400 hover:text-white transition">
            ← Вернуться на главную
          </Link>
        </div>
      </div>
    </div>
  )
}
