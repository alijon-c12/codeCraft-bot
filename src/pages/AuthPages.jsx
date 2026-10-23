import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext.jsx';

export function AuthPage({ mode = 'login' }) {
  const {
    t,
    formatPrice,
    db,
    loginWithPhone,
    createPendingPayment,
    validateReceiptImage,
    enrollInAllCourses,
    register,
    resetPassword,
    quickDemoLogin,
    navigate,
    route,
    showToast,
    lang,
    adminCardNumber,
    adminCardHolder,
    getPaymeUrl,
    getClickUrl,
    getClickTelegramUrl
  } = useApp();

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('+998');
  const [phoneError, setPhoneError] = useState('');
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');

  // SMS Verification State for login
  const [smsStep, setSmsStep] = useState(false);
  const [smsInput, setSmsInput] = useState('');
  const [countdown, setCountdown] = useState(0);

  // Step 3: Registration Course Package Payment State
  const [paymentStep, setPaymentStep] = useState(false);
  const [verifiedUser, setVerifiedUser] = useState(null);
  const [bundleReceiptImage, setBundleReceiptImage] = useState('');
  const [bundleReceiptError, setBundleReceiptError] = useState('');
  const [isPayingBundle, setIsPayingBundle] = useState(false);

  function handleBundleReceiptFileChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      showToast(
        lang === 'ru'
          ? 'Пожалуйста, выберите файл изображения (PNG, JPG, JPEG, WEBP)!'
          : "Iltimos, rasm faylini tanlang (PNG, JPG, JPEG, WEBP)!",
        'error'
      );
      return;
    }
    const reader = new FileReader();
    reader.onload = async () => {
      const dataUrl = reader.result;
      const checkResult = await validateReceiptImage(file, dataUrl, lang);
      if (!checkResult.valid) {
        setBundleReceiptImage('');
        setBundleReceiptError(checkResult.error);
        showToast(checkResult.error, 'error');
        return;
      }
      setBundleReceiptImage(dataUrl);
      setBundleReceiptError('');
      showToast(
        lang === 'ru' ? 'Чек успешно проверен и прикреплён!' : "To'lov cheki tekshirildi va muvaffaqiyatli biriktirildi!",
        'success'
      );
    };
    reader.readAsDataURL(file);
  }

  const allCourses = db.courses || [];
  const bundlePrice = 100000;

  const PHONE_START_REGEX = /^\+998/;
  const PHONE_REGEX = /^\+998[\s-]?(\(?[0-9]{2}\)?[\s-]?[0-9]{3}[\s-]?[0-9]{2}[\s-]?[0-9]{2}|[0-9]{9})$/;

  useEffect(() => {
    if (countdown <= 0) return;
    const timer = setInterval(() => {
      setCountdown((c) => c - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [countdown]);

  function validatePhoneNumber(value) {
    const trimmed = (value || '').trim();
    if (!trimmed || !PHONE_START_REGEX.test(trimmed)) {
      return t.auth.errors.phoneReq || (lang === 'ru' ? 'Вы должны ввести номер телефона' : 'Siz bu yerga telefon raqam kiritishingiz kerak');
    }
    const hasLettersOrSymbols = /[a-zA-Zа-яА-ЯёЁ!@#$%^&*_={}[\]<>]/.test(trimmed);
    const isValid = PHONE_REGEX.test(trimmed) && !hasLettersOrSymbols;
    if (!isValid) {
      return t.auth.errors.phoneReq || (lang === 'ru' ? 'Вы должны ввести номер телефона' : 'Siz bu yerga telefon raqam kiritishingiz kerak');
    }
    return '';
  }

  const [loading, setLoading] = useState(false);

  async function handleSendSmsCode(e) {
    if (e && e.preventDefault) e.preventDefault();
    setError('');

    if (name.trim().length < 3) {
      setError(t.auth.errors.nameMin);
      return;
    }

    const pErr = validatePhoneNumber(phone);
    if (pErr) {
      setPhoneError(pErr);
      setError(pErr);
      return;
    }
    setPhoneError('');
    setLoading(true);

    try {
      // Backend SMS Gateway: To'g'ridan-to'g'ri telefon raqamiga SMS yuborish
      const res = await fetch('/api/auth/send-sms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: phone.trim(),
          name: name.trim()
        })
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setError(data.error || (lang === 'ru' ? 'Ошибка отправки SMS' : 'SMS yuborishda xatolik yuz berdi'));
        setLoading(false);
        return;
      }

      setSmsStep(true);
      setCountdown(60);

      const toastMsg = lang === 'ru'
        ? `✅ SMS с кодом отправлено на номер ${phone}!`
        : `✅ Tasdiqlash kodi ${phone} raqamiga SMS orqali yuborildi!`;
      showToast(toastMsg, 'success');
      if (data.devCode) {
        showToast(`Tasdiqlash kodi: ${data.devCode}`, 'info');
      }
    } catch (err) {
      console.error('Send SMS error:', err);
      // Fallback
      setSmsStep(true);
      setCountdown(60);
      showToast(
        lang === 'ru'
          ? `✅ SMS с кодом отправлено на номер ${phone}!`
          : `✅ Tasdiqlash kodi ${phone} raqamiga SMS orqali yuborildi!`,
        'success'
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleVerifySmsAndLogin(e) {
    if (e && e.preventDefault) e.preventDefault();
    setError('');

    const input = (smsInput || '').trim();
    if (!input) {
      setError(t.auth.errors.invalidSmsCode);
      return;
    }

    setLoading(true);

    try {
      // Backend API: SMS kodni tekshirish
      const res = await fetch('/api/auth/verify-sms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: phone.trim(),
          code: input,
          name: name.trim()
        })
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setError(data.error || t.auth.errors.invalidSmsCode);
        setLoading(false);
        return;
      }

      const isAdmin = (phone || '').replace(/\D/g, '') === '998951639101' || data.user?.role === 'admin';
      if (isAdmin) {
        const loginRes = loginWithPhone({ name, phone, user: data.user });
        if (!loginRes.ok) setError(loginRes.error);
        return;
      }

      // Talaba avvalroq to'liq kurslar to'plamini sotib olganmi tekshirish
      const alreadyHasAll = (db.enrollments || []).some(
        (e) => e.userId === data.user?.id && (e.courseId === 'all' || (db.courses || []).some((c) => c.id === e.courseId))
      );

      if (alreadyHasAll) {
        const loginRes = loginWithPhone({ name, phone, user: data.user });
        if (!loginRes.ok) setError(loginRes.error);
        return;
      }

      // Yangi ro'yxatdan o'tayotgan talaba: 3-qadam Umumiy kurslarni sotib olish oynasini ochish
      loginWithPhone({ name, phone, user: data.user, skipRedirect: true });
      setVerifiedUser(data.user);
      setBundleCardHolder((data.user?.name || name || 'TALABA').toUpperCase());
      setBundleClickPhone(data.user?.phone || phone || '+998 90 123 45 67');
      setPaymentStep(true);
    } catch (err) {
      console.error('Verify SMS error:', err);
      setError(t.auth.errors.invalidSmsCode);
    } finally {
      setLoading(false);
    }
  }

  function handlePayBundle() {
    if (!bundleReceiptImage) {
      setBundleReceiptError(
        lang === 'ru'
          ? 'Пожалуйста, прикрепите фото чека об оплате! Без чека покупка невозможна.'
          : "Iltimos, to'lov cheki rasmini yuklang! Cheksiz kursni sotib ololmaysiz."
      );
      showToast(
        lang === 'ru'
          ? 'Пожалуйста, прикрепите фото чека об оплате!'
          : "Iltimos, to'lov cheki rasmini yuklang!",
        'error'
      );
      return;
    }

    setIsPayingBundle(true);
    setTimeout(() => {
      const uId = verifiedUser?.id;
      const mask = (adminCardNumber || '8600 4912 8301 7724').trim();

      // Kurs faqat admin kartaga pul tushganini tasdiqlaganidan keyin ochiladi
      if (uId && createPendingPayment) {
        createPendingPayment({
          courseId: 'all',
          userId: uId,
          amount: bundlePrice,
          provider: 'card',
          accountMask: mask,
          receiptImage: bundleReceiptImage
        });
      }

      setIsPayingBundle(false);
      showToast(
        lang === 'ru'
          ? "Чек отправлен на проверку! Администратор проверит поступление средств на карту и откроет все курсы."
          : "To'lov chekingiz adminga yuborildi! Admin kartaga pul tushganini tekshirib tasdiqlashi bilan barcha kurslar ochiladi.",
        'success'
      );
      navigate('dashboard');
    }, 700);
  }

  function handleSkipPayment() {
    showToast(
      lang === 'ru'
        ? 'Вы можете приобрести доступ ко всем курсам в любое время.'
        : 'Umumiy kurslarni istalgan vaqtda shaxsiy kabinetingizdan sotib olishingiz mumkin.',
      'info'
    );
    navigate('courses');
  }

  return (
    <div className="section auth-section">
      <div className="container narrow-container">
        <div className="auth-card">
          <div className="auth-brand-badge">⚡</div>
          {!paymentStep && (
            <div className="auth-header">
              <h1>{smsStep ? t.auth.smsSentTitle : t.auth.loginTitle}</h1>
              <p>{smsStep ? `${phone} ${t.auth.smsSentSub}` : t.auth.loginSub}</p>
            </div>
          )}

          {error && <div className="alert-error">⚠️ {error}</div>}

          {/* 3-QADAM: ROYHATDAN O'TAYOTGANDA UMUMIY KURSLARNI SOTIB OLISH */}
          {paymentStep ? (
            <div className="registration-bundle-flow">
              <div
                style={{
                  background: 'rgba(16, 185, 129, 0.1)',
                  border: '1px solid rgba(16, 185, 129, 0.3)',
                  borderRadius: '10px',
                  padding: '10px 14px',
                  marginBottom: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  color: '#10b981',
                  fontSize: '0.88rem',
                  fontWeight: 600
                }}
              >
                <span>✅</span>
                <span>
                  {lang === 'ru'
                    ? 'Шаг 1 завершён: Телефон успешно подтверждён!'
                    : "1-qadam yakunlandi: Telefon raqam muvaffaqiyatli tasdiqlandi!"}
                </span>
              </div>

              <div className="auth-header" style={{ marginBottom: '16px', textAlign: 'left' }}>
                <h2 style={{ fontSize: '1.45rem', fontWeight: 800, marginBottom: '6px' }}>
                  🎓 {lang === 'ru' ? 'Полный доступ ко всем курсам' : "Umumiy kurslar to'plami"}
                </h2>
                <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                  {lang === 'ru'
                    ? `Добро пожаловать, ${verifiedUser?.name || name}! Получите доступ ко всем видеоурокам сразу единым пакетом при регистрации.`
                    : `Xush kelibsiz, ${verifiedUser?.name || name}! Videolarni birma-bir emas, ro'yxatdan o'tishda umumiy to'plam sifatida xarid qiling.`}
                </p>
              </div>

              {/* BUNDLE FEATURES */}
              <div
                style={{
                  background: 'rgba(99, 102, 241, 0.08)',
                  border: '1px solid rgba(99, 102, 241, 0.22)',
                  borderRadius: '12px',
                  padding: '14px 16px',
                  marginBottom: '18px'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                  <span style={{ fontSize: '1.2rem' }}>🎁</span>
                  <strong style={{ fontSize: '0.94rem', color: 'var(--text)' }}>
                    {lang === 'ru' ? 'Что входит в общий пакет платформы:' : "Umumiy to'plamga nimalar kiradi:"}
                  </strong>
                </div>
                <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '0.86rem', color: 'var(--text)', lineHeight: '1.6' }}>
                  <li>
                    <strong>{(db.courses || []).length} ta</strong> {lang === 'ru' ? 'полноценных практических курса (Frontend, Backend, Дизайн)' : "amaliy kurs (Frontend, Backend, Dizayn va barcha yo'nalishlar)"}
                  </li>
                  <li>
                    {lang === 'ru'
                      ? 'Все видеоуроки без ограничений (не нужно платить за каждое видео отдельно)'
                      : "Barcha video darslar cheklovlarsiz (har bir videoni alohida sotib olish shart emas)"}
                  </li>
                  <li>
                    {lang === 'ru'
                      ? 'Практические задания, домашние работы и проверка преподавателем'
                      : "Amaliy topshiriqlar, uy vazifalari va ustoz nazorati"}
                  </li>
                  <li>
                    {lang === 'ru'
                      ? 'Официальный подтверждённый сертификат по окончании'
                      : "Kurslarni tugatganda rasmiy tasdiqlangan sertifikat"}
                  </li>
                </ul>
              </div>

              {/* 1. ADMIN KARTA RAQAMI VA MA'LUMOTLARI */}
              <div
                className="admin-card-payment-box"
                style={{
                  background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.12), rgba(168, 85, 247, 0.14))',
                  border: '2px solid rgba(99, 102, 241, 0.45)',
                  borderRadius: '16px',
                  padding: '18px',
                  marginBottom: '16px',
                  boxShadow: '0 8px 24px rgba(99, 102, 241, 0.12)'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <span style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.8px' }}>
                    💳 {lang === 'ru' ? 'Оплата на банковскую карту' : "Bank kartasiga to'lov"}
                  </span>
                  <span
                    style={{
                      background: 'rgba(99, 102, 241, 0.2)',
                      color: 'var(--primary)',
                      fontWeight: 800,
                      fontSize: '0.72rem',
                      padding: '3px 8px',
                      borderRadius: '6px'
                    }}
                  >
                    UZCARD / HUMO
                  </span>
                </div>

                <div style={{ marginBottom: '12px' }}>
                  <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '6px', fontWeight: 600 }}>
                    {lang === 'ru' ? 'Номер карты для перевода:' : 'To\'lov uchun karta raqami:'}
                  </label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <code
                      style={{
                        fontSize: '1.25rem',
                        letterSpacing: '2px',
                        fontWeight: 800,
                        color: 'var(--text)',
                        background: 'var(--surface)',
                        padding: '10px 14px',
                        borderRadius: '10px',
                        border: '1px solid var(--border)',
                        flex: 1,
                        fontFamily: 'monospace'
                      }}
                    >
                      {adminCardNumber}
                    </code>
                    <button
                      type="button"
                      className="btn btn-outline"
                      onClick={() => {
                        navigator.clipboard.writeText((adminCardNumber || '').replace(/\s+/g, ''));
                        showToast(lang === 'ru' ? 'Номер карты скопирован!' : 'Karta raqamidan nusxa olindi!', 'success');
                      }}
                      title={lang === 'ru' ? 'Скопировать номер карты' : 'Karta raqamidan nusxa olish'}
                      style={{ padding: '10px 14px', fontWeight: 700 }}
                    >
                      📋 {lang === 'ru' ? 'Копировать' : 'Nusxa olish'}
                    </button>
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px', background: 'var(--surface)', borderRadius: '10px', border: '1px solid var(--border)', fontSize: '0.88rem' }}>
                  <div>
                    <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.76rem' }}>
                      {lang === 'ru' ? 'Владелец карты:' : 'Karta egasi:'}
                    </span>
                    <strong>{adminCardHolder}</strong>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.76rem' }}>
                      {lang === 'ru' ? 'Сумма к оплате:' : "To'lov summasi:"}
                    </span>
                    <strong style={{ color: 'var(--primary)', fontSize: '1.2rem', fontWeight: 800 }}>
                      {formatPrice(bundlePrice)}
                    </strong>
                  </div>
                </div>
              </div>

              {/* 2. TO'LOV CHEKINI YUKLASH (MAJBURIY) */}
              <div
                style={{
                  background: bundleReceiptImage ? 'rgba(16, 185, 129, 0.08)' : 'var(--bg-alt)',
                  border: `2px dashed ${bundleReceiptImage ? '#10b981' : bundleReceiptError ? '#ef4444' : 'var(--border)'}`,
                  borderRadius: '14px',
                  padding: '16px',
                  marginBottom: '16px',
                  transition: 'all 0.2s'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <label style={{ margin: 0, fontWeight: 700, fontSize: '0.92rem', color: 'var(--text)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span>📸</span>
                    <span>{lang === 'ru' ? 'Фото чека об оплате (Обязательно):' : "To'lov cheki rasmi (Majburiy):"}</span>
                  </label>
                  {bundleReceiptImage && (
                    <span style={{ fontSize: '0.75rem', color: '#10b981', fontWeight: 700, background: 'rgba(16, 185, 129, 0.15)', padding: '2px 8px', borderRadius: '6px' }}>
                      ✓ {lang === 'ru' ? 'Чек прикреплён' : 'Chek yuklandi'}
                    </span>
                  )}
                </div>

                <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', margin: '0 0 12px 0', lineHeight: '1.4' }}>
                  {lang === 'ru'
                    ? 'Оплатите на указанную карту через любое приложение (Click, Payme, Uzum и др.) и обязательно прикрепите фото или скриншот чека об оплате.'
                    : "Yuqoridagi karta raqamiga istalgan ilova (Click, Payme, Uzum va h.k.) orqali to'lov qiling va to'lov kvitansiyasi (chek) skrinshotini bu yerga yuklang."}
                </p>

                {bundleReceiptError && (
                  <div style={{ background: 'rgba(239, 68, 68, 0.12)', color: '#ef4444', padding: '8px 12px', borderRadius: '8px', fontSize: '0.84rem', fontWeight: 600, marginBottom: '10px' }}>
                    ⚠️ {bundleReceiptError}
                  </div>
                )}

                {!bundleReceiptImage ? (
                  <label
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      padding: '20px',
                      border: '1px solid var(--border)',
                      borderRadius: '10px',
                      cursor: 'pointer',
                      background: 'var(--surface)',
                      textAlign: 'center',
                      gap: '6px'
                    }}
                  >
                    <input
                      type="file"
                      accept="image/*"
                      style={{ display: 'none' }}
                      onChange={handleBundleReceiptFileChange}
                    />
                    <span style={{ fontSize: '2rem' }}>📁</span>
                    <strong style={{ fontSize: '0.94rem', color: 'var(--primary)' }}>
                      {lang === 'ru' ? 'Нажмите, чтобы выбрать фото чека' : "Chek rasmini yuklash uchun bosing"}
                    </strong>
                    <small style={{ color: 'var(--text-muted)', fontSize: '0.78rem' }}>
                      PNG, JPG, JPEG, WEBP (maks. 10MB)
                    </small>
                  </label>
                ) : (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px', background: 'var(--surface)', padding: '10px 14px', borderRadius: '10px', border: '1px solid var(--border)' }}>
                    <img
                      src={bundleReceiptImage}
                      alt="Chek rasmi"
                      style={{ width: '64px', height: '64px', objectFit: 'cover', borderRadius: '8px', border: '1px solid var(--border)' }}
                    />
                    <div style={{ flex: 1 }}>
                      <strong style={{ display: 'block', fontSize: '0.88rem', color: '#10b981' }}>
                        ✅ {lang === 'ru' ? 'Чек успешно прикреплён' : "To'lov cheki tayyor"}
                      </strong>
                      <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                        {lang === 'ru' ? 'Вы можете заменить чек или нажать оплатить' : "Rasmni almashtirish yoki davom etish mumkin"}
                      </span>
                    </div>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <label className="btn btn-outline btn-sm" style={{ cursor: 'pointer', margin: 0 }}>
                        <input
                          type="file"
                          accept="image/*"
                          style={{ display: 'none' }}
                          onChange={handleBundleReceiptFileChange}
                        />
                        🔄 {lang === 'ru' ? 'Заменить' : 'Almashtirish'}
                      </label>
                      <button
                        type="button"
                        className="btn btn-ghost btn-sm"
                        style={{ color: '#ef4444' }}
                        onClick={() => setBundleReceiptImage('')}
                      >
                        🗑
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* NARX BLOKI */}
              <div className="price-breakdown" style={{ marginBottom: '16px' }}>
                <div className="price-row">
                  <span>{lang === 'ru' ? 'Пакет всех курсов:' : "Barcha umumiy kurslar to'plami:"}</span>
                  <strong>{(db.courses || []).length} ta kurs</strong>
                </div>
                <div className="price-row total" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span>{lang === 'ru' ? 'Итого к оплате:' : "Jami to'lov summasi:"}</span>
                  <span style={{ color: 'var(--primary)', fontSize: '1.3rem', fontWeight: 800 }}>
                    {formatPrice(bundlePrice)}
                  </span>
                </div>
              </div>

              {/* TUGMALAR: TASDIQLASH VA KURSLARNI OCHISH */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <button
                  type="button"
                  className="btn btn-success btn-block btn-lg"
                  style={{
                    background: !bundleReceiptImage
                      ? 'linear-gradient(135deg, #64748b, #475569)'
                      : 'linear-gradient(135deg, #10b981, #059669)',
                    color: '#fff',
                    border: 'none',
                    boxShadow: bundleReceiptImage ? '0 6px 18px rgba(16, 185, 129, 0.35)' : 'none',
                    padding: '14px',
                    fontSize: '1.02rem',
                    fontWeight: 700,
                    cursor: isPayingBundle ? 'wait' : 'pointer'
                  }}
                  disabled={isPayingBundle}
                  onClick={handlePayBundle}
                >
                  {isPayingBundle ? (
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                      <span>⏳</span>
                      {lang === 'ru' ? 'Отправка чека на проверку...' : "Chek adminga tekshiruvga yuborilmoqda..."}
                    </span>
                  ) : (
                    <span>
                      {bundleReceiptImage ? '📤' : '🔒'}{' '}
                      {lang === 'ru'
                        ? 'Отправить чек на проверку администратору'
                        : "To'lov chekini tekshiruvga yuborish"}
                    </span>
                  )}
                </button>

                {!bundleReceiptImage && (
                  <small style={{ textAlign: 'center', color: '#ef4444', fontSize: '0.8rem', fontWeight: 600 }}>
                    {lang === 'ru'
                      ? '⚠️ Сначала прикрепите фото чека выше'
                      : "⚠️ Avval yuqoridagi maydonga to'lov cheki rasmini yuklang"}
                  </small>
                )}

                {/* 3. KEYINROQ TO'LASH */}
                <button
                  type="button"
                  className="btn btn-ghost btn-block"
                  style={{ color: 'var(--text-muted)', fontSize: '0.88rem' }}
                  onClick={handleSkipPayment}
                >
                  {lang === 'ru' ? 'Пропустить и перейти к курсам →' : "Keyinroq to'lash (Platformani ko'rish) →"}
                </button>
              </div>
            </div>
          ) : !smsStep ? (
            /* STEP 1: ISM FAMILIYA & TELEFON RAQAM */
            <form className="auth-form" onSubmit={handleSendSmsCode} noValidate>
              <div className="form-group">
                <label className="field-label">
                  <span>👤</span>
                  <span>{t.auth.loginNameLabel}</span>
                </label>
                <input
                  type="text"
                  className="input"
                  placeholder={t.auth.loginNamePlaceholder}
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    setError('');
                  }}
                  required
                />
              </div>

              <div className="form-group">
                <label className="field-label">
                  <span>📱</span>
                  <span>{t.auth.loginPhoneLabel}</span>
                </label>
                <input
                  type="tel"
                  className={`input ${phoneError ? 'input-error' : ''}`}
                  style={phoneError ? { borderColor: '#ef4444', backgroundColor: 'rgba(239, 68, 68, 0.04)' } : {}}
                  placeholder={t.auth.loginPhonePlaceholder}
                  value={phone}
                  onChange={(e) => {
                    let val = e.target.value;
                    if (!PHONE_START_REGEX.test(val)) {
                      val = '+998' + val.replace(/^\+?9?9?8?/, '');
                    }
                    setPhone(val);
                    setError('');
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
                      fontSize: '0.84rem',
                      marginTop: '6px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      fontWeight: '500'
                    }}
                  >
                    ⚠️ {phoneError}
                  </span>
                )}
              </div>

              <button type="submit" disabled={loading} className="btn btn-primary btn-block btn-lg btn-auth-submit">
                {loading ? (lang === 'ru' ? '⏳ Отправка SMS...' : '⏳ SMS yuborilmoqda...') : `📨 ${t.auth.getSmsCodeBtn}`}
              </button>

              <div className="auth-trust-note">
                <span>🔒</span>
                <span>
                  {lang === 'ru'
                    ? 'Безопасная авторизация через SMS'
                    : "SMS orqali xavfsiz avtorizatsiya"}
                </span>
              </div>
            </form>
          ) : (
            /* STEP 2: SMS TASDIQLASH KODI */
            <form className="auth-form" onSubmit={handleVerifySmsAndLogin} noValidate>
              {/* SMS status notice */}
              <div
                style={{
                  background: 'rgba(56, 189, 248, 0.08)',
                  border: '1px solid rgba(56, 189, 248, 0.25)',
                  borderRadius: '12px',
                  padding: '16px',
                  marginBottom: '20px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ fontSize: '1.4rem' }}>📱</span>
                  <div>
                    <div style={{ fontWeight: '600', fontSize: '0.92rem', color: 'var(--text)' }}>
                      {lang === 'ru'
                        ? 'SMS отправлено на ваш номер:'
                        : 'SMS telefon raqamingizga yuborildi:'}
                    </div>
                    <div style={{ fontSize: '0.95rem', color: '#38bdf8', fontWeight: '700' }}>
                      {phone}
                    </div>
                  </div>
                </div>
                <p style={{ margin: 0, fontSize: '0.86rem', color: 'var(--text-muted)', lineHeight: '1.45' }}>
                  {lang === 'ru'
                    ? 'Пожалуйста, проверьте входящие SMS или нашего официального Telegram-бота '
                    : "Iltimos, telefoningizdagi SMS xabarlarni yoki rasmiy Telegram botimiz "}
                  <a
                    href="https://t.me/CodeCraftUzBot?start=login"
                    target="_blank"
                    rel="noreferrer"
                    style={{ color: '#38bdf8', fontWeight: '700', textDecoration: 'underline' }}
                  >
                    @CodeCraftUzBot
                  </a>
                  {lang === 'ru'
                    ? ' и введите полученный 4-значный код:'
                    : " ni tekshiring va kelgan 4 xonali tasdiqlash kodini kiriting:"}
                </p>
              </div>

              <div className="form-group">
                <label className="field-label">{t.auth.smsCodeLabel}</label>
                <input
                  type="text"
                  maxLength={6}
                  className="input"
                  style={{
                    fontSize: '1.45rem',
                    letterSpacing: '8px',
                    textAlign: 'center',
                    fontWeight: '700',
                    padding: '10px'
                  }}
                  placeholder="••••"
                  value={smsInput}
                  onChange={(e) => {
                    setSmsInput(e.target.value.replace(/\D/g, ''));
                    setError('');
                  }}
                  autoFocus
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '4px 0 16px', fontSize: '0.88rem' }}>
                <button
                  type="button"
                  className="text-link"
                  onClick={() => {
                    setSmsStep(false);
                    setError('');
                  }}
                >
                  ✏️ {t.auth.changePhone}
                </button>
                <button
                  type="button"
                  className="text-link"
                  disabled={countdown > 0}
                  onClick={handleSendSmsCode}
                  style={{ cursor: countdown > 0 ? 'not-allowed' : 'pointer', opacity: countdown > 0 ? 0.6 : 1 }}
                >
                  🔄 {countdown > 0 ? `${t.auth.resendCodeIn} (${countdown}s)` : t.auth.resendCode}
                </button>
              </div>

              <button type="submit" disabled={loading} className="btn btn-primary btn-block btn-lg">
                {loading ? (lang === 'ru' ? '⏳ Проверка кода...' : '⏳ Kod tekshirilmoqda...') : `🚀 ${t.auth.verifyAndLoginBtn}`}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
