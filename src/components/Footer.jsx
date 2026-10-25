import React from 'react';
import { useApp } from '../context/AppContext.jsx';

export function Footer() {
  const { t, navigate, currentUser, lang } = useApp();

  return (
    <footer className="footer">
      <div className="container footer-grid">
        <div className="footer-brand">
          <div className="brand-logo" onClick={() => navigate('home')}>
            <div className="brand-logo-42-badge">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                <path d="M5 3L15 3L9 13H17L7 23L11 15H3L5 3Z" fill="#ff5722"/>
              </svg>
            </div>
            <div className="brand-text">
              <span className="brand-name">CodeCraft</span>
            </div>
          </div>
          <p className="footer-desc">{t.footer.description}</p>
        </div>

        <div className="footer-col">
          <h4>{t.footer.quickLinks}</h4>
          <ul>
            {currentUser && (
              <li><button onClick={() => navigate('courses')}>{t.nav.courses}</button></li>
            )}
            <li><button onClick={() => navigate('about')}>{t.nav.about}</button></li>
            <li><button onClick={() => navigate('contact')}>{t.nav.contact}</button></li>
          </ul>
        </div>

        <div className="footer-col">
          <h4>{t.footer.legalTitle}</h4>
          <ul>
            <li><button onClick={() => navigate('privacy')}>{t.footer.privacy}</button></li>
            <li><button onClick={() => navigate('terms')}>{t.footer.terms}</button></li>
          </ul>
        </div>
      </div>

      <div className="container footer-bottom">
        <span>© {new Date().getFullYear()} CodeCraft LLC. {t.footer.rights}</span>
        <span>{lang === 'ru' ? 'UZS • Республика Узбекистан' : "UZS • O'zbekiston Respublikasi"}</span>
      </div>
    </footer>
  );
}
