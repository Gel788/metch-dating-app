"use client"

import { useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import Navbar from "@/components/Navbar"

export default function Home() {
  const { data: session } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (session?.user) {
      router.push("/swipe")
    }
  }, [session, router])

  if (session?.user) {
    return null
  }

  return (
    <div className="min-h-screen gradient-dark">
      <Navbar />
      
      {/* Hero секция */}
      <section className="relative overflow-hidden">
        {/* Фоновые эффекты */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-10 w-96 h-96 bg-pink-500/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-yellow-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
        </div>

        <div className="container mx-auto px-4 py-20 relative z-10">
          <div className="max-w-4xl mx-auto text-center animate-fadeIn">
            {/* Бейдж */}
            <div className="inline-flex items-center gap-2 px-6 py-3 rounded-full glass mb-8">
              <span className="text-2xl">💎</span>
              <span className="font-semibold text-gray-300">Премиум знакомства</span>
            </div>

            {/* Заголовок */}
            <h1 className="text-6xl md:text-7xl lg:text-8xl font-bold mb-8">
              <span className="text-gradient">Metch</span>
              <br />
              <span className="text-white">Найди свою</span>
              <br />
              <span className="text-gradient-purple">любовь</span>
            </h1>

            {/* Подзаголовок */}
            <p className="text-xl md:text-2xl text-gray-400 mb-12 max-w-2xl mx-auto leading-relaxed">
              Современная платформа для знакомств. Найди спонсора, компаньона или настоящую любовь
            </p>

            {/* CTA кнопки */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
              <Link href="/auth/signup" className="btn btn-primary text-lg px-10 py-4 w-full sm:w-auto">
                🚀 Начать сейчас
              </Link>
              <Link href="/auth/signin" className="btn btn-secondary text-lg px-10 py-4 w-full sm:w-auto">
                👤 Войти
              </Link>
            </div>

            {/* Статистика */}
            <div className="grid grid-cols-3 gap-6 max-w-3xl mx-auto">
              {[
                { icon: "👥", value: "10,000+", label: "Пользователей" },
                { icon: "💕", value: "5,000+", label: "Пар" },
                { icon: "⭐", value: "4.9", label: "Рейтинг" }
              ].map((stat, idx) => (
                <div key={idx} className="card p-6 animate-slideIn" style={{ animationDelay: `${idx * 0.1}s` }}>
                  <div className="text-4xl mb-2">{stat.icon}</div>
                  <div className="text-3xl font-bold text-gradient mb-1">{stat.value}</div>
                  <div className="text-sm text-gray-400">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Особенности */}
      <section className="py-20 relative">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl md:text-5xl font-bold text-center mb-16 text-white">
            Почему выбирают <span className="text-gradient">Metch</span>
          </h2>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {[
              {
                icon: "🎯",
                title: "Точный подбор",
                desc: "Умный алгоритм находит идеальные совпадения"
              },
              {
                icon: "🔒",
                title: "Безопасность",
                desc: "Проверка всех профилей и защита данных"
              },
              {
                icon: "💬",
                title: "Живое общение",
                desc: "Чат в реальном времени и видеозвонки"
              },
              {
                icon: "💎",
                title: "Premium функции",
                desc: "Расширенные возможности для VIP"
              },
              {
                icon: "📱",
                title: "Удобство",
                desc: "Работает на всех устройствах"
              },
              {
                icon: "🎁",
                title: "Виртуальные подарки",
                desc: "Дарите эмоции любимым"
              }
            ].map((feature, idx) => (
              <div 
                key={idx} 
                className="card card-hover p-8 text-center animate-slideIn"
                style={{ animationDelay: `${idx * 0.1}s` }}
              >
                <div className="text-6xl mb-4">{feature.icon}</div>
                <h3 className="text-xl font-bold mb-3 text-white">{feature.title}</h3>
                <p className="text-gray-400">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Premium секция */}
      <section className="py-20 relative">
        <div className="container mx-auto px-4">
          <div className="card-premium p-12 max-w-4xl mx-auto text-center animate-scaleIn">
            <div className="text-7xl mb-6">💎</div>
            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-gradient">
              Получи Premium
            </h2>
            <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
              Раскрой все возможности платформы. Безлимитные лайки, приоритет в поиске и эксклюзивные функции
            </p>
            <Link href="/premium" className="btn btn-gold text-lg px-10 py-4 inline-block animate-glow">
              Узнать больше →
            </Link>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 relative">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-white">
              Готов начать?
            </h2>
            <p className="text-xl text-gray-400 mb-8">
              Присоединяйся к тысячам счастливых пользователей
            </p>
            <Link href="/auth/signup" className="btn btn-primary text-lg px-12 py-4 inline-block">
              Создать аккаунт бесплатно
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-800 py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="text-gray-400">
              © 2026 Metch. Все права защищены
            </div>
            <div className="flex gap-6">
              <Link href="#" className="text-gray-400 hover:text-pink-500 transition">О нас</Link>
              <Link href="#" className="text-gray-400 hover:text-pink-500 transition">Помощь</Link>
              <Link href="#" className="text-gray-400 hover:text-pink-500 transition">Контакты</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
