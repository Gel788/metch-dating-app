import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

const mockUsers = [
  {
    email: 'anna.petrova@example.com',
    name: 'Анна',
    gender: 'FEMALE' as const,
    birthDate: new Date('1995-03-15'),
    lookingFor: 'SPONSOR' as const,
    city: 'Москва',
    bio: 'Студентка МГУ, люблю путешествия и искусство. Ищу интересного спонсора для взаимовыгодного общения.',
    interests: ['Путешествия', 'Искусство', 'Йога', 'Кино'],
    occupation: 'Студентка',
    education: 'МГУ',
    avatarUrl: '/placeholder-avatar.png'
  },
  {
    email: 'maria.ivanova@example.com',
    name: 'Мария',
    gender: 'FEMALE' as const,
    birthDate: new Date('1998-07-22'),
    lookingFor: 'COMPANION' as const,
    city: 'Санкт-Петербург',
    bio: 'Модель и фотограф. Люблю красивую жизнь и интересных людей. Готова к новым знакомствам.',
    interests: ['Фотография', 'Мода', 'Спорт', 'Музыка'],
    occupation: 'Модель',
    education: 'СПБГУ',
    avatarUrl: '/placeholder-avatar.png'
  },
  {
    email: 'elena.smirnova@example.com',
    name: 'Елена',
    gender: 'FEMALE' as const,
    birthDate: new Date('1996-11-08'),
    lookingFor: 'SPONSOR' as const,
    city: 'Москва',
    bio: 'Дизайнер интерьеров. Ценю роскошь, качественное общение и взаимное уважение.',
    interests: ['Дизайн', 'Шопинг', 'Фитнес', 'Рестораны'],
    occupation: 'Дизайнер',
    education: 'МАРХИ',
    avatarUrl: '/placeholder-avatar.png'
  },
  {
    email: 'victor.sokolov@example.com',
    name: 'Виктор',
    gender: 'MALE' as const,
    birthDate: new Date('1985-05-12'),
    lookingFor: 'COMPANION' as const,
    city: 'Москва',
    bio: 'Предприниматель, владелец бизнеса. Ищу приятную компаньонку для совместного досуга.',
    interests: ['Бизнес', 'Путешествия', 'Гольф', 'Рестораны'],
    occupation: 'Предприниматель',
    education: 'МГИМО',
    avatarUrl: '/placeholder-avatar.png'
  },
  {
    email: 'dmitry.volkov@example.com',
    name: 'Дмитрий',
    gender: 'MALE' as const,
    birthDate: new Date('1982-09-25'),
    lookingFor: 'COMPANION' as const,
    city: 'Санкт-Петербург',
    bio: 'Инвестор и меценат. Ценю красоту, ум и хорошую компанию. Готов к серьезным отношениям.',
    interests: ['Инвестиции', 'Искусство', 'Яхтинг', 'Театр'],
    occupation: 'Инвестор',
    education: 'ВШЭ',
    avatarUrl: '/placeholder-avatar.png'
  },
  {
    email: 'olga.novikova@example.com',
    name: 'Ольга',
    gender: 'FEMALE' as const,
    birthDate: new Date('1997-01-30'),
    lookingFor: 'SPONSOR' as const,
    city: 'Екатеринбург',
    bio: 'Стюардесса, много путешествую. Ищу щедрого спонсора для яркой жизни.',
    interests: ['Путешествия', 'Танцы', 'SPA', 'Море'],
    occupation: 'Стюардесса',
    education: 'УрФУ',
    avatarUrl: '/placeholder-avatar.png'
  },
  {
    email: 'natalia.kovalenko@example.com',
    name: 'Наталья',
    gender: 'FEMALE' as const,
    birthDate: new Date('1994-12-05'),
    lookingFor: 'RELATIONSHIP' as const,
    city: 'Москва',
    bio: 'Психолог, работаю с людьми. Ищу серьезные отношения с успешным мужчиной.',
    interests: ['Психология', 'Книги', 'Театр', 'Кофейни'],
    occupation: 'Психолог',
    education: 'МГУ',
    avatarUrl: '/placeholder-avatar.png'
  },
  {
    email: 'alexander.kozlov@example.com',
    name: 'Александр',
    gender: 'MALE' as const,
    birthDate: new Date('1988-04-18'),
    lookingFor: 'COMPANION' as const,
    city: 'Москва',
    bio: 'IT-предприниматель. Успешный, самодостаточный. Ищу умную и красивую спутницу.',
    interests: ['Технологии', 'Стартапы', 'Теннис', 'Автомобили'],
    occupation: 'IT-предприниматель',
    education: 'МФТИ',
    avatarUrl: '/placeholder-avatar.png'
  },
  {
    email: 'katya.sokolova@example.com',
    name: 'Екатерина',
    gender: 'FEMALE' as const,
    birthDate: new Date('1999-06-14'),
    lookingFor: 'SPONSOR' as const,
    city: 'Сочи',
    bio: 'Инфлюенсер и блогер. Живу красиво и хочу продолжать в том же духе.',
    interests: ['Instagram', 'Мода', 'Пляж', 'Вечеринки'],
    occupation: 'Блогер',
    education: 'СГУ',
    avatarUrl: '/placeholder-avatar.png'
  },
  {
    email: 'sergey.petrov@example.com',
    name: 'Сергей',
    gender: 'MALE' as const,
    birthDate: new Date('1980-08-22'),
    lookingFor: 'COMPANION' as const,
    city: 'Санкт-Петербург',
    bio: 'Врач-хирург, владелец клиники. Ищу молодую и энергичную девушку для отношений.',
    interests: ['Медицина', 'Гольф', 'Путешествия', 'Кулинария'],
    occupation: 'Врач',
    education: 'Первый мед',
    avatarUrl: '/placeholder-avatar.png'
  }
]

