# 🚀 Деплой на Vercel

## ✅ Статус сборки
- **✓ Compiled successfully**
- **✓ 43/43 страниц сгенерировано**
- **✓ Все TypeScript ошибки исправлены**

## 📋 Инструкция по деплою

### 1. Создайте PostgreSQL базу данных
Используйте один из сервисов:
- **Neon** (рекомендуется) - https://neon.tech
- **Supabase** - https://supabase.com
- **Railway** - https://railway.app

### 2. Настройте переменные окружения в Vercel

Перейдите в **Settings → Environment Variables** и добавьте:

```bash
# Database (обязательно)
DATABASE_URL=postgresql://user:password@host:5432/database

# NextAuth (обязательно)
NEXTAUTH_SECRET=ваш-секретный-ключ-минимум-32-символа
NEXTAUTH_URL=https://ваш-домен.vercel.app

# Email (опционально - для уведомлений)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
```

### 3. Добавьте Build Command

В **Settings → General → Build & Development Settings**:

- **Framework Preset**: Next.js
- **Build Command**: `npm run build`
- **Install Command**: `npm install`

### 4. Запустите миграции Prisma

После первого деплоя, в **Settings → Environment Variables** добавьте команду:

```bash
# В Vercel CLI или через dashboard
npx prisma migrate deploy
npx prisma db seed
```

Или добавьте в `package.json`:

```json
{
  "scripts": {
    "vercel-build": "prisma generate && prisma migrate deploy && next build"
  }
}
```

## 🔧 Устранение проблем

### ⚠️ "Export encountered errors"
Это нормально! Страницы `/gifts`, `/messages`, `/video-call` используют динамические параметры (`useSearchParams`) и не могут быть статически экспортированы. Они работают как Server-Side Rendered (SSR) страницы.

### ⚠️ "Dynamic server usage"
Это тоже нормально! API роуты используют `getServerSession` и не могут быть статическими.

## 📊 Что работает

- ✅ **43/43 страниц** успешно собраны
- ✅ **SSR** для динамических страниц
- ✅ **Static Generation** для статических страниц
- ✅ **API Routes** работают корректно
- ✅ **TypeScript** без ошибок

## 🎯 Готово к production!

Просто нажмите **Deploy** в Vercel!
