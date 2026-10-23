import React, { useState } from 'react';
import { useApp } from '../context/AppContext.jsx';
import { initialDatabase } from '../data/seedData.js';

export function CourseCard({ course }) {
  const { t, loc, formatPrice, db, navigate, setCheckoutCourse, currentUser, isEnrolled, hasPendingPayment, showToast, lang } = useApp();
  const teacher = db.users.find((u) => u.id === course.teacherId);
  const category = db.categories.find((c) => c.id === course.categoryId);
  const enrolled = currentUser && isEnrolled(currentUser.id, course.id);
  const pending = currentUser && hasPendingPayment(currentUser.id, course.id);

  const lessonsCount = db.modules
    .filter((m) => m.courseId === course.id)
    .reduce((acc, m) => acc + db.lessons.filter((l) => l.moduleId === m.id).length, 0);

  return (
    <div className="course-card">
      <div
        className="course-thumb-wrap"
        onClick={() => navigate('courseDetail', { courseId: course.id })}
      >
        <img src={course.thumbnail} alt={loc(course, 'title')} loading="lazy" />
        <span className="course-cat-badge">{loc(category, 'name')}</span>
        {course.discountPrice && (
          <span className="course-discount-badge">-{Math.round((1 - course.discountPrice / course.price) * 100)}%</span>
        )}
      </div>

      <div className="course-card-body">
        <div className="course-meta-row">
          <span className={`level-pill ${course.level}`}>
            {t.catalog.levels[course.level] || course.level}
          </span>
          <span className="rating-pill">⭐ {course.rating || '4.9'}</span>
          <span className="meta-small">📚 {lessonsCount} {t.catalog.lessonsCount}</span>
        </div>

        <h3
          className="course-card-title"
          onClick={() => navigate('courseDetail', { courseId: course.id })}
        >
          {loc(course, 'title')}
        </h3>

        <div
          className="course-teacher-row"
          onClick={() => navigate('teacherProfile', { teacherId: teacher?.id })}
        >
          <img src={teacher?.avatar} alt={teacher?.name} />
          <div>
            <strong>{teacher?.name}</strong>
            <small>{loc(teacher, 'specialty')}</small>
          </div>
        </div>

        <div className="course-card-footer">
          <div className="course-price-stack">
            {course.discountPrice ? (
              <>
                <span className="old-price">{formatPrice(course.price)}</span>
                <strong className="current-price">{formatPrice(course.discountPrice)}</strong>
              </>
            ) : (
              <strong className="current-price">{formatPrice(course.price)}</strong>
            )}
          </div>

          <div className="course-card-btns">
            {enrolled ? (
              <button
                className="btn btn-sm btn-success"
                onClick={() => navigate('learning', { courseId: course.id })}
              >
                ▶️ {t.courseDetail.continueLearning}
              </button>
            ) : pending ? (
              <button
                className="btn btn-sm btn-warning"
                style={{ background: 'rgba(245, 158, 11, 0.15)', color: '#d97706', border: '1px solid rgba(245, 158, 11, 0.3)', fontWeight: 600 }}
                onClick={() => setCheckoutCourse(course)}
                title={lang === 'ru' ? 'Чек на проверке у администратора' : "To'lov cheki admin tekshiruvida"}
              >
                ⏳ {lang === 'ru' ? 'Проверяется' : 'Tekshirilmoqda'}
              </button>
            ) : (
              <>
                <button
                  className="btn btn-sm btn-outline"
                  onClick={() => navigate('courseDetail', { courseId: course.id })}
                >
                  {t.catalog.detailsBtn}
                </button>
                <button
                  className="btn btn-sm btn-primary"
                  onClick={() => {
                    if (!currentUser) {
                      showToast(
                        lang === 'ru'
                          ? "Для покупки курса пожалуйста, войдите в систему!"
                          : "Kursni xarid qilish uchun avval tizimga kiring!",
                        'warning'
                      );
                      navigate('login', { redirect: 'courses' });
                      return;
                    }
                    setCheckoutCourse(course);
                  }}
                  title={t.catalog.enrollBtn || (lang === 'ru' ? "Корзина" : "Savat")}
                >
                  🛒
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export function InteractiveCodeLab({ lang }) {
  return (
    <section className="codecraft-features-section">
      <div className="container">
        {/* 3 HIGHLIGHT FEATURE CARDS */}
        <div className="codecraft-features-grid">
          <div className="feature-benefit-card">
            <div className="feature-icon-bubble">💡</div>
            <h4>{lang === 'ru' ? '100% Живая Практика' : '100% Jonli Amaliyot'}</h4>
            <p>
              {lang === 'ru'
                ? 'Никаких устаревших лекций. На каждом уроке вы пишете реальный код, создаете Telegram-ботов и современные веб-приложения.'
                : "Quruq ma'ruzalar yo'q. Har bir darsda mustaqil kod yoziladi, Telegram botlar, REST API va zamonaviy web-ilovalar yaratiladi."}
            </p>
          </div>

          <div className="feature-benefit-card">
            <div className="feature-icon-bubble">👨‍💻</div>
            <h4>{lang === 'ru' ? 'Личный Код-Ревью Ментора' : 'Shaxsiy Mentor Code-Review'}</h4>
            <p>
              {lang === 'ru'
                ? 'Каждое ваше домашнее задание построчно проверяется опытным ментором с подробным разбором ошибок и чистой архитектуры.'
                : "Har bir topshirgan vazifangiz tajribali mentorlar tomonidan qatorma-qator tekshirilib, xatolar tushuntiriladi va Clean Code o'rgatiladi."}
            </p>
          </div>

          <div className="feature-benefit-card">
            <div className="feature-icon-bubble">🚀</div>
            <h4>{lang === 'ru' ? 'Команда CodeCraft' : "CodeCraft Jamoasiga Qo'shilish"}</h4>
            <p>
              {lang === 'ru'
                ? 'Лучшие студенты получают приглашение в команду CodeCraft для участия в коммерческих проектах и быстрого карьерного роста.'
                : "Kurs davomida o'zini ko'rsatgan eng iqtidorli talabalar CodeCraft jamoasiga jalb qilinadi va real tijoriy loyihalarda ish boshlaydi."}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

export function HomePage() {
  const { t, loc, db, navigate, currentUser, lang } = useApp();
  const [activeTag, setActiveTag] = useState('Backend');

  const publishedCourses = db.courses.filter((c) => c.status === 'published');
  const teachers = db.users.filter((u) => u.role === 'teacher');

  const heroFocusData = {
    Backend: {
      category: 'Backend',
      titleHighlight: lang === 'ru' ? 'Курсы Backend разработки' : 'Backend kurslarini',
      titleDark: lang === 'ru' ? 'Изучайте вместе с командой CodeCraft' : "CodeCraft kamandasi bilan birgalikda o'rganing",
      cardBadge: 'Express',
      cardSub: 'Database',
      techPills: ['Node.js', 'Express', 'PostgreSQL'],
      mentor: 'Muhammaddiyor Orifjonov',
      mentorRole: lang === 'ru' ? 'Старший Backend-ментор' : 'Senior Backend Mentor'
    },
    Frontend: {
      category: 'Frontend',
      titleHighlight: lang === 'ru' ? 'Курсы Frontend разработки' : 'Frontend kurslarini',
      titleDark: lang === 'ru' ? 'Изучайте вместе с командой CodeCraft' : "CodeCraft kamandasi bilan birgalikda o'rganing",
      cardBadge: 'React.js',
      cardSub: 'Modern UI',
      techPills: ['React', 'TypeScript', 'Tailwind'],
      mentor: 'Muhammaddiyor Orifjonov',
      mentorRole: lang === 'ru' ? 'Full-Stack ментор' : 'Full-Stack Mentor'
    },
    Database: {
      category: 'Database',
      titleHighlight: lang === 'ru' ? 'Базы данных и Архитектура' : "Ma'lumotlar omborini",
      titleDark: lang === 'ru' ? 'Изучайте вместе с командой CodeCraft' : "CodeCraft kamandasi bilan birgalikda o'rganing",
      cardBadge: 'PostgreSQL',
      cardSub: 'Architecture',
      techPills: ['PostgreSQL', 'Redis', 'Prisma ORM'],
      mentor: 'Muhammaddiyor Orifjonov',
      mentorRole: lang === 'ru' ? 'Архитектор баз данных' : 'Database Architect'
    }
  };

  const currentFocus = heroFocusData[activeTag] || heroFocusData.Backend;

  return (
    <div className="page-home">
      {/* HERO SECTION (42.uz STYLE FOR CODECRAFT) */}
      <section className="hero-42-wrapper">
        <div className="container hero-42-grid">
          {/* Left Column: Heading, CTA Button, Slider Dashes, Category Pills */}
          <div className="hero-42-left">
            <h1 className="hero-42-title">
              <span className="hero-42-highlight">{currentFocus.titleHighlight}</span>
              <span className="hero-42-dark">{currentFocus.titleDark}</span>
            </h1>

            <div className="hero-42-cta-wrap">
              <button
                type="button"
                className="hero-42-btn-main"
                onClick={() => navigate(currentUser ? 'courses' : 'login')}
              >
                {lang === 'ru' ? 'Принять участие' : 'Ishtirok etish'}
              </button>
            </div>

            {/* Category tags */}
            <div className="hero-42-tags">
              {['Backend', 'Frontend', 'Database'].map((cat) => (
                <button
                  key={cat}
                  type="button"
                  className={`hero-42-tag-pill ${activeTag === cat ? 'active' : ''}`}
                  onClick={() => setActiveTag(cat)}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Right Column: Dark Modern Card with Topo Pattern, Express Database, and Teacher */}
          <div className="hero-42-right">
            <div className="hero-42-card">
              {/* Topographic background SVG lines */}
              <svg className="hero-42-topo-bg" viewBox="0 0 600 400" preserveAspectRatio="none">
                <path d="M0,80 Q150,140 300,70 T600,100" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="1.5" />
                <path d="M0,120 Q180,180 340,110 T600,150" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="1.5" />
                <path d="M0,160 Q160,230 320,160 T600,200" fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth="1.5" />
                <path d="M0,200 Q200,270 380,210 T600,250" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="1.5" />
                <path d="M0,240 Q180,310 350,260 T600,300" fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth="1.5" />
                <path d="M0,280 Q220,350 400,310 T600,350" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="1.5" />
                <circle cx="480" cy="180" r="140" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="1" />
                <circle cx="480" cy="180" r="190" fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="1" />
                <circle cx="480" cy="180" r="240" fill="none" stroke="rgba(255,255,255,0.03)" strokeWidth="1" />
              </svg>

              <div className="hero-42-card-content">
                {/* Header row in card: Orange badge + Database 3D server icon */}
                <div className="hero-42-card-top">
                  <div className="hero-42-orange-badge">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                      <path d="M13 2L3 14H12L11 22L21 10H12L13 2Z" fill="#ff5722"/>
                    </svg>
                  </div>
                  <div className="hero-42-db-icon">
                    <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="#38bdf8" strokeWidth="1.8">
                      <ellipse cx="12" cy="5" rx="9" ry="3"/>
                      <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"/>
                      <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/>
                    </svg>
                    <span className="plug-icon" title="Power Cable">🔌</span>
                  </div>
                </div>

                {/* Big typography in dark card */}
                <div className="hero-42-card-titles">
                  <h2 className="card-title-express">{currentFocus.cardBadge}</h2>
                  <h2 className="card-title-database">{currentFocus.cardSub}</h2>
                </div>

                {/* Micro tech pills */}
                <div className="hero-42-card-pills">
                  {currentFocus.techPills.map((tech) => (
                    <span key={tech} className="hero-42-micro-pill">{tech}</span>
                  ))}
                </div>
              </div>

              {/* Mentor portrait cutout / photo */}
              <div className="hero-42-mentor-visual">
                <img
                  src="/mdev.jpg"
                  alt={currentFocus.mentor}
                  className="hero-42-mentor-img"
                />
                <div className="hero-42-mentor-overlay" />
                <div className="hero-42-mentor-tag">
                  <span className="mentor-name">👨‍💻 {currentFocus.mentor}</span>
                  <span className="mentor-role">{currentFocus.mentorRole}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* INTERACTIVE CODE LAB & SHOWCASE */}
      <InteractiveCodeLab lang={lang} navigate={navigate} currentUser={currentUser} />

      {/* CATEGORIES & POPULAR COURSES - ONLY FOR LOGGED-IN USERS */}
      {currentUser && (
        <>
          <section className="section">
            <div className="container">
              <div className="section-head">
                <div>
                  <h2>{t.home.categoriesTitle}</h2>
                  <p>{t.home.categoriesSub}</p>
                </div>
              </div>
              <div className="categories-grid">
                {db.categories.map((cat) => {
                  const count = publishedCourses.filter((c) => c.categoryId === cat.id).length;
                  return (
                    <button
                      key={cat.id}
                      className="category-card"
                      onClick={() => navigate('courses', { categoryId: cat.id })}
                    >
                      <span className="cat-icon">
                        {cat.icon === 'code'
                          ? '💻'
                          : cat.icon === 'palette'
                            ? '🎨'
                            : cat.icon === 'cpu'
                              ? '🤖'
                              : cat.icon === 'trending'
                                ? '📈'
                                : '🌍'}
                      </span>
                      <div>
                        <h4>{loc(cat, 'name')}</h4>
                        <small>{count} {lang === 'ru' ? 'курсов' : 'ta kurs'}</small>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </section>

          <section className="section section-alt">
            <div className="container">
              <div className="section-head">
                <div>
                  <h2>{t.home.popularTitle}</h2>
                  <p>{t.home.popularSub}</p>
                </div>
                <button className="btn btn-outline" onClick={() => navigate('courses')}>
                  {t.home.viewAll} →
                </button>
              </div>
              <div className="courses-grid">
                {publishedCourses.slice(0, 6).map((course) => (
                  <CourseCard key={course.id} course={course} />
                ))}
              </div>
            </div>
          </section>
        </>
      )}

    </div>
  );
}

export function CoursesCatalogPage() {
  const { t, route, currentUser, navigate, lang, db, loc } = useApp();
  const [search, setSearch] = useState(route.params?.search || '');
  const [selectedCat, setSelectedCat] = useState(route.params?.categoryId || 'cat-backend');

  if (!currentUser) {
    return (
      <div className="section auth-section">
        <div className="container narrow-container">
          <div className="auth-card" style={{ textAlign: 'center', padding: '48px 24px' }}>
            <div style={{ fontSize: '3.5rem', marginBottom: '16px' }}>🔒</div>
            <h2>{lang === 'ru' ? 'Раздел курсов закрыт' : "Kurslar bo'limi yopiq"}</h2>
            <p style={{ color: 'var(--text-muted)', marginBottom: '24px', maxWidth: '440px', margin: '0 auto 24px' }}>
              {lang === 'ru'
                ? 'Для просмотра каталога курсов, программы и записи на обучение необходимо войти на платформу.'
                : "Kurslar katalogini ko'rish, dastur bilan tanishish va o'rganishni boshlash uchun iltimos, tizimga kiring."}
            </p>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
              <button className="btn btn-primary btn-lg" onClick={() => navigate('login', { redirect: 'courses' })}>
                🔑 {lang === 'ru' ? 'Войти в аккаунт' : 'Tizimga kirish'}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const directionTracks = [
    {
      id: 'cat-frontend',
      title: lang === 'ru' ? 'Frontend' : 'Frontend',
      fullTitle: lang === 'ru' ? 'Frontend разработка' : 'Frontend Dasturlash',
      badgeColor: '#38bdf8',
      badgeBg: 'rgba(56, 189, 248, 0.12)',
      badgeBorder: 'rgba(56, 189, 248, 0.3)',
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#38bdf8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
          <line x1="8" y1="21" x2="16" y2="21" />
          <line x1="12" y1="17" x2="12" y2="21" />
        </svg>
      ),
      bullets: lang === 'ru' ? [
        'HTML5, CSS3, Flexbox и Адаптивный веб-дизайн',
        'JavaScript (ES6+), DOM и Асинхронное программирование',
        'React.js, Next.js и Tailwind CSS экосистема',
        'Управление состоянием: Redux Toolkit и Context API',
        'Проекты: Лендинги, Веб-приложения и Дашборды',
        'Длительность: 4-6 месяцев (С выдачей сертификата)'
      ] : [
        'HTML5, CSS3, Flexbox va Responsive Dizayn',
        'JavaScript (ES6+), DOM va Zamonaviy Web dasturlash',
        'React.js, Next.js va Tailwind CSS kutubxonalari',
        'Redux Toolkit, Context API va State boshqaruvi',
        'Loyihalar: Landing page, Web ilovalar va Dashboard',
        'Kurs davomiyligi: 4-6 oy (Sertifikat bilan)'
      ]
    },
    {
      id: 'cat-backend',
      title: lang === 'ru' ? 'Backend' : 'Backend',
      fullTitle: lang === 'ru' ? 'Backend разработка' : 'Backend Dasturlash',
      badgeColor: '#34d399',
      badgeBg: 'rgba(52, 211, 153, 0.12)',
      badgeBorder: 'rgba(52, 211, 153, 0.3)',
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#34d399" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="2" y="2" width="20" height="8" rx="2" ry="2" />
          <rect x="2" y="14" width="20" height="8" rx="2" ry="2" />
          <line x1="6" y1="6" x2="6.01" y2="6" />
          <line x1="6" y1="18" x2="6.01" y2="18" />
        </svg>
      ),
      bullets: lang === 'ru' ? [
        'Node.js, Express.js и Python (Django / FastAPI)',
        'Базы данных: PostgreSQL, MongoDB, Redis, Prisma ORM',
        'Архитектура RESTful API, GraphQL и Микросервисы',
        'JWT аутентификация, Веб-безопасность и защита данных',
        'Docker контейнеризация, Linux серверы и CI/CD',
        'Разработка реальных Production-систем'
      ] : [
        'Node.js, Express.js va Python (Django / FastAPI)',
        "Ma'lumotlar bazasi: PostgreSQL, MongoDB, Redis",
        'RESTful API, GraphQL va Microservices arxitekturasi',
        'JWT autentifikatsiya, Web xavfsizlik va Kiberhimoya',
        'Docker, Linux serverlar va CI/CD deploy qilish',
        'Haqiqiy ishlab chiqarish (Production) tizimlari'
      ]
    },
    {
      id: 'cat-ai-data',
      title: lang === 'ru' ? 'Искусственный Интеллект и Data' : "Sun'iy Intellekt va Data",
      fullTitle: lang === 'ru' ? 'Искусственный Интеллект и Data' : "Sun'iy Intellekt va Data",
      badgeColor: '#fbbf24',
      badgeBg: 'rgba(251, 191, 36, 0.12)',
      badgeBorder: 'rgba(251, 191, 36, 0.3)',
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#fbbf24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
          <circle cx="12" cy="12" r="3" />
        </svg>
      ),
      bullets: lang === 'ru' ? [
        'Язык Python, Алгоритмы и Прикладная математика',
        'Data Science: Анализ данных с Pandas и NumPy',
        'Машинное обучение (Machine Learning с Scikit-Learn)',
        'Глубокое обучение: Нейросети (PyTorch, TensorFlow)',
        'Интеграция LLM (ChatGPT, Gemini API) и AI-агенты',
        'Создание практических ИИ-стартапов и портфолио'
      ] : [
        'Python dasturlash, Algoritmlar va Matematika',
        "Data Science: Pandas, NumPy va Ma'lumotlar tahlili",
        "Machine Learning (Scikit-Learn) modellarini o'qitish",
        'Deep Learning: Neyron tarmoqlari (PyTorch, TensorFlow)',
        'Katta til modellari (LLM), Prompt Engineering va AI Agentlar',
        'Amaliy AI loyihalar va portfolio yaratish'
      ]
    }
  ];

  const allAvailableCourses = (db.courses && db.courses.length > 0) ? db.courses : initialDatabase.courses;
  
  // Guarantee each track has at least its seed courses if none present in db
  const trackIds = ['cat-frontend', 'cat-backend', 'cat-ai-data'];
  const enrichedCourses = [...allAvailableCourses];
  trackIds.forEach((tId) => {
    const hasAny = enrichedCourses.some((c) => c.categoryId === tId);
    if (!hasAny) {
      const seedMatches = initialDatabase.courses.filter((c) => c.categoryId === tId);
      seedMatches.forEach((sm) => {
        if (!enrichedCourses.some((ec) => ec.id === sm.id)) {
          enrichedCourses.push(sm);
        }
      });
    }
  });

  const publishedCourses = enrichedCourses.filter((c) => c.status === 'published' || !c.status);

  function courseMatchesCategory(c, categoryId) {
    if (categoryId === 'all') return true;
    if (c.categoryId === categoryId) return true;

    const hay = `${c.categoryId || ''} ${c.category || ''} ${c.titleUz || ''} ${c.titleRu || ''} ${c.slug || ''}`.toLowerCase();
    if (categoryId === 'cat-frontend') {
      return hay.includes('front') || hay.includes('react') || hay.includes('javascript') || hay.includes('html') || hay.includes('web');
    }
    if (categoryId === 'cat-backend') {
      return hay.includes('back') || hay.includes('node') || hay.includes('python') || hay.includes('express') || hay.includes('server') || hay.includes('devops');
    }
    if (categoryId === 'cat-ai-data') {
      return hay.includes('ai') || hay.includes('sun') || hay.includes('data') || hay.includes('intel') || hay.includes('anti') || hay.includes('machine') || hay.includes('deep');
    }
    return false;
  }

  const filteredCourses = publishedCourses.filter((c) => {
    const matchesCat = courseMatchesCategory(c, selectedCat);
    const q = search.toLowerCase().trim();
    const matchesSearch = !q || loc(c, 'title').toLowerCase().includes(q) || loc(c, 'description').toLowerCase().includes(q);
    return matchesCat && matchesSearch;
  });

  const selectedTrack = directionTracks.find((t) => t.id === selectedCat);
  const selectedCatTitle = selectedTrack ? selectedTrack.fullTitle : (db.categories.find((c) => c.id === selectedCat)?.nameUz || '');

  function handleSelectTrack(trackId) {
    setSelectedCat(trackId);
    setTimeout(() => {
      const el = document.getElementById('courses-result-section');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 60);
  }

  return (
    <div className="section mdev-courses-section">
      <div className="container">
        {/* Top Header Badge & Starry Ambience */}
        <div className="mdev-header-badge-wrap">
          <span className="mdev-ambient-star star-tl">✦</span>
          <span className="mdev-ambient-star star-tr">★</span>
          <span className="mdev-ambient-star star-br">✦</span>
          <p className="mdev-header-badge">
            {lang === 'ru'
              ? 'Направления обучения и программы на платформе CodeCraft Academy'
              : "CodeCraft Academy platformasida o'qish yo'nalishlari va dasturlar"}
          </p>
        </div>

        {/* 3 Main Direction Cards Grid */}
        <div className="mdev-cards-grid">
          {directionTracks.map((track) => {
            const isActive = selectedCat === track.id;
            return (
              <div
                key={track.id}
                className={`mdev-card ${isActive ? 'active' : ''}`}
                onClick={() => handleSelectTrack(track.id)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    handleSelectTrack(track.id);
                  }
                }}
              >
                <div
                  className="mdev-card-icon-box"
                  style={{
                    backgroundColor: track.badgeBg,
                    border: `1.5px solid ${track.badgeBorder}`
                  }}
                >
                  {track.icon}
                </div>

                <h3 className="mdev-card-title">{track.title}</h3>

                <ul className="mdev-bullet-list">
                  {track.bullets.map((bullet, idx) => (
                    <li key={idx} className="mdev-bullet-item">
                      <span className="mdev-bullet-sparkle" style={{ color: track.badgeColor }}>✦</span>
                      <span>{bullet}</span>
                    </li>
                  ))}
                </ul>

                <div className="mdev-card-footer">
                  <button
                    type="button"
                    className="mdev-card-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSelectTrack(track.id);
                    }}
                  >
                    {isActive
                      ? (lang === 'ru' ? '✓ Выбрано (Курсы ниже ↓)' : "✓ Tanlangan (Kurslar pastda ↓)")
                      : (lang === 'ru' ? 'Смотреть курсы ↓' : "Kurslarni ko'rish ↓")}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Courses List Underneath Selected Direction */}
        <div id="courses-result-section" className="catalog-courses-subgrid-wrap" style={{ scrollMarginTop: '80px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '22px', flexWrap: 'wrap', gap: '14px' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
                <span
                  style={{
                    display: 'inline-block',
                    width: '12px',
                    height: '12px',
                    borderRadius: '50%',
                    backgroundColor: selectedTrack?.badgeColor || '#3b82f6',
                    boxShadow: `0 0 12px ${selectedTrack?.badgeColor || '#3b82f6'}`
                  }}
                />
                <h3 style={{ fontSize: '1.35rem', fontWeight: 800, margin: 0 }}>
                  {selectedCat === 'all'
                    ? (lang === 'ru' ? 'Все направления и курсы' : "Barcha yo'nalishlar va kurslar")
                    : (lang === 'ru' ? `Курсы по направлению: ${selectedCatTitle}` : `${selectedCatTitle} yo'nalishidagi kurslar`)}
                </h3>
              </div>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', margin: 0 }}>
                {filteredCourses.length} {lang === 'ru' ? 'доступных курсов' : "ta mavjud kurs"}
              </p>
            </div>

            <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
              {selectedCat !== 'all' && (
                <button
                  type="button"
                  className="btn btn-sm btn-outline"
                  onClick={() => setSelectedCat('all')}
                  style={{ fontSize: '0.84rem' }}
                >
                  {lang === 'ru' ? 'Показать все направления' : "Barcha yo'nalishlarni ko'rish"}
                </button>
              )}

              <div className="filter-search-wrap" style={{ position: 'relative', minWidth: '220px' }}>
                <input
                  type="text"
                  className="input input-sm"
                  placeholder={t.catalog.searchPlaceholder}
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  style={{ paddingRight: '36px', height: '38px', fontSize: '0.86rem' }}
                />
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                  style={{
                    position: 'absolute',
                    right: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: 'var(--text-muted)',
                    pointerEvents: 'none'
                  }}
                >
                  <circle cx="11" cy="11" r="7" />
                  <line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
              </div>
            </div>
          </div>

          {filteredCourses.length === 0 ? (
            <div className="empty-box" style={{ padding: '40px 20px', textAlign: 'center' }}>
              <div style={{ fontSize: '2.8rem', marginBottom: '10px' }}>🔍</div>
              <h4 style={{ margin: '0 0 6px 0', fontSize: '1.15rem' }}>{lang === 'ru' ? 'Курсы не найдены' : 'Bunday kurslar topilmadi'}</h4>
              <p className="text-muted" style={{ fontSize: '0.9rem', marginBottom: '16px' }}>
                {lang === 'ru' ? 'Попробуйте сбросить фильтр или изменить запрос' : "Qidiruv so'zini yoki kategoriyani o'zgartirib ko'ring"}
              </p>
              <button
                type="button"
                className="btn btn-sm btn-primary"
                onClick={() => { setSelectedCat('all'); setSearch(''); }}
              >
                {lang === 'ru' ? 'Сбросить фильтры' : "Barcha kurslarni ko'rsatish"}
              </button>
            </div>
          ) : (
            <div className="courses-grid">
              {filteredCourses.map((c) => (
                <CourseCard key={c.id} course={c} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}



export function CourseDetailPage() {
  const {
    t,
    loc,
    formatPrice,
    db,
    route,
    navigate,
    currentUser,
    isEnrolled,
    hasPendingPayment,
    setCheckoutCourse,
    setPreviewLesson,
    addReview,
    lang
  } = useApp();

  const courseId = route.params?.courseId || db.courses[0]?.id;
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');

  if (!currentUser) {
    return (
      <div className="section auth-section">
        <div className="container narrow-container">
          <div className="auth-card" style={{ textAlign: 'center', padding: '48px 24px' }}>
            <div style={{ fontSize: '3.5rem', marginBottom: '16px' }}>🔒</div>
            <h2>{lang === 'ru' ? 'Курс доступен только после входа' : 'Kurs faqat tizimga kirganlar uchun ochiq!'}</h2>
            <p style={{ color: 'var(--text-muted)', marginBottom: '24px', maxWidth: '440px', margin: '0 auto 24px' }}>
              {lang === 'ru'
                ? 'Для просмотра программы курса, материалов и записи на обучение пожалуйста, войдите в систему.'
                : "Kurs dasturi, o'quv materiallari va darslarga yozilish uchun iltimos, tizimga kiring."}
            </p>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
              <button className="btn btn-primary btn-lg" onClick={() => navigate('login', { redirect: 'courseDetail', courseId })}>
                🔑 {lang === 'ru' ? 'Войти в аккаунт' : 'Tizimga kirish'}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const course = db.courses.find((c) => c.id === courseId) || db.courses[0];
  const teacher = db.users.find((u) => u.id === course.teacherId);
  const category = db.categories.find((c) => c.id === course.categoryId);
  const modules = db.modules
    .filter((m) => m.courseId === course.id)
    .sort((a, b) => a.order - b.order);
  const reviews = db.reviews.filter((r) => r.courseId === course.id && r.status === 'approved');
  const enrolled = currentUser && isEnrolled(currentUser.id, course.id);
  const pending = currentUser && hasPendingPayment(currentUser.id, course.id);

  function handleReviewSubmit(e) {
    e.preventDefault();
    if (!comment.trim()) return;
    addReview({ courseId: course.id, rating, comment });
    setComment('');
  }

  return (
    <div className="section">
      <div className="container">
        <button className="btn btn-ghost btn-sm mb-4" onClick={() => navigate('courses')}>
          ← {t.courseDetail.backToCatalog}
        </button>

        <div className="course-detail-layout">
          <div className="course-detail-main">
            <div className="course-hero-banner">
              <span className="course-cat-badge">{loc(category, 'name')}</span>
              <h1>{loc(course, 'title')}</h1>
              <p className="course-lead">{loc(course, 'description')}</p>
              <div className="course-hero-meta">
                <span>⭐ {course.rating || '4.9'} ({reviews.length} {lang === 'ru' ? 'отзывов' : 'sharh'})</span>
                <span>👥 {course.studentsCount || 0} {t.catalog.studentsCount}</span>
                <span>⏱️ {course.durationHours || 48} {lang === 'ru' ? 'часов' : 'soat'}</span>
                <span>🌐 {course.language}</span>
                <span className="level-pill">{t.catalog.levels[course.level]}</span>
              </div>
            </div>

            {/* CURRICULUM MODULES & LESSONS */}
            <div className="detail-block">
              <h2>📚 {t.courseDetail.programTitle}</h2>
              <div className="modules-stack">
                {modules.map((mod) => {
                  const modLessons = db.lessons
                    .filter((l) => l.moduleId === mod.id)
                    .sort((a, b) => a.order - b.order);
                  const modQuiz = db.quizzes.find((q) => q.moduleId === mod.id);

                  return (
                    <div key={mod.id} className="module-box">
                      <div className="module-box-head">
                        <h4>{loc(mod, 'title')}</h4>
                        <span>{modLessons.length} {t.catalog.lessonsCount}</span>
                      </div>
                      <div className="module-lessons-list">
                        {modLessons.map((les) => {
                          const hasHomework = db.assignments.some((a) => a.lessonId === les.id);
                          return (
                            <div key={les.id} className="module-lesson-row">
                              <div className="lesson-row-left">
                                <span>{les.isFree || enrolled ? '📖' : '🔒'}</span>
                                <span>{loc(les, 'title')}</span>
                                {(les.videoUrl || les.videoId) && (
                                  <span className="mini-tag" style={{ background: 'rgba(56, 189, 248, 0.15)', color: '#38bdf8', borderColor: 'rgba(56, 189, 248, 0.3)' }}>
                                    🎥 Video
                                  </span>
                                )}
                                {hasHomework && (
                                  <span className="mini-tag homework">{t.courseDetail.homeworkBadge}</span>
                                )}
                              </div>
                              <div className="lesson-row-right">
                                <span className="text-muted">{les.duration} {lang === 'ru' ? 'мин' : 'daq'}</span>
                                {les.isFree && !enrolled && (
                                  <button
                                    className="btn btn-xs btn-soft"
                                    onClick={() => setPreviewLesson(les)}
                                  >
                                    👁️ {t.courseDetail.freePreview}
                                  </button>
                                )}
                                {enrolled && (
                                  <button
                                    className="btn btn-xs btn-primary"
                                    onClick={() =>
                                      navigate('learning', { courseId: course.id, lessonId: les.id })
                                    }
                                  >
                                    {lang === 'ru' ? 'Открыть' : 'Ochish'}
                                  </button>
                                )}
                              </div>
                            </div>
                          );
                        })}
                        {modQuiz && (
                          <div className="module-lesson-row quiz-row">
                            <div className="lesson-row-left">
                              <span>🧪</span>
                              <strong>{loc(modQuiz, 'title')}</strong>
                              <span className="mini-tag quiz">{t.courseDetail.quizBadge}</span>
                            </div>
                            <span className="text-muted">{lang === 'ru' ? 'Проходной балл:' : "O'tish bali:"} {modQuiz.passingScore}%</span>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* TEACHER INFO */}
            {teacher && (
              <div className="detail-block">
                <h2>👨‍🏫 {t.courseDetail.teacherSection}</h2>
                <div
                  className="teacher-detail-card"
                  onClick={() => navigate('teacherProfile', { teacherId: teacher.id })}
                >
                  <img src={teacher.avatar} alt={teacher.name} />
                  <div>
                    <h3>{teacher.name}</h3>
                    <span className="teacher-spec">{loc(teacher, 'specialty')}</span>
                    <p>{loc(teacher, 'bio')}</p>
                  </div>
                </div>
              </div>
            )}

            {/* REVIEWS */}
            <div className="detail-block">
              <h2>💬 {t.courseDetail.reviewsSection} ({reviews.length})</h2>
              <div className="reviews-stack">
                {reviews.map((rev) => (
                  <div key={rev.id} className="review-card">
                    <div className="review-author">
                      <img src={rev.userAvatar} alt={rev.userName} />
                      <div>
                        <strong>{rev.userName}</strong>
                        <div className="review-stars">{'⭐'.repeat(rev.rating)}</div>
                      </div>
                    </div>
                    <p className="review-text">{rev.comment}</p>
                  </div>
                ))}
              </div>

              {enrolled ? (
                <form className="review-form" onSubmit={handleReviewSubmit}>
                  <h4>✍️ {t.courseDetail.leaveReview}</h4>
                  <div className="form-row">
                    <label>{t.courseDetail.ratingLabel}</label>
                    <select
                      className="input"
                      value={rating}
                      onChange={(e) => setRating(Number(e.target.value))}
                    >
                      <option value={5}>{lang === 'ru' ? '⭐⭐⭐⭐⭐ (5 - Отлично)' : "⭐⭐⭐⭐⭐ (5 - A'lo)"}</option>
                      <option value={4}>{lang === 'ru' ? '⭐⭐⭐⭐ (4 - Хорошо)' : '⭐⭐⭐⭐ (4 - Yaxshi)'}</option>
                      <option value={3}>{lang === 'ru' ? '⭐⭐⭐ (3 - Средне)' : "⭐⭐⭐ (3 - O'rtacha)"}</option>
                    </select>
                  </div>
                  <textarea
                    className="input"
                    rows={3}
                    placeholder={t.courseDetail.reviewPlaceholder}
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    required
                  />
                  <button type="submit" className="btn btn-primary">
                    {t.courseDetail.submitReview}
                  </button>
                </form>
              ) : (
                <div className="info-banner">{t.courseDetail.onlyEnrolledCanReview}</div>
              )}
            </div>
          </div>

          {/* STICKY SIDEBAR */}
          <aside className="course-detail-sidebar">
            <div className="sticky-purchase-card">
              <img src={course.thumbnail} alt={loc(course, 'title')} className="sidebar-thumb" />
              <div className="sidebar-price-box">
                {course.discountPrice ? (
                  <>
                    <span className="old-price">{formatPrice(course.price)}</span>
                    <strong className="big-price">{formatPrice(course.discountPrice)}</strong>
                  </>
                ) : (
                  <strong className="big-price">{formatPrice(course.price)}</strong>
                )}
              </div>

              {enrolled ? (
                <button
                  className="btn btn-success btn-block btn-lg"
                  onClick={() => navigate('learning', { courseId: course.id })}
                >
                  ▶️ {t.courseDetail.continueLearning}
                </button>
              ) : pending ? (
                <button
                  className="btn btn-warning btn-block btn-lg"
                  style={{ background: 'rgba(245, 158, 11, 0.15)', color: '#d97706', border: '1px solid rgba(245, 158, 11, 0.3)', fontWeight: 700 }}
                  onClick={() => setCheckoutCourse(course)}
                >
                  ⏳ {lang === 'ru' ? 'Оплата проверяется' : "To'lov tekshirilmoqda"}
                </button>
              ) : (
                <button
                  className="btn btn-primary btn-block btn-lg"
                  onClick={() => setCheckoutCourse(course)}
                >
                  💳 {t.courseDetail.buyNow}
                </button>
              )}

              <div className="includes-list">
                <h4>{t.courseDetail.includesTitle}</h4>
                <ul>
                  <li>✅ {t.courseDetail.incLifetime}</li>
                  <li>✅ {t.courseDetail.incHomework}</li>
                  <li>✅ {t.courseDetail.incQuiz}</li>
                  <li>✅ {t.courseDetail.incCert}</li>
                </ul>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}

export function TeachersPage() {
  const { t, loc, db, navigate, lang } = useApp();
  const teachers = db.users.filter((u) => u.role === 'teacher');

  return (
    <div className="section">
      <div className="container">
        <div className="catalog-header">
          <h1>{t.home.teachersTitle}</h1>
          <p>{t.home.teachersSub}</p>
        </div>
        <div className="teachers-grid">
          {teachers.map((teacher) => {
            const teacherCourses = db.courses.filter((c) => c.teacherId === teacher.id);
            return (
              <div
                key={teacher.id}
                className="teacher-card"
                onClick={() => navigate('teacherProfile', { teacherId: teacher.id })}
              >
                <img src={teacher.avatar} alt={teacher.name} className="teacher-avatar" />
                <h3>{teacher.name}</h3>
                <span className="teacher-spec">{loc(teacher, 'specialty')}</span>
                <p>{loc(teacher, 'bio')}</p>
                <div className="teacher-stats-row">
                  <span>📚 {teacherCourses.length} {lang === 'ru' ? 'авторских курсов' : 'ta mualliflik kursi'}</span>
                  <span>⭐ {teacher.rating || 4.9}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export function TeacherProfilePage() {
  const { loc, db, route, navigate, lang } = useApp();
  const teacherId = route.params?.teacherId || 'usr-teacher-1';
  const teacher = db.users.find((u) => u.id === teacherId) || db.users.find((u) => u.role === 'teacher');
  const teacherCourses = db.courses.filter((c) => c.teacherId === teacher?.id);

  return (
    <div className="section">
      <div className="container">
        <button className="btn btn-ghost btn-sm mb-4" onClick={() => navigate('teachers')}>
          ← {lang === 'ru' ? 'Все преподаватели' : "Barcha o'qituvchilar"}
        </button>

        <div className="teacher-profile-hero">
          <img src={teacher.avatar} alt={teacher.name} />
          <div>
            <h1>{teacher.name}</h1>
            <span className="teacher-spec">{loc(teacher, 'specialty')}</span>
            <p className="mt-2">{loc(teacher, 'bio')}</p>
            <div className="teacher-stats-row mt-2">
              <span>⭐ {lang === 'ru' ? 'Рейтинг' : 'Reyting'}: {teacher.rating || 4.9}</span>
              <span>💼 {lang === 'ru' ? 'Опыт' : 'Tajriba'}: {teacher.experienceYears || 7} {lang === 'ru' ? 'лет' : 'yil'}</span>
              <span>📚 {lang === 'ru' ? 'Курсы' : 'Kurslar'}: {teacherCourses.length} {lang === 'ru' ? 'курсов' : 'ta'}</span>
            </div>
          </div>
        </div>

        <h2 className="mt-6 mb-4">{lang === 'ru' ? 'Авторские курсы преподавателя' : 'Ustozning mualliflik kurslari'}</h2>
        <div className="courses-grid">
          {teacherCourses.map((course) => (
            <CourseCard key={course.id} course={course} />
          ))}
        </div>
      </div>
    </div>
  );
}

export function CertificateVerifyPage() {
  const { db, loc, setActiveCertificate, lang } = useApp();
  const [code, setCode] = useState('EC-2026-UX9901');
  const [result, setResult] = useState(null);

  function handleCheck(e) {
    e.preventDefault();
    const clean = code.trim().toUpperCase();
    const cert = db.certificates.find((c) => c.code.toUpperCase() === clean);
    if (!cert) {
      setResult({ valid: false });
      return;
    }
    const student = db.users.find((u) => u.id === cert.userId);
    const course = db.courses.find((c) => c.id === cert.courseId);
    setResult({ valid: true, cert, student, course });
  }

  return (
    <div className="section">
      <div className="container narrow-container">
        <div className="verify-card">
          <h1>🎓 {lang === 'ru' ? 'Проверка подлинности сертификата' : 'Sertifikat haqiqiyligini tekshirish'}</h1>
          <p className="text-muted">
            {lang === 'ru'
              ? 'Введите ID-код сертификата выпускника (Например: EC-2026-UX9901)'
              : 'EduCenter bitiruvchisining sertifikat ID-kodini kiriting (Masalan: EC-2026-UX9901)'}
          </p>

          <form className="promo-row mt-4" onSubmit={handleCheck}>
            <input
              type="text"
              className="input"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="EC-2026-XXXXXX"
              required
            />
            <button type="submit" className="btn btn-primary">
              🔍 {lang === 'ru' ? 'Проверить' : 'Tekshirish'}
            </button>
          </form>

          {result && (
            <div className={`verify-result-box ${result.valid ? 'valid' : 'invalid'}`}>
              {result.valid ? (
                <>
                  <h3>{lang === 'ru' ? '✅ Сертификат действителен (Подтвержден)' : '✅ Sertifikat Haqiqiy (Tasdiqlangan)'}</h3>
                  <p><strong>{lang === 'ru' ? 'Выпускник:' : 'Bitiruvchi:'}</strong> {result.student?.name}</p>
                  <p><strong>{lang === 'ru' ? 'Курс:' : 'Kurs:'}</strong> {loc(result.course, 'title')}</p>
                  <p><strong>{lang === 'ru' ? 'Код сертификата:' : 'Sertifikat kodi:'}</strong> <code>{result.cert.code}</code></p>
                  <p><strong>{lang === 'ru' ? 'Дата выдачи:' : 'Berilgan sana:'}</strong> {new Date(result.cert.issuedAt).toLocaleDateString()}</p>
                  <button
                    className="btn btn-outline btn-sm mt-2"
                    onClick={() => setActiveCertificate(result.cert)}
                  >
                    📄 {lang === 'ru' ? 'Посмотреть копию сертификата' : "Sertifikat nusxasini ko'rish"}
                  </button>
                </>
              ) : (
                <>
                  <h3>{lang === 'ru' ? '❌ Сертификат не найден' : '❌ Sertifikat topilmadi'}</h3>
                  <p>{lang === 'ru' ? 'Сертификат по указанному коду отсутствует в базе данных.' : "Kiritilgan kod bo'yicha ma'lumotlar bazasida sertifikat mavjud emas."}</p>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export function AboutPageShowcase({ lang, navigate, currentUser, pageObj, loc }) {
  const [activeStackTab, setActiveStackTab] = useState('frontend');

  const stackData = {
    frontend: {
      title: lang === 'ru' ? 'Frontend Разработка' : 'Frontend Dasturlash',
      icon: '⚛️',
      desc: lang === 'ru'
        ? 'Создание современных, быстрых и адаптивных пользовательских интерфейсов, веб-сервисов и SPA-приложений.'
        : "Tezkor, zamonaviy va mobil qurilmalarga to'liq moslashuvchan veb-interfeyslar, boshqaruv panellari va SaaS ilovalar yaratish.",
      skills: ['React 19', 'JavaScript ES6+', 'TypeScript', 'Tailwind CSS', 'HTML5 & CSS3', 'Vite'],
      projects: lang === 'ru'
        ? 'CRM-панели управления, Интернет-магазины, Интерактивные платформы обучения'
        : "CRM boshqaruv panellari, Online do'konlar, Interaktiv o'quv platformalari"
    },
    backend: {
      title: lang === 'ru' ? 'Backend Разработка' : 'Backend Dasturlash',
      icon: '🛡️',
      desc: lang === 'ru'
        ? 'Разработка надежной бизнес-логики, серверов с высокой пропускной способностью и безопасных REST API.'
        : "Xavfsiz, yuqori yuklamaga chidamli serverlar va biznes mantiqini ishlab chiqish.",
      skills: ['Node.js', 'Express.js', 'NestJS', 'REST API', 'JWT Auth', 'WebSockets'],
      projects: lang === 'ru'
        ? 'Платежные шлюзы (Payme, Click), Системы аутентификации, API интеграции'
        : "To'lov shlyuzlari (Payme, Click), Avtorizatsiya serverlari, API shlyuzlar"
    },
    database: {
      title: lang === 'ru' ? 'Базы Данных и Архитектура' : "Ma'lumotlar Bazasi va Arxitektura",
      icon: '💾',
      desc: lang === 'ru'
        ? 'Проектирование реляционных баз данных, оптимизация запросов, индексация и кеширование.'
        : "Katta hajmdagi ma'lumotlarni tezkor va ishonchli saqlash, indekslash va arxitekturani loyihalash.",
      skills: ['PostgreSQL', 'Prisma ORM', 'Redis Caching', 'SQL', 'Database Indexing'],
      projects: lang === 'ru'
        ? 'Транзакционные журналы, Системы кеширования, Базы данных пользователей'
        : "Tranzaksiya jurnallari, Kesh tizimlari, Foydalanuvchilar ma'lumotlar ombori"
    },
    telegram: {
      title: lang === 'ru' ? 'Telegram Боты и Автоматизация' : 'Telegram Bot va Avtomatizatsiya',
      icon: '🤖',
      desc: lang === 'ru'
        ? 'Разработка умных ботов для автоматизации бизнеса, приема заказов и мгновенных уведомлений.'
        : "Mijozlar bilan 24/7 aloqa qiluvchi, buyurtma qabul qiluvchi va avtomatlashtirilgan xizmat botlari.",
      skills: ['Telegram Bot API', 'Node-Telegram-Bot', 'Webhooks', 'Async Tasks', 'Cron Jobs'],
      projects: lang === 'ru'
        ? 'Официальный бот @CodeCraftUzBot, Боты заказов и оплат, Системы пуш-уведомлений'
        : "EduCenter @CodeCraftUzBot, Buyurtma va to'lov botlari, Bildirishnoma tizimlari"
    },
    devops: {
      title: lang === 'ru' ? 'DevOps и Культура Кода' : 'DevOps va Toza Kod Madaniyati',
      icon: '🚀',
      desc: lang === 'ru'
        ? 'Командная работа через Git, версионирование, code review и автоматическое развертывание проектов.'
        : "Jamoada professional ishlash, versiyalar boshqaruvi va kodni serverlarga avtomatik joylashtirish (deploy).",
      skills: ['Git & GitHub', 'Docker', 'CI/CD Pipelines', 'Linux VPS', 'Clean Architecture'],
      projects: lang === 'ru'
        ? 'Развертывание на Vercel и Railway, Настройка VPS серверов, Автоматический деплой'
        : "Vercel va Railway deploy, VPS serverlar sozlamalari, Avtomatik deploy tizimi"
    }
  };

  const currentStack = stackData[activeStackTab];

  const milestones = [
    { number: '50,000+', label: lang === 'ru' ? 'Строк чистого кода' : 'Yozilgan toza kod satrlari' },
    { number: '15+', label: lang === 'ru' ? 'Реальных стартап проектов' : 'Real startap va bot loyihalari' },
    { number: '1-na-1', label: lang === 'ru' ? 'Личный код-ревью и менторство' : 'Shaxsiy mentorlik va code review' },
    { number: '100%', label: lang === 'ru' ? 'Практическое обучение' : 'Amaliyotga yo\'naltirilgan ta\'lim' }
  ];

  const principles = [
    {
      icon: '⚡',
      title: lang === 'ru' ? '90% Практика, 10% Теория' : "90% Amaliyot, 10% Nazariya",
      text: lang === 'ru'
        ? 'Вместо длинных скучных слайдов — написание реального кода с первого дня и создание работающих сервисов.'
        : "Zerikarli taqdimotlar o'rniga darsning birinchi daqiqasidan boshlab real kod yoziladi va ishchi servislar yaratiladi."
    },
    {
      icon: '👨‍💻',
      title: lang === 'ru' ? 'Личный Код-Ревью Ментора' : 'Shaxsiy Kod Tekshiruvi (Code-Review)',
      text: lang === 'ru'
        ? 'Каждая строчка кода студента анализируется старшими менторами, вырабатывая привычку писать чистый Clean Code.'
        : "Har bir o'quvchi kodi mentorlar tomonidan qatorma-qator tekshirilib, Clean Code standartlari o'rgatiladi."
    },
    {
      icon: '🤝',
      title: lang === 'ru' ? 'Культура Git и Команда' : 'Git va Jamoaviy Madaniyat',
      text: lang === 'ru'
        ? 'Обучаем совместной разработке через GitHub, pull requests и командные задачи, как в настоящих IT компаниях.'
        : "Talabalar GitHub, pull requestlar va jamoaviy loyihalar orqali haqiqiy IT kompaniyalardek ishlashni o'rganadi."
    },
    {
      icon: '💼',
      title: lang === 'ru' ? 'Нацеленность на Результат' : 'Natija va Karyera',
      text: lang === 'ru'
        ? 'Главная цель — не просто диплом, а сильное портфолио из минимум 5 реальных проектов для уверенного старта.'
        : "Asosiy maqsad qog'oz sertifikat emas, balki ishga kirish uchun kamida 5 ta mustaqil loyihadan iborat kuchli portfolio."
    }
  ];

  const mentors = [
    {
      name: 'Muhammaddiyor Orifjonov',
      role: lang === 'ru' ? 'Старший Backend и Архитектура Ментор' : 'Senior Backend & Architecture Mentor',
      avatar: '/mdev.jpg',
      tags: ['Node.js', 'Express', 'PostgreSQL', 'Architecture'],
      bio: lang === 'ru'
        ? 'Специалист по проектированию масштабируемых серверных систем и архитектуры баз данных.'
        : "Katta hajmdagi ma'lumotlar bazasi va xavfsiz server arxitekturasini yaratish bo'yicha mutaxassis."
    },
    {
      name: 'Ali Abdunabiyev',
      role: lang === 'ru' ? 'Ведущий Frontend и Бот Разработчик' : 'Lead Frontend & Telegram Bot Developer',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
      tags: ['React 19', 'JavaScript', 'Telegram Bot API', 'Tailwind CSS'],
      bio: lang === 'ru'
        ? 'Эксперт по современным UI-интерфейсам, веб-приложениям и автоматизации в Telegram.'
        : "Zamonaviy veb interfeyslar, web ilovalar va Telegram orqali biznesni avtomatlashtirish mutaxassisi."
    }
  ];

  return (
    <div className="section about-page-section">
      <div className="container">
        {/* 1. HERO CARD */}
        <div className="about-hero-card">
          <div className="about-badge-pill">
            <span>🚀</span>
            <span>{lang === 'ru' ? 'IT Команда CodeCraft' : 'CodeCraft IT Jamoasi'}</span>
          </div>
          <h1>{loc(pageObj, 'title')}</h1>
          <p className="about-lead-text">
            {loc(pageObj, 'content')}
          </p>
          <div className="about-hero-actions">
            <button
              type="button"
              className="btn btn-primary btn-lg"
              onClick={() => navigate(currentUser ? 'courses' : 'login')}
            >
              🤝 {lang === 'ru' ? 'Присоединяйтесь к нам' : "Bizga qo'shiling"}
            </button>
            <button
              type="button"
              className="btn btn-outline btn-lg"
              onClick={() => navigate('contact')}
            >
              💬 {lang === 'ru' ? 'Связаться с нами' : "Bog'lanish"}
            </button>
          </div>
        </div>

        {/* 2. MILESTONES STATS */}
        <div className="about-milestones-grid">
          {milestones.map((m, idx) => (
            <div key={idx} className="about-milestone-item">
              <span className="about-milestone-number">{m.number}</span>
              <span className="about-milestone-label">{m.label}</span>
            </div>
          ))}
        </div>

        {/* 3. INTERACTIVE TECH STACK */}
        <div className="about-stack-section">
          <div className="about-section-head">
            <h2>{lang === 'ru' ? '🛠️ Технологический Стек Команды' : "🛠️ Jamoamizning Texnologik Staki"}</h2>
            <p>
              {lang === 'ru'
                ? 'Мы обучаем и создаем коммерческие продукты на самых востребованных технологиях мирового IT-рынка.'
                : "Biz xalqaro IT bozorda eng yuqori talabga ega bo'lgan zamonaviy vositalar bilan ishlaymiz va o'rgatamiz."}
            </p>
          </div>

          <div className="about-stack-tabs">
            {Object.keys(stackData).map((key) => {
              const item = stackData[key];
              return (
                <button
                  key={key}
                  type="button"
                  className={`about-stack-tab-btn ${activeStackTab === key ? 'active' : ''}`}
                  onClick={() => setActiveStackTab(key)}
                >
                  <span>{item.icon}</span>
                  <span>{item.title}</span>
                </button>
              );
            })}
          </div>

          <div className="about-stack-detail-box">
            <div className="about-stack-detail-title">
              <span>{currentStack.icon}</span>
              <span>{currentStack.title}</span>
            </div>
            <p className="about-stack-detail-desc">{currentStack.desc}</p>

            <div style={{ marginBottom: '12px' }}>
              <small style={{ color: 'var(--text-muted)', fontWeight: '700', display: 'block', marginBottom: '8px' }}>
                {lang === 'ru' ? 'Ключевые технологии:' : "Asosiy texnologiyalar:"}
              </small>
              <div className="about-stack-skills-wrap">
                {currentStack.skills.map((skill, sIdx) => (
                  <span key={sIdx} className="about-skill-badge">
                    {skill}
                  </span>
                ))}
              </div>
            </div>

            <div className="about-stack-projects-row">
              <strong>{lang === 'ru' ? 'Что мы создаем: ' : 'Nimalar yaratamiz: '}</strong>
              <span>{currentStack.projects}</span>
            </div>
          </div>
        </div>

        {/* 4. PRINCIPLES GRID */}
        <div className="about-principles-section" style={{ marginBottom: '36px' }}>
          <div className="about-section-head">
            <h2>{lang === 'ru' ? '🎯 Наш Подход к Обучению' : "🎯 Ta'limga Bizning Yondashuvimiz"}</h2>
            <p>
              {lang === 'ru'
                ? '4 ключевых правила, которые помогают нашим студентам уверенно становиться Junior и Middle разработчиками.'
                : "Talabalarimizga tez va sifatli natijaga erishishga yordam beradigan 4 asosiy qoida."}
            </p>
          </div>

          <div className="about-principles-grid">
            {principles.map((p, idx) => (
              <div key={idx} className="about-principle-card">
                <div className="about-principle-icon">{p.icon}</div>
                <h3>{p.title}</h3>
                <p>{p.text}</p>
              </div>
            ))}
          </div>
        </div>

        {/* 5. MENTORS */}
        <div className="about-mentors-section" style={{ marginBottom: '36px' }}>
          <div className="about-section-head">
            <h2>{lang === 'ru' ? '👨‍💻 Менторы Команды' : "👨‍💻 Jamoa Mentorlari"}</h2>
            <p>
              {lang === 'ru'
                ? 'Практикующие программисты с реальным коммерческим опытом разработки.'
                : "Haqiqiy tijoriy loyihalarda ishlovchi tajribali amaliyotchi dasturchilar."}
            </p>
          </div>

          <div className="about-mentors-grid">
            {mentors.map((m, idx) => (
              <div key={idx} className="about-mentor-card">
                <img src={m.avatar} alt={m.name} className="about-mentor-avatar" />
                <div className="about-mentor-info">
                  <h4>{m.name}</h4>
                  <span className="about-mentor-role">{m.role}</span>
                  <p className="about-mentor-bio">{m.bio}</p>
                  <div className="about-mentor-tags">
                    {m.tags.map((tag, tIdx) => (
                      <span key={tIdx} className="about-mentor-tag-pill">{tag}</span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 6. CALL TO ACTION BANNER */}
        <div className="about-cta-banner">
          <h2>
            {lang === 'ru' ? 'Готовы Стать Программистом?' : "Dasturchi Bo'lishga Tayyormisiz?"}
          </h2>
          <p>
            {lang === 'ru'
              ? 'Присоединяйтесь к CodeCraft уже сегодня и начните свой путь в IT с сильной командой поддержки.'
              : "CodeCraft jamoasiga qo'shiling va kuchli mentorlar ko'magida IT sohasidagi muvaffaqiyatli yo'lingizni boshlang."}
          </p>
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button
              type="button"
              className="btn btn-primary btn-lg"
              onClick={() => navigate(currentUser ? 'courses' : 'login')}
            >
              🚀 {lang === 'ru' ? 'Начать обучение' : "O'rganishni boshlash"}
            </button>
            <button
              type="button"
              className="btn btn-outline btn-lg"
              onClick={() => navigate('contact')}
            >
              💬 {lang === 'ru' ? 'Связаться с нами' : "Bog'lanish"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export function StaticContentPage({ slug }) {
  const { db, loc, t, submitLead, navigate, currentUser, showToast, lang } = useApp();
  const pageObj = db.pages.find((p) => p.slug === slug) || db.pages[0];
  const [contactForm, setContactForm] = useState({ name: '', phone: '+998', comment: '' });
  const [phoneError, setPhoneError] = useState('');
  const [sentSuccess, setSentSuccess] = useState(false);
  const [sending, setSending] = useState(false);
  const [lastMessage, setLastMessage] = useState('');
  const [copied, setCopied] = useState(false);

  // Phone regex: requires +998 start and 9 digits
  const PHONE_START_REGEX = /^\+998/;
  const PHONE_REGEX = /^\+998[\s-]?(\(?[0-9]{2}\)?[\s-]?[0-9]{3}[\s-]?[0-9]{2}[\s-]?[0-9]{2}|[0-9]{9})$/;

  function validatePhoneNumber(value) {
    const trimmed = (value || '').trim();
    if (!trimmed || !PHONE_START_REGEX.test(trimmed)) {
      return lang === 'ru'
        ? 'Вы должны ввести номер телефона'
        : 'Siz bu yerga telefon raqam kiritishingiz kerak';
    }
    const hasLettersOrSymbols = /[a-zA-Zа-яА-ЯёЁ!@#$%^&*_={}[\]<>]/.test(trimmed);
    const isValid = PHONE_REGEX.test(trimmed) && !hasLettersOrSymbols;
    if (!isValid) {
      return lang === 'ru'
        ? 'Вы должны ввести номер телефона'
        : 'Siz bu yerga telefon raqam kiritishingiz kerak';
    }
    return '';
  }

  async function handleContact(e) {
    e.preventDefault();
    if (!contactForm.name.trim()) return;

    const phoneValidationMsg = validatePhoneNumber(contactForm.phone);
    if (phoneValidationMsg) {
      setPhoneError(phoneValidationMsg);
      showToast(phoneValidationMsg, 'error');
      return;
    }
    setPhoneError('');

    setSending(true);

    const formattedMessage = lang === 'ru'
      ? `Здравствуйте!\nНовое обращение с платформы CodeCraft:\n👤 Имя: ${contactForm.name}\n📞 Тел: ${contactForm.phone}\n💬 Сообщение: ${contactForm.comment || "Без комментариев"}`
      : `Assalomu alaykum!\nCodeCraft platformasidan yangi murojaat:\n👤 Ism: ${contactForm.name}\n📞 Tel: ${contactForm.phone}\n💬 Xabar: ${contactForm.comment || "Izohsiz"}`;
    setLastMessage(formattedMessage);

    // 1. Submit lead to database & logs with target @Frontend_Ali
    submitLead({
      name: contactForm.name,
      phone: contactForm.phone,
      comment: contactForm.comment,
      recipient: '@Frontend_Ali'
    });

    // 2. Dispatch via backend API endpoint /api/contact
    try {
      await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: contactForm.name,
          phone: contactForm.phone,
          comment: contactForm.comment,
          recipient: '@Frontend_Ali'
        })
      });
    } catch {
      // ignore network errors
    }

    setSending(false);
    setSentSuccess(true);

    // Auto-dismiss the success notification after 3 seconds
    setTimeout(() => {
      setSentSuccess(false);
    }, 3000);

    // 3. Copy message to clipboard for instant pasting
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(formattedMessage);
      }
    } catch {
      // ignore
    }

    // 4. Open Telegram chat directly to @Frontend_Ali with pre-filled message text
    const tgUrl = `https://t.me/Frontend_Ali?text=${encodeURIComponent(formattedMessage)}`;
    window.open(tgUrl, '_blank', 'noopener,noreferrer');

    showToast(
      lang === 'ru'
        ? 'Сообщение принято! Открываем профиль Телеграм @Frontend_Ali...'
        : "Xabaringiz yuborildi! @Frontend_Ali Telegram profili ochilmoqda...",
      'success'
    );

    setContactForm({ name: '', phone: '+998', comment: '' });
  }

  if (slug === 'about') {
    return (
      <AboutPageShowcase
        lang={lang}
        navigate={navigate}
        currentUser={currentUser}
        pageObj={pageObj}
        loc={loc}
      />
    );
  }

  if (slug === 'contact') {
    return (
      <div className="section">
        <div className="container">
          <div className="catalog-header">
            <h1>📍 {t.nav.contact}</h1>
            <p>{lang === 'ru' ? 'Андижан, Асака' : 'Andijon, Asaka'}</p>
          </div>
          <div className="contact-grid">
            <div className="contact-info-card">
              <h3>{lang === 'ru' ? 'Контактная информация' : "Bog'lanish uchun ma'lumotlar"}</h3>
              <p>📍 <strong>{lang === 'ru' ? 'Адрес:' : 'Manzil:'}</strong> {lang === 'ru' ? 'Андижан, Асака' : 'Andijon, Asaka'}</p>
              <p>📞 <strong>{lang === 'ru' ? 'Телефон:' : 'Telefon:'}</strong> <a href="tel:+998951639101" style={{ color: 'inherit', textDecoration: 'none' }}>+998 95 163 91 01</a></p>
              <p>✉️ <strong>{lang === 'ru' ? 'Электронная почта:' : 'Email:'}</strong> <a href="mailto:aliabdunabiyev222@gmail.com" style={{ color: 'inherit', textDecoration: 'none' }}>aliabdunabiyev222@gmail.com</a></p>
              <p>
                💬 <strong>{lang === 'ru' ? 'Телеграм:' : 'Telegram:'}</strong>{' '}
                <a
                  href="https://t.me/Frontend_Ali"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    color: '#38bdf8',
                    fontWeight: '700',
                    textDecoration: 'none',
                    borderBottom: '1.5px dashed #38bdf8',
                    paddingBottom: '2px',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    cursor: 'pointer'
                  }}
                  title={lang === 'ru' ? 'Перейти в профиль Телеграм' : "Telegram profilga o'tish"}
                >
                  @Frontend_Ali ↗
                </a>
              </p>
              <div className="map-embed-wrap">
                <iframe
                  title="CodeCraft Asaka Map"
                  src="https://www.openstreetmap.org/export/embed.html?bbox=72.215%2C40.625%2C72.265%2C40.655&layer=mapnik"
                  loading="lazy"
                />
              </div>
            </div>

            <form className="contact-form-card" onSubmit={handleContact}>
              <h3>{lang === 'ru' ? 'Оставьте нам сообщение' : 'Bizga xabar qoldiring'}</h3>

              {sentSuccess && (
                <div
                  style={{
                    background: 'rgba(34, 197, 94, 0.15)',
                    border: '1px solid rgba(34, 197, 94, 0.4)',
                    borderRadius: '10px',
                    padding: '16px',
                    marginBottom: '18px',
                    color: '#4ade80',
                    fontSize: '0.92rem'
                  }}
                >
                  <div>
                    {lang === 'ru' ? (
                      <>✅ <strong>Ваше сообщение принято!</strong> Сообщение направлено в профиль <strong>@Frontend_Ali</strong>.</>
                    ) : (
                      <>✅ <strong>Xabaringiz qabul qilindi!</strong> Xabaringiz <strong>@Frontend_Ali</strong> profiliga yuborildi.</>
                    )}
                  </div>
                  <div style={{ marginTop: '12px', display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                    <a
                      href={`https://t.me/Frontend_Ali?text=${encodeURIComponent(lastMessage)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-sm btn-primary"
                      style={{
                        textDecoration: 'none',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        fontWeight: '600'
                      }}
                    >
                      💬 {lang === 'ru' ? 'Отправить сообщение в Телеграм @Frontend_Ali ↗' : 'Telegramda @Frontend_Ali ga xabar yuborish ↗'}
                    </a>
                    <button
                      type="button"
                      className="btn btn-sm btn-outline"
                      onClick={() => {
                        if (navigator.clipboard) {
                          navigator.clipboard.writeText(lastMessage);
                          setCopied(true);
                          setTimeout(() => setCopied(false), 2000);
                        }
                      }}
                      style={{ fontSize: '0.85rem' }}
                    >
                      {copied
                        ? (lang === 'ru' ? '✅ Скопировано!' : '✅ Nusxalandi!')
                        : (lang === 'ru' ? '📋 Скопировать сообщение' : '📋 Xabarni nusxalash')}
                    </button>
                  </div>
                </div>
              )}

              <label className="field-label">{t.home.leadName}</label>
              <input
                type="text"
                className="input"
                value={contactForm.name}
                onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                required
              />
              <label className="field-label">{t.home.leadPhone}</label>
              <input
                type="tel"
                className={`input ${phoneError ? 'input-error' : ''}`}
                style={phoneError ? { borderColor: '#ef4444', backgroundColor: 'rgba(239, 68, 68, 0.04)' } : {}}
                placeholder="+998 90 123 45 67"
                value={contactForm.phone}
                onChange={(e) => {
                  let val = e.target.value;
                  if (!PHONE_START_REGEX.test(val)) {
                    val = '+998' + val.replace(/^\+?9?9?8?/, '');
                  }
                  setContactForm({ ...contactForm, phone: val });
                  if (val !== '+998') {
                    const err = validatePhoneNumber(val);
                    setPhoneError(err);
                  } else {
                    setPhoneError('');
                  }
                }}
                onBlur={(e) => {
                  if (e.target.value !== '+998') {
                    const err = validatePhoneNumber(e.target.value);
                    setPhoneError(err);
                  }
                }}
                required
              />
              {phoneError && (
                <span
                  style={{
                    color: '#ef4444',
                    fontSize: '0.86rem',
                    marginTop: '5px',
                    marginBottom: '10px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    fontWeight: '600'
                  }}
                >
                  ⚠️ {phoneError}
                </span>
              )}
              <label className="field-label">{lang === 'ru' ? 'Ваше сообщение' : 'Xabaringiz'}</label>
              <textarea
                className="input"
                rows={4}
                value={contactForm.comment}
                onChange={(e) => setContactForm({ ...contactForm, comment: e.target.value })}
                required
              />
              <button type="submit" className="btn btn-primary btn-block" disabled={sending}>
                {sending
                  ? (lang === 'ru' ? '⏳ Отправка...' : '⏳ Yuborilmoqda...')
                  : (lang === 'ru' ? '📨 Отправить' : '📨 Yuborish')}
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="section">
      <div className="container narrow-container">
        <div className="static-doc-card">
          <h1>{loc(pageObj, 'title')}</h1>
          <div className="static-doc-body">
            {loc(pageObj, 'content')
              .split('\n')
              .map((line, i) => (
                <p key={i}>{line}</p>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
}
