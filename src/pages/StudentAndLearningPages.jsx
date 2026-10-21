import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext.jsx';
import { getVideoUrl } from '../utils/mediaStorage.js';

export function StudentDashboardPage() {
  const {
    t,
    loc,
    formatPrice,
    db,
    currentUser,
    navigate,
    getCourseProgress,
    setActiveCertificate,
    updateProfile,
    markNotificationsRead,
    showToast,
    submitAssignment,
    sendChatMessage,
    markChatRead,
    lang
  } = useApp();

  const [activeTab, setActiveTab] = useState('myCourses');
  const [hwDrafts, setHwDrafts] = useState({});
  const [studentChatText, setStudentChatText] = useState('');
  const [profileForm, setProfileForm] = useState({
    name: currentUser?.name || '',
    phone: currentUser?.phone || '+998',
    avatar: currentUser?.avatar || ''
  });

  if (!currentUser) return null;

  const myEnrollments = db.enrollments.filter((e) => e.userId === currentUser.id);
  const myCourses = myEnrollments
    .map((e) => db.courses.find((c) => c.id === e.courseId))
    .filter(Boolean);
  const mySubmissions = db.submissions.filter((s) => s.userId === currentUser.id);
  const myCertificates = db.certificates.filter((c) => c.userId === currentUser.id);
  const myPayments = db.payments.filter((p) => p.userId === currentUser.id);
  const myNotifications = db.notifications.filter((n) => n.userId === currentUser.id);

  // Homework given to this student by admin, plus anything already submitted
  const myAssignments = db.assignments.filter(
    (a) =>
      a.studentId === currentUser.id ||
      mySubmissions.some((s) => s.assignmentId === a.id)
  );

  const MAX_HW_FILE_BYTES = 500 * 1024;

  function handleHwFile(assignmentId, file) {
    if (!file) return;
    if (file.size > MAX_HW_FILE_BYTES) {
      showToast(
        lang === 'ru'
          ? 'Файл слишком большой (макс. 500 КБ). Отправьте ссылку на GitHub.'
          : "Fayl juda katta (maks. 500 KB). GitHub havolasini yuboring.",
        'error'
      );
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      setHwDrafts((prev) => ({
        ...prev,
        [assignmentId]: {
          link: prev[assignmentId]?.link || '',
          fileName: file.name,
          fileData: String(reader.result || '')
        }
      }));
    };
    reader.readAsDataURL(file);
  }

  function handleHwSubmit(assignmentId) {
    const draft = hwDrafts[assignmentId] || { link: '', fileName: '', fileData: '' };
    if (!draft.link.trim() && !draft.fileData) {
      showToast(
        lang === 'ru'
          ? 'Добавьте ссылку на GitHub или прикрепите файл'
          : "GitHub havolasini kiriting yoki fayl biriktiring",
        'error'
      );
      return;
    }
    submitAssignment({
      assignmentId,
      answerText: draft.link.trim(),
      fileName: draft.fileName,
      fileData: draft.fileData
    });
    setHwDrafts((prev) => {
      const next = { ...prev };
      delete next[assignmentId];
      return next;
    });
  }

  function handleProfileSave(e) {
    e.preventDefault();
    if (profileForm.phone && profileForm.phone.trim()) {
      const phoneRegex = /^(\+?[0-9]{1,4}[\s-]?)?\(?[0-9]{2,4}\)?[\s-]?[0-9]{3,4}[\s-]?[0-9]{2,4}[\s-]?[0-9]{2,4}$/;
      const hasLettersOrSymbols = /[a-zA-Zа-яА-ЯёЁ!@#$%^&*_={}[\]<>]/.test(profileForm.phone);
      if (!phoneRegex.test(profileForm.phone.trim()) || hasLettersOrSymbols) {
        showToast(
          lang === 'ru'
            ? 'Вы должны ввести номер телефона'
            : 'Siz bu yerga telefon raqam kiritishingiz kerak',
          'error'
        );
        return;
      }
    }

    const updates = {
      name: profileForm.name,
      avatar: profileForm.avatar
    };
    updateProfile(updates);
  }

  return (
    <div className="section">
      <div className="container">
        <div className="dashboard-welcome-card">
          <div className="welcome-user">
            <img src={currentUser.avatar} alt={currentUser.name} className="avatar-lg" />
            <div>
              <h1>{currentUser.name}</h1>
              <p className="text-muted">
                {currentUser.phone} • {lang === 'ru' ? 'Роль:' : 'Rol:'}{' '}
                <span className="role-badge">
                  {currentUser.role === 'student'
                    ? (lang === 'ru' ? 'СТУДЕНТ' : 'TALABA')
                    : currentUser.role.toUpperCase()}
                </span>
              </p>
            </div>
          </div>
          <div className="welcome-kpis">
            <div className="mini-kpi">
              <strong>{myCourses.length}</strong>
              <span>{lang === 'ru' ? 'Мои курсы' : 'Kurslarim'}</span>
            </div>
            <div className="mini-kpi">
              <strong>{myCertificates.length}</strong>
              <span>{lang === 'ru' ? 'Сертификаты' : 'Sertifikatlar'}</span>
            </div>
            <div className="mini-kpi">
              <strong>{mySubmissions.length}</strong>
              <span>{lang === 'ru' ? 'Задания' : 'Topshiriqlar'}</span>
            </div>
          </div>
        </div>

        <div className="tabs-bar">
          {Object.entries(t.dashboard.tabs).map(([key, label]) => {
            const unreadChatCount = (db.messages || []).filter((m) => m.recipientId === currentUser.id && !m.read).length;
            return (
              <button
                key={key}
                className={`tab-btn ${activeTab === key ? 'active' : ''}`}
                onClick={() => {
                  setActiveTab(key);
                  if (key === 'chat') {
                    const admin = db.users.find((u) => u.role === 'admin') || { id: 'usr-admin-1' };
                    markChatRead(admin.id);
                  }
                }}
              >
                {label}
                {key === 'chat' && unreadChatCount > 0 && (
                  <span className="badge-dot" style={{ backgroundColor: '#ff5722', color: '#fff' }}>
                    {unreadChatCount}
                  </span>
                )}
                {key === 'notifications' && myNotifications.some((n) => !n.read) && (
                  <span className="badge-dot">
                    {myNotifications.filter((n) => !n.read).length}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* 0. CHAT WITH ADMIN */}
        {activeTab === 'chat' && (
          <div className="tab-panel">
            {(() => {
              const adminUser =
                db.users.find((u) => (u.phone || '').replace(/\D/g, '') === '998951639101') ||
                db.users.find((u) => u.role === 'admin') ||
                { id: 'usr-admin-1', name: 'Alibek Abdunabiyev (Bosh Admin)', phone: '+998 95 163 91 01' };

              const chatThread = (db.messages || [])
                .filter(
                  (m) =>
                    (m.senderId === currentUser.id && m.recipientId === adminUser.id) ||
                    (m.senderId === adminUser.id && m.recipientId === currentUser.id)
                )
                .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));

              function handleSendToAdmin() {
                if (!studentChatText.trim()) return;
                sendChatMessage({ recipientId: adminUser.id, text: studentChatText });
                setStudentChatText('');
              }

              return (
                <div style={{ backgroundColor: 'var(--surface)', borderRadius: 'var(--radius)', border: '1px solid var(--border)', overflow: 'hidden' }}>
                  {/* CHAT HEADER */}
                  <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', backgroundColor: 'var(--bg-alt)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{ position: 'relative' }}>
                        <img
                          src={adminUser.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'}
                          alt="Admin"
                          style={{ width: '46px', height: '46px', borderRadius: '50%', objectFit: 'cover' }}
                        />
                        <span style={{ position: 'absolute', bottom: -2, right: -2, fontSize: '12px' }}>🛡️</span>
                      </div>
                      <div>
                        <h3 style={{ margin: 0, fontSize: '1.05rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span>{adminUser.name}</span>
                          <span className="role-badge" style={{ background: 'linear-gradient(135deg, #ff5722, #f59e0b)', color: '#fff', fontSize: '0.72rem' }}>
                            BOSH ADMIN
                          </span>
                        </h3>
                        <small className="text-muted">
                          CodeCraft Bosh Ma'muriyati • Tel: {adminUser.phone} • Doimiy onlayn qo'llab-quvvatlash
                        </small>
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span className="status-pill paid" style={{ fontSize: '0.78rem' }}>🟢 Aloqada</span>
                    </div>
                  </div>

                  {/* CHAT MESSAGES BODY */}
                  <div style={{ height: '380px', overflowY: 'auto', padding: '20px', display: 'flex', flexDirection: 'column', gap: '12px', backgroundColor: 'var(--surface)' }}>
                    {chatThread.length === 0 ? (
                      <div style={{ margin: 'auto', textAlign: 'center', color: 'var(--text-muted)' }}>
                        <span style={{ fontSize: '2.5rem' }}>💬</span>
                        <p style={{ marginTop: '8px' }}>
                          Administratorga xabar yuboring. Kurslar, darslar yoki to'lovlar bo'yicha savollaringizga tezda javob beriladi.
                        </p>
                      </div>
                    ) : (
                      chatThread.map((msg) => {
                        const isFromMe = msg.senderId === currentUser.id;
                        return (
                          <div
                            key={msg.id}
                            style={{
                              alignSelf: isFromMe ? 'flex-end' : 'flex-start',
                              maxWidth: '75%',
                              display: 'flex',
                              flexDirection: 'column',
                              alignItems: isFromMe ? 'flex-end' : 'flex-start'
                            }}
                          >
                            <div
                              style={{
                                padding: '10px 16px',
                                borderRadius: isFromMe ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                                backgroundColor: isFromMe ? 'var(--primary)' : 'var(--bg-alt)',
                                color: isFromMe ? '#ffffff' : 'var(--text)',
                                boxShadow: '0 2px 6px rgba(0,0,0,0.05)',
                                fontSize: '0.94rem',
                                lineHeight: 1.45,
                                wordBreak: 'break-word',
                                border: isFromMe ? 'none' : '1px solid var(--border)'
                              }}
                            >
                              {msg.text}
                            </div>
                            <small style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '4px', padding: '0 4px' }}>
                              {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              {isFromMe && ' • ✓✓'}
                            </small>
                          </div>
                        );
                      })
                    )}
                  </div>

                  {/* QUICK QUESTIONS CHIPS */}
                  <div style={{ padding: '8px 16px', borderTop: '1px solid var(--border)', display: 'flex', gap: '8px', overflowX: 'auto', backgroundColor: 'var(--bg-alt)' }}>
                    {[
                      "Assalomu alaykum ustoz!",
                      "Mening uy vazifam tekshirildimi?",
                      "Sertifikat olish uchun nechchi ball kerak?",
                      "Keyingi modul qachon ochiladi?",
                      "Yangi kursga qanday yozilsam bo'ladi?"
                    ].map((chip, idx) => (
                      <button
                        key={idx}
                        type="button"
                        className="btn btn-xs btn-ghost"
                        onClick={() => {
                          sendChatMessage({ recipientId: adminUser.id, text: chip });
                        }}
                        style={{ whiteSpace: 'nowrap', fontSize: '0.78rem', border: '1px solid var(--border)', borderRadius: '99px', backgroundColor: 'var(--surface)' }}
                      >
                        {chip}
                      </button>
                    ))}
                  </div>

                  {/* CHAT INPUT BAR */}
                  <div style={{ padding: '12px 16px', borderTop: '1px solid var(--border)', display: 'flex', gap: '10px', backgroundColor: 'var(--surface)' }}>
                    <input
                      type="text"
                      className="input"
                      placeholder="Bosh administratorga xabaringizni yozing..."
                      value={studentChatText}
                      onChange={(e) => setStudentChatText(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleSendToAdmin();
                        }
                      }}
                    />
                    <button
                      type="button"
                      className="btn btn-primary"
                      onClick={handleSendToAdmin}
                      style={{ minWidth: '100px' }}
                    >
                      Yuborish ✈️
                    </button>
                  </div>
                </div>
              );
            })()}
          </div>
        )}

        {/* 1. MY COURSES */}
        {activeTab === 'myCourses' && (
          <div className="tab-panel">
            {myCourses.length === 0 ? (
              <div className="empty-box">
                <p>{t.dashboard.noCourses}</p>
                <button className="btn btn-primary" onClick={() => navigate('courses')}>
                  🚀 {lang === 'ru' ? 'Перейти в каталог курсов' : "Kurslar katalogiga o'tish"}
                </button>
              </div>
            ) : (
              <div className="enrolled-courses-grid">
                {myCourses.map((course) => {
                  const progress = getCourseProgress(currentUser.id, course.id);
                  const cert = myCertificates.find((c) => c.courseId === course.id);
                  return (
                    <div key={course.id} className="enrolled-course-card">
                      <img src={course.thumbnail} alt={loc(course, 'title')} />
                      <div className="enrolled-course-body">
                        <h3>{loc(course, 'title')}</h3>
                        <div className="progress-row">
                          <span>{t.dashboard.progressLabel}</span>
                          <strong>{progress}%</strong>
                        </div>
                        <div className="progress-bar-track">
                          <div className="progress-bar-fill" style={{ width: `${progress}%` }} />
                        </div>

                        <div className="enrolled-actions">
                          <button
                            className="btn btn-primary btn-sm"
                            onClick={() => navigate('learning', { courseId: course.id })}
                          >
                            ▶️ {t.dashboard.openLesson}
                          </button>
                          {cert && (
                            <button
                              className="btn btn-outline btn-sm"
                              onClick={() => setActiveCertificate(cert)}
                            >
                              🎓 {t.dashboard.downloadCert}
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* 2. HOMEWORK SUBMISSIONS */}
        {activeTab === 'submissions' && (
          <div className="tab-panel">
            <div className="table-card">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>{lang === 'ru' ? 'Название задания' : 'Vazifa nomi'}</th>
                    <th>{lang === 'ru' ? 'Ваш ответ / Файл' : 'Javobingiz / Fayl'}</th>
                    <th>{lang === 'ru' ? 'Оценка преподавателя' : 'Ustoz bahosi'}</th>
                    <th>{lang === 'ru' ? 'Комментарий преподавателя' : 'Ustoz izohi'}</th>
                  </tr>
                </thead>
                <tbody>
                  {myAssignments.map((asg) => {
                    const sub = mySubmissions.find((s) => s.assignmentId === asg.id);
                    const graded = sub && sub.score !== null && sub.score !== undefined;
                    const draft = hwDrafts[asg.id] || { link: '', fileName: '', fileData: '' };
                    return (
                      <tr key={asg.id}>
                        <td>
                          <strong>{loc(asg, 'title')}</strong>
                          {loc(asg, 'description') && (
                            <div className="text-muted" style={{ fontSize: '0.85rem', marginTop: '4px' }}>
                              {loc(asg, 'description')}
                            </div>
                          )}
                        </td>
                        <td>
                          {sub && (
                            <div style={{ marginBottom: graded ? 0 : '10px' }}>
                              {sub.answerText && (
                                <div>
                                  {/^https?:\/\//i.test(sub.answerText.trim()) ? (
                                    <a href={sub.answerText.trim()} target="_blank" rel="noopener noreferrer">
                                      {sub.answerText}
                                    </a>
                                  ) : (
                                    sub.answerText
                                  )}
                                </div>
                              )}
                              {sub.fileName && <small className="text-muted">📎 {sub.fileName}</small>}
                            </div>
                          )}
                          {!graded && (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                              <input
                                type="url"
                                className="input"
                                placeholder={lang === 'ru' ? 'Ссылка на GitHub' : 'GitHub havolasi'}
                                value={draft.link}
                                onChange={(e) =>
                                  setHwDrafts({ ...hwDrafts, [asg.id]: { ...draft, link: e.target.value } })
                                }
                              />
                              <input
                                type="file"
                                className="input"
                                onChange={(e) => handleHwFile(asg.id, e.target.files?.[0])}
                              />
                              <button
                                type="button"
                                className="btn btn-primary btn-sm"
                                onClick={() => handleHwSubmit(asg.id)}
                              >
                                🚀 {sub
                                  ? (lang === 'ru' ? 'Отправить заново' : 'Qayta yuborish')
                                  : (lang === 'ru' ? 'Отправить' : 'Yuborish')}
                              </button>
                            </div>
                          )}
                        </td>
                        <td>{graded ? <strong>{sub.score} / 100</strong> : '—'}</td>
                        <td>{graded ? (sub.teacherComment || '—') : '—'}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 3. CERTIFICATES */}
        {activeTab === 'certificates' && (
          <div className="tab-panel">
            {myCertificates.length === 0 ? (
              <div className="empty-box">
                <p>
                  {lang === 'ru'
                    ? 'Официальный PDF-сертификат появится здесь после 100% завершения курса.'
                    : "Kursni 100% tugatganingizdan so'ng rasmiy PDF sertifikat shu yerda paydo bo'ladi."}
                </p>
              </div>
            ) : (
              <div className="certs-grid">
                {myCertificates.map((cert) => {
                  const course = db.courses.find((c) => c.id === cert.courseId);
                  return (
                    <div key={cert.id} className="cert-item-card">
                      <div className="cert-badge-icon">🎓</div>
                      <div>
                        <h3>{loc(course, 'title')}</h3>
                        <p className="text-muted">
                          {lang === 'ru' ? 'ID Код:' : 'ID Kod:'} <code>{cert.code}</code> •{' '}
                          {lang === 'ru' ? 'Дата:' : 'Sana:'}{' '}
                          {new Date(cert.issuedAt).toLocaleDateString()}
                        </p>
                        <button
                          className="btn btn-primary btn-sm mt-2"
                          onClick={() => setActiveCertificate(cert)}
                        >
                          📄 {t.dashboard.downloadCert}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* 4. PAYMENTS HISTORY */}
        {activeTab === 'payments' && (
          <div className="tab-panel">
            <div className="table-card">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>{lang === 'ru' ? 'ID транзакции' : 'Tranzaksiya ID'}</th>
                    <th>{lang === 'ru' ? 'Курс' : 'Kurs'}</th>
                    <th>{lang === 'ru' ? 'Платежная система' : "To'lov tizimi"}</th>
                    <th>{lang === 'ru' ? 'Промокод' : 'Promo-kod'}</th>
                    <th>{lang === 'ru' ? 'Сумма' : 'Summa'}</th>
                    <th>{lang === 'ru' ? 'Статус' : 'Holati'}</th>
                    <th>{lang === 'ru' ? 'Дата' : 'Sana'}</th>
                  </tr>
                </thead>
                <tbody>
                  {myPayments.map((pay) => {
                    const crs = db.courses.find((c) => c.id === pay.courseId);
                    return (
                      <tr key={pay.id}>
                        <td><code>{pay.transactionId}</code></td>
                        <td>{loc(crs, 'title')}</td>
                        <td><span className="role-badge">{pay.provider.toUpperCase()}</span></td>
                        <td>{pay.promoCode ? <code>{pay.promoCode}</code> : '—'}</td>
                        <td><strong>{formatPrice(pay.amount)}</strong></td>
                        <td>
                          <span className={`status-pill ${pay.status}`}>
                            {pay.status === 'paid'
                              ? (lang === 'ru' ? 'ОПЛАЧЕНО' : "TO'LANGAN")
                              : pay.status.toUpperCase()}
                          </span>
                        </td>
                        <td>{new Date(pay.createdAt).toLocaleDateString()}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 5. NOTIFICATIONS */}
        {activeTab === 'notifications' && (
          <div className="tab-panel">
            <div className="panel-head-row">
              <h3>🔔 {lang === 'ru' ? 'Уведомления' : 'Bildirishnomalar'} ({myNotifications.length})</h3>
              <button className="btn btn-outline btn-sm" onClick={markNotificationsRead}>
                ✓ {t.dashboard.markAllRead}
              </button>
            </div>
            <div className="notifications-stack">
              {myNotifications.map((n) => (
                <div key={n.id} className={`notif-card ${n.read ? '' : 'unread'}`}>
                  <div>
                    <p>{loc(n, 'text')}</p>
                    <small className="text-muted">
                      {new Date(n.createdAt).toLocaleString()}
                    </small>
                  </div>
                  {!n.read && (
                    <span className="status-pill pending">
                      {lang === 'ru' ? 'НОВОЕ' : 'YANGI'}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 6. PROFILE SETTINGS */}
        {activeTab === 'profile' && (
          <div className="tab-panel">
            <form className="profile-form-card" onSubmit={handleProfileSave}>
              <h3>⚙️ {t.dashboard.tabs.profile}</h3>
              <div className="form-group">
                <label className="field-label">{t.auth.nameLabel}</label>
                <input
                  type="text"
                  className="input"
                  placeholder={t.auth.loginNamePlaceholder}
                  value={profileForm.name}
                  onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label className="field-label">{t.auth.phoneLabel}</label>
                <input
                  type="tel"
                  className="input"
                  value={profileForm.phone}
                  readOnly
                  disabled
                  style={{ opacity: 0.7, cursor: 'not-allowed' }}
                />
              </div>
              <div className="form-group">
                <label className="field-label">
                  {lang === 'ru' ? 'Ссылка на фото профиля (URL)' : 'Avatar rasm havolasi (URL)'}
                </label>
                <input
                  type="url"
                  className="input"
                  value={profileForm.avatar}
                  onChange={(e) => setProfileForm({ ...profileForm, avatar: e.target.value })}
                />
              </div>
              <button type="submit" className="btn btn-primary">
                💾 {t.dashboard.saveProfile}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}

export function LearningPage() {
  const {
    t,
    loc,
    db,
    route,
    navigate,
    currentUser,
    getCourseLessons,
    getCourseProgress,
    canAccessLesson,
    toggleLessonComplete,
    submitQuizAttempt,
    submitAssignment,
    setCheckoutCourse,
    showToast,
    lang
  } = useApp();

  const courseId = route.params?.courseId || 'crs-1';
  const course = db.courses.find((c) => c.id === courseId) || db.courses[0];
  const modules = db.modules
    .filter((m) => m.courseId === course.id)
    .sort((a, b) => a.order - b.order);
  const allLessons = getCourseLessons(course.id);

  const [activeLessonId, setActiveLessonId] = useState(
    route.params?.lessonId || allLessons[0]?.id
  );
  const [activeQuizId, setActiveQuizId] = useState(null);
  const [hwText, setHwText] = useState('');
  const [hwFile, setHwFile] = useState('');
  const [quizAnswers, setQuizAnswers] = useState({});
  const [quizResult, setQuizResult] = useState(null);
  const [currentVideoUrl, setCurrentVideoUrl] = useState('');

  const activeLesson =
    allLessons.find((l) => l.id === activeLessonId) || allLessons[0];
  const activeQuiz = db.quizzes.find((q) => q.id === activeQuizId);

  useEffect(() => {
    let active = true;
    async function loadVideo() {
      if (activeLesson?.videoUrl) {
        setCurrentVideoUrl(activeLesson.videoUrl);
      } else if (activeLesson?.videoId) {
        const u = await getVideoUrl(activeLesson.videoId);
        if (active && u) setCurrentVideoUrl(u);
      } else if (course?.videoUrl) {
        setCurrentVideoUrl(course.videoUrl);
      } else {
        setCurrentVideoUrl('');
      }
    }
    loadVideo();
    return () => { active = false; };
  }, [activeLesson, course]);

  const hasAccess = canAccessLesson(currentUser, activeLesson, course.id);
  const isCompleted = db.lessonProgress.some(
    (lp) => lp.userId === currentUser?.id && lp.lessonId === activeLesson?.id && lp.completed
  );
  const progress = currentUser ? getCourseProgress(currentUser.id, course.id) : 0;

  const lessonIdx = allLessons.findIndex((l) => l.id === activeLesson?.id);
  const prevLesson = lessonIdx > 0 ? allLessons[lessonIdx - 1] : null;
  const nextLesson =
    lessonIdx >= 0 && lessonIdx < allLessons.length - 1 ? allLessons[lessonIdx + 1] : null;

  const lessonAssignment = db.assignments.find((a) => a.lessonId === activeLesson?.id);
  const mySubmission = db.submissions.find(
    (s) => s.assignmentId === lessonAssignment?.id && s.userId === currentUser?.id
  );

  function handleDownloadMaterial(fileName) {
    const content = `CodeCraft\n${lang === 'ru' ? 'Курс' : 'Kurs'}: ${loc(course, 'title')}\n${lang === 'ru' ? 'Урок' : 'Dars'}: ${loc(activeLesson, 'title')}\n\n${loc(activeLesson, 'content')}`;
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName || 'Lesson_Material.txt';
    a.click();
    URL.revokeObjectURL(url);
    showToast(
      lang === 'ru' ? `${fileName} скачан!` : `${fileName} yuklab olindi!`,
      'success'
    );
  }

  function handleHomeworkSubmit(e) {
    e.preventDefault();
    if (!hwText.trim() || !lessonAssignment) return;
    submitAssignment({
      assignmentId: lessonAssignment.id,
      answerText: hwText,
      fileName: hwFile || 'practical_work.zip'
    });
    setHwText('');
  }

  function handleQuizSubmit(e) {
    e.preventDefault();
    if (!activeQuiz) return;
    let correctCount = 0;
    activeQuiz.questions.forEach((q) => {
      const chosenId = quizAnswers[q.id];
      const correctOpt = q.options.find((o) => o.isCorrect);
      if (chosenId && chosenId === correctOpt?.id) {
        correctCount += 1;
      }
    });
    const score = Math.round((correctCount / activeQuiz.questions.length) * 100);
    const passed = score >= activeQuiz.passingScore;
    setQuizResult({ score, passed, correctCount, total: activeQuiz.questions.length });
    submitQuizAttempt(activeQuiz.id, score, passed);
  }

  return (
    <div className="learning-layout">
      {/* LEFT SIDEBAR: MODULES, LESSONS & QUIZZES */}
      <aside className="learning-sidebar">
        <div className="learning-sidebar-head">
          <button className="btn btn-ghost btn-xs" onClick={() => navigate('dashboard')}>
            ← {t.learning.backToDashboard}
          </button>
          <h3>{loc(course, 'title')}</h3>
          <div className="progress-row">
            <small>{t.learning.courseProgress}</small>
            <strong>{progress}%</strong>
          </div>
          <div className="progress-bar-track">
            <div className="progress-bar-fill" style={{ width: `${progress}%` }} />
          </div>
        </div>

        <div className="learning-modules-scroll">
          {modules.map((mod) => {
            const modLessons = db.lessons
              .filter((l) => l.moduleId === mod.id)
              .sort((a, b) => a.order - b.order);
            const modQuiz = db.quizzes.find((q) => q.moduleId === mod.id);

            return (
              <div key={mod.id} className="sidebar-module-group">
                <div className="sidebar-module-title">{loc(mod, 'title')}</div>
                {modLessons.map((les) => {
                  const done = db.lessonProgress.some(
                    (lp) => lp.userId === currentUser?.id && lp.lessonId === les.id && lp.completed
                  );
                  const allowed = canAccessLesson(currentUser, les, course.id);
                  return (
                    <button
                      key={les.id}
                      className={`sidebar-lesson-btn ${
                        !activeQuizId && activeLesson?.id === les.id ? 'active' : ''
                      }`}
                      onClick={() => {
                        setActiveQuizId(null);
                        setActiveLessonId(les.id);
                      }}
                    >
                      <span>{done ? '✅' : allowed ? '📖' : '🔒'}</span>
                      <span className="sidebar-lesson-text">{loc(les, 'title')}</span>
                      <small>{les.duration}m</small>
                    </button>
                  );
                })}
                {modQuiz && (
                  <button
                    className={`sidebar-lesson-btn quiz-btn ${
                      activeQuizId === modQuiz.id ? 'active' : ''
                    }`}
                    onClick={() => {
                      setActiveQuizId(modQuiz.id);
                      setQuizAnswers({});
                      setQuizResult(null);
                    }}
                  >
                    <span>🧪</span>
                    <span className="sidebar-lesson-text">{loc(modQuiz, 'title')}</span>
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </aside>

      {/* RIGHT CONTENT: VIDEO / LESSON OR QUIZ */}
      <main className="learning-content">
        {!hasAccess ? (
          <div className="access-denied-card">
            <div className="lock-big">🔒</div>
            <h2>{t.learning.accessDenied}</h2>
            <p className="text-muted">
              {lang === 'ru'
                ? 'Проверка сервера: У вас нет доступа к этому платному уроку.'
                : 'Server tomonidan tekshiruv: Siz ushbu pullik darsga ruxsatga ega emassiz.'}
            </p>
            <button
              className="btn btn-primary btn-lg mt-4"
              onClick={() => setCheckoutCourse(course)}
            >
              💳 {t.courseDetail.buyNow}
            </button>
          </div>
        ) : activeQuiz ? (
          <div className="quiz-Arena-card">
            <div className="quiz-header">
              <h2>🧪 {loc(activeQuiz, 'title')}</h2>
              <span className="role-badge">
                ⏱️ {activeQuiz.timeLimitMin} {lang === 'ru' ? 'мин | Проходной балл:' : "daqiqa | O'tish bali:"} {activeQuiz.passingScore}%
              </span>
            </div>

            <form onSubmit={handleQuizSubmit}>
              {activeQuiz.questions.map((q, qIndex) => (
                <div key={q.id} className="quiz-question-card">
                  <h4>
                    {qIndex + 1}. {loc(q, 'text')}
                  </h4>
                  <div className="quiz-options-stack">
                    {q.options.map((opt) => {
                      const selected = quizAnswers[q.id] === opt.id;
                      let resultClass = '';
                      if (quizResult) {
                        if (opt.isCorrect) resultClass = 'correct';
                        else if (selected && !opt.isCorrect) resultClass = 'wrong';
                      }
                      return (
                        <label
                          key={opt.id}
                          className={`quiz-option-label ${selected ? 'selected' : ''} ${resultClass}`}
                        >
                          <input
                            type="radio"
                            name={q.id}
                            checked={selected}
                            onChange={() =>
                              !quizResult && setQuizAnswers({ ...quizAnswers, [q.id]: opt.id })
                            }
                          />
                          <span>{loc(opt, 'text')}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>
              ))}

              {!quizResult ? (
                <button type="submit" className="btn btn-primary btn-lg">
                  ✅ {t.learning.submitQuiz}
                </button>
              ) : (
                <div className={`quiz-result-banner ${quizResult.passed ? 'passed' : 'failed'}`}>
                  <h3>
                    {t.learning.quizScore} {quizResult.score}% ({quizResult.correctCount} /{' '}
                    {quizResult.total})
                  </h3>
                  <p>{quizResult.passed ? t.learning.quizPassed : t.learning.quizFailed}</p>
                  <button
                    type="button"
                    className="btn btn-outline btn-sm mt-2"
                    onClick={() => {
                      setQuizResult(null);
                      setQuizAnswers({});
                    }}
                  >
                    ↺ {lang === 'ru' ? 'Сдать заново' : 'Qaytadan topshirish'}
                  </button>
                </div>
              )}
            </form>
          </div>
        ) : (
          <div className="lesson-player-container">
            <div className="lesson-reader-header">
              <div className="lesson-reader-meta">
                <span className="role-badge">
                  📖 {lang === 'ru' ? 'Урок' : 'Dars'} {activeLesson?.order || 1}
                </span>
                <span className="meta-small">
                  ⏱️ {activeLesson?.duration || 20} {lang === 'ru' ? 'минут чтения и практики' : "daqiqa o'qish va amaliyot"}
                </span>
                {activeLesson?.isFree && <span className="status-pill paid">{t.brand.free}</span>}
              </div>
              <h2>{loc(activeLesson, 'title')}</h2>
            </div>

            <div className="lesson-controls-bar">
              <button
                className="btn btn-outline"
                disabled={!prevLesson}
                onClick={() => prevLesson && setActiveLessonId(prevLesson.id)}
              >
                ← {t.learning.prevLesson}
              </button>

              <button
                className={`btn ${isCompleted ? 'btn-success' : 'btn-primary'}`}
                onClick={() => toggleLessonComplete(activeLesson.id, course.id)}
              >
                {isCompleted ? t.learning.completedLesson : `✓ ${t.learning.markComplete}`}
              </button>

              <button
                className="btn btn-outline"
                disabled={!nextLesson}
                onClick={() => nextLesson && setActiveLessonId(nextLesson.id)}
              >
                {t.learning.nextLesson} →
              </button>
            </div>

            {currentVideoUrl && (
              <div
                className="lesson-video-box"
                style={{
                  borderRadius: '14px',
                  overflow: 'hidden',
                  background: '#000',
                  marginBottom: '24px',
                  border: '1px solid rgba(255,255,255,0.1)',
                  boxShadow: '0 8px 30px rgba(0,0,0,0.35)'
                }}
              >
                <video
                  key={currentVideoUrl}
                  controls
                  playsInline
                  controlsList="nodownload"
                  poster={course.thumbnail}
                  src={currentVideoUrl}
                  style={{ width: '100%', maxHeight: '500px', display: 'block' }}
                />
              </div>
            )}

            <div className="lesson-notes-card">
              <h3>📖 {lang === 'ru' ? 'Конспект урока и объяснение' : 'Dars konspekti va tushuntirish'}</h3>
              <p>{loc(activeLesson, 'content')}</p>

              {activeLesson?.attachmentName && (
                <div className="attachment-download-box">
                  <span>📎 {t.learning.materialsTitle} <strong>{activeLesson.attachmentName}</strong></span>
                  <button
                    className="btn btn-sm btn-soft"
                    onClick={() => handleDownloadMaterial(activeLesson.attachmentName)}
                  >
                    ⬇️ {t.learning.downloadBtn}
                  </button>
                </div>
              )}
            </div>

            {/* HOMEWORK ASSIGNMENT BOX */}
            {lessonAssignment && (
              <div className="homework-card">
                <h3>📝 {t.learning.homeworkTitle}: {loc(lessonAssignment, 'title')}</h3>
                <p>{loc(lessonAssignment, 'description')}</p>

                {mySubmission && (
                  <div className="submission-status-box">
                    <div className="sub-row">
                      <strong>{t.learning.homeworkSubmitted}</strong>
                      <span className={`status-pill ${mySubmission.status === 'graded' ? 'paid' : 'pending'}`}>
                        {mySubmission.status === 'graded' ? t.learning.statusGraded : t.learning.statusPending}
                      </span>
                    </div>
                    <p>
                      <strong>{lang === 'ru' ? 'Ваш отправленный ответ:' : 'Yuborgan javobingiz:'}</strong>{' '}
                      {mySubmission.answerText}
                    </p>
                    {mySubmission.score !== null && (
                      <div className="teacher-grade-feedback">
                        <strong>🎯 {t.learning.teacherScore} {mySubmission.score} / 100</strong>
                        <p>💬 {t.learning.teacherFeedback} "{mySubmission.teacherComment}"</p>
                      </div>
                    )}
                  </div>
                )}

                <form className="homework-form" onSubmit={handleHomeworkSubmit}>
                  <textarea
                    className="input"
                    rows={3}
                    placeholder={t.learning.homeworkAnswerPlaceholder}
                    value={hwText}
                    onChange={(e) => setHwText(e.target.value)}
                    required
                  />
                  <div className="form-row">
                    <label>{t.learning.homeworkFileLabel}</label>
                    <input
                      type="text"
                      className="input"
                      placeholder={lang === 'ru' ? 'Например: github_project.zip' : 'Masalan: github_project.zip'}
                      value={hwFile}
                      onChange={(e) => setHwFile(e.target.value)}
                    />
                  </div>
                  <button type="submit" className="btn btn-primary">
                    🚀 {t.learning.submitHomework}
                  </button>
                </form>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
