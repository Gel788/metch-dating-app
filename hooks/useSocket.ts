"use client"

import { useEffect, useState } from "react"
import { io, Socket } from "socket.io-client"

let socket: Socket | null = null

export const useSocket = (userId?: string) => {
  const [isConnected, setIsConnected] = useState(false)
  const [socketInstance, setSocketInstance] = useState<Socket | null>(null)

  useEffect(() => {
    if (!userId) return

    // Инициализация socket только один раз
    if (!socket) {
      socket = io({
        path: "/api/socket/io",
        addTrailingSlash: false
      })

      socket.on("connect", () => {
        console.log("Socket connected")
        setIsConnected(true)
        socket?.emit("join", userId)
      })

      socket.on("disconnect", () => {
        console.log("Socket disconnected")
        setIsConnected(false)
      })

      socket.on("connect_error", (error) => {
        console.error("Socket connection error:", error)
        setIsConnected(false)
      })
    }

    setSocketInstance(socket)

    return () => {
      // Не отключаем socket при unmount, чтобы сохранить соединение
      // socket?.disconnect()
    }
  }, [userId])

  const sendMessage = (receiverId: string, message: unknown) => {
    if (socket && userId) {
      socket.emit("send_message", {
        senderId: userId,
        receiverId,
        message
      })
    }
  }

  const sendTypingStatus = (recipientId: string, isTyping: boolean) => {
    if (socket && userId) {
      socket.emit("typing", {
        userId,
        recipientId,
        isTyping
      })
    }
  }

  const updateStatus = (status: "online" | "offline") => {
    if (socket && userId) {
      socket.emit("status_change", { userId, status })
    }
  }

  return {
    socket: socketInstance,
    isConnected,
    sendMessage,
    sendTypingStatus,
    updateStatus
  }
}
