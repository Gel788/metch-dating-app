"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import Navbar from "@/components/Navbar"
import Image from "next/image"
import Link from "next/link"

interface Story {
  id: string
  userId: string
  mediaUrl: string
  mediaType: string
  caption?: string
  viewsCount: number
  expiresAt: string
  createdAt: string
}

interface UserStories {
  user: {
    id: string
    profile?: {
      name: string
      avatarUrl?: string
    }
  }
  stories: Story[]
}

export default function StoriesPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const [userStories, setUserStories] = useState<UserStories[]>([])
  const [currentStory, setCurrentStory] = useState<{ userIndex: number; storyIndex: number } | null>(null)
  const [loading, setLoading] = useState(true)
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    fetchStories()
  }, [])

  const fetchStories = async () => {
    try {
      const res = await fetch("/api/stories")
      const data = await res.json()
      setUserStories(data.stories || [])
    } catch (error) {
      console.error("Error:", error)
    } finally {
      setLoading(false)
    }
  }

  const openStory = (userIndex: number) => {
    setCurrentStory({ userIndex, storyIndex: 0 })
    setProgress(0)
  }

  const closeStory = () => {
    setCurrentStory(null)
    setProgress(0)
  }

  const nextStory = () => {
    if (!currentStory) return

    const currentUser = userStories[currentStory.userIndex]
    if (currentStory.storyIndex < currentUser.stories.length - 1) {
      setCurrentStory({ ...currentStory, storyIndex: currentStory.storyIndex + 1 })
      setProgress(0)
    } else if (currentStory.userIndex < userStories.length - 1) {
      setCurrentStory({ userIndex: currentStory.userIndex + 1, storyIndex: 0 })
      setProgress(0)
    } else {
      closeStory()
    }
  }

  const prevStory = () => {
    if (!currentStory) return

    if (currentStory.storyIndex > 0) {
      setCurrentStory({ ...currentStory, storyIndex: currentStory.storyIndex - 1 })
      setProgress(0)
    } else if (currentStory.userIndex > 0) {
      const prevUser = userStories[currentStory.userIndex - 1]
      setCurrentStory({ userIndex: currentStory.userIndex - 1, storyIndex: prevUser.stories.length - 1 })
      setProgress(0)
    }
  }

  useEffect(() => {
    if (currentStory) {
      const interval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 100) {
            nextStory()
            return 0
          }
          return prev + 2
        })
      }, 100)
      return () => clearInterval(interval)
    }
  }, [currentStory])

  if (loading) {
    return (
      <div className="min-h-screen gradient-dark">
        <Navbar />
        <div className="flex items-center justify-center h-[calc(100vh-160px)] md:h-[calc(100vh-80px)]">
          <div className="text-center">
            <div className="text-7xl mb-4 animate-pulse">📖</div>
            <div className="text-xl text-gray-400">Загрузка...</div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen gradient-dark pb-24 md:pb-8">
      <Navbar />

      <main className="container mx-auto px-4 py-6 md:py-8 max-w-6xl">
        {/* Заголовок */}
        <div className="flex flex-col md:flex-row items-center justify-between mb-8 md:mb-10 gap-4 animate-fadeIn">
          <div className="text-center md:text-left">
            <h1 className="text-4xl md:text-5xl font-bold mb-2">
              <span className="text-gradient">Истории</span>
            </h1>
            <p className="text-base md:text-lg text-gray-400">Узнайте, что нового у других</p>
          </div>
          {session && (
            <Link href="/stories/create" className="btn btn-gold text-sm md:text-base px-6">
              ✨ Добавить историю
            </Link>
          )}
        </div>

        {userStories.length === 0 ? (
          <div className="text-center py-12 md:py-20 card p-8 md:p-12 max-w-md mx-auto">
            <div className="text-7xl md:text-8xl mb-6">📖</div>
            <h3 className="text-2xl md:text-3xl font-bold text-white mb-3">Пока нет историй</h3>
            <p className="text-gray-400 mb-6 md:mb-8 text-base md:text-lg">Станьте первым!</p>
            {session && (
              <Link href="/stories/create" className="btn btn-primary">
                Создать историю
              </Link>
            )}
          </div>
        ) : (
          <div className="flex gap-4 md:gap-6 overflow-x-auto pb-4 md:pb-6 scrollbar-hide">
            {userStories.map((userStory, idx) => (
              <button
                key={userStory.user.id}
                onClick={() => openStory(idx)}
                className="flex-shrink-0 animate-slideIn"
                style={{ animationDelay: `${idx * 0.05}s` }}
              >
                <div className="relative">
                  {/* Аватар с градиентом */}
                  <div className="w-20 h-20 md:w-24 md:h-24 rounded-full overflow-hidden p-[3px] bg-gradient-to-br from-pink-500 via-purple-500 to-blue-500 hover:scale-105 transition-transform">
                    <div className="glass-dark rounded-full p-[3px] w-full h-full">
                      <div className="w-full h-full rounded-full overflow-hidden bg-gradient-to-br from-pink-900/20 to-purple-900/20">
                        {userStory.user.profile?.avatarUrl ? (
                          <Image
                            src={userStory.user.profile.avatarUrl}
                            alt={userStory.user.profile.name || "User"}
                            width={96}
                            height={96}
                            className="object-cover w-full h-full"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-3xl md:text-4xl">
                            👤
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  {/* Имя */}
                  <p className="text-xs md:text-sm text-center mt-2 font-semibold text-white max-w-20 md:max-w-24 truncate">
                    {userStory.user.profile?.name || "User"}
                  </p>
                  
                  {/* Счетчик историй */}
                  <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-gradient-gold flex items-center justify-center text-xs font-bold text-black">
                    {userStory.stories.length}
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </main>

      {/* Story Viewer */}
      {currentStory && (
        <div className="fixed inset-0 bg-black z-50 flex items-center justify-center">
          {(() => {
            const currentUserStory = userStories[currentStory.userIndex]
            const story = currentUserStory.stories[currentStory.storyIndex]

            return (
              <>
                {/* Progress bars */}
                <div className="absolute top-4 left-4 right-4 flex gap-2 z-20">
                  {currentUserStory.stories.map((_, idx) => (
                    <div key={idx} className="flex-1 h-1 bg-white/20 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-white rounded-full transition-all"
                        style={idx === currentStory.storyIndex ? { width: `${progress}%` } : 
                               idx < currentStory.storyIndex ? { width: '100%' } : { width: '0%' }}
                      />
                    </div>
                  ))}
                </div>

                {/* Header */}
                <div className="absolute top-8 left-4 md:left-6 right-4 md:right-6 flex items-center justify-between z-20">
                  <Link 
                    href={`/profiles/${currentUserStory.user.id}`}
                    className="flex items-center gap-3 glass px-3 py-2 rounded-full hover:bg-black/70 transition"
                  >
                    <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-800">
                      {currentUserStory.user.profile?.avatarUrl ? (
                        <Image
                          src={currentUserStory.user.profile.avatarUrl}
                          alt={currentUserStory.user.profile.name || "User"}
                          width={40}
                          height={40}
                          className="object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-xl">
                          👤
                        </div>
                      )}
                    </div>
                    <div className="text-white">
                      <p className="font-bold text-sm">{currentUserStory.user.profile?.name || "User"}</p>
                      <p className="text-xs opacity-80">
                        {Math.floor((new Date().getTime() - new Date(story.createdAt).getTime()) / (1000 * 60 * 60))}ч назад
                      </p>
                    </div>
                  </Link>
                  <button
                    onClick={closeStory}
                    className="glass w-10 h-10 rounded-full flex items-center justify-center text-white text-2xl hover:bg-white/20 transition"
                  >
                    ×
                  </button>
                </div>

                {/* Content */}
                <div className="relative w-full max-w-md h-[85vh] rounded-2xl overflow-hidden">
                  {story.mediaType === "image" ? (
                    <Image
                      src={story.mediaUrl}
                      alt="Story"
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <video
                      src={story.mediaUrl}
                      className="w-full h-full object-cover"
                      autoPlay
                      muted
                      loop
                    />
                  )}

                  {/* Caption */}
                  {story.caption && (
                    <div className="absolute bottom-24 left-4 right-4 glass px-4 py-3 rounded-2xl text-white">
                      <p className="text-sm md:text-base">{story.caption}</p>
                    </div>
                  )}

                  {/* Views */}
                  <div className="absolute bottom-6 left-4 glass px-3 py-2 rounded-full text-white text-sm flex items-center gap-2">
                    <span>👁️</span>
                    <span className="font-semibold">{story.viewsCount}</span>
                  </div>
                </div>

                {/* Navigation arrows - desktop */}
                <button
                  onClick={prevStory}
                  className="hidden md:block absolute left-6 top-1/2 -translate-y-1/2 glass w-12 h-12 rounded-full flex items-center justify-center text-white text-3xl hover:bg-white/20 transition disabled:opacity-30"
                  disabled={currentStory.userIndex === 0 && currentStory.storyIndex === 0}
                >
                  ‹
                </button>
                <button
                  onClick={nextStory}
                  className="hidden md:block absolute right-6 top-1/2 -translate-y-1/2 glass w-12 h-12 rounded-full flex items-center justify-center text-white text-3xl hover:bg-white/20 transition"
                >
                  ›
                </button>

                {/* Tap zones - mobile */}
                <div className="absolute inset-0 flex z-10 md:hidden">
                  <div className="w-1/3 h-full" onClick={prevStory}></div>
                  <div className="w-1/3 h-full"></div>
                  <div className="w-1/3 h-full" onClick={nextStory}></div>
                </div>
              </>
            )
          })()}
        </div>
      )}
    </div>
  )
}
