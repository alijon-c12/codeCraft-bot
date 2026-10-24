import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext.jsx';
import { getVideoUrl } from '../utils/mediaStorage.js';

export function GlobalModals() {
  const {
    t,
    loc,
    formatPrice,
    db,
    currentUser,
    checkoutCourse,
    setCheckoutCourse,
    createPendingPayment,
    hasPendingPayment,
    validateReceiptImage,
    adminCardNumber,
    adminCardHolder,
    getPaymeUrl,
    getClickUrl,
    getClickTelegramUrl,
    previewLesson,
    setPreviewLesson,
    activeCertificate,
    setActiveCertificate,
    deleteCertificate,
    navigate,
    showToast,
    lang
  } = useApp();

  const [receiptImage, setReceiptImage] = useState('');
  const [receiptError, setReceiptError] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [modalVideoUrl, setModalVideoUrl] = useState('');

  useEffect(() => {
    setIsProcessing(false);
    setReceiptImage('');
    setReceiptError('');
  }, [checkoutCourse]);

  useEffect(() => {
    let active = true;
    async function load() {
      if (previewLesson?.videoUrl) {
        setModalVideoUrl(previewLesson.videoUrl);
      } else if (previewLesson?.videoId) {
        const u = await getVideoUrl(previewLesson.videoId);
        if (active && u) setModalVideoUrl(u);
      } else {
        setModalVideoUrl('');
      }
    }
    load();
    return () => { active = false; };
  }, [previewLesson]);

  if (!checkoutCourse && !previewLesson && !activeCertificate) return null;

  // 1. CHECKOUT & PAYME/CLICK PAYMENT MODAL
  if (checkoutCourse) {
    const basePrice = checkoutCourse.discountPrice || checkoutCourse.price;
    const isAlreadyEnrolled = Boolean(
      currentUser &&
      db.enrollments.some(
        (e) => e.userId === currentUser.id && (e.courseId === checkoutCourse.id || e.courseId === 'all')
      )
    );
    const isPendingApproval = Boolean(
      currentUser && hasPendingPayment(currentUser.id, checkoutCourse.id)
    );

    function handleReceiptFileChange(e) {
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
        // Smart Receipt Validation: Faqat haqiqiy to'lov cheklarini qabul qiladi
        const checkResult = await validateReceiptImage(file, dataUrl, lang);
        if (!checkResult.valid) {
          setReceiptImage('');
          setReceiptError(checkResult.error);
          showToast(checkResult.error, 'error');
          return;
        }
        setReceiptImage(checkResult.compressedDataUrl || dataUrl);
        setReceiptError('');
        showToast(
          lang === 'ru' ? 'Чек успешно проверен и прикреплён!' : "To'lov cheki tekshirildi va muvaffaqiyatli biriktirildi!",
          'success'
        );
      };
      reader.readAsDataURL(file);
    }

    function handlePayNow() {
      if (!currentUser) {
        showToast(
          lang === 'ru'
            ? 'Пожалуйста, сначала войдите в систему!'
            : "Kursni sotib olish uchun avval tizimga kiring!",
          'warning'
        );
        setCheckoutCourse(null);
        navigate('login');
        return;
      }

      if (!receiptImage) {
        setReceiptError(
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

      setIsProcessing(true);

      setTimeout(() => {
        const accountMask = (adminCardNumber || '8600 4912 8301 7724').trim();

        // 1. Pending to'lov yaratiladi va Admin panelidagi "Kurs sotib olmoqchi bo'lganlar" bo'limiga tushadi!
        createPendingPayment({
          courseId: checkoutCourse.id,
          courseTitle: loc(checkoutCourse, 'title'),
          courseThumbnail: checkoutCourse.thumbnail,
          amount: basePrice,
          provider: 'card',
          accountMask,
          receiptImage
        });

        setIsProcessing(false);

        showToast(
          lang === 'ru'
            ? "Чек отправлен админу! Как только администратор подтвердит оплату, курс откроется прямо здесь."
            : "To'lov chekingiz adminga yuborildi! Admin tasdiqlashi bilan shu oynada kurs ko'rish imkoniyati ochiladi.",
          'success'
        );
      }, 500);
    }

    return (
      <div className="modal-backdrop" onClick={() => { if (!isProcessing) setCheckoutCourse(null); }}>
        <div className="modal-card" onClick={(e) => e.stopPropagation()}>
          <div className="modal-header">
            <h3>💳 {t.payment.title}</h3>
            <button className="close-btn" disabled={isProcessing} onClick={() => setCheckoutCourse(null)}>✕</button>
          </div>

          <div className="modal-body">
            <div className="checkout-course-summary">
              <img src={checkoutCourse.thumbnail} alt={loc(checkoutCourse, 'title')} />
              <div>
                <h4>{loc(checkoutCourse, 'title')}</h4>
                <span className="text-muted">{formatPrice(basePrice)}</span>
              </div>
            </div>

            <div style={{ background: 'rgba(99, 102, 241, 0.12)', border: '1px solid rgba(99, 102, 241, 0.3)', borderRadius: '10px', padding: '10px 14px', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ fontSize: '1.3rem' }}>🌟</span>
              <div style={{ fontSize: '0.86rem', lineHeight: '1.4' }}>
                <strong>{lang === 'ru' ? 'Полный доступ ко всей платформе:' : "Barcha kurslarga to'liq kirish:"}</strong>{' '}
                {lang === 'ru'
                  ? 'Вам не нужно покупать каждый урок или видео отдельно. Данная оплата открывает все видеоуроки и курсы!'
                  : "Videolarni birma-bir sotib olishingiz shart emas. Ushbu to'lov platformadagi barcha umumiy kurslarni ochadi!"}
              </div>
            </div>

            {isAlreadyEnrolled ? (
              <div
                style={{
                  textAlign: 'center',
                  padding: '24px 16px',
                  background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.14), rgba(5, 150, 105, 0.08))',
                  border: '2px solid rgba(16, 185, 129, 0.5)',
                  borderRadius: '14px'
                }}
              >
                <div style={{ fontSize: '3rem', marginBottom: '8px' }}>🎉</div>
                <h4 style={{ marginBottom: '8px', color: '#10b981', fontSize: '1.2rem', fontWeight: 800 }}>
                  {lang === 'ru'
                    ? 'Оплата подтверждена! Курс открыт для просмотра!'
                    : "To'lov tasdiqlandi! Kurs ko'rish imkoniyati ochildi!"}
                </h4>
                <p className="text-muted" style={{ marginBottom: '20px', fontSize: '0.92rem', lineHeight: '1.5' }}>
                  {lang === 'ru'
                    ? 'Администратор подтвердил поступление средств на карту. Все видеоуроки и материалы курса полностью открыты для вас.'
                    : "Admin bank kartasiga pul tushganini tasdiqladi. Endi ushbu kursning barcha video darslarini bemalol ko'rishingiz mumkin!"}
                </p>
                <button
                  className="btn btn-success btn-block btn-lg"
                  style={{
                    background: 'linear-gradient(135deg, #10b981, #059669)',
                    color: '#fff',
                    border: 'none',
                    fontWeight: 800,
                    fontSize: '1.02rem',
                    padding: '14px 20px',
                    boxShadow: '0 8px 20px rgba(16, 185, 129, 0.35)'
                  }}
                  onClick={() => {
                    const targetCourseId = db.courses.some((c) => c.id === checkoutCourse.id)
                      ? checkoutCourse.id
                      : (db.courses[0]?.id || checkoutCourse.id);
                    setCheckoutCourse(null);
                    navigate('learning', { courseId: targetCourseId });
                  }}
                >
                  ▶️ {lang === 'ru' ? 'Смотреть курс (Начать уроки)' : "Kursni ko'rish (Darslarni boshlash)"}
                </button>
              </div>
            ) : isPendingApproval ? (
              <div style={{ textAlign: 'center', padding: '24px 10px' }}>
                <div style={{ fontSize: '2.8rem', marginBottom: '10px' }}>⏳</div>
                <h4 style={{ marginBottom: '10px', color: '#f59e0b' }}>
                  {lang === 'ru'
                    ? 'Оплата проверяется администратором!'
                    : "To'lov tekshirilmoqda!"}
                </h4>
                <p className="text-muted" style={{ marginBottom: '16px', fontSize: '0.9rem', lineHeight: '1.5' }}>
                  {lang === 'ru'
                    ? 'Вы уже отправили чек об оплате. Администратор проверяет поступление средств на банковскую карту. Как только деньги поступят на карту, курс автоматически откроется в вашем кабинете.'
                    : "Siz to'lov chekini yuborgansiz. Admin bank kartasiga pul tushganini tekshirmoqda. Kartaga pul tushishi bilan kurs kabinetingizda avtomatik ochiladi."}
                </p>
                <div style={{ background: 'rgba(245, 158, 11, 0.1)', border: '1px solid rgba(245, 158, 11, 0.3)', borderRadius: '10px', padding: '12px 14px', marginBottom: '20px', fontSize: '0.85rem', textAlign: 'left' }}>
                  🛡️ <strong>{lang === 'ru' ? 'Правило безопасности:' : 'Xavfsizlik qoidasi:'}</strong>{' '}
                  {lang === 'ru'
                    ? 'Доступ к курсу активируется только после подтверждения реального поступления средств на карту.'
                    : "Kartaga haqiqiy pul kelib tushmagunicha kurs ochilmaydi."}
                </div>
                <button
                  className="btn btn-outline btn-block"
                  onClick={() => setCheckoutCourse(null)}
                >
                  {lang === 'ru' ? 'Понятно' : 'Tushunarli'}
                </button>
              </div>
            ) : (
              <>
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
                        {formatPrice(basePrice)}
                      </strong>
                    </div>
                  </div>
                </div>

                {/* 2. TO'LOV CHEKINI YUKLASH (MAJBURIY) */}
                <div
                  style={{
                    background: receiptImage ? 'rgba(16, 185, 129, 0.08)' : 'var(--bg-alt)',
                    border: `2px dashed ${receiptImage ? '#10b981' : receiptError ? '#ef4444' : 'var(--border)'}`,
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
                    {receiptImage && (
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

                  {receiptError && (
                    <div style={{ background: 'rgba(239, 68, 68, 0.12)', color: '#ef4444', padding: '8px 12px', borderRadius: '8px', fontSize: '0.84rem', fontWeight: 600, marginBottom: '10px' }}>
                      ⚠️ {receiptError}
                    </div>
                  )}

                  {!receiptImage ? (
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
                        onChange={handleReceiptFileChange}
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
                        src={receiptImage}
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
                            onChange={handleReceiptFileChange}
                          />
                          🔄 {lang === 'ru' ? 'Заменить' : 'Almashtirish'}
                        </label>
                        <button
                          type="button"
                          className="btn btn-ghost btn-sm"
                          style={{ color: '#ef4444' }}
                          onClick={() => setReceiptImage('')}
                        >
                          🗑
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* NARX HISOBOYI */}
                <div className="price-breakdown" style={{ marginBottom: '14px' }}>
                  <div className="price-row">
                    <span>{lang === 'ru' ? 'Стоимость курса:' : 'Kurs narxi:'}</span>
                    <span>{formatPrice(basePrice)}</span>
                  </div>
                  <div className="price-row total" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span>{lang === 'ru' ? 'Итого к оплате:' : "Jami to'lov summasi:"}</span>
                    <span style={{ color: 'var(--primary)', fontSize: '1.25rem', fontWeight: 800 }}>
                      {formatPrice(basePrice)}
                    </span>
                  </div>
                </div>

                {/* 3. TASDIQLASH VA KURSLARNI OCHISH */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <button
                    type="button"
                    className="btn btn-success btn-block btn-lg"
                    style={{
                      background: !receiptImage
                        ? 'linear-gradient(135deg, #64748b, #475569)'
                        : 'linear-gradient(135deg, #10b981, #059669)',
                      border: 'none',
                      boxShadow: receiptImage ? '0 6px 18px rgba(16, 185, 129, 0.35)' : 'none',
                      padding: '14px',
                      fontSize: '1.02rem',
                      fontWeight: 700,
                      cursor: isProcessing ? 'wait' : 'pointer'
                    }}
                    disabled={isProcessing}
                    onClick={handlePayNow}
                  >
                    {isProcessing ? (
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                        <span>⏳</span>
                        {lang === 'ru' ? 'Отправка чека на проверку...' : "Chek adminga tekshiruvga yuborilmoqda..."}
                      </span>
                    ) : (
                      <span>
                        {receiptImage ? '📤' : '🔒'}{' '}
                        {lang === 'ru'
                          ? 'Отправить чек на проверку администратору'
                          : "To'lov chekini tekshiruvga yuborish"}
                      </span>
                    )}
                  </button>

                  {!receiptImage && (
                    <small style={{ textAlign: 'center', color: '#ef4444', fontSize: '0.8rem', fontWeight: 600 }}>
                      {lang === 'ru'
                        ? '⚠️ Сначала прикрепите фото чека выше'
                        : "⚠️ Avval yuqoridagi maydonga to'lov cheki rasmini yuklang"}
                    </small>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    );
  }

  // 2. FREE LESSON PREVIEW MODAL
  if (previewLesson) {
    return (
      <div className="modal-backdrop" onClick={() => setPreviewLesson(null)}>
        <div className="modal-card modal-lg" onClick={(e) => e.stopPropagation()}>
          <div className="modal-header">
            <h3>📖 {t.courseDetail.freePreview}: {loc(previewLesson, 'title')}</h3>
            <button className="close-btn" onClick={() => setPreviewLesson(null)}>✕</button>
          </div>
          <div className="modal-body">
            <div className="preview-meta-bar mb-4">
              <span className="status-pill paid">
                ✓ {lang === 'ru' ? 'Бесплатный открытый урок' : 'Bepul ochiq dars'}
              </span>
              <span className="text-muted">
                ⏱️ {previewLesson.duration || 20} {lang === 'ru' ? 'минут чтения и практики' : "daqiqa o'qish va amaliyot"}
              </span>
              {previewLesson.attachmentName && (
                <span className="role-badge">📎 {previewLesson.attachmentName}</span>
              )}
            </div>

            {modalVideoUrl && (
              <div
                className="preview-video-container mb-4"
                style={{
                  borderRadius: '12px',
                  overflow: 'hidden',
                  background: '#000',
                  marginBottom: '18px',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.3)'
                }}
              >
                <video
                  controls
                  playsInline
                  disablePictureInPicture
                  disableRemotePlayback
                  controlsList="nodownload"
                  src={modalVideoUrl}
                  style={{ width: '100%', maxHeight: '360px', display: 'block' }}
                />
              </div>
            )}

            <div className="lesson-notes-card">
              <h4>📖 {lang === 'ru' ? 'Конспект урока и основные понятия:' : 'Dars konspekti va asosiy tushunchalar:'}</h4>
              <p className="lesson-preview-notes">{loc(previewLesson, 'content')}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 3. PRINTABLE OFFICIAL CERTIFICATE MODAL
  if (activeCertificate) {
    const student = db.users.find((u) => u.id === activeCertificate.userId);
    const course = db.courses.find((c) => c.id === activeCertificate.courseId);
    const teacher = db.users.find((u) => u.id === course?.teacherId);

    return (
      <div className="modal-backdrop" onClick={() => setActiveCertificate(null)}>
        <div className="modal-card modal-lg" onClick={(e) => e.stopPropagation()}>
          <div className="modal-header">
            <h3>
              🎓 {lang === 'ru' ? 'Официальный сертификат CodeCraft' : 'CodeCraft Rasmiy Sertifikati'} ({activeCertificate.code})
            </h3>
            <button className="close-btn" onClick={() => setActiveCertificate(null)}>✕</button>
          </div>
          <div className="modal-body">
            <div className="certificate-canvas" id="printable-certificate">
              <div className="cert-border">
                <div className="cert-top-row">
                  <span className="cert-brand">🎓 CODECRAFT ACADEMY</span>
                  <span className="cert-code">ID: {activeCertificate.code}</span>
                </div>
                <h2 className="cert-heading">{lang === 'ru' ? 'СЕРТИФИКАТ' : 'SERTIFIKAT'}</h2>
                <p className="cert-sub">
                  {lang === 'ru' ? 'Настоящим подтверждается, что:' : 'Ushbu sertifikat egasi muvaffaqiyatli yakunladi:'}
                </p>
                <h1 className="cert-student-name">{student?.name || currentUser?.name}</h1>
                <p className="cert-course-Text">
                  {lang === 'ru' ? (
                    <>
                      успешно завершил(а) все модули, тестовые испытания и практические проекты курса{' '}
                      <strong>"{loc(course, 'title')}"</strong> со 100% результатом.
                    </>
                  ) : (
                    <>
                      <strong>"{loc(course, 'title')}"</strong> amaliy o'quv kursining barcha modullari, test sinovlari va amaliy loyihalarini 100% natija bilan tamomladi.
                    </>
                  )}
                </p>
                <div className="cert-footer-row">
                  <div>
                    <small>{lang === 'ru' ? 'Ментор курса:' : 'Kurs mentori:'}</small>
                    <strong>{teacher?.name || 'Muhammaddiyor Orifjonov'}</strong>
                  </div>
                  <div className="cert-seal">✓ VERIFIED</div>
                  <div>
                    <small>{lang === 'ru' ? 'Дата выдачи:' : 'Berilgan sana:'}</small>
                    <strong>{new Date(activeCertificate.issuedAt).toLocaleDateString()}</strong>
                  </div>
                </div>
              </div>
            </div>
            <div className="modal-actions-row">
              <button className="btn btn-primary" onClick={() => window.print()}>
                🖨️ {lang === 'ru' ? 'Скачать PDF / Печать' : 'PDF yuklab olish / Chop etish'}
              </button>
              <button
                type="button"
                className="btn btn-outline"
                style={{
                  borderColor: 'rgba(239, 68, 68, 0.4)',
                  color: '#ef4444',
                  background: 'rgba(239, 68, 68, 0.08)'
                }}
                onClick={() => {
                  const confirmMsg = lang === 'ru'
                    ? `Удалить сертификат ${activeCertificate.code}?`
                    : `Haqiqatan ham ${activeCertificate.code} sertifikatini o'chirmoqchimisiz?`;
                  if (window.confirm(confirmMsg)) {
                    const certId = activeCertificate.id;
                    setActiveCertificate(null);
                    deleteCertificate(certId);
                  }
                }}
              >
                🗑️ {lang === 'ru' ? 'Удалить' : "O'chirish"}
              </button>
              <button className="btn btn-outline" onClick={() => setActiveCertificate(null)}>
                {lang === 'ru' ? 'Закрыть' : 'Yopish'}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
