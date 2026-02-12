"use client"

import { useState, useEffect, useRef } from "react"
import { useSession } from "next-auth/react"
import { useRouter, useSearchParams } from "next/navigation"
import Navbar from "@/components/Navbar"
import { useVideoCall } from "@/hooks/useVideoCall"

export default function VideoCallPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const searchParams = useSearchParams()
  const recipientId = searchParams.get("userId")
  
  const localVideoRef = useRef<HTMLVideoElement>(null)
  const remoteVideoRef = useRef<HTMLVideoElement>(null)

  const {
    localStream,
    remoteStream,
    isCallActive,
    isConnecting,
    isMuted,
    isVideoOff,
    callStatus,
    startCall,
    endCall,
    toggleMute,
    toggleVideo
  } = useVideoCall({
    userId: session?.user?.id,
    recipientId: recipientId || undefined,
    onCallEnded: () => router.back()
  })

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin")
    }
  }, [status, router])

  // Устанавливаем локальный видео стрим
  useEffect(() => {
    if (localVideoRef.current && localStream) {
      localVideoRef.current.srcObject = localStream
    }
  }, [localStream])

  // Устанавливаем удаленный видео стрим
  useEffect(() => {
    if (remoteVideoRef.current && remoteStream) {
      remoteVideoRef.current.srcObject = remoteStream
    }
  }, [remoteStream])


  if (status === "loading") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50">
        <Navbar />
        <div className="flex items-center justify-center h-96">
          <div className="text-xl">Загрузка...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="bg-yellow-600 text-white rounded-lg p-4 mb-4">
            ⚠️ Видео-чат доступен только для Premium пользователей
          </div>

          {/* Статус звонка */}
          {callStatus !== "idle" && callStatus !== "ended" && (
            <div className="bg-white rounded-lg p-4 mb-4 text-center">
              <p className="text-lg font-semibold">
                {callStatus === "calling" && "⏳ Звоним..."}
                {callStatus === "ringing" && "📞 Входящий звонок..."}
                {callStatus === "connected" && "✅ Соединение установлено"}
              </p>
            </div>
          )}

          {!isCallActive ? (
            <div className="bg-white rounded-xl shadow-xl p-12 text-center">
              <h1 className="text-3xl font-bold mb-4">Видео-звонок</h1>
              <p className="text-gray-600 mb-8">
                {recipientId 
                  ? "Начните видео-звонок для общения лицом к лицу"
                  : "Укажите пользователя для звонка"}
              </p>
              {recipientId && (
                <button
                  onClick={startCall}
                  disabled={isConnecting}
                  className="bg-gradient-to-r from-green-600 to-green-700 text-white px-8 py-4 rounded-full text-lg font-semibold hover:shadow-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isConnecting ? "Соединение..." : "📹 Начать звонок"}
                </button>
              )}
              {!recipientId && (
                <button
                  onClick={() => router.push("/profiles")}
                  className="bg-gradient-to-r from-pink-600 to-purple-600 text-white px-8 py-4 rounded-full text-lg font-semibold hover:shadow-lg transition"
                >
                  Найти собеседника
                </button>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {/* Видео собеседника */}
              <div className="relative bg-black rounded-xl overflow-hidden" style={{ height: "60vh" }}>
                <video
                  ref={remoteVideoRef}
                  autoPlay
                  playsInline
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-4 left-4 bg-black bg-opacity-50 text-white px-4 py-2 rounded-lg">
                  Собеседник
                </div>
              </div>

              {/* Локальное видео */}
              <div className="relative bg-black rounded-xl overflow-hidden" style={{ height: "20vh" }}>
                <video
                  ref={localVideoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-2 left-2 bg-black bg-opacity-50 text-white px-3 py-1 rounded-lg text-sm">
                  Вы
                </div>
              </div>

              {/* Управление */}
              <div className="flex justify-center gap-4">
                <button
                  onClick={toggleMute}
                  className={`${
                    isMuted ? "bg-red-600" : "bg-gray-700"
                  } text-white p-4 rounded-full hover:opacity-80 transition`}
                >
                  {isMuted ? "🔇" : "🎤"}
                </button>
                <button
                  onClick={toggleVideo}
                  className={`${
                    isVideoOff ? "bg-red-600" : "bg-gray-700"
                  } text-white p-4 rounded-full hover:opacity-80 transition`}
                >
                  {isVideoOff ? "📹" : "📷"}
                </button>
                <button
                  onClick={endCall}
                  className="bg-red-600 text-white px-6 py-4 rounded-full hover:bg-red-700 transition"
                >
                  Завершить звонок
                </button>
              </div>
            </div>
          )}

          <div className="mt-8 bg-white rounded-xl p-6">
            <h3 className="font-bold text-lg mb-2">✨ Полнофункциональный видео-чат</h3>
            <p className="text-gray-600 text-sm mb-4">
              Реализован с использованием WebRTC и Socket.io для real-time сигнализации.
            </p>
            <div className="grid md:grid-cols-2 gap-4 text-sm">
              <div>
                <h4 className="font-semibold mb-2">Возможности:</h4>
                <ul className="list-disc list-inside text-gray-600 space-y-1">
                  <li>P2P видео соединение</li>
                  <li>Real-time сигнализация</li>
                  <li>ICE кандидаты</li>
                  <li>Управление камерой/микрофоном</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Требования:</h4>
                <ul className="list-disc list-inside text-gray-600 space-y-1">
                  <li>Premium подписка</li>
                  <li>HTTPS (в продакшн)</li>
                  <li>Разрешения браузера</li>
                  <li>Стабильное соединение</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
