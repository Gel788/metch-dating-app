import { PrismaClient, Gender, LookingFor } from "@prisma/client"
import bcrypt from "bcryptjs"

const prisma = new PrismaClient()

async function main() {
  console.log("🌱 Добавляем дополнительных пользователей...")

  const password = await bcrypt.hash("password123", 10)

  const additionalUsers = [
    // Мужчины-спонсоры
    {
      email: "dmitry.kozlov@example.com",
      profile: {
        name: "Дмитрий Козлов",
        gender: "MALE" as Gender,
        lookingFor: "COMPANION" as LookingFor,
        birthDate: new Date("1985-03-15"),
        city: "Москва",
        country: "Россия",
        bio: "Успешный предприниматель. Люблю путешествия и хорошую компанию. Ищу интересную девушку для совместного времяпрепровождения.",
        occupation: "CEO",
        education: "МГУ",
        interests: ["Бизнес", "Путешествия", "Автомобили", "Яхтинг"],
        avatarUrl: "https://i.pravatar.cc/400?img=12"
      }
    },
    {
      email: "alexander.petrov@example.com",
      profile: {
        name: "Александр Петров",
        gender: "MALE" as Gender,
        lookingFor: "COMPANION" as LookingFor,
        birthDate: new Date("1982-07-20"),
        city: "Санкт-Петербург",
        country: "Россия",
        bio: "Инвестор и меценат. Ценю красоту, интеллект и чувство юмора. Готов дарить незабываемые эмоции.",
        occupation: "Инвестор",
        education: "СПбГУ",
        interests: ["Искусство", "Театр", "Рестораны", "Гольф"],
        avatarUrl: "https://i.pravatar.cc/400?img=13"
      }
    },
    {
      email: "sergey.volkov@example.com",
      profile: {
        name: "Сергей Волков",
        gender: "MALE" as Gender,
        lookingFor: "COMPANION" as LookingFor,
        birthDate: new Date("1980-11-05"),
        city: "Москва",
        country: "Россия",
        bio: "Владелец IT-компании. Обожаю активный отдых и новые впечатления. Ищу позитивную спутницу.",
        occupation: "IT Entrepreneur",
        education: "МФТИ",
        interests: ["Технологии", "Спорт", "Музыка", "Кино"],
        avatarUrl: "https://i.pravatar.cc/400?img=14"
      }
    },
    {
      email: "mikhail.sorokin@example.com",
      profile: {
        name: "Михаил Сорокин",
        gender: "MALE" as Gender,
        lookingFor: "COMPANION" as LookingFor,
        birthDate: new Date("1987-04-12"),
        city: "Екатеринбург",
        country: "Россия",
        bio: "Финансовый директор крупной корпорации. Люблю жизнь во всех её проявлениях. Ценю искренность.",
        occupation: "CFO",
        education: "ВШЭ",
        interests: ["Финансы", "Фитнес", "Кулинария", "Вино"],
        avatarUrl: "https://i.pravatar.cc/400?img=15"
      }
    },
    // Женщины ищущие спонсоров
    {
      email: "katerina.belova@example.com",
      profile: {
        name: "Катерина Белова",
        gender: "FEMALE" as Gender,
        lookingFor: "SPONSOR" as LookingFor,
        birthDate: new Date("1995-06-18"),
        city: "Москва",
        country: "Россия",
        bio: "Модель и студентка. Люблю красивую жизнь и интересное общение. Ищу щедрого спонсора.",
        occupation: "Модель",
        education: "МГИМО",
        interests: ["Мода", "Фотография", "Йога", "Путешествия"],
        avatarUrl: "https://i.pravatar.cc/400?img=47"
      }
    },
    {
      email: "victoria.romanova@example.com",
      profile: {
        name: "Виктория Романова",
        gender: "FEMALE" as Gender,
        lookingFor: "SPONSOR" as LookingFor,
        birthDate: new Date("1996-09-25"),
        city: "Санкт-Петербург",
        country: "Россия",
        bio: "Актриса театра. Обожаю искусство, роскошь и комфорт. Хочу найти успешного мужчину.",
        occupation: "Актриса",
        education: "РГИСИ",
        interests: ["Театр", "Балет", "Живопись", "SPA"],
        avatarUrl: "https://i.pravatar.cc/400?img=48"
      }
    },
    {
      email: "daria.orlova@example.com",
      profile: {
        name: "Дарья Орлова",
        gender: "FEMALE" as Gender,
        lookingFor: "SPONSOR" as LookingFor,
        birthDate: new Date("1997-02-14"),
        city: "Москва",
        country: "Россия",
        bio: "Дизайнер интерьеров. Ценю красоту, стиль и комфорт. Ищу состоятельного партнёра.",
        occupation: "Дизайнер",
        education: "МАРХИ",
        interests: ["Дизайн", "Мода", "Шоппинг", "Рестораны"],
        avatarUrl: "https://i.pravatar.cc/400?img=49"
      }
    },
    // Обычные пользователи для разнообразия
    {
      email: "igor.petrov@example.com",
      profile: {
        name: "Игорь Петров",
        gender: "MALE" as Gender,
        lookingFor: "RELATIONSHIP" as LookingFor,
        birthDate: new Date("1992-08-30"),
        city: "Новосибирск",
        country: "Россия",
        bio: "Программист. Люблю IT, игры и хорошую музыку. Ищу девушку для серьёзных отношений.",
        occupation: "Software Engineer",
        education: "НГУ",
        interests: ["Программирование", "Игры", "Музыка", "Кино"],
        avatarUrl: "https://i.pravatar.cc/400?img=16"
      }
    },
    {
      email: "elena.kuznetsova@example.com",
      profile: {
        name: "Елена Кузнецова",
        gender: "FEMALE" as Gender,
        lookingFor: "RELATIONSHIP" as LookingFor,
        birthDate: new Date("1994-05-22"),
        city: "Казань",
        country: "Россия",
        bio: "Врач-терапевт. Люблю медицину, спорт и природу. Ищу надёжного партнёра.",
        occupation: "Врач",
        education: "КФУ",
        interests: ["Медицина", "Фитнес", "Путешествия", "Книги"],
        avatarUrl: "https://i.pravatar.cc/400?img=50"
      }
    },
    {
      email: "roman.ivanov@example.com",
      profile: {
        name: "Роман Иванов",
        gender: "MALE" as Gender,
        lookingFor: "RELATIONSHIP" as LookingFor,
        birthDate: new Date("1991-12-10"),
        city: "Москва",
        country: "Россия",
        bio: "Маркетолог. Творческий и позитивный. Ищу девушку для создания семьи.",
        occupation: "Маркетолог",
        education: "РЭУ",
        interests: ["Маркетинг", "Фотография", "Спорт", "Готовка"],
        avatarUrl: "https://i.pravatar.cc/400?img=17"
      }
    }
  ]

  for (const userData of additionalUsers) {
    const existingUser = await prisma.user.findUnique({
      where: { email: userData.email }
    })

    if (existingUser) {
      console.log(`⏭️  Пользователь ${userData.email} уже существует`)
      continue
    }

    const user = await prisma.user.create({
      data: {
        email: userData.email,
        password,
        emailVerified: new Date(),
        profile: {
          create: userData.profile
        }
      },
      include: {
        profile: true
      }
    })

    console.log(`✅ Создан: ${userData.profile.name} (${userData.email})`)
  }

  const totalProfiles = await prisma.profile.count()
  const maleCount = await prisma.profile.count({ where: { gender: "MALE" } })
  const femaleCount = await prisma.profile.count({ where: { gender: "FEMALE" } })

  console.log("\n📊 Итоговая статистика:")
  console.log(`Всего профилей: ${totalProfiles}`)
  console.log(`Мужчин: ${maleCount}`)
  console.log(`Женщин: ${femaleCount}`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
