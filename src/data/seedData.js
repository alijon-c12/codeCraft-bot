export const initialDatabase = {
  users: [
    {
      id: "usr-admin-1",
      name: "Alibek Abdunabiyev (Bosh Admin)",
      phone: "+998 95 163 91 01",
      email: "admin@codecraft.uz",
      passwordHash: "admin123",
      role: "admin",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80",
      bioUz: "CodeCraft platformasi bosh administratori va tizim to'liq nazoratchisi.",
      bioRu: "Главный администратор платформы CodeCraft и руководитель системы.",
      specialtyUz: "Bosh Boshqaruvchi",
      specialtyRu: "Главный Администратор",
      blocked: false,
      createdAt: "2026-01-10T09:00:00.000Z"
    },
    {
      id: "usr-teacher-1",
      name: "Muhammaddiyor Orifjonov",
      phone: "+998902223344",
      email: "teacher1@educenter.uz",
      passwordHash: "teacher123",
      role: "teacher",
      avatar: "/mdev.jpg",
      bioUz: "Senior Full-Stack dasturchi va IT mentor. 8+ yillik tajriba (EPAM, Uzum Tech). 3500 dan ortiq shogirdlar ustozi.",
      bioRu: "Senior Full-Stack разработчик и IT-ментор. Опыт 8+ лет (EPAM, Uzum Tech). Наставник более 3500 студентов.",
      specialtyUz: "Senior Full-Stack & AI Engineer",
      specialtyRu: "Senior Full-Stack & AI Инженер",
      experienceYears: 8,
      rating: 4.9,
      blocked: false,
      createdAt: "2026-01-15T10:00:00.000Z"
    },
    {
      id: "usr-student-1",
      name: "Jasur Tursunov",
      phone: "+998909998877",
      email: "student@educenter.uz",
      passwordHash: "student123",
      role: "student",
      avatar: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=200&auto=format&fit=crop&q=80",
      bioUz: "Frontend va Sun'iy intellekt yo'nalishi talabasi.",
      bioRu: "Студент направления Frontend и Искусственный интеллект.",
      specialtyUz: "Talaba",
      specialtyRu: "Студент",
      blocked: false,
      createdAt: "2026-02-01T14:00:00.000Z"
    }
  ],

  categories: [
    {
      id: "cat-frontend",
      nameUz: "Frontend Dasturlash",
      nameRu: "Frontend разработка",
      slug: "frontend",
      icon: "code"
    },
    {
      id: "cat-backend",
      nameUz: "Backend Dasturlash",
      nameRu: "Backend разработка",
      slug: "backend",
      icon: "server"
    },
    {
      id: "cat-ai-data",
      nameUz: "Sun'iy Intellekt va Data",
      nameRu: "Искусственный интеллект и Data",
      slug: "ai-data",
      icon: "cpu"
    },
    {
      id: "cat-design",
      nameUz: "UI/UX va Grafik Dizayn",
      nameRu: "UI/UX и Графический дизайн",
      slug: "design",
      icon: "palette"
    }
  ],

  courses: [
    {
      id: "crs-1",
      titleUz: "Full-Stack Web Dasturlash: React, Next.js va Node.js Bootcamp",
      titleRu: "Full-Stack Веб-разработка: React, Next.js и Node.js Буткемп",
      slug: "fullstack-react-nextjs-nodejs",
      descriptionUz: "Noldan boshlab zamonaviy veb-ilovalarni yaratishni o'rganing. Kurs davomida HTML/CSS, JavaScript ES6+, React 19, Next.js, Node.js, PostgreSQL va Prisma ORM yordamida 5 ta real startap loyihasini yaratasiz.",
      descriptionRu: "Научитесь создавать современные веб-приложения с нуля. В ходе курса вы освоите HTML/CSS, JavaScript ES6+, React 19, Next.js, Node.js, PostgreSQL и создадите 5 реальных проектов в портфолио.",
      price: 1800000,
      discountPrice: 1350000,
      thumbnail: "https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800&auto=format&fit=crop&q=80",
      videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
      level: "beginner",
      language: "O'zbek / Русский",
      status: "published",
      teacherId: "usr-teacher-1",
      categoryId: "cat-frontend",
      durationHours: 72,
      studentsCount: 0,
      rating: 4.9,
      createdAt: "2026-02-10T10:00:00.000Z"
    },
    {
      id: "crs-2",
      titleUz: "UI/UX va Mobil Ilovalar Dizayni: Figma Pro & Design Systems",
      titleRu: "UI/UX и Дизайн мобильных приложений: Figma Pro & Design Systems",
      slug: "ui-ux-figma-design-systems",
      descriptionUz: "Foydalanuvchilar uchun qulay interfeyslar yaratish, UX tadqiqotlar o'tkazish, Figma'da Auto-Layout, Variables, interaktiv prototiplar va to'liq Design System qurishni amaliy tarzda o'rganing.",
      descriptionRu: "Освойте проектирование удобных интерфейсов, UX-исследования, Auto-Layout, Variables, интерактивное прототипирование в Figma и создание полноценных дизайн-систем.",
      price: 1400000,
      discountPrice: 990000,
      thumbnail: "https://images.unsplash.com/photo-1561070791-2526d30994b5?w=800&auto=format&fit=crop&q=80",
      level: "beginner",
      language: "O'zbek / Русский",
      status: "published",
      teacherId: "usr-teacher-1",
      categoryId: "cat-design",
      durationHours: 48,
      studentsCount: 0,
      rating: 4.8,
      createdAt: "2026-02-12T10:00:00.000Z"
    },
    {
      id: "crs-3",
      titleUz: "Python, Data Science va Generativ Sun'iy Intellekt (AI/LLM)",
      titleRu: "Python, Data Science и Генеративный ИИ (AI/LLM)",
      slug: "python-data-science-ai-llm",
      descriptionUz: "Python dasturlash tili, Pandas, Scikit-Learn, Machine Learning algoritmlari hamda OpenAI/Gemini API asosida aqlli AI agentlar va Telegram botlar yaratishni o'rganing.",
      descriptionRu: "Изучите язык Python, Pandas, Scikit-Learn, алгоритмы машинного обучения и создание умных ИИ-агентов и Telegram-ботов на базе современных LLM.",
      price: 2200000,
      discountPrice: 1690000,
      thumbnail: "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&auto=format&fit=crop&q=80",
      level: "intermediate",
      language: "O'zbek",
      status: "published",
      teacherId: "usr-teacher-1",
      categoryId: "cat-ai-data",
      durationHours: 64,
      studentsCount: 0,
      rating: 4.9,
      createdAt: "2026-02-15T10:00:00.000Z"
    },
    {
      id: "crs-5",
      titleUz: "Backend Arxitektura: Node.js, Microservices, Docker va DevOps",
      titleRu: "Backend Архитектура: Node.js, Микросервисы, Docker и DevOps",
      slug: "backend-nodejs-microservices-devops",
      descriptionUz: "Yuqori yuklamaga chidamli server ilovalari, REST va GraphQL API, Redis keshlashtirish, Payme/Click integratsiyasi, Docker konteynerizatsiya va CI/CD pipeline qurish.",
      descriptionRu: "Разработка высоконагруженных серверных систем, REST и GraphQL API, кэширование Redis, интеграция Payme/Click, контейнеризация Docker и настройка CI/CD.",
      price: 2400000,
      discountPrice: 1850000,
      thumbnail: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800&auto=format&fit=crop&q=80",
      videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
      level: "advanced",
      language: "O'zbek",
      status: "published",
      teacherId: "usr-teacher-1",
      categoryId: "cat-backend",
      durationHours: 80,
      studentsCount: 0,
      rating: 5.0,
      createdAt: "2026-02-20T10:00:00.000Z"
    }
  ],

  modules: [
    {
      id: "mod-101",
      courseId: "crs-1",
      titleUz: "1-modul: Zamonaviy JavaScript va React 19 Asoslari",
      titleRu: "Модуль 1: Современный JavaScript и Основы React 19",
      order: 1
    },
    {
      id: "mod-102",
      courseId: "crs-1",
      titleUz: "2-modul: Next.js App Router, Backend API va Ma'lumotlar bazasi",
      titleRu: "Модуль 2: Next.js App Router, Backend API и Базы данных",
      order: 2
    },
    {
      id: "mod-201",
      courseId: "crs-2",
      titleUz: "1-modul: UX Tadqiqot va Figma Interfeysi",
      titleRu: "Модуль 1: UX-исследования и интерфейс Figma",
      order: 1
    },
    {
      id: "mod-202",
      courseId: "crs-2",
      titleUz: "2-modul: Design System va Mobil Ilova Prototiplash",
      titleRu: "Модуль 2: Дизайн-системы и прототипирование мобильных приложений",
      order: 2
    },
    {
      id: "mod-301",
      courseId: "crs-3",
      titleUz: "1-modul: Python va Data Tahlil (Pandas & NumPy)",
      titleRu: "Модуль 1: Python и анализ данных (Pandas & NumPy)",
      order: 1
    },
    {
      id: "mod-501",
      courseId: "crs-5",
      titleUz: "1-modul: Yuqori yuklamali Node.js va PostgreSQL Arxitekturasi",
      titleRu: "Модуль 1: Высоконагруженная архитектура Node.js и PostgreSQL",
      order: 1
    }
  ],

  lessons: [
    {
      id: "les-1001",
      moduleId: "mod-101",
      titleUz: "1.1. Kursga kirish, VS Code sozlash va loyiha arxitekturasi",
      titleRu: "1.1. Введение в курс, настройка VS Code и архитектура проекта",
      type: "video",
      videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
      contentUz: "Ushbu birinchi darsda biz Full-Stack dasturchi yo'l xaritasi, zamonaviy React ekotizimi va ish muhitini professional darajada sozlashni ko'rib chiqamiz.\n\nAsosiy tushunchalar:\n• Virtual DOM va deklarativ UI\n• Component-based arxitektura\n• Vite va Next.js farqlari",
      contentRu: "В этом первом уроке мы разберём дорожную карту Full-Stack разработчика, современную экосистему React и профессиональную настройку рабочего окружения.\n\nКлючевые концепции:\n• Virtual DOM и декларативный UI\n• Компонентная архитектура\n• Отличия Vite и Next.js",
      duration: 18,
      order: 1,
      isFree: true,
      attachmentName: "React_Roadmap_va_Konspekt.pdf",
      attachmentUrl: "#download-roadmap"
    },
    {
      id: "les-1002",
      moduleId: "mod-101",
      titleUz: "1.2. React Hooks: useState, useEffect va Custom Hooklar",
      titleRu: "1.2. React Hooks: useState, useEffect и кастомные хуки",
      type: "video",
      videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4",
      contentUz: "Komponent holatini (state) boshqarish, side-effectlar bilan ishlash hamda qayta ishlatiluvchi custom hooklar (`useFetch`, `useLocalStorage`) yozish amaliyoti.",
      contentRu: "Управление состоянием компонента (state), работа с побочными эффектами и написание переиспользуемых кастомных хуков (`useFetch`, `useLocalStorage`).",
      duration: 28,
      order: 2,
      isFree: true,
      attachmentName: "React_Hooks_CheatSheet.pdf",
      attachmentUrl: "#download-hooks"
    },
    {
      id: "les-1003",
      moduleId: "mod-102",
      titleUz: "2.1. REST API, Autentifikatsiya (JWT) va Prisma ORM bilan ishlash",
      titleRu: "2.1. REST API, Аутентификация (JWT) и работа с Prisma ORM",
      type: "text",
      contentUz: "Server tomonida foydalanuvchilarni ro'yxatdan o'tkazish, parollarni xeshlash, rolga asoslangan middleware himoyasi va PostgreSQL jadvallarini bog'lash.",
      contentRu: "Серверная регистрация пользователей, хэширование паролей, ролевая защита через middleware и проектирование связей в PostgreSQL.",
      duration: 35,
      order: 1,
      isFree: false,
      attachmentName: "Prisma_Schema_Starter.zip",
      attachmentUrl: "#download-prisma"
    },
    {
      id: "les-2001",
      moduleId: "mod-201",
      titleUz: "1.1. UX Qonunlari va Foydalanuvchi Psixologiyasi (Bepul dars)",
      titleRu: "1.1. Законы UX и психология пользователя (Бесплатный урок)",
      type: "video",
      videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
      contentUz: "Jakob qonuni, Fitts qonuni va Hick qonuni asosida foydalanuvchi qiynalmaydigan interfeys loyihalash sirlari.",
      contentRu: "Секреты проектирования интуитивно понятных интерфейсов на основе законов Якоба, Фиттса и Хика.",
      duration: 22,
      order: 1,
      isFree: true,
      attachmentName: "UX_Laws_Guide_UZ.pdf",
      attachmentUrl: "#download-ux"
    },
    {
      id: "les-2002",
      moduleId: "mod-202",
      titleUz: "2.1. Figma Auto-Layout, Variables va UI Kit yaratish",
      titleRu: "2.1. Figma Auto-Layout, Variables и создание UI Kit",
      type: "text",
      contentUz: "Katta loyihalar uchun rang tokenlari, tipografika tizimi va moslashuvchan komponentlar kutubxonasini noldan quramiz.",
      contentRu: "Создаём с нуля цветовые токены, систему типографики и адаптивную библиотеку компонентов для крупных проектов.",
      duration: 30,
      order: 1,
      isFree: false,
      attachmentName: "EduCenter_UI_Kit.fig",
      attachmentUrl: "#download-uikit"
    },
    {
      id: "les-3001",
      moduleId: "mod-301",
      titleUz: "1.1. Python asoslari va AI ekotizimiga kirish",
      titleRu: "1.1. Основы Python и введение в экосистему ИИ",
      type: "video",
      videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4",
      contentUz: "Python sintaksisi, ma'lumot turlari, funksiyalar va Jupyter Notebook muhitida ma'lumotlarni tahlil qilishni boshlaymiz.",
      contentRu: "Синтаксис Python, структуры данных, функции и начало работы с анализом данных в Jupyter Notebook.",
      duration: 26,
      order: 1,
      isFree: true,
      attachmentName: "Python_AI_Notebook.pdf",
      attachmentUrl: "#download-python"
    },
    {
      id: "les-5001",
      moduleId: "mod-501",
      titleUz: "1.1. Microservices arxitekturasi va Docker konteynerlar",
      titleRu: "1.1. Микросервисная архитектура и Docker-контейнеры",
      type: "video",
      videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4",
      contentUz: "Monolit va mikroservis arxitekturalarini solishtirish, Dockerfile va docker-compose.yml yozish amaliyoti.",
      contentRu: "Сравнение монолитной и микросервисной архитектуры, практика написания Dockerfile и docker-compose.yml.",
      duration: 32,
      order: 1,
      isFree: true,
      attachmentName: "Docker_Compose_Examples.zip",
      attachmentUrl: "#download-docker"
    }
  ],

  quizzes: [
    {
      id: "quiz-101",
      moduleId: "mod-101",
      courseId: "crs-1",
      titleUz: "1-modul yakuniy testi: React va JavaScript asoslari",
      titleRu: "Итоговый тест модуля 1: Основы React и JavaScript",
      timeLimitMin: 10,
      passingScore: 70,
      questions: [
        {
          id: "q-1",
          textUz: "React komponentida lokal holatni (state) saqlash uchun qaysi Hook ishlatiladi?",
          textRu: "Какой хук используется для хранения локального состояния (state) в React-компоненте?",
          options: [
            { id: "opt-1a", textUz: "useState()", textRu: "useState()", isCorrect: true },
            { id: "opt-1b", textUz: "useHistory()", textRu: "useHistory()", isCorrect: false },
            { id: "opt-1c", textUz: "useStatic()", textRu: "useStatic()", isCorrect: false },
            { id: "opt-1d", textUz: "useDOM()", textRu: "useDOM()", isCorrect: false }
          ]
        },
        {
          id: "q-2",
          textUz: "Ro'yxat elementlarini `.map()` orqali chiqarganda qaysi maxsus prop berilishi shart?",
          textRu: "Какой специальный проп обязательно передавать при рендеринге списка через `.map()`?",
          options: [
            { id: "opt-2a", textUz: "indexId", textRu: "indexId", isCorrect: false },
            { id: "opt-2b", textUz: "key", textRu: "key", isCorrect: true },
            { id: "opt-2c", textUz: "ref", textRu: "ref", isCorrect: false },
            { id: "opt-2d", textUz: "slot", textRu: "slot", isCorrect: false }
          ]
        },
        {
          id: "q-3",
          textUz: "API so'rovlarni komponent yuklanganda bajarish uchun qaysi Hook mos keladi?",
          textRu: "Какой хук подходит для выполнения API-запросов при монтировании компонента?",
          options: [
            { id: "opt-3a", textUz: "useMemo()", textRu: "useMemo()", isCorrect: false },
            { id: "opt-3b", textUz: "useEffect()", textRu: "useEffect()", isCorrect: true },
            { id: "opt-3c", textUz: "useId()", textRu: "useId()", isCorrect: false },
            { id: "opt-3d", textUz: "useStyle()", textRu: "useStyle()", isCorrect: false }
          ]
        }
      ]
    },
    {
      id: "quiz-201",
      moduleId: "mod-201",
      courseId: "crs-2",
      titleUz: "UX Qonunlari va Figma Asoslari Testi",
      titleRu: "Тест: Законы UX и основы Figma",
      timeLimitMin: 10,
      passingScore: 70,
      questions: [
        {
          id: "q-201-1",
          textUz: "Figma'da elementlar o'lchamiga qarab avtomatik moslashuvchi konteyner nima deb ataladi?",
          textRu: "Как в Figma называется контейнер, автоматически подстраивающийся под контент?",
          options: [
            { id: "opt-201a", textUz: "Auto-Layout", textRu: "Auto-Layout", isCorrect: true },
            { id: "opt-201b", textUz: "Mask Group", textRu: "Mask Group", isCorrect: false },
            { id: "opt-201c", textUz: "Boolean Union", textRu: "Boolean Union", isCorrect: false }
          ]
        }
      ]
    }
  ],

  assignments: [
    {
      id: "asg-101",
      lessonId: "les-1002",
      courseId: "crs-1",
      titleUz: "1-amaliy vazifa: Interaktiv Kurslar Filtr Komponentini yaratish",
      titleRu: "Практическое задание 1: Создание интерактивного фильтра курсов",
      descriptionUz: "useState va useEffect yordamida kurslarni kategoriya va qidiruv so'zi bo'yicha filtrlaydigan React komponent yozing. GitHub havolangizni yoki kodni yuboring.",
      descriptionRu: "Напишите React-компонент фильтрации курсов по категории и поисковому запросу с использованием useState и useEffect. Пришлите ссылку на GitHub или код.",
      maxScore: 100
    },
    {
      id: "asg-201",
      lessonId: "les-2001",
      courseId: "crs-2",
      titleUz: "UX Audit va Mobil Ilova Bosh Sahifa Eskizi",
      titleRu: "UX-аудит и скетч главного экрана мобильного приложения",
      descriptionUz: "O'zingiz tanlagan onlayn do'kon yoki ta'lim ilovasining 3 ta UX muammosini tahlil qilib, Figma havolasini yuboring.",
      descriptionRu: "Проанализируйте 3 UX-проблемы любого приложения и отправьте ссылку на ваше решение в Figma.",
      maxScore: 100
    }
  ],

  enrollments: [],

  lessonProgress: [],

  submissions: [],

  quizAttempts: [],

  payments: [],

  promoCodes: [
    {
      id: "prm-1",
      code: "EDUCENTER20",
      discountType: "percent",
      discountValue: 20,
      expiresAt: "2027-12-31T23:59:59.000Z",
      maxUses: 500,
      usedCount: 42,
      active: true
    },
    {
      id: "prm-2",
      code: "START50",
      discountType: "fixed",
      discountValue: 50000,
      expiresAt: "2027-12-31T23:59:59.000Z",
      maxUses: 1000,
      usedCount: 118,
      active: true
    },
    {
      id: "prm-3",
      code: "PRO30",
      discountType: "percent",
      discountValue: 30,
      expiresAt: "2027-06-30T23:59:59.000Z",
      maxUses: 100,
      usedCount: 19,
      active: true
    }
  ],

  reviews: [
    {
      id: "rev-1",
      userId: "usr-student-1",
      userName: "Jasur Tursunov",
      userAvatar: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=200&auto=format&fit=crop&q=80",
      courseId: "crs-1",
      rating: 5,
      comment: "Full-Stack kursini bitirib, 3 oyda IT kompaniyaga Junior React Developer bo'lib ishga kirdim. Ustoz Muhammaddiyor akaga katta rahmat!",
      status: "approved",
      createdAt: "2026-03-05T11:00:00.000Z"
    },
    {
      id: "rev-2",
      userId: "usr-student-1",
      userName: "Madina Rustamova",
      userAvatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&auto=format&fit=crop&q=80",
      courseId: "crs-2",
      rating: 5,
      comment: "Muhammaddiyor akaning amaliy darslari juda tushunarli. Figma va zamonaviy veb-arxitektura mavzularini real loyihada qo'llab ko'rdik.",
      status: "approved",
      createdAt: "2026-03-06T09:30:00.000Z"
    },
    {
      id: "rev-3",
      userId: "usr-student-1",
      userName: "Bekzod Nurmatov",
      userAvatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=80",
      courseId: "crs-3",
      rating: 5,
      comment: "Python va AI kursi kutganimdan ham a'lo chiqdi. O'zimizning Telegram AI botimizni serverga chiqardik.",
      status: "pending",
      createdAt: "2026-03-09T14:15:00.000Z"
    }
  ],

  certificates: [],

  notifications: [],

  leads: [
    {
      id: "lead-1",
      name: "Javohir Abdullayev",
      phone: "+998935551122",
      comment: "Full-Stack dasturlash kursiga kechki guruh yoki onlayn mentorlik haqida ma'lumot olmoqchiman.",
      status: "new",
      createdAt: "2026-03-09T10:15:00.000Z"
    },
    {
      id: "lead-2",
      name: "Dilnoza Hasanova",
      phone: "+998974443322",
      comment: "UI/UX dizayn kursini bo'lib to'lash imkoniyati bormi?",
      status: "contacted",
      createdAt: "2026-03-08T16:40:00.000Z"
    }
  ],

  banners: [
    {
      id: "ban-1",
      titleUz: "Assalomu alaykum hurmatli o'quvchi. Siz \"CodeCraft\" jamoasiga keldingiz. Biz sizni tabriklaymiz!",
      titleRu: "Здравствуйте, уважаемый студент! Вы присоединились к команде \"CodeCraft\". Мы поздравляем вас!",
      subtitleUz: "Zamonaviy dasturlash, sun'iy intellekt va raqamli kasblar olamiga xush kelibsiz. Tajribali ustozimiz Muhammaddiyor Orifjonov va ahil jamoamiz sizni yangi marralar sari mehr bilan yetaklaydi.",
      subtitleRu: "Добро пожаловать в мир современных IT-профессий, искусственного интеллекта и практических проектов. Наш наставник Мухаммаддиёр Орифжонов и вся команда помогут вам достичь больших целей.",
      ctaTextUz: "Kurslarni ko'rish",
      ctaTextRu: "Смотреть курсы",
      promoBadgeUz: "🌸 CodeCraft Jamoasi — Xush kelibsiz!",
      promoBadgeRu: "🌸 Команда CodeCraft — Добро пожаловать!",
      active: true
    }
  ],

  faqs: [
    {
      id: "faq-1",
      questionUz: "Darslar qanday formatda o'tkaziladi va qancha vaqt saqlanadi?",
      questionRu: "В каком формате проходят уроки и как долго доступен курс?",
      answerUz: "Barcha darslar batafsil interaktiv matnli konspektlar, amaliy topshiriqlar va yuklab olinadigan materiallar ko'rinishida platformaga joylangan. Kursni xarid qilganingizdan so'ng darslarga 24/7 doimiy kirish huquqiga ega bo'lasiz.",
      answerRu: "Все уроки представлены в виде подробных интерактивных конспектов, практических заданий и дополнительных файлов. После покупки доступ к курсу остаётся у вас навсегда 24/7.",
      order: 1
    },
    {
      id: "faq-2",
      questionUz: "Uy vazifalarini kim tekshiradi va savollarimga qanday javob olaman?",
      questionRu: "Кто проверяет домашние задания и как получить ответы на вопросы?",
      answerUz: "Har bir amaliy vazifani shaxsan kurs ustozi (mentor) tekshiradi, ball qo'yadi va batafsil izoh qoldiradi. Natija haqida shaxsiy kabinetingizga va Telegram orqali xabarnoma yuboriladi.",
      answerRu: "Каждое домашнее задание проверяет лично преподаватель курса, выставляя балл и развёрнутый комментарий. Уведомление приходит в личный кабинет.",
      order: 2
    },
    {
      id: "faq-3",
      questionUz: "To'lovni qanday amalga oshirish mumkin?",
      questionRu: "Какими способами можно оплатить обучение?",
      answerUz: "To'lovlarni Payme hamda Click tizimlari orqali Uzcard va Humo kartalari yordamida bir necha soniyada xavfsiz amalga oshirishingiz mumkin. To'lov o'tishi bilan kurs avtomatik ochiladi.",
      answerRu: "Оплата принимается через платёжные системы Payme и Click картами Uzcard и Humo. Курс открывается автоматически сразу после успешной оплаты.",
      order: 3
    },
    {
      id: "faq-4",
      questionUz: "Kurs yakunida sertifikat beriladimi?",
      questionRu: "Выдаётся ли сертификат по окончании курса?",
      answerUz: "Ha! Kursdagi barcha darslarni 100% yakunlaganingizda tizim avtomatik ravishda noyob ID-kodli rasmiy PDF sertifikat yaratadi. Uning haqiqiyligini istalgan ish beruvchi saytimizda tekshirishi mumkin.",
      answerRu: "Да! После прохождения 100% уроков курса система автоматически генерирует именной сертификат с уникальным кодом проверки подлинности.",
      order: 4
    }
  ],

  pages: [
    {
      id: "pg-about",
      slug: "about",
      titleUz: "CodeCraft haqida",
      titleRu: "О команде CodeCraft",
      contentUz: "Bu CodeCraft jamoasi. Sen ham bizga qo'shil va dasturchi bo'l.",
      contentRu: "Это команда CodeCraft. Присоединяйся к нам и стань программистом."
    },
    {
      id: "pg-privacy",
      slug: "privacy",
      titleUz: "Maxfiylik siyosati",
      titleRu: "Политика конфиденциальности",
      contentUz: "1. Umumiy qoidalar: EduCenter foydalanuvchilarning shaxsiy ma'lumotlari (ism, telefon raqam, email va to'lov tarixi) xavfsizligini O'zbekiston Respublikasi qonunchiligiga muvofiq himoya qiladi.\n2. Ma'lumotlardan foydalanish: Shaxsiy ma'lumotlar faqat o'quv jarayonini tashkil etish, sertifikat rasmiylashtirish va bildirishnomalar yuborish uchun ishlatiladi.\n3. Axborot xavfsizligi: Barcha parollar shifrlangan holda saqlanadi va to'lov operatsiyalari rasmiy Payme/Click shlyuzlari orqali amalga oshiriladi.",
      contentRu: "1. Общие положения: EduCenter обеспечивает защиту персональных данных пользователей (имя, телефон, email, история транзакций) в соответствии с законодательством Республики Узбекистан.\n2. Использование данных: Данные используются исключительно для предоставления доступа к курсам, выдачи сертификатов и отправки уведомлений.\n3. Безопасность: Пароли хранятся в зашифрованном виде, а платежи проходят через сертифицированные шлюзы Payme и Click."
    },
    {
      id: "pg-terms",
      slug: "terms",
      titleUz: "Ommaviy oferta shartnomasi",
      titleRu: "Публичная оферта",
      contentUz: "1. Shartnoma predmeti: Mazkur Ommaviy oferta EduCenter onlayn ta'lim platformasi orqali masofaviy o'quv kurslarini taqdim etish tartibini belgilaydi.\n2. Kursga ulanish: Foydalanuvchi Payme yoki Click orqali to'lovni amalga oshirgan vaqtdan boshlab shaxsiy kabinetida tanlangan kurs darslariga kirish huquqini oladi.\n3. Mualliflik huquqi: Platformadagi barcha darslar, konspektlar va o'quv materiallari EduCenter intellektual mulki hisoblanadi va uchinchi shaxslarga tarqatilishi taqiqlanadi.",
      contentRu: "1. Предмет договора: Настоящая публичная оферта регулирует порядок предоставления доступа к онлайн-курсам на платформе EduCenter.\n2. Доступ к обучению: Доступ к материалам выбранного курса открывается автоматически в личном кабинете сразу после подтверждения оплаты через Payme или Click.\n3. Авторские права: Все учебные материалы, лекции и задания являются интеллектуальной собственностью EduCenter."
    }
  ],

  auditLogs: [
    {
      id: "aud-1",
      userId: "usr-admin-1",
      userName: "Azizbek Rahimov (Admin)",
      action: "SYSTEM_SEED",
      details: "Platforma boshlang'ich ma'lumotlar bazasi (6 ta kurs, 5 ta kategoriya) ishga tushirildi",
      createdAt: "2026-03-01T09:00:00.000Z"
    },
    {
      id: "aud-2",
      userId: "usr-admin-1",
      userName: "Azizbek Rahimov (Admin)",
      action: "PROMO_CREATED",
      details: "EDUCENTER20 (20% chegirma) promo-kodi faollashtirildi",
      createdAt: "2026-03-01T10:15:00.000Z"
    }
  ],

  notificationLogs: [
    {
      id: "nlog-1",
      channel: "TELEGRAM_BOT",
      recipient: "Admin Chat (-1001234567890)",
      message: "✅ Yangi to'lov! Talaba: Jasur Tursunov | Kurs: Full-Stack Web Dasturlash | Summa: 1 080 000 so'm (Payme)",
      createdAt: "2026-03-01T11:58:02.000Z"
    },
    {
      id: "nlog-2",
      channel: "EMAIL_SMTP",
      recipient: "student@educenter.uz",
      message: "🎓 Sertifikat tayyor: EC-2026-UX9901 (UI/UX va Mobil Ilovalar Dizayni)",
      createdAt: "2026-02-28T17:01:05.000Z"
    }
  ],

  messages: [
    {
      id: "msg-init-1",
      senderId: "usr-admin-1",
      senderName: "Alibek Abdunabiyev (Bosh Admin)",
      senderRole: "admin",
      recipientId: "usr-student-1",
      recipientName: "Jasur Tursunov",
      text: "Assalomu alaykum Jasur! CodeCraft ta'lim platformasiga xush kelibsiz. O'quv jarayoni yoki uy vazifalari bo'yicha har qanday savolingiz bo'lsa, shu chat orqali bemalol murojaat qilishingiz mumkin.",
      createdAt: "2026-03-01T12:00:00.000Z",
      read: true
    },
    {
      id: "msg-init-2",
      senderId: "usr-student-1",
      senderName: "Jasur Tursunov",
      senderRole: "student",
      recipientId: "usr-admin-1",
      recipientName: "Alibek Abdunabiyev (Bosh Admin)",
      text: "Assalomu alaykum ustoz! Katta rahmat, darslarni boshladim. Kurs sifati va amaliy topshiriqlar a'lo darajada tuzilgan ekan.",
      createdAt: "2026-03-01T12:15:00.000Z",
      read: true
    }
  ],

  invitations: []
};
