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
    validatePromoCode,
    createPendingPayment,
    processPaymentWebhook,
    previewLesson,
    setPreviewLesson,
    activeCertificate,
    setActiveCertificate,
    navigate,
    showToast,
    lang
  } = useApp();

  const [provider, setProvider] = useState('payme');
  const [promoInput, setPromoInput] = useState('');
  const [appliedPromo, setAppliedPromo] = useState(null);
  const [pendingPayment, setPendingPayment] = useState(null);
  const [modalVideoUrl, setModalVideoUrl] = useState('');

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

  // 1. CHECKOUT & PAYME/CLICK SANDBOX MODAL
  if (checkoutCourse) {
    const basePrice = checkoutCourse.discountPrice || checkoutCourse.price;
    const promoResult = validatePromoCode(appliedPromo || '', basePrice);

    function handleApplyPromo() {
      const check = validatePromoCode(promoInput, basePrice);
      if (check.valid) {
        setAppliedPromo(promoInput.toUpperCase().trim());
        showToast(t.payment.promoApplied, 'success');
      } else {
        setAppliedPromo(null);
        showToast(t.payment.promoInvalid, 'error');
      }
    }

    function handleCreateInvoice() {
      if (!currentUser) {
        setCheckoutCourse(null);
        navigate('login');
        return;
      }
      const payment = createPendingPayment({
        courseId: checkoutCourse.id,
        provider,
        promoCode: appliedPromo
      });
      setPendingPayment(payment);
    }

    function handleWebhookConfirm(status) {
      if (!pendingPayment) return;
      processPaymentWebhook(pendingPayment.id, status);
      const targetCourseId = checkoutCourse.id;
      setPendingPayment(null);
      setCheckoutCourse(null);
      setPromoInput('');
      setAppliedPromo(null);
      if (status === 'paid') {
        navigate('learning', { courseId: targetCourseId });
      }
    }

    return (
      <div className="modal-backdrop" onClick={() => { setCheckoutCourse(null); setPendingPayment(null); }}>
        <div className="modal-card" onClick={(e) => e.stopPropagation()}>
          <div className="modal-header">
            <h3>💳 {t.payment.title}</h3>
            <button className="close-btn" onClick={() => { setCheckoutCourse(null); setPendingPayment(null); }}>✕</button>
          </div>

          <div className="modal-body">
            <div className="checkout-course-summary">
              <img src={checkoutCourse.thumbnail} alt={loc(checkoutCourse, 'title')} />
              <div>
                <h4>{loc(checkoutCourse, 'title')}</h4>
                <span className="text-muted">{formatPrice(basePrice)}</span>
              </div>
            </div>

            {!pendingPayment ? (
              <>
                <label className="field-label">{t.payment.selectProvider}</label>
                <div className="provider-grid">
                  <button
                    type="button"
                    className={`provider-card ${provider === 'payme' ? 'selected' : ''}`}
                    onClick={() => setProvider('payme')}
                  >
                    <span className="provider-logo payme-text">Payme</span>
                    <small>Uzcard / Humo / Visa</small>
                  </button>
                  <button
                    type="button"
                    className={`provider-card ${provider === 'click' ? 'selected' : ''}`}
                    onClick={() => setProvider('click')}
                  >
                    <span className="provider-logo click-text">CLICK Evolution</span>
                    <small>{lang === 'ru' ? 'Быстрая оплата' : "Tezkor to'lov"}</small>
                  </button>
                </div>

                <label className="field-label">{t.payment.promoLabel}</label>
                <div className="promo-row">
                  <input
                    type="text"
                    className="input"
                    placeholder={t.payment.promoPlaceholder}
                    value={promoInput}
                    onChange={(e) => setPromoInput(e.target.value)}
                  />
                  <button type="button" className="btn btn-outline" onClick={handleApplyPromo}>
                    {t.payment.applyPromo}
                  </button>
                </div>
                <small className="promo-hint">
                  💡 {lang === 'ru' ? 'Тестовые промокоды:' : 'Sinov promo-kodlar:'} <code>EDUCENTER20</code> (-20%), <code>START50</code> (-50,000), <code>PRO30</code> (-30%)
                </small>

                <div className="price-breakdown">
                  <div className="price-row">
                    <span>{t.payment.originalPrice}</span>
                    <span>{formatPrice(basePrice)}</span>
                  </div>
                  {promoResult.valid && (
                    <div className="price-row discount">
                      <span>{t.payment.discountAmount} ({promoResult.promo.code})</span>
                      <span>- {formatPrice(promoResult.discountAmount)}</span>
                    </div>
                  )}
                  <div className="price-row total">
                    <span>{t.payment.totalPayable}</span>
                    <span>{formatPrice(promoResult.finalPrice)}</span>
                  </div>
                </div>

                <button className="btn btn-primary btn-block btn-lg" onClick={handleCreateInvoice}>
                  🔒 {t.payment.createInvoice} ({provider.toUpperCase()})
                </button>
              </>
            ) : (
              <div className="sandbox-gateway">
                <div className="sandbox-alert">
                  <strong>🛠️ {provider.toUpperCase()} Merchant Sandbox</strong>
                  <p>{t.payment.sandboxNotice}</p>
                  <div className="tx-details">
                    <div><span>Invoice ID:</span> <code>{pendingPayment.transactionId}</code></div>
                    <div><span>{lang === 'ru' ? 'Статус:' : 'Holat (Status):'}</span> <span className="status-pill pending">PENDING</span></div>
                    <div><span>{lang === 'ru' ? 'Сумма:' : 'Summa:'}</span> <strong>{formatPrice(pendingPayment.amount)}</strong></div>
                  </div>
                </div>

                <div className="sandbox-actions">
                  <button
                    className="btn btn-success btn-block btn-lg"
                    onClick={() => handleWebhookConfirm('paid')}
                  >
                    ✅ {t.payment.confirmWebhook}
                  </button>
                  <button
                    className="btn btn-outline btn-block"
                    onClick={() => handleWebhookConfirm('cancelled')}
                  >
                    ❌ {t.payment.cancelPayment}
                  </button>
                </div>
              </div>
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
