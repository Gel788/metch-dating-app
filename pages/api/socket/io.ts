import { Server as NetServer } from "http"
import { NextApiRequest } from "next"
import { Server as SocketIOServer } from "socket.io"
import { NextApiResponseServerIO } from "@/lib/socket"

export const config = {
  api: {
    bodyParser: false
  }
}

const ioHandler = (req: NextApiRequest, res: NextApiResponseServerIO) => {
  if (!res.socket.server.io) {
    console.log("Initializing Socket.IO server...")

    const httpServer: NetServer = res.socket.server as unknown as NetServer
    const io = new SocketIOServer(httpServer, {
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
        
        // Уведомляем других о том, что пользователь онлайн
        socket.broadcast.emit("user_status", { userId, status: "online" })
      })

      // Отправка сообщения
      socket.on("send_message", (data: {
        senderId: string
        receiverId: string
        message: unknown
      }) => {
        console.log(`Message from ${data.senderId} to ${data.receiverId}`)
        
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

      // Отключение
      socket.on("disconnect", () => {
        console.log(`Socket disconnected: ${socket.id}`)
      })
    })

    res.socket.server.io = io
    console.log("Socket.IO server initialized")
  } else {
    console.log("Socket.IO server already running")
  }

  res.end()
}

export default ioHandler
