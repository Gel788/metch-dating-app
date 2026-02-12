import Link from "next/link"
import Image from "next/image"

interface ProfileCardProps {
  profile: any
}

export default function ProfileCard({ profile }: ProfileCardProps) {
  const age = Math.floor(
    (new Date().getTime() - new Date(profile.birthDate).getTime()) / (365.25 * 24 * 60 * 60 * 1000)
  )

  const imageUrl = profile.avatarUrl || profile.photos?.[0]?.url

  return (
    <Link href={`/profiles/${profile.id}`}>
      <div className="card card-hover overflow-hidden group">
        {/* Фото */}
        <div className="relative aspect-[3/4] bg-gradient-to-br from-pink-900/20 to-purple-900/20">
          {imageUrl ? (
            <Image
              src={imageUrl}
              alt={profile.name}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-500"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <span className="text-5xl md:text-8xl">👤</span>
            </div>
          )}

          {/* Градиент */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>

          {/* VIP бейдж */}
          {profile.user?.premium?.isActive && (
            <div className="absolute top-2 right-2 md:top-3 md:right-3 badge badge-gold animate-glow text-xs">
              💎
            </div>
          )}

          {/* Информация */}
          <div className="absolute bottom-0 left-0 right-0 p-3 md:p-5">
            <h3 className="text-lg md:text-2xl font-bold text-white mb-1 md:mb-2 truncate">
              {profile.name}, {age}
            </h3>
            {profile.city && (
              <div className="flex items-center gap-1 md:gap-2 text-gray-200 mb-2 md:mb-3 text-xs md:text-sm">
                <span>📍</span>
                <span className="truncate">{profile.city}</span>
              </div>
            )}
            {profile.interests && profile.interests.length > 0 && (
              <div className="flex flex-wrap gap-1 md:gap-2">
                {profile.interests.slice(0, 2).map((interest: string, idx: number) => (
                  <span
                    key={idx}
                    className="px-2 md:px-3 py-0.5 md:py-1 rounded-full text-xs font-medium bg-pink-500/30 text-pink-200 border border-pink-500/50 truncate max-w-[80px] md:max-w-none"
                  >
                    {interest}
                  </span>
                ))}
                {profile.interests.length > 2 && (
                  <span className="px-2 md:px-3 py-0.5 md:py-1 rounded-full text-xs font-medium bg-purple-500/30 text-purple-200 border border-purple-500/50">
                    +{profile.interests.length - 2}
                  </span>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </Link>
  )
}
