"use client"

import { useState, useEffect } from "react"
import { useSession, signOut } from "next-auth/react"
import Link from "next/link"
import { usePathname } from "next/navigation"

export default function Navbar() {
  const { data: session } = useSession()
  const pathname = usePathname()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const NavLink = ({ href, children, icon, onClick }: { href: string, children: React.ReactNode, icon?: string, onClick?: () => void }) => {
    const isActive = pathname === href
    return (
      <Link
        href={href}
        className={`flex items-center gap-2 px-4 py-3 rounded-xl font-medium transition-all duration-300 ${
          isActive
            ? "bg-gradient-to-r from-pink-500/20 to-purple-500/20 text-pink-400 shadow-lg shadow-pink-500/20"
            : "text-gray-300 hover:text-white hover:bg-white/10"
        }`}
        onClick={onClick}
      >
        {icon && <span className="text-xl">{icon}</span>}
        <span>{children}</span>
      </Link>
    )
  }

  const MobileBottomNav = () => {
    if (!session) return null
    
    const bottomNavItems = [
      { href: "/swipe", icon: "💘", label: "Свайп" },
      { href: "/profiles", icon: "🔍", label: "Поиск" },
      { href: "/messages", icon: "💬", label: "Чат" },
      { href: "/likes", icon: "❤️", label: "Лайки" },
      { href: "/profile/me", icon: "👤", label: "Профиль" }
    ]

    return (
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 glass-dark border-t border-gray-800">
        <div className="grid grid-cols-5 gap-1 px-2 py-2">
          {bottomNavItems.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex flex-col items-center justify-center py-2 rounded-xl transition-all duration-300 ${
                  isActive
                    ? "text-pink-400 bg-pink-500/10"
                    : "text-gray-400 hover:text-white hover:bg-white/5"
                }`}
              >
                <span className="text-2xl mb-1">{item.icon}</span>
                <span className="text-xs font-medium">{item.label}</span>
              </Link>
            )
          })}
        </div>
      </div>
    )
  }

  return (
    <>
      <nav className={`glass-dark sticky top-0 z-50 border-b border-gray-800 transition-all duration-300 ${
        scrolled ? "shadow-xl shadow-black/50" : ""
      }`}>
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-20">
            {/* Логотип */}
            <Link
              href={session ? "/swipe" : "/"}
              className="text-2xl font-bold text-gradient flex items-center gap-2 hover:scale-105 transition-transform"
            >
              <span className="text-3xl">❤️</span>
              <span>Metch</span>
            </Link>

            {/* Desktop меню */}
            {session ? (
              <>
                <div className="hidden md:flex items-center gap-2">
                  <NavLink href="/swipe" icon="💘">Swipe</NavLink>
                  <NavLink href="/profiles" icon="🔍">Поиск</NavLink>
                  <NavLink href="/messages" icon="💬">Чат</NavLink>
                  <NavLink href="/likes" icon="❤️">Лайки</NavLink>
                  
                  <Link href="/premium" className="btn btn-gold ml-2 text-sm px-4 py-2">
                    💎 Premium
                  </Link>

                  {/* Dropdown профиль */}
                  <div className="relative ml-2">
                    <button
                      onClick={() => setDropdownOpen(!dropdownOpen)}
                      className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all duration-300 ${
                        dropdownOpen ? "bg-white/10" : "bg-white/5 hover:bg-white/10"
                      }`}
                    >
                      <span>👤</span>
                      <span className="text-gray-300">Меню</span>
                      <span className={`text-gray-500 transition-transform duration-300 ${dropdownOpen ? "rotate-180" : ""}`}>▼</span>
                    </button>

                    {dropdownOpen && (
                      <>
                        <div 
                          className="fixed inset-0 z-40" 
                          onClick={() => setDropdownOpen(false)}
                        ></div>
                        <div className="absolute right-0 mt-2 w-64 card p-3 animate-scaleIn z-50">
                          <Link
                            href="/profile/me"
                            className="flex items-center gap-3 px-4 py-3 text-gray-300 hover:bg-white/5 rounded-xl transition"
                            onClick={() => setDropdownOpen(false)}
                          >
                            <span className="text-xl">👤</span>
                            <span>Мой профиль</span>
                          </Link>
                          <Link
                            href="/stories"
                            className="flex items-center gap-3 px-4 py-3 text-gray-300 hover:bg-white/5 rounded-xl transition"
                            onClick={() => setDropdownOpen(false)}
                          >
                            <span className="text-xl">📖</span>
                            <span>Истории</span>
                          </Link>
                          <Link
                            href="/advertisements/all"
                            className="flex items-center gap-3 px-4 py-3 text-gray-300 hover:bg-white/5 rounded-xl transition"
                            onClick={() => setDropdownOpen(false)}
                          >
                            <span className="text-xl">💰</span>
                            <span>Объявления</span>
                          </Link>
                          <Link
                            href="/advertisements"
                            className="flex items-center gap-3 px-4 py-3 text-gray-300 hover:bg-white/5 rounded-xl transition"
                            onClick={() => setDropdownOpen(false)}
                          >
                            <span className="text-xl">📢</span>
                            <span>Мои объявления</span>
                          </Link>
                          <Link
                            href="/favorites"
                            className="flex items-center gap-3 px-4 py-3 text-gray-300 hover:bg-white/5 rounded-xl transition"
                            onClick={() => setDropdownOpen(false)}
                          >
                            <span className="text-xl">⭐</span>
                            <span>Избранное</span>
                          </Link>
                          <Link
                            href="/profile-views"
                            className="flex items-center gap-3 px-4 py-3 text-gray-300 hover:bg-white/5 rounded-xl transition"
                            onClick={() => setDropdownOpen(false)}
                          >
                            <span className="text-xl">👁️</span>
                            <span>Просмотры</span>
                          </Link>
                          <Link
                            href="/analytics"
                            className="flex items-center gap-3 px-4 py-3 text-gray-300 hover:bg-white/5 rounded-xl transition"
                            onClick={() => setDropdownOpen(false)}
                          >
                            <span className="text-xl">📊</span>
                            <span>Аналитика</span>
                          </Link>
                          <Link
                            href="/settings"
                            className="flex items-center gap-3 px-4 py-3 text-gray-300 hover:bg-white/5 rounded-xl transition"
                            onClick={() => setDropdownOpen(false)}
                          >
                            <span className="text-xl">⚙️</span>
                            <span>Настройки</span>
                          </Link>
                          <div className="divider my-2"></div>
                          <button
                            onClick={() => signOut()}
                            className="w-full flex items-center gap-3 px-4 py-3 text-red-400 hover:bg-red-500/10 rounded-xl transition"
                          >
                            <span className="text-xl">🚪</span>
                            <span>Выйти</span>
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                </div>

                {/* Mobile меню кнопка */}
                <button
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                  className="md:hidden px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 transition-all duration-300"
                >
                  <span className="text-2xl">{mobileMenuOpen ? "✕" : "☰"}</span>
                </button>
              </>
            ) : (
              <div className="flex items-center gap-3">
                <Link href="/auth/signin" className="btn btn-secondary text-sm px-6 py-2">
                  Войти
                </Link>
                <Link href="/auth/signup" className="btn btn-primary text-sm px-6 py-2">
                  Регистрация
                </Link>
              </div>
            )}
          </div>

          {/* Mobile dropdown меню */}
          {session && mobileMenuOpen && (
            <div className="md:hidden py-4 space-y-2 animate-slideIn max-h-[70vh] overflow-y-auto">
              <Link
                href="/stories"
                className="flex items-center gap-3 px-4 py-3 text-gray-300 hover:bg-white/5 rounded-xl transition"
                onClick={() => setMobileMenuOpen(false)}
              >
                <span className="text-xl">📖</span>
                <span>Истории</span>
              </Link>
              <Link
                href="/advertisements/all"
                className="flex items-center gap-3 px-4 py-3 text-gray-300 hover:bg-white/5 rounded-xl transition"
                onClick={() => setMobileMenuOpen(false)}
              >
                <span className="text-xl">💰</span>
                <span>Объявления</span>
              </Link>
              <Link
                href="/advertisements"
                className="flex items-center gap-3 px-4 py-3 text-gray-300 hover:bg-white/5 rounded-xl transition"
                onClick={() => setMobileMenuOpen(false)}
              >
                <span className="text-xl">📢</span>
                <span>Мои объявления</span>
              </Link>
              <Link
                href="/favorites"
                className="flex items-center gap-3 px-4 py-3 text-gray-300 hover:bg-white/5 rounded-xl transition"
                onClick={() => setMobileMenuOpen(false)}
              >
                <span className="text-xl">⭐</span>
                <span>Избранное</span>
              </Link>
              <Link
                href="/profile-views"
                className="flex items-center gap-3 px-4 py-3 text-gray-300 hover:bg-white/5 rounded-xl transition"
                onClick={() => setMobileMenuOpen(false)}
              >
                <span className="text-xl">👁️</span>
                <span>Просмотры</span>
              </Link>
              <Link
                href="/analytics"
                className="flex items-center gap-3 px-4 py-3 text-gray-300 hover:bg-white/5 rounded-xl transition"
                onClick={() => setMobileMenuOpen(false)}
              >
                <span className="text-xl">📊</span>
                <span>Аналитика</span>
              </Link>
              <Link
                href="/premium"
                className="flex items-center gap-3 px-4 py-3 bg-gradient-to-r from-yellow-500/20 to-amber-500/20 text-yellow-400 rounded-xl transition"
                onClick={() => setMobileMenuOpen(false)}
              >
                <span className="text-xl">💎</span>
                <span>Premium</span>
              </Link>
              <Link
                href="/settings"
                className="flex items-center gap-3 px-4 py-3 text-gray-300 hover:bg-white/5 rounded-xl transition"
                onClick={() => setMobileMenuOpen(false)}
              >
                <span className="text-xl">⚙️</span>
                <span>Настройки</span>
              </Link>
              <div className="divider my-2"></div>
              <button
                onClick={() => signOut()}
                className="w-full flex items-center gap-3 px-4 py-3 text-red-400 hover:bg-red-500/10 rounded-xl transition"
              >
                <span className="text-xl">🚪</span>
                <span>Выйти</span>
              </button>
            </div>
          )}
        </div>
      </nav>

      {/* Нижняя мобильная навигация */}
      <MobileBottomNav />
      
      {/* Padding для нижней навигации */}
      {session && <div className="md:hidden h-20"></div>}
    </>
  )
}
