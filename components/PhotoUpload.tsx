"use client"

import { useState, useRef } from "react"
import Image from "next/image"

interface PhotoUploadProps {
  currentPhotoUrl?: string
  isAvatar?: boolean
  onUploadSuccess?: (url: string) => void
}

export default function PhotoUpload({ 
  currentPhotoUrl, 
  isAvatar = false,
  onUploadSuccess 
}: PhotoUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [preview, setPreview] = useState<string | null>(currentPhotoUrl || null)
  const [error, setError] = useState("")
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Проверка типа
    if (!file.type.startsWith("image/")) {
      setError("Пожалуйста, выберите изображение")
      return
    }

    // Проверка размера
    if (file.size > 5 * 1024 * 1024) {
      setError("Файл слишком большой. Максимум 5MB")
      return
    }

    setError("")

    // Показываем preview
    const reader = new FileReader()
    reader.onloadend = () => {
      setPreview(reader.result as string)
    }
    reader.readAsDataURL(file)

    // Загружаем файл
    await uploadFile(file)
  }

  const uploadFile = async (file: File) => {
    try {
      setUploading(true)
      setError("")

      const formData = new FormData()
      formData.append("file", file)
      formData.append("isAvatar", isAvatar.toString())

      const res = await fetch("/api/upload/photo", {
        method: "POST",
        body: formData
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || "Ошибка загрузки")
      }

      if (onUploadSuccess) {
        onUploadSuccess(data.url || data.photo?.url)
      }

      alert(data.message || "Фото успешно загружено!")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ошибка загрузки")
      setPreview(currentPhotoUrl || null)
    } finally {
      setUploading(false)
    }
  }

  const handleClick = () => {
    fileInputRef.current?.click()
  }

  return (
    <div className="space-y-4">
      <div 
        onClick={handleClick}
        className="relative w-full aspect-square rounded-xl overflow-hidden border-2 border-dashed border-gray-300 hover:border-pink-500 cursor-pointer transition group"
      >
        {preview ? (
          <>
            <Image
              src={preview}
              alt="Preview"
              fill
              className="object-cover"
            />
            {!uploading && (
              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition flex items-center justify-center">
                <span className="text-white opacity-0 group-hover:opacity-100 transition">
                  Изменить фото
                </span>
              </div>
            )}
          </>
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-500">
            <svg className="w-16 h-16 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            <span>{isAvatar ? "Загрузить аватар" : "Добавить фото"}</span>
          </div>
        )}

        {uploading && (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <div className="text-white">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-2"></div>
              <p>Загрузка...</p>
            </div>
          </div>
        )}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/jpg,image/png,image/webp"
        onChange={handleFileSelect}
        className="hidden"
        disabled={uploading}
      />

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-2 rounded-lg text-sm">
          {error}
        </div>
      )}

      <p className="text-sm text-gray-500 text-center">
        JPG, PNG или WebP. Максимум 5MB.
        {!isAvatar && " Фото будет проверено модератором."}
      </p>
    </div>
  )
}
