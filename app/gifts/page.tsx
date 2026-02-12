"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter, useSearchParams } from "next/navigation"
import Navbar from "@/components/Navbar"

interface Gift {
  id: string
  name: string
  imageUrl: string
  price: number
}

export default function GiftsPage() {
  const { status } = useSession()
  const router = useRouter()
  const searchParams = useSearchParams()
  const userId = searchParams?.get("userId")
  
  const [catalog, setCatalog] = useState<Gift[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin")
    } else if (status === "authenticated") {
      fetchCatalog()
    }
  }, [status, router])

  const fetchCatalog = async () => {
    try {
      const res = await fetch("/api/gifts?catalog=true")
      const data = await res.json()
      setCatalog(data)
    } catch (error) {
      console.error("Error fetching catalog:", error)
    } finally {
      setLoading(false)
    }
  }

  const sendGift = async (giftId: string) => {
    if (!userId) {
      alert("Не указан получатель")
      return
    }

    try {
      const res = await fetch("/api/gifts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          receiverId: userId,
          giftId
        })
      })

      if (res.ok) {
        alert("🎁 Подарок отправлен!")
        router.back()
      } else {
        const error = await res.json()
        alert(error.error)
      }
    } catch (error) {
      console.error("Error sending gift:", error)
    }
  }

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen gradient-dark">
        <Navbar />
        <div className="flex items-center justify-center h-[calc(100vh-160px)] md:h-[calc(100vh-80px)]">
          <div className="text-center">
            <div className="text-7xl mb-4 animate-pulse">🎁</div>
            <div className="text-xl text-gray-400">Загрузка...</div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen gradient-dark pb-24 md:pb-8">
      <Navbar />
      
      <main className="container mx-auto px-4 py-6 md:py-8">
        <div className="max-w-5xl mx-auto">
          {/* Заголовок */}
          <div className="text-center mb-8 md:mb-10 animate-fadeIn">
            <div className="text-7xl mb-4">🎁</div>
            <h1 className="text-4xl md:text-5xl font-bold mb-3">
              <span className="text-gradient">Виртуальные подарки</span>
            </h1>
            <p className="text-base md:text-xl text-gray-400">Удивите собеседника</p>
          </div>

          {/* Premium инфо */}
          <div className="card-premium p-6 md:p-8 mb-8 animate-slideIn">
            <div className="flex flex-col md:flex-row items-center gap-4">
              <div className="text-6xl">💎</div>
              <div className="flex-1 text-center md:text-left">
                <p className="font-bold text-white text-lg md:text-xl mb-1">
                  Отправка подарков только для Premium
                </p>
                <p className="text-sm text-gray-300">Получите доступ к эксклюзивным подаркам</p>
              </div>
              <button
                onClick={() => router.push("/premium")}
                className="btn btn-gold text-sm md:text-base"
              >
                Узнать →
              </button>
            </div>
          </div>

          {/* Каталог */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {catalog.map((gift, idx) => (
              <div
                key={gift.id}
                className="card card-hover p-4 md:p-6 text-center animate-slideIn"
                style={{ animationDelay: `${idx * 0.05}s` }}
              >
                <div className="text-5xl md:text-6xl mb-3 md:mb-4">{gift.imageUrl}</div>
                <h3 className="text-base md:text-xl font-bold text-white mb-2">{gift.name}</h3>
                <div className="text-2xl md:text-3xl font-bold text-gradient mb-4">
                  {gift.price} 💎
                </div>
                <button
                  onClick={() => sendGift(gift.id)}
                  className="btn btn-primary w-full text-sm md:text-base"
                >
                  Отправить
                </button>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  )
}
