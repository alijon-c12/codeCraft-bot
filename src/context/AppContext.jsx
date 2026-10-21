import React, { createContext, useContext, useState, useEffect } from 'react';
import { initialDatabase } from '../data/seedData.js';
import { messages } from '../messages/index.js';

const AppContext = createContext(null);

export const ADMIN_PHONE = '+998 95 163 91 01';
export const ADMIN_PHONE_NORMALIZED = '998951639101';

const STORAGE_KEY = 'educenter_db_v16';
const USER_STORAGE_KEY = 'educenter_current_user_v4';
const LANG_STORAGE_KEY = 'educenter_lang_v1';
const THEME_STORAGE_KEY = 'educenter_theme_v1';

function sanitizeDb(data) {
  if (!data) return structuredClone(initialDatabase);
  const clone = structuredClone(data);
  // Ensure categories always match the official categories (Frontend, Backend, AI & Data, UI/UX)
  clone.categories = structuredClone(initialDatabase.categories);

  if (Array.isArray(clone.courses)) {
    const validCatIds = clone.categories.map((c) => c.id);
    // Remove obsolete removed courses if present
    clone.courses = clone.courses.filter((c) => c.id !== 'crs-4' && c.id !== 'crs-6');
    clone.courses.forEach((c) => {
      if (!validCatIds.includes(c.categoryId)) {
        c.categoryId = 'cat-frontend';
      }
      c.studentsCount = (clone.enrollments || []).filter((e) => e.courseId === c.id).length;
    });
  }

  if (!Array.isArray(clone.payments)) {
    clone.payments = [];
  }
  return clone;
}

