"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { useSession } from "next-auth/react"
import { useRouter, useSearchParams } from "next/navigation"
import Navbar from "@/components/Navbar"
import Image from "next/image"
import { useSocket } from "@/hooks/useSocket"
import Link from "next/link"

export default function MessagesPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const searchParams = useSearchParams()
  const userId = searchParams.get("userId")
  
  const [dialogues, setDialogues] = useState<unknown[]>([])
  const [messages, setMessages] = useState<unknown[]>([])
  const [selectedUser, setSelectedUser] = useState<{ id: string; profile?: { name?: string; avatarUrl?: string } } | null>(null)
  const [newMessage, setNewMessage] = useState("")
  const [loading, setLoading] = useState(true)
  const [isTyping, setIsTyping] = useState(false)
  const [typingTimeout, setTypingTimeout] = useState<NodeJS.Timeout | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const { socket, isConnected, sendMessage: sendSocketMessage, sendTypingStatus } = useSocket(session?.user?.id)

  const fetchDialogues = useCallback(async () => {
    try {
      const res = await fetch("/api/messages")
      const data = await res.json()
      setDialogues(data)
    } catch (error) {
      console.error("Error fetching dialogues:", error)
    } finally {
      setLoading(false)
    }
  }, [])

  const fetchMessages = useCallback(async (withUserId: string) => {
    try {
      setLoading(true)
      const res = await fetch(`/api/messages?withUserId=${withUserId}`)
      const data = await res.json()
      setMessages(data)
      
      if (data.length > 0) {
        const otherUser = data[0].sender.id === session?.user?.id 
          ? data[0].receiver 
          : data[0].sender
        setSelectedUser(otherUser)
      }
    } catch (error) {
      console.error("Error fetching messages:", error)
    } finally {
      setLoading(false)
    }
  }, [session?.user?.id])

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin")
    } else if (status === "authenticated") {
      if (userId) {
        fetchMessages(userId)
      } else {
        fetchDialogues()
      }
    }
  }, [status, userId, router, fetchMessages, fetchDialogues])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  useEffect(() => {
    if (!socket) return

    socket.on("new_message", (message: unknown) => {
      setMessages((prev) => [...prev, message])
    })

    socket.on("user_typing", (data: { userId: string; isTyping: boolean }) => {
      if (data.userId === selectedUser?.id) {
        setIsTyping(data.isTyping)
      }
    })

    return () => {
      socket.off("new_message")
      socket.off("user_typing")
    }
  }, [socket, selectedUser])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!newMessage.trim() || !selectedUser) return

    try {
      const res = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          receiverId: selectedUser.id,
          content: newMessage
        })
      })

      if (res.ok) {
        const message = await res.json()
        setMessages([...messages, message])
        
        if (isConnected) {
          sendSocketMessage(selectedUser.id, message)
        }
        
        setNewMessage("")
        
        if (selectedUser) {
          sendTypingStatus(selectedUser.id, false)
        }
      } else {
        const error = await res.json()
        alert(error.error)
      }
    } catch (error) {
      console.error("Error sending message:", error)
    }
  }

  const handleTyping = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewMessage(e.target.value)

    if (!selectedUser) return

    if (!isTyping) {
      sendTypingStatus(selectedUser.id, true)
    }

    if (typingTimeout) {
      clearTimeout(typingTimeout)
    }

    const timeout = setTimeout(() => {
      sendTypingStatus(selectedUser.id, false)
    }, 3000)

    setTypingTimeout(timeout)
  }

  const selectDialogue = (dialogue: { user: { id: string; profile?: { name?: string; avatarUrl?: string } }; userId: string }) => {
    setSelectedUser(dialogue.user)
    fetchMessages(dialogue.userId)
    router.push(`/messages?userId=${dialogue.userId}`)
  }

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen gradient-dark">
        <Navbar />
        <div className="flex items-center justify-center h-[calc(100vh-160px)] md:h-[calc(100vh-80px)]">
          <div className="text-center">
            <div className="text-7xl mb-4 animate-pulse">💬</div>
            <div className="text-xl text-gray-400">Загрузка...</div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen gradient-dark">
      <Navbar />
      
      <main className="container mx-auto px-2 md:px-4 py-4 md:py-6 pb-24 md:pb-6">
        <div className="card overflow-hidden" style={{ height: "calc(100vh - 180px)" }}>
          <div className="flex h-full">
            {/* Список диалогов */}
            <div className={`${selectedUser ? "hidden md:flex" : "flex"} md:w-80 flex-col border-r border-gray-800 w-full`}>
              <div className="p-4 md:p-6 border-b border-gray-800 glass-dark">
                <h2 className="text-xl md:text-2xl font-bold text-white flex items-center gap-2">
                  <span>💬</span>
                  <span>Чаты</span>
                </h2>
              </div>
              
              <div className="flex-1 overflow-y-auto">
                {dialogues.length === 0 ? (
                  <div className="p-8 text-center">
                    <div className="text-6xl mb-4">💬</div>
                    <p className="text-gray-400">Нет диалогов</p>
                    <Link href="/swipe" className="btn btn-primary mt-4 text-sm">
                      Начать знакомство
                    </Link>
                  </div>
                ) : (
                  <div>
                    {dialogues.map((dialogue, idx) => (
                      <button
                        key={dialogue.userId}
                        onClick={() => selectDialogue(dialogue)}
                        className={`w-full p-4 border-b border-gray-800 hover:bg-white/5 transition-all duration-300 animate-fadeIn ${
                          selectedUser?.id === dialogue.userId ? "bg-pink-500/10" : ""
                        }`}
                        style={{ animationDelay: `${idx * 0.05}s` }}
                      >
                        <div className="flex items-center gap-3">
                          <div className="relative w-14 h-14 rounded-full overflow-hidden flex-shrink-0 bg-gradient-to-br from-pink-900/20 to-purple-900/20">
                            {dialogue.user.profile?.avatarUrl ? (
                              <Image
                                src={dialogue.user.profile.avatarUrl}
                                alt={dialogue.user.profile?.name || "User"}
                                fill
                                className="object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-2xl">
                                👤
                              </div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0 text-left">
                            <div className="flex justify-between items-start mb-1">
                              <h3 className="font-bold text-white truncate text-base">
                                {dialogue.user.profile?.name || "User"}
                              </h3>
                              {dialogue.unreadCount > 0 && (
                                <span className="badge badge-pink text-xs ml-2">
                                  {dialogue.unreadCount}
                                </span>
                              )}
                            </div>
                            <p className="text-sm text-gray-400 truncate">
                              {dialogue.lastMessage.content}
                            </p>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Область сообщений */}
            <div className={`${selectedUser ? "flex" : "hidden md:flex"} flex-1 flex-col w-full md:w-auto`}>
              {selectedUser ? (
                <>
                  {/* Заголовок чата */}
                  <div className="p-4 md:p-6 border-b border-gray-800 glass-dark">
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => setSelectedUser(null)}
                        className="md:hidden text-white text-2xl mr-2"
                      >
                        ←
                      </button>
                      <Link href={`/profiles/${selectedUser.id}`} className="flex items-center gap-3 hover:opacity-80 transition">
                        <div className="relative w-12 h-12 rounded-full overflow-hidden bg-gradient-to-br from-pink-900/20 to-purple-900/20">
                          {selectedUser.profile?.avatarUrl ? (
                            <Image
                              src={selectedUser.profile.avatarUrl}
                              alt={selectedUser.profile?.name || "User"}
                              fill
                              className="object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-2xl">
                              👤
                            </div>
                          )}
                        </div>
                        <div>
                          <h3 className="font-bold text-white text-lg">{selectedUser.profile?.name || "User"}</h3>
                          {isConnected && (
                            <div className="text-xs text-green-400 flex items-center gap-1">
                              <span className="w-2 h-2 bg-green-400 rounded-full"></span>
                              <span>онлайн</span>
                            </div>
                          )}
                        </div>
                      </Link>
                    </div>
                  </div>

                  {/* Сообщения */}
                  <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-950/50">
                    {messages.length === 0 ? (
                      <div className="flex items-center justify-center h-full text-gray-400">
                        <div className="text-center">
                          <div className="text-6xl mb-4">💬</div>
                          <p>Начните диалог!</p>
                        </div>
                      </div>
                    ) : (
                      messages.map((message, idx) => {
                        const isOwn = message.sender.id === session?.user?.id
                        return (
                          <div
                            key={message.id}
                            className={`flex ${isOwn ? "justify-end" : "justify-start"} animate-fadeIn`}
                            style={{ animationDelay: `${idx * 0.02}s` }}
                          >
                            <div
                              className={`max-w-[80%] md:max-w-md px-4 py-3 rounded-2xl ${
                                isOwn
                                  ? "bg-gradient-to-r from-pink-600 to-purple-600 text-white rounded-br-sm"
                                  : "glass text-white rounded-bl-sm"
                              }`}
                            >
                              <p className="text-sm md:text-base leading-relaxed">{message.content}</p>
                              <p className={`text-xs mt-1 ${isOwn ? "text-pink-200" : "text-gray-400"}`}>
                                {new Date(message.createdAt).toLocaleTimeString("ru-RU", {
                                  hour: "2-digit",
                                  minute: "2-digit"
                                })}
                              </p>
                            </div>
                          </div>
                        )
                      })
                    )}
                    
                    {isTyping && (
                      <div className="flex items-center gap-2 animate-fadeIn">
                        <div className="glass px-4 py-3 rounded-2xl rounded-bl-sm">
                          <div className="flex gap-1">
                            <div className="w-2 h-2 bg-pink-400 rounded-full animate-bounce"></div>
                            <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                            <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    <div ref={messagesEndRef} />
                  </div>

                  {/* Форма отправки */}
                  <form onSubmit={sendMessage} className="p-4 border-t border-gray-800 glass-dark">
                    <div className="flex gap-2 md:gap-3">
                      <input
                        type="text"
                        value={newMessage}
                        onChange={handleTyping}
                        placeholder="Напишите сообщение..."
                        className="input flex-1 text-sm md:text-base"
                      />
                      <button
                        type="submit"
                        disabled={!newMessage.trim()}
                        className="btn btn-primary px-4 md:px-8 disabled:opacity-50 text-sm md:text-base"
                      >
                        <span className="hidden md:inline">Отправить</span>
                        <span className="md:hidden">➤</span>
                      </button>
                    </div>
                  </form>
                </>
              ) : (
                <div className="flex-1 flex items-center justify-center">
                  <div className="text-center p-8">
                    <div className="text-8xl mb-6">💬</div>
                    <h3 className="text-2xl font-bold text-white mb-3">Выберите чат</h3>
                    <p className="text-gray-400">Или начните новое знакомство</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
