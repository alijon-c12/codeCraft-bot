import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext.jsx';

export function AuthPage({ mode = 'login' }) {
  const {
    t,
    loginWithPhone,
    register,
    resetPassword,
    quickDemoLogin,
    navigate,
    route,
    showToast,
    lang
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

      const loginRes = loginWithPhone({ name, phone, user: data.user });
      if (!loginRes.ok) {
        setError(loginRes.error);
      }
    } catch (err) {
      console.error('Verify SMS error:', err);
      setError(t.auth.errors.invalidSmsCode);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="section auth-section">
      <div className="container narrow-container">
        <div className="auth-card">
          <div className="auth-brand-badge">⚡</div>
          <div className="auth-header">
            <h1>{smsStep ? t.auth.smsSentTitle : t.auth.loginTitle}</h1>
            <p>{smsStep ? `${phone} ${t.auth.smsSentSub}` : t.auth.loginSub}</p>
          </div>

          {error && <div className="alert-error">⚠️ {error}</div>}

          {/* LOGIN: STEP 1 (NAME & PHONE) OR STEP 2 (SMS CODE) */}
          {!smsStep ? (
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

              <div style={{ marginTop: '12px', textAlign: 'center' }}>
                <button
                  type="button"
                  className="btn btn-xs btn-ghost"
                  onClick={() => {
                    setName('Alibek Abdunabiyev');
                    setPhone('+998 95 163 91 01');
                    setPhoneError('');
                    setError('');
                  }}
                  style={{
                    color: 'var(--text-muted)',
                    fontSize: '0.8rem',
                    border: '1px dashed var(--border)',
                    borderRadius: '99px',
                    padding: '5px 14px',
                    cursor: 'pointer'
                  }}
                  title="Admin sifatida tezkor to'ldirish"
                >
                  👑 Bosh Admin: +998 95 163 91 01
                </button>
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