export function AppProvider({ children }) {
  const [db, setDb] = useState(() => {
    try {
      localStorage.removeItem('educenter_db_v1');
      localStorage.removeItem('educenter_db_v10');
      localStorage.removeItem('educenter_db_v11');
      localStorage.removeItem('educenter_db_v12');
      localStorage.removeItem('educenter_db_v13');
      localStorage.removeItem('educenter_db_v14');
      localStorage.removeItem('educenter_db_v15');
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) return sanitizeDb(JSON.parse(saved));
    } catch {
      // ignore storage errors
    }
    return sanitizeDb(initialDatabase);
  });

  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const saved = localStorage.getItem(USER_STORAGE_KEY) || localStorage.getItem('educenter_current_user_v3');
      if (saved) {
        const u = JSON.parse(saved);
        if ((u.phone || '').replace(/\D/g, '') === ADMIN_PHONE_NORMALIZED) {
          u.role = 'admin';
        }
        return u;
      }
    } catch {
      // ignore
    }
    return null;
  });

  const [lang, setLangState] = useState(() => {
    return localStorage.getItem(LANG_STORAGE_KEY) || 'uz';
  });

  const [theme, setTheme] = useState(() => {
    return localStorage.getItem(THEME_STORAGE_KEY) || 'light';
  });

  // Router state: { page: 'home' | 'courses' | 'courseDetail' | 'teachers' | 'teacherProfile' | 'verifyCert' | 'about' | 'contact' | 'privacy' | 'terms' | 'login' | 'register' | 'resetPassword' | 'dashboard' | 'learning' | 'teacher' | 'admin', params: {} }
  const [route, setRoute] = useState(() => ({
    page: currentUser ? 'courses' : 'home',
    params: {}
  }));
  const [checkoutCourse, setCheckoutCourse] = useState(null);
  const [previewLesson, setPreviewLesson] = useState(null);
  const [activeCertificate, setActiveCertificate] = useState(null);
  const [toast, setToast] = useState(null);

  const t = messages[lang] || messages.uz;

  function showToast(text, type = 'success') {
    setToast({ id: Date.now(), text, type });
    setTimeout(() => {
      setToast((prev) => (prev ? null : null));
    }, 4000);
  }

  // Sync initial state from Node.js backend API (/api/state) if running
  useEffect(() => {
    fetch('/api/state')
      .then((r) => (r.ok ? r.json() : null))
      .then((serverData) => {
        if (serverData && serverData.courses && serverData.courses.length > 0) {
          const clean = sanitizeDb(serverData);
          setDb(clean);
          localStorage.setItem(STORAGE_KEY, JSON.stringify(clean));
        }
      })
      .catch(() => {
        // Offline or static mode fallback
      });
  }, []);

  // Persist DB changes to localStorage and Node backend (/api/sync)
  function updateDb(updater, auditInfo = null) {
    setDb((prev) => {
      const next = typeof updater === 'function' ? updater(structuredClone(prev)) : updater;
      if (Array.isArray(next.courses)) {
        next.courses.forEach((c) => {
          c.studentsCount = (next.enrollments || []).filter((e) => e.courseId === c.id).length;
        });
      }
      if (auditInfo && currentUser) {
        next.auditLogs = [
          {
            id: `aud-${Date.now()}`,
            userId: currentUser.id,
            userName: currentUser.name,
            action: auditInfo.action,
            details: auditInfo.details,
            createdAt: new Date().toISOString()
          },
          ...(next.auditLogs || [])
        ];
      }
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      } catch {
        // ignore
      }
      fetch('/api/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ db: next })
      }).catch(() => {});
      return next;
    });
  }

  function setLang(nextLang) {
    setLangState(nextLang);
    localStorage.setItem(LANG_STORAGE_KEY, nextLang);
    document.documentElement.lang = nextLang;
  }

  function toggleTheme() {
    const next = theme === 'light' ? 'dark' : 'light';
    setTheme(next);
    localStorage.setItem(THEME_STORAGE_KEY, next);
  }

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  // Dynamic SEO title updater per page (Step 5 TZ requirement)
  useEffect(() => {
    const pageTitles = {
      home: `EduCenter — ${t.brand.tagline}`,
      courses: `${t.catalog.title} | EduCenter`,
      teachers: `${t.nav.teachers} | EduCenter`,
      verifyCert: `${t.nav.verifyCert} | EduCenter`,
      about: `${t.nav.about} | EduCenter`,
      contact: `${t.nav.contact} | EduCenter`,
      dashboard: `${t.dashboard.title} | EduCenter`,
      teacher: `${t.teacherPanel.title} | EduCenter`,
      admin: `${t.adminPanel.title} | EduCenter`,
      login: `${t.auth.loginTitle} | EduCenter`,
      register: `${t.auth.registerTitle} | EduCenter`
    };
    document.title = pageTitles[route.page] || 'EduCenter — Onlayn Ta\'lim Platformasi';
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [route.page, lang]);

  // Role-based route middleware protection (Step 3 TZ requirement)
  function navigate(page, params = {}) {
    if (currentUser && ['home', 'teachers', 'teacherProfile', 'about', 'contact', 'login', 'register'].includes(page)) {
      return setRoute({ page: 'courses', params: {} });
    }
    if (page === 'admin') {
      if (!currentUser) {
        showToast(t.auth.loginSub, 'error');
        return setRoute({ page: 'login', params: { redirect: 'admin' } });
      }
      if (currentUser.role !== 'admin') {
        showToast('Faqat administratorlar uchun ruxsat berilgan!', 'error');
        return setRoute({ page: 'courses', params: {} });
      }
    }
    if (page === 'teacher') {
      if (!currentUser) {
        showToast(t.auth.loginSub, 'error');
        return setRoute({ page: 'login', params: { redirect: 'teacher' } });
      }
      if (currentUser.role !== 'teacher' && currentUser.role !== 'admin') {
        showToast("Faqat o'qituvchilar uchun ruxsat berilgan!", 'error');
        return setRoute({ page: 'courses', params: {} });
      }
    }
    if (page === 'dashboard' || page === 'learning') {
      if (!currentUser) {
        showToast(t.auth.loginSub, 'error');
        return setRoute({ page: 'login', params: { redirect: page, ...params } });
      }
    }
    if (page === 'courses' || page === 'courseDetail') {
      if (!currentUser) {
        return setRoute({ page: 'login', params: { redirect: page, ...params } });
      }
    }
    setRoute({ page, params });
  }

  function loc(item, field) {
    if (!item) return '';
    const key = `${field}${lang === 'ru' ? 'Ru' : 'Uz'}`;
    return item[key] || item[`${field}Uz`] || item[field] || '';
  }

  function formatPrice(amount) {
    if (amount === 0) return t.brand.free;
    const formatted = Number(amount || 0)
      .toString()
      .replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
    return `${formatted} ${t.brand.currency}`;
  }

  // AUTHENTICATION
  function login(identifier, password) {
    const clean = (identifier || '').trim().toLowerCase();
    const user = db.users.find(
      (u) =>
        (u.email && u.email.toLowerCase() === clean) ||
        (u.phone && u.phone.replace(/\s+/g, '') === clean.replace(/\s+/g, ''))
    );
    if (!user || (user.passwordHash && user.passwordHash !== password && !user.passwordHash.endsWith(password))) {
      // Also check default demo passwords
      const validDemo =
        (user?.role === 'admin' && password === 'admin123') ||
        (user?.role === 'teacher' && password === 'teacher123') ||
        (user?.role === 'student' && password === 'student123');
      if (!user || !validDemo) {
        return { ok: false, error: t.auth.errors.invalidCreds };
      }
    }
    if (user.blocked) {
      return { ok: false, error: t.auth.errors.userBlocked || "Sizning hisobingiz admin tomonidan bloklangan!" };
    }
    // Only +998 95 163 91 01 can have admin privileges
    if (user.role === 'admin' && (user.phone || '').replace(/\D/g, '') !== ADMIN_PHONE_NORMALIZED) {
      user.role = 'student';
    }
    setCurrentUser(user);
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
    showToast(`${ user.name } — Xush kelibsiz!`, 'success');

    const targetRedirect = route.params?.redirect || (user.role === 'admin' ? 'admin' : 'courses');
    setRoute({ page: targetRedirect, params: route.params || {} });
    return { ok: true, user };
  }

  function loginWithPhone({ name, phone, user: apiUser }) {
    const cleanPhone = (phone || '').trim();
    const cleanName = (name || '').trim();
    const normalizedDigits = cleanPhone.replace(/\D/g, '');
    const isAdminNumber = normalizedDigits === ADMIN_PHONE_NORMALIZED;

    // 1. If backend already verified and returned user object
    let user = apiUser || db.users.find(
      (u) =>
        (u.phone && u.phone.replace(/\D/g, '') === normalizedDigits) ||
        (cleanName && u.name.toLowerCase() === cleanName.toLowerCase())
    );

    if (user) {
      if (user.blocked) {
        return { ok: false, error: t.auth.errors.userBlocked || "Sizning hisobingiz admin tomonidan bloklangan! Qayta tiklash uchun ma'muriyat bilan bog'laning." };
      }
      if (isAdminNumber) {
        user = {
          ...user,
          role: 'admin',
          phone: cleanPhone || user.phone,
          name: cleanName || user.name || 'Alibek Abdunabiyev (Bosh Admin)'
        };
      } else if (user.role === 'admin') {
        user = { ...user, role: 'student' };
      }
      if (cleanName && user.name !== cleanName) {
        user = { ...user, name: cleanName, phone: cleanPhone || user.phone };
      }
      setDb((prev) => ({
        ...prev,
        users: prev.users.map((u) => (u.id === user.id ? user : u))
      }));
    } else {
      // 2. Register new user
      user = {
        id: isAdminNumber ? 'usr-admin-1' : `usr-${Date.now()}`,
        name: cleanName || (isAdminNumber ? 'Alibek Abdunabiyev (Bosh Admin)' : 'Foydalanuvchi'),
        email: isAdminNumber ? 'admin@codecraft.uz' : '',
        phone: cleanPhone,
        passwordHash: 'sms_verified',
        role: isAdminNumber ? 'admin' : 'student',
        avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&auto=format&fit=crop&q=80',
        bioUz: isAdminNumber ? 'CodeCraft platformasi bosh administratori va tizim to\'liq nazoratchisi' : 'CodeCraft platformasi talabasi',
        bioRu: isAdminNumber ? 'Главный администратор платформы CodeCraft' : 'Студент платформы CodeCraft',
        specialtyUz: isAdminNumber ? 'Bosh Boshqaruvchi' : 'Talaba',
        specialtyRu: isAdminNumber ? 'Главный Администратор' : 'Студент',
        blocked: false,
        createdAt: new Date().toISOString()
      };
      setDb((prev) => ({
        ...prev,
        users: [...prev.users, user],
        notificationLogs: [
          {
            id: `nlog-${Date.now()}`,
            channel: 'SMS_GATEWAY',
            recipient: cleanPhone,
            message: `Xush kelibsiz! CodeCraft platformasiga muvaffaqiyatli kirdingiz (${user.name}).`,
            createdAt: new Date().toISOString()
          },
          ...(prev.notificationLogs || [])
        ]
      }));
    }

    setCurrentUser(user);
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
    showToast(
      lang === 'ru'
        ? `Добро пожаловать, ${user.name}!`
        : `${user.name} — Xush kelibsiz!`,
      'success'
    );

    const targetRedirect = route.params?.redirect || (user.role === 'admin' ? 'admin' : 'courses');
    setRoute({ page: targetRedirect, params: route.params || {} });
    return { ok: true, user };
  }

  function quickDemoLogin(role) {
    let user;
    if (role === 'admin') {
      user = db.users.find((u) => (u.phone || '').replace(/\D/g, '') === ADMIN_PHONE_NORMALIZED && !u.blocked) ||
             db.users.find((u) => u.role === 'admin' && !u.blocked);
    } else {
      user = db.users.find((u) => u.role === role && !u.blocked);
    }
    if (user) {
      setCurrentUser(user);
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
      showToast(`${user.name} (${role.toUpperCase()}) sifatida tizimga kirdingiz`, 'success');
      const targetRedirect = route.params?.redirect || (role === 'admin' ? 'admin' : 'courses');
      setRoute({ page: targetRedirect, params: route.params || {} });
    }
  }

  // Active block enforcement: log out user immediately if admin blocked them
  useEffect(() => {
    if (currentUser) {
      const fresh = db.users.find((u) => u.id === currentUser.id);
      if (fresh && fresh.blocked) {
        logout();
        showToast(
          lang === 'ru'
            ? 'Ваш аккаунт заблокирован администратором!'
            : 'Sizning hisobingiz admin tomonidan bloklandi!',
          'error'
        );
      }
    }
  }, [db.users, currentUser]);

  function register({ name, identifier, password }) {
    const clean = identifier.trim();
    const isEmail = clean.includes('@');
    const exists = db.users.some(
      (u) =>
        (isEmail && u.email?.toLowerCase() === clean.toLowerCase()) ||
        (!isEmail && u.phone?.replace(/\s+/g, '') === clean.replace(/\s+/g, ''))
    );
    if (exists) {
      return { ok: false, error: t.auth.errors.userExists };
    }
    const newUser = {
      id: `usr-${Date.now()}`,
      name: name.trim(),
      email: isEmail ? clean : '',
      phone: !isEmail ? clean : '+998900000000',
      passwordHash: password,
      role: 'student',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&auto=format&fit=crop&q=80',
      bioUz: 'EduCenter platformasi talabasi',
      bioRu: 'Студент платформы EduCenter',
      specialtyUz: 'Talaba',
      specialtyRu: 'Студент',
      blocked: false,
      createdAt: new Date().toISOString()
    };
    updateDb((draft) => {
      draft.users.push(newUser);
      draft.notifications.unshift({
        id: `notif-${Date.now()}`,
        userId: newUser.id,
        textUz: `Xush kelibsiz, ${newUser.name}! EduCenter platformasida muvaffaqiyatli ro'yxatdan o'tdingiz.`,
        textRu: `Добро пожаловать, ${newUser.name}! Вы успешно зарегистрировались на платформе EduCenter.`,
        read: false,
        createdAt: new Date().toISOString()
      });
      return draft;
    });
    setCurrentUser(newUser);
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(newUser));
    showToast(`${newUser.name}, muvaffaqiyatli ro'yxatdan o'tdingiz!`, 'success');
    const targetRedirect = route.params?.redirect || 'courses';
    setRoute({ page: targetRedirect, params: route.params || {} });
    return { ok: true, user: newUser };
  }

  function resetPassword({ identifier, newPassword }) {
    const clean = identifier.trim().toLowerCase();
    const target = db.users.find(
      (u) => u.email?.toLowerCase() === clean || u.phone?.replace(/\s+/g, '') === clean.replace(/\s+/g, '')
    );
    if (!target) {
      return { ok: false, error: t.auth.errors.invalidCreds };
    }
    updateDb((draft) => {
      const u = draft.users.find((x) => x.id === target.id);
      if (u) u.passwordHash = newPassword;
      return draft;
    });
    showToast('Parol muvaffaqiyatli yangilandi! Endi tizimga kirishingiz mumkin.', 'success');
    setRoute({ page: 'login', params: {} });
    return { ok: true };
  }

  function logout() {
    setCurrentUser(null);
    localStorage.removeItem(USER_STORAGE_KEY);
    showToast(lang === 'ru' ? 'Вы вышли из системы' : 'Tizimdan chiqdingiz', 'info');
    setRoute({ page: 'home', params: {} });
  }

  function updateProfile(updates) {
    if (!currentUser) return;
    const updatedUser = { ...currentUser, ...updates };
    setCurrentUser(updatedUser);
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(updatedUser));
    updateDb((draft) => {
      const idx = draft.users.findIndex((u) => u.id === currentUser.id);
      if (idx !== -1) draft.users[idx] = { ...draft.users[idx], ...updates };
      return draft;
    });
    showToast(t.dashboard.profileSaved, 'success');
  }

  // ENROLLMENT & PROGRESS HELPERS
  function isEnrolled(userId, courseId) {
    if (!userId || !courseId) return false;
    return db.enrollments.some((e) => e.userId === userId && e.courseId === courseId);
  }

  function getCourseLessons(courseId) {
    const modIds = db.modules
      .filter((m) => m.courseId === courseId)
      .sort((a, b) => a.order - b.order)
      .map((m) => m.id);
    return db.lessons
      .filter((l) => modIds.includes(l.moduleId))
      .sort((a, b) => a.order - b.order);
  }

  function getCourseProgress(userId, courseId) {
    if (!userId || !courseId) return 0;
    const lessons = getCourseLessons(courseId);
    if (lessons.length === 0) return 0;
    const completedCount = lessons.filter((l) =>
      db.lessonProgress.some((lp) => lp.userId === userId && lp.lessonId === l.id && lp.completed)
    ).length;
    return Math.round((completedCount / lessons.length) * 100);
  }

  function canAccessLesson(user, lesson, courseId) {
    if (!lesson) return false;
    if (lesson.isFree) return true;
    if (!user) return false;
    if (user.role === 'admin') return true;
    const course = db.courses.find((c) => c.id === courseId);
    if (user.role === 'teacher' && course?.teacherId === user.id) return true;
    return isEnrolled(user.id, courseId);
  }

  function toggleLessonComplete(lessonId, courseId) {
    if (!currentUser) return;
    updateDb((draft) => {
      const existing = draft.lessonProgress.find(
        (lp) => lp.userId === currentUser.id && lp.lessonId === lessonId
      );
      if (existing) {
        existing.completed = !existing.completed;
        existing.updatedAt = new Date().toISOString();
      } else {
        draft.lessonProgress.push({
          id: `lp-${Date.now()}`,
          userId: currentUser.id,
          lessonId,
          completed: true,
          updatedAt: new Date().toISOString()
        });
      }

      // Recalculate progress to see if course is 100% completed -> auto-issue Certificate (Step 12 TZ)
      const modIds = draft.modules.filter((m) => m.courseId === courseId).map((m) => m.id);
      const courseLessons = draft.lessons.filter((l) => modIds.includes(l.moduleId));
      const completedAll =
        courseLessons.length > 0 &&
        courseLessons.every((l) =>
          draft.lessonProgress.some(
            (lp) => lp.userId === currentUser.id && lp.lessonId === l.id && lp.completed
          )
        );

      if (completedAll) {
        const enr = draft.enrollments.find(
          (e) => e.userId === currentUser.id && e.courseId === courseId
        );
        if (enr) enr.status = 'completed';

        const hasCert = draft.certificates.some(
          (c) => c.userId === currentUser.id && c.courseId === courseId
        );
        if (!hasCert) {
          const course = draft.courses.find((c) => c.id === courseId);
          const randomCode = `EC-2026-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
          const newCert = {
            id: `cert-${Date.now()}`,
            userId: currentUser.id,
            courseId,
            code: randomCode,
            issuedAt: new Date().toISOString()
          };
          draft.certificates.unshift(newCert);
          draft.notifications.unshift({
            id: `notif-${Date.now()}`,
            userId: currentUser.id,
            textUz: `🎉 Tabriklaymiz! Siz "${course?.titleUz}" kursini 100% tugatdingiz! Sertifikat kodi: ${randomCode}`,
            textRu: `🎉 Поздравляем! Вы завершили курс "${course?.titleRu}" на 100%! Код сертификата: ${randomCode}`,
            read: false,
            createdAt: new Date().toISOString()
          });
          draft.notificationLogs.unshift({
            id: `nlog-${Date.now()}`,
            channel: 'EMAIL_SMTP',
            recipient: currentUser.email || currentUser.phone,
            message: `🎓 Yangi PDF Sertifikat yaratildi: ${randomCode} (${course?.titleUz})`,
            createdAt: new Date().toISOString()
          });
          setTimeout(() => {
            showToast(`🎉 Kurs 100% yakunlandi! Sertifikat (${randomCode}) yaratildi!`, 'success');
          }, 200);
        }
      }
      return draft;
    });
  }

  // QUIZ & HOMEWORK
  function submitQuizAttempt(quizId, score, passed) {
    if (!currentUser) return;
    updateDb((draft) => {
      draft.quizAttempts.unshift({
        id: `qa-${Date.now()}`,
        quizId,
        userId: currentUser.id,
        score,
        passed,
        createdAt: new Date().toISOString()
      });
      return draft;
    });
    showToast(passed ? t.learning.quizPassed : t.learning.quizFailed, passed ? 'success' : 'error');
  }

  function submitAssignment({ assignmentId, answerText, fileName, fileData }) {
    if (!currentUser) return;
    updateDb((draft) => {
      const existingIdx = draft.submissions.findIndex(
        (s) => s.assignmentId === assignmentId && s.userId === currentUser.id
      );
      const payload = {
        id: existingIdx !== -1 ? draft.submissions[existingIdx].id : `sub-${Date.now()}`,
        assignmentId,
        userId: currentUser.id,
        answerText: answerText || '',
        fileName: fileName || '',
        fileData: fileData || '',
        score: null,
        teacherComment: '',
        status: 'pending',
        createdAt: new Date().toISOString()
      };
      if (existingIdx !== -1) draft.submissions[existingIdx] = payload;
      else draft.submissions.unshift(payload);
      return draft;
    });
    showToast(
      lang === 'ru'
        ? 'Домашнее задание отправлено на проверку!'
        : 'Uy vazifasi tekshiruv uchun yuborildi!',
      'success'
    );
  }

  // Admin gives a personal homework task to a specific student
  function adminAssignHomework({ studentId, title, description }) {
    if (!studentId || !title.trim()) return false;
    const id = `asg-${Date.now()}`;
    updateDb(
      (draft) => {
        draft.assignments.unshift({
          id,
          studentId,
          lessonId: null,
          courseId: null,
          titleUz: title.trim(),
          titleRu: title.trim(),
          descriptionUz: description.trim(),
          descriptionRu: description.trim(),
          maxScore: 100,
          createdAt: new Date().toISOString()
        });
        draft.notifications.unshift({
          id: `notif-${Date.now()}`,
          userId: studentId,
          textUz: `📝 Sizga yangi uy vazifasi berildi: "${title.trim()}"`,
          textRu: `📝 Вам назначено новое домашнее задание: "${title.trim()}"`,
          read: false,
          createdAt: new Date().toISOString()
        });
        return draft;
      },
      { action: 'HOMEWORK_ASSIGNED', details: `Talabaga (${studentId}) vazifa berildi: ${title.trim()}` }
    );
    showToast(
      lang === 'ru' ? 'Задание выдано студенту!' : 'Vazifa talabaga berildi!',
      'success'
    );
    return true;
  }

  // PAYMENTS & PROMO CODES (Step 9)
  function validatePromoCode(code, basePrice) {
    const clean = (code || '').trim().toUpperCase();
    if (!clean) return { valid: false, discountAmount: 0, finalPrice: basePrice };
    const promo = db.promoCodes.find(
      (p) =>
        p.code.toUpperCase() === clean &&
        p.active &&
        p.usedCount < p.maxUses &&
        new Date(p.expiresAt) > new Date()
    );
    if (!promo) return { valid: false, discountAmount: 0, finalPrice: basePrice };
    const discountAmount =
      promo.discountType === 'percent'
        ? Math.round((basePrice * promo.discountValue) / 100)
        : Math.min(basePrice, promo.discountValue);
    return {
      valid: true,
      promo,
      discountAmount,
      finalPrice: Math.max(0, basePrice - discountAmount)
    };
  }

  function createPendingPayment({ courseId, provider, promoCode }) {
    if (!currentUser) return null;
    const course = db.courses.find((c) => c.id === courseId);
    if (!course) return null;
    const basePrice = course.discountPrice || course.price;
    const promoCheck = validatePromoCode(promoCode, basePrice);
    const payment = {
      id: `pay-${Date.now()}`,
      userId: currentUser.id,
      courseId,
      amount: promoCheck.finalPrice,
      originalAmount: basePrice,
      promoCode: promoCheck.valid ? promoCheck.promo.code : null,
      provider: provider || 'payme',
      status: 'pending',
      transactionId: `${(provider || 'payme').toUpperCase()}-TX-${Math.floor(10000000 + Math.random() * 90000000)}`,
      createdAt: new Date().toISOString()
    };
    updateDb((draft) => {
      draft.payments.unshift(payment);
      return draft;
    });
    return payment;
  }

  function processPaymentWebhook(paymentId, status = 'paid') {
    let wasIdempotent = false;
    updateDb((draft) => {
      const payment = draft.payments.find((p) => p.id === paymentId);
      if (!payment) return draft;

      // Idempotency check (Step 9 acceptance criteria)
      if (payment.status === 'paid') {
        wasIdempotent = true;
        return draft;
      }

      payment.status = status;
      if (status === 'paid') {
        const alreadyEnrolled = draft.enrollments.some(
          (e) => e.userId === payment.userId && e.courseId === payment.courseId
        );
        if (!alreadyEnrolled) {
          draft.enrollments.unshift({
            id: `enr-${Date.now()}`,
            userId: payment.userId,
            courseId: payment.courseId,
            status: 'active',
            createdAt: new Date().toISOString()
          });
        }
        const course = draft.courses.find((c) => c.id === payment.courseId);
        if (course) course.studentsCount = (course.studentsCount || 0) + 1;

        if (payment.promoCode) {
          const promo = draft.promoCodes.find((p) => p.code === payment.promoCode);
          if (promo) promo.usedCount += 1;
        }

        draft.notifications.unshift({
          id: `notif-${Date.now()}`,
          userId: payment.userId,
          textUz: `✅ To'lov muvaffaqiyatli! "${course?.titleUz}" kursi shaxsiy kabinetingizda ochildi. Chek: ${payment.transactionId}`,
          textRu: `✅ Оплата прошла успешно! Курс "${course?.titleRu}" открыт в вашем личном кабинете. Чек: ${payment.transactionId}`,
          read: false,
          createdAt: new Date().toISOString()
        });

        draft.notificationLogs.unshift({
          id: `nlog-${Date.now()}`,
          channel: 'TELEGRAM_BOT',
          recipient: 'Admin Chat (-1001234567890)',
          message: `💰 Yangi to'lov (${payment.provider.toUpperCase()}): ${payment.amount} so'm | Tranzaksiya: ${payment.transactionId}`,
          createdAt: new Date().toISOString()
        });
      }
      return draft;
    });

    if (status === 'paid' && !wasIdempotent) {
      showToast(t.payment.paymentSuccess, 'success');
    } else if (status === 'cancelled') {
      showToast("To'lov bekor qilindi", 'error');
    }
  }

  function adminConfirmPayment(paymentId) {
    if (!currentUser || currentUser.role !== 'admin') return;
    updateDb((draft) => {
      const payment = (draft.payments || []).find((p) => p.id === paymentId);
      if (!payment) return draft;

      payment.status = 'paid';
      const alreadyEnrolled = (draft.enrollments || []).some(
        (e) => e.userId === payment.userId && e.courseId === payment.courseId
      );
      if (!alreadyEnrolled) {
        draft.enrollments = draft.enrollments || [];
        draft.enrollments.unshift({
          id: `enr-${Date.now()}`,
          userId: payment.userId,
          courseId: payment.courseId,
          status: 'active',
          createdAt: new Date().toISOString()
        });
      }
      const course = (draft.courses || []).find((c) => c.id === payment.courseId);
      if (course) {
        course.studentsCount = (draft.enrollments || []).filter((e) => e.courseId === course.id).length;
      }
      if (payment.promoCode) {
        const promo = (draft.promoCodes || []).find((p) => p.code === payment.promoCode);
        if (promo) promo.usedCount = (promo.usedCount || 0) + 1;
      }

      draft.notifications = draft.notifications || [];
      draft.notifications.unshift({
        id: `notif-${Date.now()}`,
        userId: payment.userId,
        textUz: `✅ To'lov admin tomonidan tasdiqlandi! "${course?.titleUz || 'Kurs'}" kursi ochildi.`,
        textRu: `✅ Оплата подтверждена администратором! Курс "${course?.titleRu || 'Курс'}" открыт.`,
        read: false,
        createdAt: new Date().toISOString()
      });
      return draft;
    }, { action: 'ADMIN_PAYMENT_CONFIRMED', details: `Admin to'lovni tasdiqladi: ${paymentId}` });

    showToast("To'lov tasdiqlandi va talabaga kurs ochildi!", 'success');
  }

  function adminCancelPayment(paymentId) {
    if (!currentUser || currentUser.role !== 'admin') return;
    updateDb((draft) => {
      const payment = (draft.payments || []).find((p) => p.id === paymentId);
      if (!payment) return draft;
      payment.status = 'cancelled';
      return draft;
    }, { action: 'ADMIN_PAYMENT_CANCELLED', details: `Admin to'lovni bekor qildi: ${paymentId}` });
    showToast("To'lov bekor qilindi!", 'info');
  }

  function adminUpdatePayment(paymentId, updates) {
    if (!currentUser || currentUser.role !== 'admin') return;
    updateDb((draft) => {
      const payment = (draft.payments || []).find((p) => p.id === paymentId);
      if (!payment) return draft;
      const prevStatus = payment.status;
      if (updates.amount !== undefined) payment.amount = Number(updates.amount) || payment.amount;
      if (updates.provider !== undefined) payment.provider = updates.provider;
      if (updates.status !== undefined) payment.status = updates.status;

      if (updates.status === 'paid' && prevStatus !== 'paid') {
        const alreadyEnrolled = (draft.enrollments || []).some(
          (e) => e.userId === payment.userId && e.courseId === payment.courseId
        );
        if (!alreadyEnrolled) {
          draft.enrollments = draft.enrollments || [];
          draft.enrollments.unshift({
            id: `enr-${Date.now()}`,
            userId: payment.userId,
            courseId: payment.courseId,
            status: 'active',
            createdAt: new Date().toISOString()
          });
        }
        const course = (draft.courses || []).find((c) => c.id === payment.courseId);
        if (course) {
          course.studentsCount = (draft.enrollments || []).filter((e) => e.courseId === course.id).length;
        }
      }
      return draft;
    }, { action: 'ADMIN_PAYMENT_UPDATED', details: `To'lov yangilandi: ${paymentId}` });
    showToast("To'lov ma'lumotlari yangilandi!", 'success');
  }

  function adminDeletePayment(paymentId) {
    if (!currentUser || currentUser.role !== 'admin') return;
    updateDb((draft) => {
      draft.payments = (draft.payments || []).filter((p) => p.id !== paymentId);
      return draft;
    }, { action: 'ADMIN_PAYMENT_DELETED', details: `To'lov o'chirildi: ${paymentId}` });
    showToast("To'lov yozuvi o'chirildi!", 'success');
  }

  // REVIEWS & LEADS
  function addReview({ courseId, rating, comment }) {
    if (!currentUser) return;
    if (!isEnrolled(currentUser.id, courseId)) {
      showToast(t.courseDetail.onlyEnrolledCanReview, 'error');
      return;
    }
    updateDb((draft) => {
      draft.reviews.unshift({
        id: `rev-${Date.now()}`,
        userId: currentUser.id,
        userName: currentUser.name,
        userAvatar: currentUser.avatar,
        courseId,
        rating: Number(rating),
        comment,
        status: 'approved',
        createdAt: new Date().toISOString()
      });
      return draft;
    });
    showToast('Sharhingiz uchun rahmat!', 'success');
  }

  function submitLead({ name, phone, comment, recipient = '@Frontend_Ali' }) {
    updateDb((draft) => {
      draft.leads.unshift({
        id: `lead-${Date.now()}`,
        name,
        phone,
        comment: comment || '',
        status: 'new',
        createdAt: new Date().toISOString()
      });
      draft.notificationLogs.unshift({
        id: `nlog-${Date.now()}`,
        channel: 'TELEGRAM',
        recipient,
        message: `📨 Yangi xabar: ${name} (${phone}) — ${comment || 'Izohsiz'}`,
        createdAt: new Date().toISOString()
      });
      return draft;
    });

    try {
      fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, phone, comment, recipient })
      }).catch(() => {});
    } catch {
      // ignore
    }

    showToast(t.home.leadSuccess, 'success');
  }

  function markNotificationsRead() {
    if (!currentUser) return;
    updateDb((draft) => {
      draft.notifications.forEach((n) => {
        if (n.userId === currentUser.id) n.read = true;
      });
      return draft;
    });
  }

  // TEACHER PANEL ACTIONS (Step 10)
  function saveCourse(courseData) {
    if (!currentUser) return null;
    let savedId = courseData.id;
    updateDb(
      (draft) => {
        if (courseData.id) {
          const idx = draft.courses.findIndex((c) => c.id === courseData.id);
          if (idx !== -1) {
            // Ownership check: teacher can only edit their own course
            if (
              currentUser.role === 'teacher' &&
              draft.courses[idx].teacherId !== currentUser.id
            ) {
              showToast("Siz boshqa o'qituvchining kursini tahrirlay olmaysiz!", 'error');
              return draft;
            }
            draft.courses[idx] = {
              ...draft.courses[idx],
              ...courseData,
              discountPrice: null,
              status: 'published'
            };
          }
        } else {
          savedId = `crs-${Date.now()}`;
          const newCourse = {
            id: savedId,
            titleUz: courseData.titleUz,
            titleRu: courseData.titleRu || courseData.titleUz,
            slug: courseData.titleUz.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
            descriptionUz: courseData.descriptionUz,
            descriptionRu: courseData.descriptionRu || courseData.descriptionUz,
            price: Number(courseData.price) || 1200000,
            discountPrice: null,
            thumbnail:
              courseData.thumbnail ||
              'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&auto=format&fit=crop&q=80',
            videoUrl: courseData.videoUrl || '',
            videoName: courseData.videoName || '',
            videoId: courseData.videoId || '',
            level: courseData.level || 'beginner',
            language: courseData.language || "O'zbek / Русский",
            status: 'published',
            teacherId: currentUser.role === 'teacher' ? currentUser.id : courseData.teacherId || 'usr-teacher-1',
            categoryId: courseData.categoryId || 'cat-frontend',
            durationHours: Number(courseData.durationHours) || 40,
            studentsCount: 0,
            rating: 5.0,
            createdAt: new Date().toISOString()
          };
          draft.courses.unshift(newCourse);

          // Automatically create starter module & lesson for the new course
          const modId = `mod-${Date.now()}`;
          draft.modules.push({
            id: modId,
            courseId: savedId,
            titleUz: '1-modul: Darslar va Amaliyot',
            titleRu: 'Модуль 1: Уроки и практика',
            order: 1
          });
          draft.lessons.push({
            id: `les-${Date.now()}`,
            moduleId: modId,
            titleUz: courseData.videoName ? `1.1. ${courseData.titleUz} (Video dars)` : '1.1. Kurs bilan tanishuv',
            titleRu: courseData.videoName ? `1.1. ${courseData.titleRu || courseData.titleUz} (Видео урок)` : '1.1. Знакомство с курсом',
            type: courseData.videoUrl || courseData.videoId ? 'video' : 'text',
            videoUrl: courseData.videoUrl || '',
            videoName: courseData.videoName || '',
            videoId: courseData.videoId || '',
            contentUz: courseData.descriptionUz,
            contentRu: courseData.descriptionRu || courseData.descriptionUz,
            duration: 20,
            order: 1,
            isFree: true,
            attachmentName: 'Kurs_Dasturi.pdf',
            attachmentUrl: '#download'
          });
        }
        return draft;
      },
      {
        action: courseData.id ? 'COURSE_UPDATED' : 'COURSE_CREATED',
        details: `Kurs saqlandi: ${courseData.titleUz}`
      }
    );
    showToast('Kurs muvaffaqiyatli saqlandi!', 'success');
    return savedId;
  }

  function addModule({ courseId, titleUz, titleRu }) {
    updateDb((draft) => {
      const count = draft.modules.filter((m) => m.courseId === courseId).length;
      draft.modules.push({
        id: `mod-${Date.now()}`,
        courseId,
        titleUz,
        titleRu: titleRu || titleUz,
        order: count + 1
      });
      return draft;
    });
    showToast("Yangi modul qo'shildi!", 'success');
  }

  function addLesson(lessonData) {
    if (lessonData.courseId && !lessonData.moduleId) {
      return addLessonToCourse(lessonData);
    }
    updateDb((draft) => {
      const count = draft.lessons.filter((l) => l.moduleId === lessonData.moduleId).length;
      draft.lessons.push({
        id: `les-${Date.now()}`,
        moduleId: lessonData.moduleId,
        titleUz: lessonData.titleUz,
        titleRu: lessonData.titleRu || lessonData.titleUz,
        type: lessonData.videoUrl || lessonData.videoId ? 'video' : lessonData.type || 'text',
        videoUrl: lessonData.videoUrl || '',
        videoName: lessonData.videoName || '',
        videoId: lessonData.videoId || '',
        contentUz: lessonData.contentUz || '',
        contentRu: lessonData.contentRu || lessonData.contentUz || '',
        duration: Number(lessonData.duration) || 20,
        order: count + 1,
        isFree: Boolean(lessonData.isFree),
        attachmentName: lessonData.attachmentName || 'Dars_Materiali.pdf',
        attachmentUrl: '#download'
      });
      return draft;
    });
    showToast("Yangi dars qo'shildi!", 'success');
  }

  function addLessonToCourse({
    courseId,
    titleUz,
    titleRu,
    contentUz,
    contentRu,
    videoUrl,
    videoName,
    videoId,
    duration = 20,
    isFree = false,
    attachmentName = 'Dars_Materiali.pdf'
  }) {
    if (!courseId || !titleUz?.trim()) return;
    updateDb((draft) => {
      let mod = draft.modules.find((m) => m.courseId === courseId);
      if (!mod) {
        mod = {
          id: `mod-${Date.now()}`,
          courseId,
          titleUz: 'Darslar',
          titleRu: 'Уроки',
          order: 1
        };
        draft.modules.push(mod);
      }

      const existingLessons = draft.lessons.filter((l) => l.moduleId === mod.id);
      draft.lessons.push({
        id: `les-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        moduleId: mod.id,
        titleUz: titleUz.trim(),
        titleRu: (titleRu || titleUz).trim(),
        type: videoUrl || videoId ? 'video' : 'text',
        videoUrl: videoUrl || '',
        videoName: videoName || '',
        videoId: videoId || '',
        contentUz: contentUz || '',
        contentRu: contentRu || contentUz || '',
        duration: Number(duration) || 20,
        order: existingLessons.length + 1,
        isFree: Boolean(isFree),
        attachmentName: attachmentName || 'Dars_Materiali.pdf',
        attachmentUrl: '#download'
      });
      return draft;
    });
    showToast(lang === 'ru' ? 'Урок успешно добавлен!' : "Dars muvaffaqiyatli qo'shildi!", 'success');
  }

  function deleteLesson(lessonId) {
    if (!lessonId) return;
    updateDb((draft) => {
      draft.lessons = draft.lessons.filter((l) => l.id !== lessonId);
      return draft;
    });
    showToast(lang === 'ru' ? 'Урок удален' : "Dars o'chirildi", 'info');
  }

  function deleteCourse(courseId) {
    if (!courseId) return;
    updateDb((draft) => {
      draft.courses = draft.courses.filter((c) => c.id !== courseId);
      const modIds = draft.modules.filter((m) => m.courseId === courseId).map((m) => m.id);
      draft.modules = draft.modules.filter((m) => m.courseId !== courseId);
      draft.lessons = draft.lessons.filter((l) => !modIds.includes(l.moduleId));
      return draft;
    });
    showToast(lang === 'ru' ? 'Курс удален' : "Kurs o'chirildi", 'info');
  }

  function moveLessonOrder(lessonId, direction) {
    updateDb((draft) => {
      const target = draft.lessons.find((l) => l.id === lessonId);
      if (!target) return draft;
      const siblings = draft.lessons
        .filter((l) => l.moduleId === target.moduleId)
        .sort((a, b) => a.order - b.order);
      const idx = siblings.findIndex((l) => l.id === lessonId);
      const swapIdx = direction === 'up' ? idx - 1 : idx + 1;
      if (swapIdx < 0 || swapIdx >= siblings.length) return draft;
      const tempOrder = siblings[idx].order;
      siblings[idx].order = siblings[swapIdx].order;
      siblings[swapIdx].order = tempOrder;
      return draft;
    });
  }

  function gradeSubmission({ submissionId, score, teacherComment }) {
    updateDb(
      (draft) => {
        const sub = draft.submissions.find((s) => s.id === submissionId);
        if (!sub) return draft;
        sub.score = Number(score);
        sub.teacherComment = teacherComment;
        sub.status = 'graded';

        const asg = draft.assignments.find((a) => a.id === sub.assignmentId);
        draft.notifications.unshift({
          id: `notif-${Date.now()}`,
          userId: sub.userId,
          textUz: `📝 Uy vazifangiz tekshirildi: "${asg?.titleUz}" — Ball: ${score}/100. Ustoz izohi: ${teacherComment}`,
          textRu: `📝 Домашнее задание проверено: "${asg?.titleRu}" — Балл: ${score}/100. Комментарий: ${teacherComment}`,
          read: false,
          createdAt: new Date().toISOString()
        });
        return draft;
      },
      {
        action: 'HOMEWORK_GRADED',
        details: `Topshiriq (${submissionId}) ${score} ball bilan baholandi`
      }
    );
    showToast('Vazifa baholandi va talabaga xabarnoma yuborildi!', 'success');
  }

  // ADMIN PANEL ACTIONS (Step 11 — all logged to AuditLog)
  function adminUpdateUser(userId, updates) {
    updateDb(
      (draft) => {
        const user = draft.users.find((u) => u.id === userId);
        if (user) Object.assign(user, updates);
        return draft;
      },
      {
        action: 'USER_UPDATED',
        details: `Foydalanuvchi (${userId}) ma'lumotlari o'zgartirildi: ${JSON.stringify(updates)}`
      }
    );
    showToast("Foydalanuvchi ma'lumotlari yangilandi", 'success');
  }

  function adminToggleBlockUser(userId, reason = '') {
    let newStatus = false;
    updateDb(
      (draft) => {
        const user = draft.users.find((u) => u.id === userId);
        if (!user) return draft;
        user.blocked = !user.blocked;
        newStatus = user.blocked;

        draft.notifications = draft.notifications || [];
        draft.notifications.unshift({
          id: `notif-${Date.now()}`,
          userId: user.id,
          textUz: newStatus
            ? `🚫 Sizning hisobingiz ma'muriyat tomonidan bloklandi. Sabab: ${reason || "Qoidabuzarlik yoki intizomsizlik"}`
            : "🔓 Sizning hisobingiz admin tomonidan blokdan chiqarildi.",
          textRu: newStatus
            ? `🚫 Ваш аккаунт заблокирован администратором. Причина: ${reason || "Нарушение регламента"}`
            : "🔓 Ваш аккаунт разблокирован администратором.",
          read: false,
          createdAt: new Date().toISOString()
        });
        return draft;
      },
      {
        action: 'USER_BLOCK_TOGGLED',
        details: `Foydalanuvchi (${userId}) holati: ${newStatus ? 'BLOKLANDI' : 'OCHILDI'}`
      }
    );
    showToast(newStatus ? "🚫 Foydalanuvchi bloklandi!" : "🔓 Foydalanuvchi blokdan chiqarildi!", newStatus ? 'error' : 'success');
  }

  function adminDeleteUser(userId) {
    if (!currentUser || currentUser.role !== 'admin') return;
    if (userId === currentUser.id) {
      showToast("Bosh admin hisobini o'chirib bo'lmaydi!", 'error');
      return;
    }
    updateDb(
      (draft) => {
        draft.users = draft.users.filter((u) => u.id !== userId);
        draft.enrollments = (draft.enrollments || []).filter((e) => e.userId !== userId);
        draft.submissions = (draft.submissions || []).filter((s) => s.userId !== userId);
        draft.messages = (draft.messages || []).filter((m) => m.senderId !== userId && m.recipientId !== userId);
        return draft;
      },
      {
        action: 'USER_DELETED',
        details: `Foydalanuvchi (${userId}) butunlay o'chirildi`
      }
    );
    showToast("Foydalanuvchi tizimdan butunlay o'chirildi", 'info');
  }

  function adminInviteUser({ name, phone, role = 'student', courseId = '', message = '' }) {
    if (!currentUser || currentUser.role !== 'admin') return null;
    const cleanPhone = (phone || '').trim();
    const cleanName = (name || '').trim();
    if (!cleanPhone || !cleanName) {
      showToast("Ism va telefon raqam kiritilishi shart!", 'error');
      return null;
    }

    const inviteCode = 'INV-' + Math.floor(100000 + Math.random() * 900000);
    const existing = db.users.find((u) => u.phone && u.phone.replace(/\D/g, '') === cleanPhone.replace(/\D/g, ''));
    let invitedUserId = existing?.id;

    updateDb(
      (draft) => {
        if (!existing) {
          invitedUserId = `usr-${Date.now()}`;
          draft.users.push({
            id: invitedUserId,
            name: cleanName,
            phone: cleanPhone,
            email: '',
            role: role || 'student',
            passwordHash: 'invited',
            avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&auto=format&fit=crop&q=80',
            bioUz: `${role === 'teacher' ? "O'qituvchi" : 'Talaba'} (Admin tomonidan taklif qilingan)`,
            bioRu: `${role === 'teacher' ? 'Преподаватель' : 'Студент'} (Приглашен администратором)`,
            specialtyUz: role === 'teacher' ? "Mentor" : 'Talaba',
            specialtyRu: role === 'teacher' ? 'Ментор' : 'Студент',
            blocked: false,
            createdAt: new Date().toISOString()
          });
        }

        if (courseId && invitedUserId) {
          const already = (draft.enrollments || []).some((e) => e.userId === invitedUserId && e.courseId === courseId);
          if (!already) {
            draft.enrollments = draft.enrollments || [];
            draft.enrollments.unshift({
              id: `enr-${Date.now()}`,
              userId: invitedUserId,
              courseId,
              status: 'active',
              createdAt: new Date().toISOString()
            });
            const crs = draft.courses.find((c) => c.id === courseId);
            if (crs) crs.studentsCount = (crs.studentsCount || 0) + 1;
          }
        }

        draft.invitations = draft.invitations || [];
        draft.invitations.unshift({
          id: `inv-${Date.now()}`,
          code: inviteCode,
          name: cleanName,
          phone: cleanPhone,
          role: role || 'student',
          courseId: courseId || null,
          message: message || '',
          invitedBy: currentUser.name,
          createdAt: new Date().toISOString()
        });

        draft.notificationLogs = draft.notificationLogs || [];
        draft.notificationLogs.unshift({
          id: `nlog-${Date.now()}`,
          channel: 'SMS_GATEWAY',
          recipient: cleanPhone,
          message: `Siz CodeCraft platformasiga taklif qilindingiz! Kirish raqamingiz: ${cleanPhone}. Taklif kodi: ${inviteCode}`,
          createdAt: new Date().toISOString()
        });

        return draft;
      },
      {
        action: 'USER_INVITED',
        details: `Yangi foydalanuvchi (${cleanName}, ${cleanPhone}) taklif qilindi`
      }
    );

    const inviteLink = `${window.location.origin}/?invite=${inviteCode}&phone=${encodeURIComponent(cleanPhone)}`;
    showToast("Foydalanuvchi taklif qilindi va tizimga qo'shildi!", 'success');
    return { inviteCode, inviteLink, userId: invitedUserId };
  }

  function adminEnrollUser(userId, courseId) {
    if (!currentUser || currentUser.role !== 'admin') return;
    const user = db.users.find((u) => u.id === userId);
    const course = db.courses.find((c) => c.id === courseId);
    if (!user || !course) return;

    let already = false;
    updateDb(
      (draft) => {
        const isEnr = (draft.enrollments || []).some((e) => e.userId === userId && e.courseId === courseId);
        if (isEnr) {
          already = true;
          return draft;
        }
        draft.enrollments = draft.enrollments || [];
        draft.enrollments.unshift({
          id: `enr-${Date.now()}`,
          userId,
          courseId,
          status: 'active',
          createdAt: new Date().toISOString()
        });
        const crs = draft.courses.find((c) => c.id === courseId);
        if (crs) crs.studentsCount = (crs.studentsCount || 0) + 1;

        draft.notifications = draft.notifications || [];
        draft.notifications.unshift({
          id: `notif-${Date.now()}`,
          userId,
          textUz: `🎓 Bosh Administrator sizni "${course.titleUz}" kursiga bepul biriktirdi! Darslarni shaxsiy kabinetda boshlashingiz mumkin.`,
          textRu: `🎓 Главный Администратор предоставил вам доступ к курсу "${course.titleRu}"!`,
          read: false,
          createdAt: new Date().toISOString()
        });
        return draft;
      },
      {
        action: 'COURSE_ENROLLED_BY_ADMIN',
        details: `${user.name} ga "${course.titleUz}" kursi biriktirildi`
      }
    );

    if (already) {
      showToast("Ushbu foydalanuvchi allaqachon bu kursga yozilgan", 'info');
    } else {
      showToast(`"${course.titleUz}" kursi ${user.name}ga biriktirildi!`, 'success');
    }
  }

  function sendChatMessage({ recipientId, text }) {
    if (!currentUser) return false;
    const cleanText = (text || '').trim();
    if (!cleanText) return false;

    const recipient = db.users.find((u) => u.id === recipientId);
    const msgId = `msg-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    updateDb((draft) => {
      draft.messages = draft.messages || [];
      draft.messages.push({
        id: msgId,
        senderId: currentUser.id,
        senderName: currentUser.name,
        senderRole: currentUser.role,
        recipientId,
        recipientName: recipient?.name || 'Foydalanuvchi',
        text: cleanText,
        createdAt: new Date().toISOString(),
        read: false
      });

      draft.notifications = draft.notifications || [];
      draft.notifications.unshift({
        id: `notif-${Date.now()}`,
        userId: recipientId,
        textUz: currentUser.role === 'admin'
          ? `💬 Bosh Administrator (${currentUser.name}): "${cleanText.slice(0, 45)}${cleanText.length > 45 ? '...' : ''}"`
          : `💬 ${currentUser.name}: "${cleanText.slice(0, 45)}${cleanText.length > 45 ? '...' : ''}"`,
        textRu: currentUser.role === 'admin'
          ? `💬 Главный Администратор (${currentUser.name}): "${cleanText.slice(0, 45)}${cleanText.length > 45 ? '...' : ''}"`
          : `💬 ${currentUser.name}: "${cleanText.slice(0, 45)}${cleanText.length > 45 ? '...' : ''}"`,
        read: false,
        createdAt: new Date().toISOString()
      });

      return draft;
    });

    showToast(lang === 'ru' ? 'Сообщение отправлено' : 'Xabar yuborildi', 'success');
    return true;
  }

  function markChatRead(otherUserId) {
    if (!currentUser || !otherUserId) return;
    updateDb((draft) => {
      let changed = false;
      (draft.messages || []).forEach((m) => {
        if (m.recipientId === currentUser.id && m.senderId === otherUserId && !m.read) {
          m.read = true;
          changed = true;
        }
      });
      return changed ? draft : draft;
    });
  }

  function adminBroadcastMessage(text) {
    if (!currentUser || currentUser.role !== 'admin') return;
    const cleanText = (text || '').trim();
    if (!cleanText) return;

    updateDb(
      (draft) => {
        draft.users.forEach((u) => {
          if (u.id !== currentUser.id) {
            draft.messages = draft.messages || [];
            draft.messages.push({
              id: `msg-${Date.now()}-${Math.floor(Math.random() * 10000)}`,
              senderId: currentUser.id,
              senderName: currentUser.name,
              senderRole: 'admin',
              recipientId: u.id,
              recipientName: u.name,
              text: `📢 [UMUMIY E'LON]: ${cleanText}`,
              createdAt: new Date().toISOString(),
              read: false
            });

            draft.notifications = draft.notifications || [];
            draft.notifications.unshift({
              id: `notif-${Date.now()}-${Math.floor(Math.random() * 10000)}`,
              userId: u.id,
              textUz: `📢 Bosh Administratsiya e'loni: "${cleanText.slice(0, 50)}..."`,
              textRu: `📢 Объявление Администрации: "${cleanText.slice(0, 50)}..."`,
              read: false,
              createdAt: new Date().toISOString()
            });
          }
        });
        return draft;
      },
      {
        action: 'BROADCAST_SENT',
        details: `Barcha talabalarga xabar yuborildi: ${cleanText}`
      }
    );
    showToast("Barcha foydalanuvchilarga e'lon yuborildi!", 'success');
  }

  function adminToggleCourseStatus(courseId) {
    updateDb(
      (draft) => {
        const course = draft.courses.find((c) => c.id === courseId);
        if (course) {
          course.status = course.status === 'published' ? 'draft' : 'published';
        }
        return draft;
      },
      {
        action: 'COURSE_STATUS_CHANGED',
        details: `Kurs (${courseId}) holati o'zgartirildi`
      }
    );
    showToast('Kurs holati yangilandi', 'success');
  }

  function adminDeleteCourse(courseId) {
    updateDb(
      (draft) => {
        draft.courses = draft.courses.filter((c) => c.id !== courseId);
        return draft;
      },
      {
        action: 'COURSE_DELETED',
        details: `Kurs (${courseId}) o'chirildi`
      }
    );
    showToast("Kurs o'chirildi", 'info');
  }

  function adminSaveCategory(catData) {
    updateDb(
      (draft) => {
        if (catData.id) {
          const idx = draft.categories.findIndex((c) => c.id === catData.id);
          if (idx !== -1) draft.categories[idx] = { ...draft.categories[idx], ...catData };
        } else {
          draft.categories.push({
            id: `cat-${Date.now()}`,
            nameUz: catData.nameUz,
            nameRu: catData.nameRu || catData.nameUz,
            slug: catData.slug || catData.nameUz.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
            icon: catData.icon || 'code'
          });
        }
        return draft;
      },
      {
        action: 'CATEGORY_SAVED',
        details: `Kategoriya saqlandi: ${catData.nameUz}`
      }
    );
    showToast('Kategoriya saqlandi', 'success');
  }

  function adminDeleteCategory(catId) {
    updateDb(
      (draft) => {
        draft.categories = draft.categories.filter((c) => c.id !== catId);
        return draft;
      },
      {
        action: 'CATEGORY_DELETED',
        details: `Kategoriya (${catId}) o'chirildi`
      }
    );
    showToast("Kategoriya o'chirildi", 'info');
  }

  function adminSavePromo(promoData) {
    updateDb(
      (draft) => {
        draft.promoCodes.unshift({
          id: `prm-${Date.now()}`,
          code: promoData.code.toUpperCase().trim(),
          discountType: promoData.discountType || 'percent',
          discountValue: Number(promoData.discountValue) || 15,
          expiresAt: promoData.expiresAt || '2027-12-31T23:59:59.000Z',
          maxUses: Number(promoData.maxUses) || 100,
          usedCount: 0,
          active: true
        });
        return draft;
      },
      {
        action: 'PROMO_CREATED',
        details: `Yangi promo-kod qo'shildi: ${promoData.code.toUpperCase()}`
      }
    );
    showToast("Yangi promo-kod qo'shildi!", 'success');
  }

  function adminTogglePromo(promoId) {
    updateDb(
      (draft) => {
        const promo = draft.promoCodes.find((p) => p.id === promoId);
        if (promo) promo.active = !promo.active;
        return draft;
      },
      {
        action: 'PROMO_TOGGLED',
        details: `Promo-kod (${promoId}) holati o'zgartirildi`
      }
    );
  }

  function adminUpdateLeadStatus(leadId, status) {
    updateDb(
      (draft) => {
        const lead = draft.leads.find((l) => l.id === leadId);
        if (lead) lead.status = status;
        return draft;
      },
      {
        action: 'LEAD_STATUS_UPDATED',
        details: `Konsultatsiya arizasi (${leadId}) holati "${status}" ga o'zgartirildi`
      }
    );
    showToast('Ariza holati yangilandi', 'success');
  }

  function adminModerateReview(reviewId, status) {
    updateDb(
      (draft) => {
        const rev = draft.reviews.find((r) => r.id === reviewId);
        if (rev) rev.status = status;
        return draft;
      },
      {
        action: 'REVIEW_MODERATED',
        details: `Sharh (${reviewId}) moderatsiya holati: ${status}`
      }
    );
    showToast('Sharh holati yangilandi', 'success');
  }

  function adminUpdateBanner(bannerData) {
    updateDb(
      (draft) => {
        draft.banners[0] = { ...draft.banners[0], ...bannerData };
        return draft;
      },
      {
        action: 'CMS_BANNER_UPDATED',
        details: 'Bosh sahifa banneri yangilandi'
      }
    );
    showToast('Banner muvaffaqiyatli yangilandi!', 'success');
  }

  function adminSaveFaq(faqData) {
    updateDb(
      (draft) => {
        draft.faqs.push({
          id: `faq-${Date.now()}`,
          questionUz: faqData.questionUz,
          questionRu: faqData.questionRu || faqData.questionUz,
          answerUz: faqData.answerUz,
          answerRu: faqData.answerRu || faqData.answerUz,
          order: draft.faqs.length + 1
        });
        return draft;
      },
      {
        action: 'CMS_FAQ_ADDED',
        details: `Yangi FAQ qo'shildi: ${faqData.questionUz}`
      }
    );
    showToast("Yangi FAQ savol-javobi qo'shildi!", 'success');
  }

  function exportPaymentsCsv() {
    const headers = ['ID', 'Tranzaksiya', 'Talaba', 'Kurs', 'Provayder', 'Summa (UZS)', 'PromoKod', 'Holat', 'Sana'];
    const rows = db.payments.map((p) => {
      const usr = db.users.find((u) => u.id === p.userId);
      const crs = db.courses.find((c) => c.id === p.courseId);
      return [
        p.id,
        p.transactionId,
        `"${usr?.name || p.userId}"`,
        `"${crs?.titleUz || p.courseId}"`,
        p.provider.toUpperCase(),
        p.amount,
        p.promoCode || '-',
        p.status,
        p.createdAt
      ].join(',');
    });
    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `educenter_payments_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('CSV fayl yuklab olindi!', 'success');
  }

  return (
    <AppContext.Provider
      value={{
        db,
        currentUser,
        lang,
        setLang,
        theme,
        toggleTheme,
        t,
        loc,
        formatPrice,
        route,
        navigate,
        checkoutCourse,
        setCheckoutCourse,
        previewLesson,
        setPreviewLesson,
        activeCertificate,
        setActiveCertificate,
        toast,
        showToast,
        login,
        loginWithPhone,
        quickDemoLogin,
        register,
        resetPassword,
        logout,
        updateProfile,
        isEnrolled,
        getCourseLessons,
        getCourseProgress,
        canAccessLesson,
        toggleLessonComplete,
        submitQuizAttempt,
        submitAssignment,
        validatePromoCode,
        createPendingPayment,
        processPaymentWebhook,
        addReview,
        submitLead,
        markNotificationsRead,
        saveCourse,
        addModule,
        addLesson,
        addLessonToCourse,
        deleteLesson,
        deleteCourse,
        moveLessonOrder,
        gradeSubmission,
        adminAssignHomework,
        adminUpdateUser,
        adminToggleBlockUser,
        adminDeleteUser,
        adminInviteUser,
        adminEnrollUser,
        sendChatMessage,
        markChatRead,
        adminBroadcastMessage,
        adminToggleCourseStatus,
        adminDeleteCourse,
        adminSaveCategory,
        adminDeleteCategory,
        adminSavePromo,
        adminTogglePromo,
        adminUpdateLeadStatus,
        adminModerateReview,
        adminSaveBanner: adminUpdateBanner,
        adminUpdateBanner,
        adminSaveFaq,
        exportPaymentsCsv,
        adminConfirmPayment,
        adminCancelPayment,
        adminUpdatePayment,
        adminDeletePayment
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  return useContext(AppContext);
}
