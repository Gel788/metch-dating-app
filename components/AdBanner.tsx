"use client"

import { useEffect, useState } from "react"
import Link from "next/link"

interface AdBannerProps {
  position: "TOP_BANNER" | "SIDEBAR" | "FEED"
}

interface Ad {
  id: string
  title: string
  description: string
  category: string
  user: {
    profile?: {
      name: string
      avatarUrl?: string
    }
  }
}

export default function AdBanner({ position }: AdBannerProps) {
  const [ads, setAds] = useState<Ad[]>([])
  const [currentAdIndex, setCurrentAdIndex] = useState(0)

  useEffect(() => {
    fetchAds()
  }, [position])

  useEffect(() => {
    if (ads.length > 1) {
      const interval = setInterval(() => {
        setCurrentAdIndex((prev) => (prev + 1) % ads.length)
      }, 10000) // Смена объявления каждые 10 секунд

      return () => clearInterval(interval)
    }
  }, [ads])

  const fetchAds = async () => {
    try {
      const res = await fetch(`/api/advertisements?position=${position}`)
      const data = await res.json()
      setAds(data)
    } catch (error) {
      console.error("Error fetching ads:", error)
    }
  }

  const handleClick = async (adId: string) => {
    try {
      await fetch(`/api/advertisements/${adId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "click" })
      })
    } catch (error) {
      console.error("Error tracking click:", error)
    }
  }

  if (ads.length === 0) return null

  const currentAd = ads[currentAdIndex]
  
  // Проверка что объявление существует
  if (!currentAd) return null

  if (position === "TOP_BANNER") {
    return (
      <div className="bg-gradient-to-r from-pink-500 to-purple-600 text-white">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <Link
                href={`/advertisements/${currentAd.id}`}
                onClick={() => handleClick(currentAd.id)}
                className="hover:opacity-80 transition"
              >
                <p className="font-semibold">{currentAd.title}</p>
                <p className="text-sm text-pink-100">{currentAd.description.substring(0, 100)}...</p>
              </Link>
            </div>
            <span className="text-xs bg-white bg-opacity-20 px-2 py-1 rounded">Реклама</span>
          </div>
        </div>
      </div>
    )
  }

  if (position === "SIDEBAR") {
    return (
      <div className="bg-white rounded-xl shadow-lg p-4 mb-4">
        <span className="text-xs text-gray-500">Реклама</span>
        <Link
          href={`/advertisements/${currentAd.id}`}
          onClick={() => handleClick(currentAd.id)}
          className="block mt-2 hover:opacity-80 transition"
        >
          <h3 className="font-bold text-lg mb-2">{currentAd.title}</h3>
          <p className="text-gray-700 text-sm line-clamp-3">{currentAd.description}</p>
        </Link>
      </div>
    )
  }

  if (position === "FEED") {
    return (
      <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-xl shadow-lg p-6 border-2 border-yellow-300">
        <div className="flex justify-between items-start mb-3">
          <span className="text-xs bg-yellow-500 text-white px-2 py-1 rounded">💎 Платное объявление</span>
        </div>
        <Link
          href={`/advertisements/${currentAd.id}`}
          onClick={() => handleClick(currentAd.id)}
          className="block hover:opacity-80 transition"
        >
          <h3 className="font-bold text-xl mb-2">{currentAd.title}</h3>
          <p className="text-gray-700 mb-3">{currentAd.description}</p>
          <div className="text-pink-600 font-semibold">Подробнее →</div>
        </Link>
      </div>
    )
  }

  return null
}
