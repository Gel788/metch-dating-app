"use client"

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import Navbar from "@/components/Navbar"
import Link from "next/link"

export default function PremiumPage() {
  const { data: session } = useSession()
  const router = useRouter()

  const plans = [
    { name: "1 месяц", price: "990₽", period: "/мес" },
    { name: "3 месяца", price: "690₽", period: "/мес", total: "2,070₽", save: "Экономия 900₽", popular: true },
    { name: "6 месяцев", price: "490₽", period: "/мес", total: "2,940₽", save: "Экономия 3,000₽" }
  ]

  const features = [
    { icon: "👀", title: "Видеть кто лайкнул", desc: "Узнайте кто проявил интерес" },
    { icon: "⭐", title: "Безлимитные супер-лайки", desc: "Выделяйтесь среди других" },
    { icon: "🚀", title: "Буст профиля", desc: "Первый в поиске на 24 часа" },
    { icon: "🔍", title: "Расширенные фильтры", desc: "Точный подбор" },
    { icon: "💬", title: "Приоритет в сообщениях", desc: "Доставка первыми" },
    { icon: "📊", title: "Детальная аналитика", desc: "Полная статистика" },
    { icon: "🎭", title: "Режим инкогнито", desc: "Просмотр незаметно" },
    { icon: "🔄", title: "Отмена действий", desc: "Верните лайки" },
    { icon: "💎", title: "Значок Premium", desc: "Золотой значок" },
    { icon: "🎁", title: "Эксклюзивные подарки", desc: "Премиум подарки" },
    { icon: "📸", title: "Больше фото", desc: "До 20 фотографий" },
    { icon: "🌍", title: "Поиск везде", desc: "Без границ" }
  ]

  return (
    <div className="min-h-screen gradient-dark">
      <Navbar />
      
      <main className="container mx-auto px-4 py-12 max-w-6xl">
        {/* Заголовок */}
        <div className="text-center mb-12 animate-fadeIn">
          <div className="text-8xl mb-6 animate-pulse">💎</div>
          <h1 className="text-6xl font-bold mb-4">
            <span className="text-gradient">Получите Premium</span>
          </h1>
          <p className="text-2xl text-gray-400">
            Раскройте все возможности платформы
          </p>
        </div>

        {/* Тарифы */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          {plans.map((plan, idx) => (
            <div
              key={idx}
              className={`card p-8 animate-slideIn ${plan.popular ? "card-premium" : ""}`}
              style={{ animationDelay: `${idx * 0.1}s` }}
            >
              {plan.popular && (
                <div className="badge badge-gold mb-4">
                  🔥 ПОПУЛЯРНЫЙ
                </div>
              )}
              
              <div className="text-center">
                <h3 className="text-2xl font-bold text-white mb-4">{plan.name}</h3>
                <div className="mb-6">
                  <div className="text-5xl font-bold text-gradient mb-2">{plan.price}</div>
                  <div className="text-gray-400">{plan.period}</div>
                  {plan.total && (
                    <div className="text-gray-500 text-sm mt-2">Всего: {plan.total}</div>
                  )}
                </div>
                {plan.save && (
                  <div className="badge badge-pink mb-6">
                    {plan.save}
                  </div>
                )}
                <button
                  onClick={() => {
                    if (!session) {
                      router.push("/auth/signin")
                    } else {
                      alert("Функция оплаты в разработке")
                    }
                  }}
                  className={plan.popular ? "btn btn-gold w-full" : "btn btn-purple w-full"}
                >
                  Выбрать план
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Возможности */}
        <div className="card p-10 mb-12">
          <h2 className="text-4xl font-bold text-center mb-10 text-white">
            Что входит в <span className="text-gradient">Premium</span>
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, idx) => (
              <div key={idx} className="glass p-6 rounded-2xl">
                <div className="text-5xl mb-3">{feature.icon}</div>
                <h3 className="font-bold text-white mb-2 text-lg">{feature.title}</h3>
                <p className="text-sm text-gray-400">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="card-premium p-12 text-center animate-scaleIn">
          <h2 className="text-4xl font-bold mb-4">
            <span className="text-gradient">Готовы попробовать?</span>
          </h2>
          <p className="text-gray-300 mb-8 max-w-2xl mx-auto text-lg">
            Присоединяйтесь к тысячам пользователей Premium
          </p>
          <button
            onClick={() => {
              if (!session) {
                router.push("/auth/signin")
              } else {
                window.scrollTo({ top: 0, behavior: "smooth" })
              }
            }}
            className="btn btn-gold text-lg px-12 py-4 animate-glow"
          >
            Начать сейчас →
          </button>
        </div>
      </main>
    </div>
  )
}
