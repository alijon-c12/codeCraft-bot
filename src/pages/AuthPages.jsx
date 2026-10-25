import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext.jsx';

export function AuthPage({ mode = 'login' }) {
  const {
    t,
    login,
    register,
    resetPassword,
    navigate,
    showToast,
    lang
  } = useApp();

  const [activeTab, setActiveTab] = useState(
    mode === 'register' ? 'register' : mode === 'reset' ? 'reset' : 'login'
  );

  useEffect(() => {
    if (mode === 'register' || mode === 'reset' || mode === 'login') {
      setActiveTab(mode);
    }
  }, [mode]);

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('+998');
  const [phoneError, setPhoneError] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  function handlePhoneChange(e) {
    let val = e.target.value;
    // Keep +998 at start
    if (!val.startsWith('+')) {
      val = '+' + val.replace(/\D/g, '');
    }
    if (!val.startsWith('+998')) {
      val = '+998' + val.replace(/^\+?9?9?8?/, '');
    }
    setPhone(val);
    setError('');
    setPhoneError('');
  }

  function validatePhone(val) {
    const digits = (val || '').replace(/\D/g, '');
    if (digits.length < 9) {
      return (
        lang === 'ru'
          ? 'Пожалуйста, введите корректный номер телефона'
          : "Iltimos, to'liq telefon raqamingizni kiriting"
      );
    }
    return '';
  }

  async function handleLoginSubmit(e) {
    if (e && e.preventDefault) e.preventDefault();
    setError('');

    const pErr = validatePhone(phone);
    if (pErr) {
      setPhoneError(pErr);
      setError(pErr);
      return;
    }

    if (!password) {
      setError(lang === 'ru' ? 'Введите пароль' : 'Parolni kiriting');
      return;
    }

    setLoading(true);
    try {
      const res = await login(phone.trim(), password);
      if (!res.ok) {
        setError(res.error || t.auth.errors.invalidCreds);
      }
    } catch (err) {
      console.error('Login error:', err);
      setError(t.auth.errors.invalidCreds);
    } finally {
      setLoading(false);
    }
  }

  async function handleRegisterSubmit(e) {
    if (e && e.preventDefault) e.preventDefault();
    setError('');

    if (name.trim().length < 2) {
      setError(lang === 'ru' ? 'Введите ваше имя' : "Ism familiyangizni kiriting");
      return;
    }

    const pErr = validatePhone(phone);
    if (pErr) {
      setPhoneError(pErr);
      setError(pErr);
      return;
    }

    if (!password || password.length < 4) {
      setError(lang === 'ru' ? 'Пароль должен содержать минимум 4 символа' : "Parol kamida 4 ta belgidan iborat bo'lishi kerak");
      return;
    }

    setLoading(true);
    try {
      // register() creates a new account OR smoothly updates existing user without throwing errors
      const res = await register({
        name: name.trim(),
        phone: phone.trim(),
        password: password
      });

      if (!res.ok) {
        setError(res.error || (lang === 'ru' ? 'Ошибка регистрации' : "Ro'yxatdan o'tishda xatolik"));
      }
    } catch (err) {
      console.error('Register error:', err);
      setError(lang === 'ru' ? 'Ошибка регистрации' : "Ro'yxatdan o'tishda xatolik");
    } finally {
      setLoading(false);
    }
  }

  async function handleResetSubmit(e) {
    if (e && e.preventDefault) e.preventDefault();
    setError('');

    const pErr = validatePhone(phone);
    if (pErr) {
      setPhoneError(pErr);
      setError(pErr);
      return;
    }

    if (!password || password.length < 4) {
      setError(lang === 'ru' ? 'Пароль должен содержать минимум 4 символа' : "Parol kamida 4 ta belgidan iborat bo'lishi kerak");
      return;
    }

    setLoading(true);
    try {
      const res = resetPassword({
        phone: phone.trim(),
        newPassword: password
      });

      if (!res.ok) {
        setError(res.error || (lang === 'ru' ? 'Пользователь не найден' : 'Foydalanuvchi topilmadi'));
      } else {
        showToast(
          lang === 'ru'
            ? 'Пароль успешно обновлён! Войдите с новым паролем.'
            : "Parol muvaffaqiyatli yangilandi! Yangi parol bilan kiring.",
          'success'
        );
        setActiveTab('login');
      }
    } catch (err) {
      console.error('Reset password error:', err);
      setError(lang === 'ru' ? 'Ошибка при сбросе пароля' : 'Parolni yangilashda xatolik');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="section auth-section">
      <div className="container narrow-container">
        <div className="auth-card">
          <div className="auth-brand-badge">⚡</div>

          {/* TAB SELECTOR: KIRISH / RO'YXATDAN O'TISH */}
          <div
            style={{
              display: 'flex',
              background: 'var(--bg-alt, rgba(0,0,0,0.04))',
              padding: '4px',
              borderRadius: '12px',
              marginBottom: '20px',
              gap: '4px'
            }}
          >
            <button
              type="button"
              style={{
                flex: 1,
                padding: '10px 14px',
                borderRadius: '8px',
                border: 'none',
                fontWeight: 700,
                fontSize: '0.92rem',
                cursor: 'pointer',
                transition: 'all 0.2s',
                background: activeTab === 'login' ? 'var(--primary)' : 'transparent',
                color: activeTab === 'login' ? '#fff' : 'var(--text-muted)'
              }}
              onClick={() => {
                setActiveTab('login');
                setError('');
                setPhoneError('');
              }}
            >
              🔑 {t.auth.loginBtn || (lang === 'ru' ? 'Вход' : 'Kirish')}
            </button>
            <button
              type="button"
              style={{
                flex: 1,
                padding: '10px 14px',
                borderRadius: '8px',
                border: 'none',
                fontWeight: 700,
                fontSize: '0.92rem',
                cursor: 'pointer',
                transition: 'all 0.2s',
                background: activeTab === 'register' ? 'var(--primary)' : 'transparent',
                color: activeTab === 'register' ? '#fff' : 'var(--text-muted)'
              }}
              onClick={() => {
                setActiveTab('register');
                setError('');
                setPhoneError('');
              }}
            >
              ✨ {t.auth.registerBtn || (lang === 'ru' ? 'Регистрация' : "Ro'yxatdan o'tish")}
            </button>
          </div>

          <div className="auth-header">
            <h1>
              {activeTab === 'login'
                ? t.auth.loginTitle
                : activeTab === 'register'
                ? t.auth.registerTitle
                : t.auth.resetTitle}
            </h1>
            <p>
              {activeTab === 'login'
                ? t.auth.loginSub
                : activeTab === 'register'
                ? (lang === 'ru' ? 'Быстрая регистрация: укажите имя, номер и пароль' : "Tezkor ro'yxatdan o'tish: ism, telefon va parolingizni kiriting")
                : t.auth.resetSub}
            </p>
          </div>

          {error && <div className="alert-error">⚠️ {error}</div>}

          {/* 1. LOGIN FORM */}
          {activeTab === 'login' && (
            <form className="auth-form" onSubmit={handleLoginSubmit} noValidate>
              <div className="form-group">
                <label className="field-label">
                  <span>📱</span>
                  <span>{t.auth.loginPhoneLabel || (lang === 'ru' ? 'Номер телефона' : 'Telefon raqam')}</span>
                </label>
                <input
                  type="tel"
                  className={`input ${phoneError ? 'input-error' : ''}`}
                  style={phoneError ? { borderColor: '#ef4444', backgroundColor: 'rgba(239, 68, 68, 0.04)' } : {}}
                  placeholder="+998 90 123 45 67"
                  value={phone}
                  onChange={handlePhoneChange}
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

              <div className="form-group">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <label className="field-label" style={{ margin: 0 }}>
                    <span>🔒</span>
                    <span>{t.auth.passwordLabel || (lang === 'ru' ? 'Пароль' : 'Parol')}</span>
                  </label>
                  <button
                    type="button"
                    className="text-link"
                    style={{ fontSize: '0.82rem' }}
                    onClick={() => {
                      setActiveTab('reset');
                      setError('');
                      setPhoneError('');
                    }}
                  >
                    {t.auth.forgotPassword || (lang === 'ru' ? 'Забыли пароль?' : 'Parolni unutdingizmi?')}
                  </button>
                </div>

                <div style={{ position: 'relative' }}>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    className="input"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      setError('');
                    }}
                    style={{ paddingRight: '40px' }}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{
                      position: 'absolute',
                      right: '10px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      fontSize: '1.1rem',
                      padding: '4px'
                    }}
                    title={showPassword ? 'Yashirish' : "Ko'rsatish"}
                  >
                    {showPassword ? '🙈' : '👁️'}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn btn-primary btn-block btn-lg btn-auth-submit"
              >
                {loading
                  ? (lang === 'ru' ? '⏳ Вход в систему...' : '⏳ Tizimga kirilmoqda...')
                  : `🚀 ${t.auth.loginBtn || (lang === 'ru' ? 'Войти' : 'Tizimga kirish')}`}
              </button>

              <div style={{ textAlign: 'center', marginTop: '16px', fontSize: '0.9rem' }}>
                <span style={{ color: 'var(--text-muted)' }}>
                  {t.auth.noAccount || (lang === 'ru' ? 'Нет аккаунта?' : "Hisobingiz yo'qmi?")}{' '}
                </span>
                <button
                  type="button"
                  className="text-link"
                  style={{ fontWeight: 700 }}
                  onClick={() => {
                    setActiveTab('register');
                    setError('');
                    setPhoneError('');
                  }}
                >
                  {t.auth.registerBtn || (lang === 'ru' ? 'Зарегистрироваться' : "Ro'yxatdan o'tish")}
                </button>
              </div>
            </form>
          )}

          {/* 2. SIMPLE FAST REGISTER FORM */}
          {activeTab === 'register' && (
            <form className="auth-form" onSubmit={handleRegisterSubmit} noValidate>
              <div className="form-group">
                <label className="field-label">
                  <span>👤</span>
                  <span>{t.auth.loginNameLabel || (lang === 'ru' ? 'Имя и фамилия' : 'Ism familiya')}</span>
                </label>
                <input
                  type="text"
                  className="input"
                  placeholder={t.auth.loginNamePlaceholder || (lang === 'ru' ? 'Введите имя и фамилию' : 'Ism familiya kiriting')}
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
                  <span>{t.auth.loginPhoneLabel || (lang === 'ru' ? 'Номер телефона' : 'Telefon raqam')}</span>
                </label>
                <input
                  type="tel"
                  className={`input ${phoneError ? 'input-error' : ''}`}
                  style={phoneError ? { borderColor: '#ef4444', backgroundColor: 'rgba(239, 68, 68, 0.04)' } : {}}
                  placeholder="+998 90 123 45 67"
                  value={phone}
                  onChange={handlePhoneChange}
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

              <div className="form-group">
                <label className="field-label">
                  <span>🔒</span>
                  <span>{lang === 'ru' ? 'Пароль' : 'Parol'}</span>
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    className="input"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      setError('');
                    }}
                    style={{ paddingRight: '40px' }}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{
                      position: 'absolute',
                      right: '10px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      fontSize: '1.1rem',
                      padding: '4px'
                    }}
                    title={showPassword ? 'Yashirish' : "Ko'rsatish"}
                  >
                    {showPassword ? '🙈' : '👁️'}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn btn-primary btn-block btn-lg btn-auth-submit"
              >
                {loading
                  ? (lang === 'ru' ? '⏳ Регистрация...' : "⏳ Ro'yxatdan o'tilmoqda...")
                  : `✨ ${t.auth.registerBtn || (lang === 'ru' ? 'Зарегистрироваться' : "Ro'yxatdan o'tish")}`}
              </button>

              <div style={{ textAlign: 'center', marginTop: '16px', fontSize: '0.9rem' }}>
                <span style={{ color: 'var(--text-muted)' }}>
                  {t.auth.hasAccount || (lang === 'ru' ? 'Уже есть аккаунт?' : 'Allaqachon hisobingiz bormi?')}{' '}
                </span>
                <button
                  type="button"
                  className="text-link"
                  style={{ fontWeight: 700 }}
                  onClick={() => {
                    setActiveTab('login');
                    setError('');
                    setPhoneError('');
                  }}
                >
                  {t.auth.loginBtn || (lang === 'ru' ? 'Войти' : 'Kirish')}
                </button>
              </div>
            </form>
          )}

          {/* 3. RESET PASSWORD FORM */}
          {activeTab === 'reset' && (
            <form className="auth-form" onSubmit={handleResetSubmit} noValidate>
              <div className="form-group">
                <label className="field-label">
                  <span>📱</span>
                  <span>{t.auth.loginPhoneLabel || (lang === 'ru' ? 'Номер телефона' : 'Telefon raqam')}</span>
                </label>
                <input
                  type="tel"
                  className={`input ${phoneError ? 'input-error' : ''}`}
                  style={phoneError ? { borderColor: '#ef4444', backgroundColor: 'rgba(239, 68, 68, 0.04)' } : {}}
                  placeholder="+998 90 123 45 67"
                  value={phone}
                  onChange={handlePhoneChange}
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

              <div className="form-group">
                <label className="field-label">
                  <span>🔒</span>
                  <span>{lang === 'ru' ? 'Новый пароль' : 'Yangi parol'}</span>
                </label>
                <input
                  type="password"
                  className="input"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setError('');
                  }}
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn btn-primary btn-block btn-lg btn-auth-submit"
              >
                {loading
                  ? (lang === 'ru' ? '⏳ Обновление...' : '⏳ Yangilanmoqda...')
                  : `🔄 ${t.auth.resetBtn || (lang === 'ru' ? 'Обновить пароль' : 'Parolni yangilash')}`}
              </button>

              <div style={{ textAlign: 'center', marginTop: '16px', fontSize: '0.9rem' }}>
                <button
                  type="button"
                  className="text-link"
                  onClick={() => {
                    setActiveTab('login');
                    setError('');
                    setPhoneError('');
                  }}
                >
                  ← {lang === 'ru' ? 'Вернуться ко входу' : 'Kirish sahifasiga qaytish'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
