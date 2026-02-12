import { Server as NetServer } from "http"
import { Server as SocketIOServer } from "socket.io"
import { NextApiResponse } from "next"

export type NextApiResponseServerIO = NextApiResponse & {
  socket: {
    server: NetServer & {
      io: SocketIOServer
    }
  }
}

export const initSocketServer = (server: NetServer) => {
  const io = new SocketIOServer(server, {
    path: "/api/socket/io",
    addTrailingSlash: false,
    cors: {
      origin: process.env.NEXTAUTH_URL || "http://localhost:3000",
      methods: ["GET", "POST"]
    }
  })

  io.on("connection", (socket) => {
    console.log(`Socket connected: ${socket.id}`)

    // Присоединение к комнате пользователя
    socket.on("join", (userId: string) => {
      socket.join(`user:${userId}`)
      console.log(`User ${userId} joined room`)
    })

    // Отправка сообщения
    socket.on("send_message", (data: {
      senderId: string
      receiverId: string
      message: unknown
    }) => {
      // Отправляем получателю
      io.to(`user:${data.receiverId}`).emit("new_message", data.message)
      // Подтверждаем отправителю
      socket.emit("message_sent", { success: true })
    })

    // Набор текста
    socket.on("typing", (data: { userId: string; recipientId: string; isTyping: boolean }) => {
      io.to(`user:${data.recipientId}`).emit("user_typing", {
        userId: data.userId,
        isTyping: data.isTyping
      })
    })

    // Онлайн статус
    socket.on("status_change", (data: { userId: string; status: "online" | "offline" }) => {
      io.emit("user_status", data)
    })

    socket.on("disconnect", () => {
      console.log(`Socket disconnected: ${socket.id}`)
    })
  })

  return io
}
