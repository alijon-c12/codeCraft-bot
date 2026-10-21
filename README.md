# 🎓 EduCenter — Onlayn O'quv Markazi Platformasi

Ushbu loyiha `TZ_EduCenter.md` texnik topshirig'i asosida **React (Vite)** frontend hamda **Node.js REST API** backend arxitekturasi yordamida to'liq ishlab chiqilgan.

---

## 🚀 Ishga tushirish yo'riqnomasi

Loyiha ichida ham Frontend, ham Backend API avtomatik birga ishlaydi (`vite.config.js` ichiga ulangan `server/apiMiddleware.js` orqali):

```bash
# 1. Paketlarni tekshirish (agar kerak bo'lsa)
npm install

# 2. Frontend + Backend API ni birgalikda ishga tushirish
npm run dev
```

Alohida mustaqil Backend API serverni (`http://localhost:5000`) ishga tushirish uchun:
```bash
npm run server
```

Production build tayyorlash va tekshirish:
```bash
npm run build
npm run lint
```

---

## 🔑 Demo Hisoblar (1-klikda kirish tugmalari mavjud)

`Kirish` (`/login`) sahifasida tayyor **1-klikda kirish** tugmalari yoki quyidagi login/parollar orqali barcha rollarni sinab ko'rishingiz mumkin:

| Rol | Login (Email / Telefon) | Parol | Imkoniyatlari |
|---|---|---|---|
| **Talaba** | `student@educenter.uz` / `+998909998877` | `student123` | Kurslarni o'qish, video tezligini boshqarish, test va uy vazifasi topshirish, Payme/Click orqali xarid qilish, sertifikat olish |
| **O'qituvchi** | `teacher1@educenter.uz` / `+998902223344` | `teacher123` | Yangi kurs yaratish va tahrirlash, modul va darslar qo'shish (tartibini surish), talabalar progressini ko'rish, vazifalarni baholash |
| **Admin** | `admin@educenter.uz` / `+998901112233` | `admin123` | Dashboard & Statistika, foydalanuvchilar (rol va bloklash), kurslar, kategoriyalar, to'lovlar (CSV eksport), promo-kodlar, CMS, AuditLog |

---

## 🎟️ Sinov Promo-kodlar va Sertifikat kodi

- **Promo-kodlar** (To'lov oynasida sinab ko'rish uchun):
  - `EDUCENTER20` — **20%** chegirma
  - `START50` — **50 000 so'm** chegirma
  - `PRO30` — **30%** chegirma
- **Sertifikatni tekshirish kodi** (`Sertifikat tekshirish` sahifasi uchun):
  - `EC-2026-UX9901`

---

## 📂 Loyiha fayllari tuzilishi

- [`src/App.jsx`](file:///c:/Users/777%20comp%20service/Desktop/yakuniy%20loyham/src/App.jsx) — Asosiy marshrutizator (Router) va global qobiq
- [`src/context/AppContext.jsx`](file:///c:/Users/777%20comp%20service/Desktop/yakuniy%20loyham/src/context/AppContext.jsx) — Holat boshqaruvi, Auth, Progress, Sertifikat generatsiyasi, To'lov Webhook, Teacher va Admin funksiyalari
- [`src/messages/uz.js`](file:///c:/Users/777%20comp%20service/Desktop/yakuniy%20loyham/src/messages/uz.js) va [`src/messages/ru.js`](file:///c:/Users/777%20comp%20service/Desktop/yakuniy%20loyham/src/messages/ru.js) — O'zbek va Rus tillari lug'ati
- [`src/data/seedData.js`](file:///c:/Users/777%20comp%20service/Desktop/yakuniy%20loyham/src/data/seedData.js) — Boshlang'ich ma'lumotlar bazasi (1 admin, 1 bosh mentor (Muhammaddiyor Orifjonov), 5 kategoriya, 6 ta kurs, modullar, darslar, testlar, vazifalar)
- [`src/components/Navbar.jsx`](file:///c:/Users/777%20comp%20service/Desktop/yakuniy%20loyham/src/components/Navbar.jsx), [`src/components/Footer.jsx`](file:///c:/Users/777%20comp%20service/Desktop/yakuniy%20loyham/src/components/Footer.jsx), [`src/components/Modals.jsx`](file:///c:/Users/777%20comp%20service/Desktop/yakuniy%20loyham/src/components/Modals.jsx) — Umumiy maket va Payme/Click/Sertifikat modallari
- [`src/pages/PublicPages.jsx`](file:///c:/Users/777%20comp%20service/Desktop/yakuniy%20loyham/src/pages/PublicPages.jsx) — Ommaviy sahifalar (Bosh sahifa, Katalog, Kurs sahifasi, O'qituvchilar, Sertifikat tekshiruvi, Biz haqimizda, Aloqa)
- [`src/pages/AuthPages.jsx`](file:///c:/Users/777%20comp%20service/Desktop/yakuniy%20loyham/src/pages/AuthPages.jsx) — Kirish, Ro'yxatdan o'tish va Parolni tiklash
- [`src/pages/StudentAndLearningPages.jsx`](file:///c:/Users/777%20comp%20service/Desktop/yakuniy%20loyham/src/pages/StudentAndLearningPages.jsx) — Talaba kabineti va Dars ko'rish (Learning) interfeysi
- [`src/pages/TeacherAndAdminPages.jsx`](file:///c:/Users/777%20comp%20service/Desktop/yakuniy%20loyham/src/pages/TeacherAndAdminPages.jsx) — O'qituvchi paneli va Admin boshqaruv markazi
- [`server/apiMiddleware.js`](file:///c:/Users/777%20comp%20service/Desktop/yakuniy%20loyham/server/apiMiddleware.js) va [`server/index.js`](file:///c:/Users/777%20comp%20service/Desktop/yakuniy%20loyham/server/index.js) — Node.js Backend REST API (JWT, SHA-256 parol xeshlash, Rate Limiting, Payme/Click idempotent webhook, `server/db.json` fayl bazasi)
- [`prisma/schema.prisma`](file:///c:/Users/777%20comp%20service/Desktop/yakuniy%20loyham/prisma/schema.prisma) — PostgreSQL + Prisma ORM sxemasi
