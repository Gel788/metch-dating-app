#!/bin/bash

echo "🚀 Запуск Metch Dating App..."
echo ""

# Проверка версии Node.js
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
echo "📦 Текущая версия Node.js: $(node -v)"

if [ "$NODE_VERSION" -lt 20 ]; then
    echo ""
    echo "⚠️  ВНИМАНИЕ: Требуется Node.js >= 20.9.0"
    echo ""
    echo "Для обновления Node.js выполните:"
    echo ""
    echo "1. Установите nvm (если ещё не установлен):"
    echo "   curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash"
    echo ""
    echo "2. Перезапустите terminal"
    echo ""
    echo "3. Установите Node.js 20:"
    echo "   nvm install 20"
    echo "   nvm use 20"
    echo "   nvm alias default 20"
    echo ""
    echo "4. Запустите этот скрипт снова"
    echo ""
    read -p "Попробовать запустить с текущей версией Node.js? (y/n) " -n 1 -r
    echo ""
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

echo ""
echo "🗄️  Проверка PostgreSQL..."

# Проверка PostgreSQL
if command -v psql &> /dev/null; then
    echo "✅ PostgreSQL установлен"
    
    # Проверка подключения к БД
    if psql -lqt | cut -d \| -f 1 | grep -qw metch; then
        echo "✅ База данных 'metch' существует"
    else
        echo "⚠️  База данных 'metch' не найдена"
        echo ""
        read -p "Создать базу данных 'metch'? (y/n) " -n 1 -r
        echo ""
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            createdb metch
            echo "✅ База данных создана"
        fi
    fi
else
    echo "⚠️  PostgreSQL не установлен или не запущен"
    echo ""
    echo "Для установки PostgreSQL:"
    echo "  brew install postgresql@16"
    echo "  brew services start postgresql@16"
    echo ""
    read -p "Продолжить без PostgreSQL? (используется .env настройка) (y/n) " -n 1 -r
    echo ""
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

echo ""
echo "📦 Проверка зависимостей..."

if [ ! -d "node_modules" ]; then
    echo "Установка npm пакетов..."
    npm install
fi

echo ""
echo "🔧 Настройка Prisma..."

# Генерация Prisma Client
npx prisma generate

# Миграции (если БД доступна)
echo ""
read -p "Выполнить миграции базы данных? (y/n) " -n 1 -r
echo ""
if [[ $REPLY =~ ^[Yy]$ ]]; then
    npx prisma migrate dev --name init
fi

echo ""
echo "✨ Запуск сервера разработки..."
echo ""
echo "🌐 Приложение будет доступно на: http://localhost:3000"
echo ""
echo "Нажмите Ctrl+C для остановки сервера"
echo ""
sleep 2

# Запуск сервера
npm run dev