async function main() {
  console.log('🌱 Начало заполнения базы данных...')

  // Очистка существующих данных
  await prisma.advertisement.deleteMany()
  await prisma.videoCall.deleteMany()
  await prisma.gift.deleteMany()
  await prisma.like.deleteMany()
  await prisma.message.deleteMany()
  await prisma.photo.deleteMany()
  await prisma.premium.deleteMany()
  await prisma.profile.deleteMany()
  await prisma.user.deleteMany()

  console.log('✅ База данных очищена')

  const hashedPassword = await bcrypt.hash('password123', 10)

  // Создание пользователей и профилей
  for (const mockUser of mockUsers) {
    const user = await prisma.user.create({
      data: {
        email: mockUser.email,
        password: hashedPassword,
        profile: {
          create: {
            name: mockUser.name,
            gender: mockUser.gender,
            birthDate: mockUser.birthDate,
            lookingFor: mockUser.lookingFor,
            city: mockUser.city,
            bio: mockUser.bio,
            interests: mockUser.interests,
            occupation: mockUser.occupation,
            education: mockUser.education,
            avatarUrl: mockUser.avatarUrl,
            viewsCount: Math.floor(Math.random() * 500),
            likesCount: Math.floor(Math.random() * 50)
          }
        }
      },
      include: {
        profile: true
      }
    })

    console.log(`✅ Создан пользователь: ${mockUser.name} (${mockUser.email})`)

    // Добавляем Premium для некоторых пользователей
    if (Math.random() > 0.6) {
      const endDate = new Date()
      endDate.setMonth(endDate.getMonth() + 1)

      await prisma.premium.create({
        data: {
          userId: user.id,
          plan: 'BASIC',
          endDate,
          isActive: true
        }
      })

      // Делаем топ-профиль
      await prisma.profile.update({
        where: { id: user.profile!.id },
        data: {
          isTopProfile: true,
          topUntil: endDate
        }
      })

      console.log(`  💎 Premium активирован для ${mockUser.name}`)
    }
  }

  // Создаем взаимные лайки для некоторых пользователей
  const users = await prisma.user.findMany()
  
  for (let i = 0; i < 10; i++) {
    const user1 = users[Math.floor(Math.random() * users.length)]
    const user2 = users[Math.floor(Math.random() * users.length)]

    if (user1.id !== user2.id) {
      try {
        await prisma.like.create({
          data: {
            giverId: user1.id,
            receiverId: user2.id
          }
        })
        console.log(`  ❤️ Лайк: ${user1.email} → ${user2.email}`)
      } catch (error) {
        // Игнорируем дубликаты
      }
    }
  }

  // Создаем несколько сообщений
  for (let i = 0; i < 15; i++) {
    const sender = users[Math.floor(Math.random() * users.length)]
    const receiver = users[Math.floor(Math.random() * users.length)]

    if (sender.id !== receiver.id) {
      await prisma.message.create({
        data: {
          senderId: sender.id,
          receiverId: receiver.id,
          content: [
            'Привет! Как дела?',
            'Интересный профиль, хотелось бы познакомиться',
            'Свободны сегодня вечером?',
            'Спасибо за лайк! Вы тоже интересны',
            'Расскажите о себе подробнее',
          ][Math.floor(Math.random() * 5)],
          isRead: Math.random() > 0.5
        }
      })
    }
  }

  console.log('✅ Созданы лайки и сообщения')

  // Создаем платные объявления от мужчин
  const maleUsers = users.filter(u => {
    const mockUser = mockUsers.find(mu => mu.email === u.email)
    return mockUser?.gender === "MALE"
  })

  const now = new Date()
  const advertisements = [
    {
      userId: maleUsers[0].id, // Виктор
      title: "🎯 Ищу девушку для совместного отдыха",
      description: "Успешный предприниматель, 32 года. Ищу привлекательную девушку для совместных путешествий, ужинов в ресторанах и интересного времяпрепровождения. Готов обеспечить комфортный отдых. Конфиденциальность гарантирую.",
      category: "ANNOUNCEMENT" as const,
      isPaid: true,
      isActive: true,
      position: "TOP_BANNER" as const,
      priority: 10,
      startDate: now,
      endDate: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000), // +7 дней
      targetGender: "FEMALE" as const,
      targetAgeMin: 22,
      targetAgeMax: 35,
      targetCities: ["Москва", "Санкт-Петербург"]
    },
    {
      userId: maleUsers[1].id, // Дмитрий
      title: "💰 Спонсорство для особенной девушки",
      description: "Бизнесмен из Екатеринбурга. Ищу девушку, которая ценит красивую жизнь. Предлагаю регулярную материальную поддержку, подарки, совместные поездки. Жду фото и контакты в ответ.",
      category: "PROFILE_PROMOTION" as const,
      isPaid: true,
      isActive: true,
      position: "SIDEBAR" as const,
      priority: 9,
      startDate: now,
      endDate: new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000), // +14 дней
      targetGender: "FEMALE" as const,
      targetAgeMin: 20,
      targetAgeMax: 30,
      targetCities: ["Екатеринбург", "Москва"]
    },
    {
      userId: maleUsers[2].id, // Александр
      title: "🌟 Приглашаю на деловой ужин",
      description: "Руководитель компании, 35 лет. Ищу интеллигентную собеседницу для деловых встреч и светских мероприятий. Оплата за компанию, без обязательств. Элитные рестораны, культурные события.",
      category: "EVENT" as const,
      isPaid: true,
      isActive: true,
      position: "FEED" as const,
      priority: 8,
      startDate: now,
      endDate: new Date(now.getTime() + 10 * 24 * 60 * 60 * 1000), // +10 дней
      targetGender: "FEMALE" as const,
      targetAgeMin: 25,
      targetAgeMax: 40,
      targetCities: ["Москва", "Санкт-Петербург", "Казань"]
    },
    {
      userId: maleUsers[3].id, // Сергей
      title: "💎 VIP-сопровождение на мероприятия",
      description: "Врач-хирург, 44 года. Приглашаю стильную девушку на светские мероприятия, выставки, премьеры. Щедрое вознаграждение, luxury-формат встреч. Требования: презентабельная внешность, умение вести беседу.",
      category: "EVENT" as const,
      isPaid: true,
      isActive: true,
      position: "SIDEBAR" as const,
      priority: 7,
      startDate: now,
      endDate: new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000), // +5 дней
      targetGender: "FEMALE" as const,
      targetAgeMin: 23,
      targetAgeMax: 35,
      targetCities: ["Москва"]
    },
    {
      userId: maleUsers[0].id, // Виктор (второе объявление)
      title: "🏖️ Приглашаю в путешествие",
      description: "Планирую поездку на море. Ищу спутницу, которая любит комфорт и новые впечатления. Все расходы беру на себя: перелет, отель 5*, развлечения. Отдых без обязательств.",
      category: "ANNOUNCEMENT" as const,
      isPaid: true,
      isActive: true,
      position: "FEED" as const,
      priority: 6,
      startDate: now,
      endDate: new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000), // +3 дня
      targetGender: "FEMALE" as const,
      targetAgeMin: 21,
      targetAgeMax: 32,
      targetCities: []
    }
  ]

  for (const ad of advertisements) {
    await prisma.advertisement.create({ data: ad })
    const user = users.find(usr => usr.id === ad.userId)
    const mockUser = mockUsers.find(mu => mu.email === user?.email)
    console.log(`  💰 Объявление: ${mockUser?.name} - "${ad.title.substring(0, 40)}..."`)
  }

  console.log('✅ Созданы платные объявления от мужчин')

  console.log('')
  console.log('🎉 База данных успешно заполнена!')
  console.log('')
  console.log('📝 Тестовые аккаунты:')
  console.log('   Email: anna.petrova@example.com')
  console.log('   Email: victor.sokolov@example.com')
  console.log('   Email: maria.ivanova@example.com')
  console.log('   ...')
  console.log('   Пароль для всех: password123')
  console.log('')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
