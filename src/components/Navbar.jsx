import React, { useState } from 'react';
import { useApp } from '../context/AppContext.jsx';

export function Navbar() {
  const {
    currentUser,
    lang,
    setLang,
    theme,
    toggleTheme,
    t,
    route,
    navigate,
    logout,
    db
  } = useApp();
  const [mobileOpen, setMobileOpen] = useState(false);

  const unreadCount = currentUser
    ? db.notifications.filter((n) => n.userId === currentUser.id && !n.read).length
    : 0;

  const navItems = currentUser
    ? [
        { id: 'courses', label: t.nav.courses },
        { id: 'myCourses', label: t.nav.myCourses }
      ]
    : [
        { id: 'home', label: t.nav.home },
        { id: 'teachers', label: t.nav.teachers },
        { id: 'about', label: t.nav.about },
        { id: 'contact', label: t.nav.contact }
      ];

  function handleNav(page) {
    navigate(page);
    setMobileOpen(false);
  }

  return (
    <header className="navbar">
      <div className="container navbar-inner">
        <button className="brand-logo" onClick={() => handleNav(currentUser ? 'courses' : 'home')}>
          <div className="brand-logo-42-badge" style={{ padding: 0, overflow: 'hidden', background: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <img
              src="/logo.jpg"
              alt="CodeCraft"
              style={{ width: '32px', height: '32px', borderRadius: '50%', objectFit: 'cover' }}
              onError={(e) => {
                e.currentTarget.onerror = null;
                e.currentTarget.src = '/favicon.png';
              }}
            />
          </div>
          <div className="brand-text">
            <span className="brand-name">CodeCraft</span>
          </div>
        </button>

        <nav className="nav-links desktop-only">
          {navItems.map((item) => (
            <button
              key={item.id}
              className={`nav-link ${route.page === item.id ? 'active' : ''}`}
              onClick={() => handleNav(item.id)}
            >
              {item.label}
            </button>
          ))}
        </nav>

        <div className="nav-actions">
          <div className="lang-switcher" role="group" aria-label="Language switcher">
            <button
              className={`lang-btn ${lang === 'uz' ? 'active' : ''}`}
              onClick={() => setLang('uz')}
            >
              UZ
            </button>
            <button
              className={`lang-btn ${lang === 'ru' ? 'active' : ''}`}
              onClick={() => setLang('ru')}
            >
              RU
            </button>
          </div>

          <button
            className="icon-btn"
            onClick={toggleTheme}
            title={theme === 'light' ? t.nav.darkMode : t.nav.lightMode}
          >
            {theme === 'light' ? '🌙' : '☀️'}
          </button>

          {currentUser ? (
            <div className="user-Menu-bar">
              {currentUser.role === 'admin' && (
                <button
                  className={`btn btn-sm ${route.page === 'admin' ? 'btn-primary' : 'btn-outline'}`}
                  onClick={() => handleNav('admin')}
                >
                  🛡️ {t.nav.adminPanel}
                </button>
              )}
              {(currentUser.role === 'teacher' || currentUser.role === 'admin') && (
                <button
                  className={`btn btn-sm ${route.page === 'teacher' ? 'btn-primary' : 'btn-outline'}`}
                  onClick={() => handleNav('teacher')}
                >
                  👨‍🏫 {t.nav.teacherPanel}
                </button>
              )}
              <button
                className={`btn btn-sm ${route.page === 'dashboard' ? 'btn-primary' : 'btn-soft'}`}
                onClick={() => handleNav('dashboard')}
              >
                👤 {currentUser.name.split(' ')[0]}
                {unreadCount > 0 && <span className="badge-dot">{unreadCount}</span>}
              </button>
              <button
                className="btn btn-sm btn-outline"
                onClick={logout}
                title={t.nav.logout}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  borderColor: 'rgba(239, 68, 68, 0.35)',
                  background: 'rgba(239, 68, 68, 0.08)',
                  color: '#f87171',
                  fontWeight: '600',
                  padding: '6px 12px',
                  borderRadius: '10px'
                }}
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                  <polyline points="16 17 21 12 16 7" />
                  <line x1="21" y1="12" x2="9" y2="12" />
                </svg>
                <span>{t.nav.logout}</span>
              </button>
            </div>
          ) : (
            <div className="auth-buttons desktop-only">
              <button className="btn-dark-pill" onClick={() => handleNav('login')}>
                {t.nav.login}
              </button>
            </div>
          )}

          <button
            className="burger-btn mobile-only"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle Menu"
          >
            {mobileOpen ? '✕' : '☰'}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="mobile-drawer">
          <div className="container mobile-drawer-inner">
            {navItems.map((item) => (
              <button
                key={item.id}
                className={`mobile-nav-link ${route.page === item.id ? 'active' : ''}`}
                onClick={() => handleNav(item.id)}
              >
                {item.label}
              </button>
            ))}
            <hr className="divider" />
            {currentUser ? (
              <div className="mobile-auth-stack">
                <button className="btn btn-primary btn-block" onClick={() => handleNav('dashboard')}>
                  👤 {t.nav.dashboard} ({currentUser.name})
                </button>
                {(currentUser.role === 'teacher' || currentUser.role === 'admin') && (
                  <button className="btn btn-outline btn-block" onClick={() => handleNav('teacher')}>
                    👨‍🏫 {t.nav.teacherPanel}
                  </button>
                )}
                {currentUser.role === 'admin' && (
                  <button className="btn btn-outline btn-block" onClick={() => handleNav('admin')}>
                    🛡️ {t.nav.adminPanel}
                  </button>
                )}
                <button
                  className="btn btn-outline btn-block"
                  onClick={() => {
                    setMobileOpen(false);
                    logout();
                  }}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    borderColor: 'rgba(239, 68, 68, 0.35)',
                    background: 'rgba(239, 68, 68, 0.08)',
                    color: '#f87171',
                    fontWeight: '600'
                  }}
                >
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                    <polyline points="16 17 21 12 16 7" />
                    <line x1="21" y1="12" x2="9" y2="12" />
                  </svg>
                  <span>{t.nav.logout}</span>
                </button>
              </div>
            ) : (
              <div className="mobile-auth-stack">
                <button className="btn btn-primary btn-block" onClick={() => handleNav('login')}>
                  {t.nav.login}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
