import React, { useState } from 'react';
import { useApp } from '../context/AppContext.jsx';
import { saveVideoFile } from '../utils/mediaStorage.js';

export function TeacherPanelPage() {
  const {
    t,
    loc,
    formatPrice,
    db,
    currentUser,
    getCourseProgress,
    saveCourse,
    deleteCourse,
    gradeSubmission,
    showToast,
    lang
  } = useApp();

  const [activeTab, setActiveTab] = useState('myCourses');

  // Filter courses owned by current teacher (or all if admin is viewing teacher panel)
  const myCourses = db.courses.filter((c) =>
    currentUser?.role === 'admin' ? true : c.teacherId === currentUser?.id
  );
  const myCourseIds = myCourses.map((c) => c.id);

  const [editingCourse, setEditingCourse] = useState({
    id: '',
    titleUz: '',
    titleRu: '',
    descriptionUz: '',
    descriptionRu: '',
    price: 1500000,
    categoryId: db.categories[0]?.id || 'cat-frontend',
    level: 'beginner',
    status: 'published',
    thumbnail: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&auto=format&fit=crop&q=80',
    videoUrl: '',
    videoName: '',
    videoId: ''
  });
  const [courseVideoPreview, setCourseVideoPreview] = useState('');

  const [gradingState, setGradingState] = useState({});

  async function handleCourseVideoFile(file) {
    if (!file) return;
    try {
      const vidId = `vid-crs-${Date.now()}`;
      const objectUrl = await saveVideoFile(vidId, file);
      setCourseVideoPreview(objectUrl);
      setEditingCourse((prev) => ({
        ...prev,
        videoId: vidId,
        videoUrl: objectUrl,
        videoName: file.name
      }));
      showToast(lang === 'ru' ? 'Видео файл успешно выбран!' : "Video fayl tanlandi!", 'success');
    } catch (err) {
      console.error(err);
    }
  }

  function startEditCourse(course) {
    setEditingCourse({
      id: course.id,
      titleUz: course.titleUz,
      titleRu: course.titleRu,
      descriptionUz: course.descriptionUz,
      descriptionRu: course.descriptionRu,
      price: course.price,
      categoryId: course.categoryId,
      level: course.level,
      status: 'published',
      thumbnail: course.thumbnail,
      videoUrl: course.videoUrl || '',
      videoName: course.videoName || '',
      videoId: course.videoId || ''
    });
    setCourseVideoPreview(course.videoUrl || '');
    setActiveTab('createCourse');
  }

  function startNewCourse() {
    setEditingCourse({
      id: '',
      titleUz: '',
      titleRu: '',
      descriptionUz: '',
      descriptionRu: '',
      price: 1500000,
      categoryId: db.categories[0]?.id || 'cat-frontend',
      level: 'beginner',
      status: 'published',
      thumbnail: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&auto=format&fit=crop&q=80',
      videoUrl: '',
      videoName: '',
      videoId: ''
    });
    setCourseVideoPreview('');
    setActiveTab('createCourse');
  }

  function handleSaveCourse(e) {
    e.preventDefault();
    const id = saveCourse(editingCourse);
    if (id) {
      setActiveTab('myCourses');
    }
  }

  // Teacher KPIs
  const myPayments = db.payments.filter(
    (p) => myCourseIds.includes(p.courseId) && p.status === 'paid'
  );
  const totalRevenue = myPayments.reduce((sum, p) => sum + p.amount, 0);
  const myEnrollments = db.enrollments.filter((e) => myCourseIds.includes(e.courseId));

  return (
    <div className="section">
      <div className="container">
        <div className="dashboard-welcome-card">
          <div>
            <h1>👨‍🏫 {t.teacherPanel.title}</h1>
            <p className="text-muted">
              {lang === 'ru'
                ? `Преподаватель: ${currentUser?.name} • Управление авторскими курсами`
                : `Ustoz: ${currentUser?.name} • Mualliflik kurslari boshqaruvi`}
            </p>
          </div>
          <div className="welcome-kpis">
            <div className="mini-kpi">
              <strong>{myCourses.length}</strong>
              <span>{lang === 'ru' ? 'Мои курсы' : 'Kurslarim'}</span>
            </div>
            <div className="mini-kpi">
              <strong>{myEnrollments.length}</strong>
              <span>{lang === 'ru' ? 'Активные студенты' : 'Faol talabalar'}</span>
            </div>
            <div className="mini-kpi">
              <strong>{totalRevenue === 0 ? (lang === 'ru' ? "0 сум" : "0 so'm") : formatPrice(totalRevenue)}</strong>
              <span>{lang === 'ru' ? 'Общий доход' : 'Jami tushum'}</span>
            </div>
          </div>
        </div>

        <div className="tabs-bar">
          {Object.entries(t.teacherPanel.tabs).map(([key, label]) => (
            <button
              key={key}
              className={`tab-btn ${activeTab === key ? 'active' : ''}`}
              onClick={() => setActiveTab(key)}
            >
              {label}
            </button>
          ))}
        </div>

        {/* TAB 1: MY COURSES */}
        {activeTab === 'myCourses' && (
          <div className="tab-panel">
            <div className="panel-head-row">
              <h3>
                {lang === 'ru'
                  ? `Мои авторские курсы (${myCourses.length})`
                  : `Mening mualliflik kurslarim (${myCourses.length})`}
              </h3>
              <button className="btn btn-primary" onClick={startNewCourse}>
                {t.teacherPanel.newCourseBtn}
              </button>
            </div>

            <div className="table-card">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>{lang === 'ru' ? 'Название курса' : 'Kurs sarlavhasi'}</th>
                    <th>{lang === 'ru' ? 'Цена' : 'Narx'}</th>
                    <th>{lang === 'ru' ? 'Уровень' : 'Daraja'}</th>
                    <th>{lang === 'ru' ? 'Студенты' : 'Talabalar'}</th>
                    <th>{lang === 'ru' ? 'Статус' : 'Holati'}</th>
                    <th>{lang === 'ru' ? 'Действия' : 'Amallar'}</th>
                  </tr>
                </thead>
                <tbody>
                  {myCourses.map((crs) => (
                    <tr key={crs.id}>
                      <td><strong>{loc(crs, 'title')}</strong></td>
                      <td>{formatPrice(crs.price)}</td>
                      <td>{t.catalog.levels[crs.level]}</td>
                      <td>{crs.studentsCount || 0} {lang === 'ru' ? 'студ.' : 'ta'}</td>
                      <td>
                        <span className={`status-pill ${crs.status === 'published' ? 'paid' : 'pending'}`}>
                          {crs.status === 'published'
                            ? t.teacherPanel.statusPublished
                            : t.teacherPanel.statusDraft}
                        </span>
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: '6px' }}>
                          <button
                            className="btn btn-xs btn-outline"
                            onClick={() => startEditCourse(crs)}
                          >
                            {lang === 'ru' ? '✏️ Изменить' : '✏️ Tahrirlash'}
                          </button>
                          <button
                            className="btn btn-xs btn-ghost"
                            style={{ color: '#ef4444' }}
                            onClick={() => {
                              if (window.confirm(lang === 'ru' ? `Удалить курс "${loc(crs, 'title')}"?` : `"${loc(crs, 'title')}" kursini o'chirmoqchimisiz?`)) {
                                deleteCourse(crs.id);
                              }
                            }}
                            title={lang === 'ru' ? "Удалить курс" : "Kursni o'chirish"}
                          >
                            🗑️
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 2: CREATE / EDIT COURSE */}
        {activeTab === 'createCourse' && (
          <div className="tab-panel" style={{ maxWidth: '760px', margin: '0 auto' }}>
            <form className="editor-card" onSubmit={handleSaveCourse}>
              <h3>
                {editingCourse.id
                  ? (lang === 'ru' ? '✏️ Редактировать курс' : '✏️ Kursni tahrirlash')
                  : (lang === 'ru' ? '➕ Создать новый курс' : '➕ Yangi kurs yaratish')}
              </h3>
              <div className="form-group">
                <label className="field-label">
                  {lang === 'ru' ? 'Название курса (на узбекском)' : "Kurs nomi (O'zbek tilida)"}
                </label>
                <input
                  type="text"
                  className="input"
                  value={editingCourse.titleUz}
                  onChange={(e) => setEditingCourse({ ...editingCourse, titleUz: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label className="field-label">
                  {lang === 'ru' ? 'Название курса (на русском)' : "Kurs nomi (Rus tilida)"}
                </label>
                <input
                  type="text"
                  className="input"
                  value={editingCourse.titleRu}
                  onChange={(e) => setEditingCourse({ ...editingCourse, titleRu: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label className="field-label">
                  {lang === 'ru' ? 'Подробное описание (UZ)' : "Batafsil tavsif (UZ)"}
                </label>
                <textarea
                  className="input"
                  rows={3}
                  value={editingCourse.descriptionUz}
                  onChange={(e) =>
                    setEditingCourse({ ...editingCourse, descriptionUz: e.target.value })
                  }
                  required
                />
              </div>

              <div className="form-row-2">
                <div className="form-group">
                  <label className="field-label">
                    {lang === 'ru' ? 'Цена курса (UZS)' : "Kurs narxi (UZS)"}
                  </label>
                  <input
                    type="number"
                    className="input"
                    value={editingCourse.price}
                    onChange={(e) => setEditingCourse({ ...editingCourse, price: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="field-label">
                    {lang === 'ru' ? 'Уровень' : "Daraja"}
                  </label>
                  <select
                    className="input"
                    value={editingCourse.level}
                    onChange={(e) => setEditingCourse({ ...editingCourse, level: e.target.value })}
                  >
                    <option value="beginner">{t.catalog.levels.beginner}</option>
                    <option value="intermediate">{t.catalog.levels.intermediate}</option>
                    <option value="advanced">{t.catalog.levels.advanced}</option>
                  </select>
                </div>
              </div>

              <div className="form-row-2">
                <div className="form-group">
                  <label className="field-label">
                    {lang === 'ru' ? 'Категория' : "Kategoriya"}
                  </label>
                  <select
                    className="input"
                    value={editingCourse.categoryId}
                    onChange={(e) =>
                      setEditingCourse({ ...editingCourse, categoryId: e.target.value })
                    }
                  >
                    {db.categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {loc(cat, 'name')}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label className="field-label">
                    {lang === 'ru' ? 'Обложка курса (URL)' : "Muqova rasmi (URL)"}
                  </label>
                  <input
                    type="url"
                    className="input"
                    value={editingCourse.thumbnail}
                    onChange={(e) =>
                      setEditingCourse({ ...editingCourse, thumbnail: e.target.value })
                    }
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="field-label">
                  {lang === 'ru'
                    ? '📹 Видео курса / Трейлер (Выбрать с компьютера)'
                    : "📹 Kurs videosi / Treyler (Kompyuterdan tanlash)"}
                </label>
                <input
                  type="file"
                  accept="video/*"
                  className="input"
                  onChange={(e) => handleCourseVideoFile(e.target.files?.[0])}
                />
                {(courseVideoPreview || editingCourse.videoUrl) && (
                  <div className="video-preview-box" style={{ marginTop: '10px', borderRadius: '10px', overflow: 'hidden', background: '#000', border: '1px solid rgba(255,255,255,0.1)' }}>
                    <video
                      controls
                      playsInline
                      src={courseVideoPreview || editingCourse.videoUrl}
                      style={{ width: '100%', maxHeight: '220px', display: 'block' }}
                    />
                    {editingCourse.videoName && (
                      <div style={{ padding: '6px 10px', fontSize: '0.85rem', color: '#10b981', background: 'rgba(16, 185, 129, 0.1)' }}>
                        {lang === 'ru' ? '✅ Выбранное видео:' : '✅ Tanlangan video:'} <strong>{editingCourse.videoName}</strong>
                      </div>
                    )}
                  </div>
                )}
              </div>

              <button type="submit" className="btn btn-primary btn-block">
                💾 {t.teacherPanel.saveCourse}
              </button>
            </form>
          </div>
        )}

        {/* TAB 3: STUDENTS & PROGRESS */}
        {activeTab === 'students' && (
          <div className="tab-panel">
            <div className="table-card">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>{lang === 'ru' ? 'Студент' : 'Talaba'}</th>
                    <th>{lang === 'ru' ? 'Контакты' : 'Aloqa'}</th>
                    <th>{lang === 'ru' ? 'Курс' : 'Kurs'}</th>
                    <th>{lang === 'ru' ? 'Дата записи' : 'Yozilgan sana'}</th>
                    <th>{lang === 'ru' ? 'Прогресс' : "O'zlashtirish (Progress)"}</th>
                  </tr>
                </thead>
                <tbody>
                  {myEnrollments.map((enr) => {
                    const st = db.users.find((u) => u.id === enr.userId);
                    const crs = db.courses.find((c) => c.id === enr.courseId);
                    const prog = getCourseProgress(enr.userId, enr.courseId);
                    return (
                      <tr key={enr.id}>
                        <td><strong>{st?.name}</strong></td>
                        <td>{st?.email || st?.phone}</td>
                        <td>{loc(crs, 'title')}</td>
                        <td>{new Date(enr.createdAt).toLocaleDateString()}</td>
                        <td>
                          <div className="inline-progress">
                            <div className="progress-bar-track">
                              <div className="progress-bar-fill" style={{ width: `${prog}%` }} />
                            </div>
                            <strong>{prog}%</strong>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 4: HOMEWORK SUBMISSIONS GRADING */}
        {activeTab === 'submissions' && (
          <div className="tab-panel">
            <div className="submissions-grading-stack">
              {db.submissions.map((sub) => {
                const st = db.users.find((u) => u.id === sub.userId);
                const asg = db.assignments.find((a) => a.id === sub.assignmentId);
                const g = gradingState[sub.id] || {
                  score: sub.score ?? 90,
                  comment: sub.teacherComment || "Ajoyib natija, amaliy topshiriq to'liq bajarilgan!"
                };

                return (
                  <div key={sub.id} className="grading-item-card">
                    <div className="grading-head">
                      <div>
                        <h4>{loc(asg, 'title')}</h4>
                        <span className="text-muted">
                          Talaba: <strong>{st?.name}</strong> • Fayl: <code>{sub.fileName}</code>
                        </span>
                      </div>
                      <span className={`status-pill ${sub.status === 'graded' ? 'paid' : 'pending'}`}>
                        {sub.status.toUpperCase()}
                      </span>
                    </div>
                    <p className="submission-answer-box">{sub.answerText}</p>

                    <div className="grading-controls-row">
                      <input
                        type="number"
                        className="input score-input"
                        min={0}
                        max={100}
                        placeholder="Ball (0-100)"
                        value={g.score}
                        onChange={(e) =>
                          setGradingState({
                            ...gradingState,
                            [sub.id]: { ...g, score: e.target.value }
                          })
                        }
                      />
                      <input
                        type="text"
                        className="input"
                        placeholder={lang === 'ru' ? "Комментарий преподавателя..." : "Ustoz izohi..."}
                        value={g.comment}
                        onChange={(e) =>
                          setGradingState({
                            ...gradingState,
                            [sub.id]: { ...g, comment: e.target.value }
                          })
                        }
                      />
                      <button
                        className="btn btn-primary"
                        onClick={() =>
                          gradeSubmission({
                            submissionId: sub.id,
                            score: g.score,
                            teacherComment: g.comment
                          })
                        }
                      >
                        ✅ {t.teacherPanel.gradeBtn}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 5: REVENUE ANALYTICS */}
        {activeTab === 'analytics' && (
          <div className="tab-panel">
            <div className="table-card">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>{lang === 'ru' ? "Курс" : "Kurs"}</th>
                    <th>{lang === 'ru' ? "Цена" : "Narx"}</th>
                    <th>{lang === 'ru' ? "Всего студентов" : "Jami talabalar"}</th>
                    <th>{lang === 'ru' ? "Оплаченные транзакции" : "To'langan tranzaksiyalar"}</th>
                    <th>{lang === 'ru' ? "Общий доход" : "Jami daromad"}</th>
                  </tr>
                </thead>
                <tbody>
                  {myCourses.map((crs) => {
                    const crsPays = myPayments.filter((p) => p.courseId === crs.id);
                    const crsRev = crsPays.reduce((s, p) => s + p.amount, 0);
                    return (
                      <tr key={crs.id}>
                        <td><strong>{loc(crs, 'title')}</strong></td>
                        <td>{formatPrice(crs.discountPrice || crs.price)}</td>
                        <td>{crs.studentsCount || 0} {lang === 'ru' ? "студ." : "ta"}</td>
                        <td>{crsPays.length} {lang === 'ru' ? "шт" : "ta"}</td>
                        <td><strong>{formatPrice(crsRev)}</strong></td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export function AdminPanelPage() {
  const {
    t,
    loc,
    formatPrice,
    db,
    currentUser,
    adminUpdateUser,
    adminToggleBlockUser,
    adminDeleteUser,
    adminInviteUser,
    adminEnrollUser,
    adminBroadcastMessage,
    adminToggleCourseStatus,
    adminDeleteCourse,
    adminResetDefaultCourses,
    exportPaymentsCsv,
    adminConfirmPayment,
    adminCancelPayment,
    adminUpdatePayment,
    adminDeletePayment,
    gradeSubmission,
    adminAssignHomework,
    showToast,
    lang,
    navigate,
    adminCardNumber,
    adminCardHolder,
    updateAdminCard
  } = useApp();

  const [activeTab, setActiveTab] = useState('overview');
  const [hwAssignForm, setHwAssignForm] = useState({ studentId: '', title: '', description: '' });
  const [hwGrading, setHwGrading] = useState({});
  const [userSearch, setUserSearch] = useState('');
  const [userRoleFilter, setUserRoleFilter] = useState('all');
  const [payFilter, setPayFilter] = useState('all');

  // Admin Card Settings
  const [editingAdminCard, setEditingAdminCard] = useState(false);
  const [newCardInput, setNewCardInput] = useState('');
  const [newHolderInput, setNewHolderInput] = useState('');

  // Admin User states
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteForm, setInviteForm] = useState({ name: '', phone: '+998', role: 'student', courseId: '', message: '' });
  const [inviteResult, setInviteResult] = useState(null);
  const [showBroadcastModal, setShowBroadcastModal] = useState(false);
  const [broadcastText, setBroadcastText] = useState('');
  const [enrollModalUser, setEnrollModalUser] = useState(null);
  const [enrollCourseId, setEnrollCourseId] = useState(db.courses[0]?.id || '');

  // Payment editing modal states
  const [editingPayment, setEditingPayment] = useState(null);
  const [editPayForm, setEditPayForm] = useState({ amount: '', status: 'paid', provider: 'card' });
  const [viewingReceiptImage, setViewingReceiptImage] = useState(null);

  const paidPayments = (db.payments || []).filter((p) => p.status === 'paid');
  const pendingPayments = (db.payments || []).filter((p) => p.status === 'pending');
  const totalRevenue = paidPayments.reduce((s, p) => s + p.amount, 0);

  return (
    <div className="section">
      <div className="container">
        <div className="dashboard-welcome-card admin-banner">
          <div>
            <h1>🛡️ {t.adminPanel.title}</h1>
            <p className="text-muted">
              {lang === 'ru'
                ? "Полный контроль платформы, курсы, платежи и пользователи"
                : "Butun platforma nazorati, kurslar, to'lovlar va foydalanuvchilar"}
            </p>
          </div>
          <div className="welcome-kpis">
            <div className="mini-kpi">
              <strong>{(db.enrollments || []).length}</strong>
              <span>{lang === 'ru' ? "Активные студенты" : "Faol talabalar"}</span>
            </div>
            <div className="mini-kpi">
              <strong>{db.courses.length}</strong>
              <span>{lang === 'ru' ? "Курсы" : "Kurslar"}</span>
            </div>
            <div className="mini-kpi">
              <strong>{totalRevenue === 0 ? (lang === 'ru' ? "0 сум" : "0 so'm") : formatPrice(totalRevenue)}</strong>
              <span>{lang === 'ru' ? "Доход" : "Tushum"}</span>
            </div>
          </div>
        </div>

        {/* YANGI KURS SOTIB OLISH SO'ROVI KELGANDA ADMINGA TEZKOR XABARNOMA */}
        {pendingPayments.length > 0 && activeTab !== 'purchaseRequests' && (
          <div
            style={{
              background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.16), rgba(16, 185, 129, 0.14))',
              border: '2px solid rgba(245, 158, 11, 0.55)',
              borderRadius: '14px',
              padding: '16px 20px',
              marginBottom: '18px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '14px',
              boxShadow: '0 8px 24px rgba(245, 158, 11, 0.15)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span style={{ fontSize: '2rem' }}>🔔</span>
              <div>
                <h4 style={{ margin: '0 0 4px 0', fontSize: '1.05rem', fontWeight: 800, color: '#fbbf24' }}>
                  {lang === 'ru'
                    ? `Новые чеки об оплате (${pendingPayments.length} шт.) ожидают вашего подтверждения!`
                    : `Yangi xabar: ${pendingPayments.length} ta o'quvchi kurs sotib olib, to'lov chekini yubordi!`}
                </h4>
                <p style={{ margin: 0, fontSize: '0.88rem', color: 'var(--text-muted)' }}>
                  {lang === 'ru'
                    ? 'Проверьте поступление средств на карту и подтвердите, чтобы открыть курс студенту.'
                    : "Kartangizga pul tushganini tekshirib tasdiqlang — tasdiqlashingiz bilan o'quvchiga kurs avtomatik ochiladi."}
                </p>
              </div>
            </div>
            <button
              type="button"
              className="btn btn-primary"
              style={{ background: '#f59e0b', borderColor: '#f59e0b', color: '#0f172a', fontWeight: 800 }}
              onClick={() => setActiveTab('purchaseRequests')}
            >
              🛒 {lang === 'ru' ? 'Перейти к проверке чеков' : "Cheklarni ko'rish va tasdiqlash"} ({pendingPayments.length})
            </button>
          </div>
        )}

        <div className="tabs-bar">
          {Object.entries(t.adminPanel.tabs).map(([key, label]) => {
            const isPurchaseTab = key === 'purchaseRequests';
            return (
              <button
                key={key}
                className={`tab-btn ${activeTab === key ? 'active' : ''}`}
                onClick={() => setActiveTab(key)}
                style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}
              >
                {isPurchaseTab && <span>🛒</span>}
                <span>{label}</span>
                {isPurchaseTab && pendingPayments.length > 0 && (
                  <span
                    style={{
                      background: '#ef4444',
                      color: '#fff',
                      fontSize: '0.75rem',
                      fontWeight: 800,
                      padding: '2px 8px',
                      borderRadius: '999px',
                      boxShadow: '0 0 10px rgba(239, 68, 68, 0.6)'
                    }}
                  >
                    {pendingPayments.length}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* KURS SOTIB OLMOQCHI BO'LGANLAR (CHEK YUBORGAN O'QUVCHILARNI TASDIQLASH BO'LIMI) */}
        {activeTab === 'purchaseRequests' && (
          <div className="tab-panel">
            <div
              className="chart-card"
              style={{
                padding: '18px 22px',
                borderRadius: '14px',
                marginBottom: '20px',
                border: '1px solid rgba(56, 189, 248, 0.35)',
                background: 'linear-gradient(135deg, rgba(56, 189, 248, 0.08), rgba(99, 102, 241, 0.08))',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '14px'
              }}
            >
              <div>
                <h3 style={{ margin: '0 0 6px 0', fontSize: '1.2rem', fontWeight: 800 }}>
                  🛒 {lang === 'ru' ? 'Студенты, отправившие чек на покупку курса' : "Kurs sotib olib, to'lov chekini tashlagan o'quvchilar"}
                </h3>
                <p className="text-muted" style={{ margin: 0, fontSize: '0.9rem' }}>
                  {lang === 'ru'
                    ? 'Когда студент отправляет чек об оплате, он появляется здесь. После вашего подтверждения курс мгновенно открывается у студента!'
                    : "O'quvchi kurs sotib olib chek tashlaganda shu yerga kelib tushadi. Kartangizga pul tushganini tasdiqlasangiz, o'quvchiga kurs shu zahoti avtomatik ochiladi!"}
                </p>
              </div>
              <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
                <div style={{ background: 'rgba(245, 158, 11, 0.15)', border: '1px solid rgba(245, 158, 11, 0.4)', padding: '8px 14px', borderRadius: '10px', fontWeight: 700, color: '#fbbf24', fontSize: '0.88rem' }}>
                  ⏳ {lang === 'ru' ? 'Ожидают подтверждения:' : 'Tasdiqlash kutilmoqda:'} {pendingPayments.length} {lang === 'ru' ? 'чел.' : 'ta'}
                </div>
                <div style={{ background: 'rgba(16, 185, 129, 0.15)', border: '1px solid rgba(16, 185, 129, 0.4)', padding: '8px 14px', borderRadius: '10px', fontWeight: 700, color: '#10b981', fontSize: '0.88rem' }}>
                  ✅ {lang === 'ru' ? 'Подтверждено (Курс открыт):' : 'Tasdiqlangan (Kurs ochilgan):'} {paidPayments.length} {lang === 'ru' ? 'чел.' : 'ta'}
                </div>
              </div>
            </div>

            {(db.payments || []).length === 0 ? (
              <div className="table-card" style={{ textAlign: 'center', padding: '56px 24px', borderRadius: '16px' }}>
                <div style={{ fontSize: '3.4rem', marginBottom: '12px' }}>📭</div>
                <h3 style={{ marginBottom: '8px' }}>
                  {lang === 'ru' ? 'Пока никто не отправил запрос на покупку курса' : "Hozircha hech kim kurs sotib olish uchun chek yubormagan"}
                </h3>
                <p className="text-muted" style={{ maxWidth: '500px', margin: '0 auto', fontSize: '0.94rem' }}>
                  {lang === 'ru'
                    ? 'Как только студент выберет курс и загрузит скриншот чека об оплате, его заявка сразу появится на этой странице.'
                    : "O'quvchi kursni tanlab, to'lov cheki skrinshotini yuborishi bilan uning so'rovi va cheki shu yerda paydo bo'ladi."}
                </p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {(db.payments || []).map((p) => {
                  const usr = (db.users || []).find((u) => u.id === p.userId);
                  const crs =
                    p.courseId === 'all'
                      ? {
                          titleUz: "Barcha umumiy kurslar to'plami (Full Bundle)",
                          titleRu: "Полный доступ ко всем курсам (Full Bundle)"
                        }
                      : (db.courses || []).find((c) => c.id === p.courseId);
                  const studentName = usr?.name || p.userName || (lang === 'ru' ? 'Студент' : "O'quvchi");
                  const studentPhone = usr?.phone || p.userPhone || "Raqam ko'rsatilmagan";
                  const courseTitle = (crs ? loc(crs, 'title') : '') || p.courseTitle || (db.courses[0] ? loc(db.courses[0], 'title') : 'Kurs');
                  const courseThumb = crs?.thumbnail || p.courseThumbnail || db.courses[0]?.thumbnail || '';
                  const isPaid = p.status === 'paid';
                  const isPending = p.status === 'pending';

                  return (
                    <div
                      key={p.id}
                      className="chart-card"
                      style={{
                        padding: '20px',
                        borderRadius: '16px',
                        border: isPending
                          ? '2px solid rgba(245, 158, 11, 0.65)'
                          : isPaid
                          ? '1.5px solid rgba(16, 185, 129, 0.45)'
                          : '1px solid rgba(239, 68, 68, 0.35)',
                        background: isPending
                          ? 'linear-gradient(135deg, rgba(245, 158, 11, 0.08), rgba(15, 23, 42, 0.9))'
                          : 'var(--surface)',
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
                        gap: '20px',
                        alignItems: 'center',
                        boxShadow: isPending ? '0 10px 28px rgba(245, 158, 11, 0.12)' : 'none'
                      }}
                    >
                      {/* 1. O'QUVCHI VA KURS MA'LUMOTLARI */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                        {courseThumb ? (
                          <img
                            src={courseThumb}
                            alt={courseTitle}
                            style={{ width: '72px', height: '72px', borderRadius: '12px', objectFit: 'cover', flexShrink: 0, border: '1px solid var(--border)' }}
                          />
                        ) : (
                          <div style={{ width: '72px', height: '72px', borderRadius: '12px', background: 'rgba(99, 102, 241, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', flexShrink: 0 }}>
                            📚
                          </div>
                        )}
                        <div>
                          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '2px' }}>
                            👤 {lang === 'ru' ? 'Студент:' : "O'quvchi:"}
                          </div>
                          <div style={{ fontSize: '1.08rem', fontWeight: 800 }}>{studentName}</div>
                          <div style={{ fontSize: '0.86rem', color: '#38bdf8', fontWeight: 600, marginBottom: '6px' }}>
                            📞 {studentPhone}
                          </div>
                          <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text)' }}>
                            📖 {lang === 'ru' ? 'Курс:' : 'Kurs:'} <span style={{ color: '#a855f7' }}>{courseTitle}</span>
                          </div>
                        </div>
                      </div>

                      {/* 2. SUMMA, KARTA VA SANASI */}
                      <div>
                        <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '4px' }}>
                          💰 {lang === 'ru' ? 'Сумма оплаты:' : "To'lov summasi:"}
                        </div>
                        <div style={{ fontSize: '1.35rem', fontWeight: 900, color: '#10b981', marginBottom: '6px' }}>
                          {formatPrice(p.amount)}
                        </div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                          💳 {lang === 'ru' ? 'На карту:' : 'Karta:'} <code>{p.accountMask || adminCardNumber}</code>
                        </div>
                        <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '3px' }}>
                          🕒 {p.createdAt ? new Date(p.createdAt).toLocaleString() : '-'} • <code>{p.transactionId}</code>
                        </div>
                      </div>

                      {/* 3. TO'LOV CHEKI SKRINSHOTI */}
                      <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '6px', fontWeight: 600 }}>
                          📸 {lang === 'ru' ? 'Прикреплённый чек об оплате:' : "Yuborilgan to'lov cheki:"}
                        </div>
                        {p.receiptImage ? (
                          <div style={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                            <img
                              src={p.receiptImage}
                              alt="To'lov cheki"
                              onClick={() => setViewingReceiptImage(p.receiptImage)}
                              style={{
                                width: '110px',
                                height: '90px',
                                objectFit: 'cover',
                                borderRadius: '10px',
                                border: '2px solid rgba(56, 189, 248, 0.5)',
                                cursor: 'pointer',
                                boxShadow: '0 4px 12px rgba(0,0,0,0.25)'
                              }}
                              title={lang === 'ru' ? 'Нажмите, чтобы увеличить чек' : "Chekni kattalashtirib ko'rish uchun bosing"}
                            />
                            <button
                              type="button"
                              className="btn btn-xs btn-outline"
                              onClick={() => setViewingReceiptImage(p.receiptImage)}
                              style={{ fontSize: '0.78rem' }}
                            >
                              🔍 {lang === 'ru' ? 'Увеличить чек' : "Chekni to'liq ko'rish"}
                            </button>
                          </div>
                        ) : (
                          <span className="text-muted" style={{ fontSize: '0.85rem' }}>
                            {lang === 'ru' ? 'Чек не прикреплён' : 'Chek rasmi biriktirilmagan'}
                          </span>
                        )}
                      </div>

                      {/* 4. HOLATI VA TASDIQLASH TUGMALARI */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', alignItems: 'flex-end', justifyContent: 'center' }}>
                        <span
                          style={{
                            fontSize: '0.8rem',
                            padding: '5px 12px',
                            borderRadius: '999px',
                            fontWeight: 800,
                            backgroundColor: isPaid
                              ? 'rgba(16, 185, 129, 0.18)'
                              : isPending
                              ? 'rgba(245, 158, 11, 0.2)'
                              : 'rgba(239, 68, 68, 0.18)',
                            color: isPaid ? '#10b981' : isPending ? '#fbbf24' : '#ef4444'
                          }}
                        >
                          {isPaid
                            ? (lang === 'ru' ? '✅ ОПЛАТА ПОДТВЕРЖДЕНА (КУРС ОТКРЫТ)' : "✅ PUL TUSHGANI TASDIQLANDI (KURS OCHIQ)")
                            : isPending
                            ? (lang === 'ru' ? '⏳ ОЖИДАЕТ ВАШЕГО ПОДТВЕРЖДЕНИЯ' : "⏳ TASDIQLASHINGIZ KUTILMOQDA")
                            : (lang === 'ru' ? '❌ ОТКЛОНЕНО (ДЕНЕГ НЕТ)' : "❌ RAD ETILGAN (PUL TUSHMADI)")}
                        </span>

                        {!isPaid && (
                          <button
                            type="button"
                            className="btn btn-success"
                            onClick={() => adminConfirmPayment(p.id)}
                            style={{
                              background: 'linear-gradient(135deg, #10b981, #059669)',
                              color: '#fff',
                              border: 'none',
                              fontWeight: 800,
                              padding: '10px 18px',
                              borderRadius: '10px',
                              boxShadow: '0 6px 18px rgba(16, 185, 129, 0.35)',
                              width: '100%',
                              maxWidth: '280px'
                            }}
                          >
                            ✅ {lang === 'ru' ? 'Подтвердить (Деньги поступили — Открыть курс)' : "Tasdiqlash (Kartaga pul tushdi — Kursni ochish)"}
                          </button>
                        )}

                        {isPending && (
                          <button
                            type="button"
                            className="btn btn-sm btn-outline"
                            onClick={() => adminCancelPayment(p.id)}
                            style={{
                              color: '#ef4444',
                              borderColor: 'rgba(239, 68, 68, 0.45)',
                              width: '100%',
                              maxWidth: '280px'
                            }}
                          >
                            ✕ {lang === 'ru' ? 'Отклонить (Деньги не поступили)' : "Rad etish (Kartaga pul tushmadi)"}
                          </button>
                        )}

                        {isPaid && (
                          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                            <button
                              type="button"
                              className="btn btn-xs btn-outline"
                              onClick={() => adminCancelPayment(p.id)}
                              style={{ color: '#f59e0b', borderColor: 'rgba(245, 158, 11, 0.4)' }}
                            >
                              ↩️ {lang === 'ru' ? 'Отменить доступ' : 'Tasdiqni bekor qilish'}
                            </button>
                            <button
                              type="button"
                              className="btn btn-xs btn-ghost"
                              style={{ color: '#ef4444' }}
                              onClick={() => {
                                if (window.confirm(lang === 'ru' ? 'Удалить эту заявку?' : "Ushbu to'lov so'rovini o'chirmoqchimisiz?")) {
                                  adminDeletePayment(p.id);
                                }
                              }}
                            >
                              🗑️ {lang === 'ru' ? 'Удалить' : "O'chirish"}
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* 1. OVERVIEW & CHARTS */}
        {activeTab === 'overview' && (
          <div className="tab-panel">
            <div className="overview-stats-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '24px' }}>
              <div className="chart-card" style={{ padding: '20px', borderRadius: '12px' }}>
                <div style={{ color: '#94a3b8', fontSize: '0.9rem', marginBottom: '6px' }}>
                  {lang === 'ru' ? "💰 Общий доход (Реальный)" : "💰 Jami tushum (Real)"}
                </div>
                <div style={{ fontSize: '1.6rem', fontWeight: 'bold', color: '#10b981' }}>
                  {totalRevenue === 0 ? (lang === 'ru' ? "0 сум" : "0 so'm") : formatPrice(totalRevenue)}
                </div>
                <small className="text-muted">
                  {lang === 'ru' ? "Только реальные успешные покупки" : "Faqat haqiqiy muvaffaqiyatli xaridlar"}
                </small>
              </div>
              <div className="chart-card" style={{ padding: '20px', borderRadius: '12px' }}>
                <div style={{ color: '#94a3b8', fontSize: '0.9rem', marginBottom: '6px' }}>
                  {lang === 'ru' ? "🎓 Купившие курсы" : "🎓 Kurs sotib olganlar"}
                </div>
                <div style={{ fontSize: '1.6rem', fontWeight: 'bold' }}>
                  {(db.enrollments || []).length} {lang === 'ru' ? "чел." : "ta"}
                </div>
                <small className="text-muted">
                  {lang === 'ru' ? "Реальные активные студенты" : "Haqiqiy faol talabalar"}
                </small>
              </div>
              <div className="chart-card" style={{ padding: '20px', borderRadius: '12px' }}>
                <div style={{ color: '#94a3b8', fontSize: '0.9rem', marginBottom: '6px' }}>
                  {lang === 'ru' ? "💳 Успешные платежи" : "💳 Muvaffaqiyatli to'lovlar"}
                </div>
                <div style={{ fontSize: '1.6rem', fontWeight: 'bold' }}>
                  {paidPayments.length} {lang === 'ru' ? "шт" : "ta"}
                </div>
                <small className="text-muted">
                  {lang === 'ru' ? "Транзакции Payme и Click" : "Payme & Click tranzaksiyalari"}
                </small>
              </div>
              <div className="chart-card" style={{ padding: '20px', borderRadius: '12px' }}>
                <div style={{ color: '#94a3b8', fontSize: '0.9rem', marginBottom: '6px' }}>
                  {lang === 'ru' ? "📚 Курсы на платформе" : "📚 Platformadagi kurslar"}
                </div>
                <div style={{ fontSize: '1.6rem', fontWeight: 'bold' }}>
                  {db.courses.length} {lang === 'ru' ? "шт" : "ta"}
                </div>
                <small className="text-muted">
                  {lang === 'ru' ? "Авторские курсы" : "Mualliflik kurslari"}
                </small>
              </div>
            </div>

            <div className="chart-card" style={{ padding: '36px 24px', textAlign: 'center', background: 'rgba(255, 255, 255, 0.02)', border: '1px dashed rgba(255, 255, 255, 0.15)', borderRadius: '14px' }}>
              <div style={{ fontSize: '2.5rem', marginBottom: '12px' }}>🛡️</div>
              <h3 style={{ marginBottom: '8px', fontSize: '1.2rem' }}>
                {lang === 'ru'
                  ? `Состояние платформы: Чистая и Активная (${(db.enrollments || []).length} покупок)`
                  : `Platforma holati: Toza va Faol (${(db.enrollments || []).length} ta xarid)`}
              </h3>
              <p className="text-muted" style={{ maxWidth: '620px', margin: '0 auto', fontSize: '0.95rem', lineHeight: '1.6' }}>
                {lang === 'ru'
                  ? "Все тестовые данные сброшены до 0. Когда пользователи оплатят курсы через Payme или Click, либо администратор прикрепит курс вручную, статистика и доходы в реальном времени отобразятся здесь."
                  : "Barcha soxta yoki test ma'lumotlari 0 ga tushirildi. Hozircha hech kim kurs sotib olmagan. Foydalanuvchilar Payme yoki Click orqali kurs sotib olganda yoki admin tomonidan biriktirilganda, statistika va tushumlar avtomatik ravishda bu yerda real vaqtda aks etadi."}
              </p>
            </div>
          </div>
        )}

        {/* HOMEWORK: ASSIGN TASKS & GRADE STUDENTS */}
        {activeTab === 'homework' && (
          <div className="tab-panel">
            <form
              className="editor-card"
              style={{ marginBottom: '24px' }}
              onSubmit={(e) => {
                e.preventDefault();
                const ok = adminAssignHomework(hwAssignForm);
                if (ok) setHwAssignForm({ studentId: hwAssignForm.studentId, title: '', description: '' });
              }}
            >
              <h3>📝 {lang === 'ru' ? 'Выдать задание студенту' : 'Talabaga vazifa berish'}</h3>
              <div className="form-group">
                <label className="field-label">{lang === 'ru' ? 'Студент' : 'Talaba'}</label>
                <select
                  className="input"
                  value={hwAssignForm.studentId}
                  onChange={(e) => setHwAssignForm({ ...hwAssignForm, studentId: e.target.value })}
                  required
                >
                  <option value="">{lang === 'ru' ? 'Выберите студента...' : 'Talabani tanlang...'}</option>
                  {db.users
                    .filter((u) => u.role === 'student')
                    .map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.name} {u.phone ? `(${u.phone})` : ''}
                      </option>
                    ))}
                </select>
              </div>
              <div className="form-group">
                <label className="field-label">{lang === 'ru' ? 'Название задания' : 'Vazifa nomi'}</label>
                <input
                  type="text"
                  className="input"
                  value={hwAssignForm.title}
                  onChange={(e) => setHwAssignForm({ ...hwAssignForm, title: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label className="field-label">{lang === 'ru' ? 'Описание' : 'Tavsif'}</label>
                <textarea
                  className="input"
                  rows={3}
                  value={hwAssignForm.description}
                  onChange={(e) => setHwAssignForm({ ...hwAssignForm, description: e.target.value })}
                />
              </div>
              <button type="submit" className="btn btn-primary">
                ➕ {lang === 'ru' ? 'Выдать задание' : 'Vazifa berish'}
              </button>
            </form>

            <div className="table-card">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>{lang === 'ru' ? 'Студент' : 'Talaba'}</th>
                    <th>{lang === 'ru' ? 'Задание' : 'Vazifa'}</th>
                    <th>{lang === 'ru' ? 'Ответ / Файл' : 'Javob / Fayl'}</th>
                    <th>{lang === 'ru' ? 'Оценка (0-100)' : 'Baho (0-100)'}</th>
                    <th>{lang === 'ru' ? 'Комментарий' : 'Izoh'}</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {db.assignments
                    .filter((a) => a.studentId || db.submissions.some((s) => s.assignmentId === a.id))
                    .flatMap((asg) => {
                      const subs = db.submissions.filter((s) => s.assignmentId === asg.id);
                      if (subs.length === 0 && asg.studentId) {
                        return [{ asg, sub: null, userId: asg.studentId }];
                      }
                      return subs.map((sub) => ({ asg, sub, userId: sub.userId }));
                    })
                    .map(({ asg, sub, userId }) => {
                      const student = db.users.find((u) => u.id === userId);
                      const key = sub ? sub.id : `${asg.id}-${userId}`;
                      const draft = hwGrading[key] || {
                        score: sub?.score ?? '',
                        comment: sub?.teacherComment || ''
                      };
                      return (
                        <tr key={key}>
                          <td><strong>{student?.name || userId}</strong></td>
                          <td>{loc(asg, 'title')}</td>
                          <td>
                            {sub ? (
                              <>
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
                                {sub.fileName && sub.fileData && (
                                  <a href={sub.fileData} download={sub.fileName}>📎 {sub.fileName}</a>
                                )}
                                {sub.fileName && !sub.fileData && <small className="text-muted">📎 {sub.fileName}</small>}
                              </>
                            ) : (
                              <span className="text-muted">
                                {lang === 'ru' ? 'Ответ ещё не отправлен' : 'Javob hali yuborilmagan'}
                              </span>
                            )}
                          </td>
                          <td>
                            <input
                              type="number"
                              min="0"
                              max="100"
                              className="input"
                              style={{ width: '90px' }}
                              disabled={!sub}
                              value={draft.score}
                              onChange={(e) =>
                                setHwGrading({ ...hwGrading, [key]: { ...draft, score: e.target.value } })
                              }
                            />
                          </td>
                          <td>
                            <input
                              type="text"
                              className="input"
                              disabled={!sub}
                              value={draft.comment}
                              onChange={(e) =>
                                setHwGrading({ ...hwGrading, [key]: { ...draft, comment: e.target.value } })
                              }
                            />
                          </td>
                          <td>
                            <button
                              className="btn btn-xs btn-primary"
                              disabled={!sub || draft.score === ''}
                              onClick={() =>
                                gradeSubmission({
                                  submissionId: sub.id,
                                  score: Math.max(0, Math.min(100, Number(draft.score))),
                                  teacherComment: draft.comment
                                })
                              }
                            >
                              💾 {lang === 'ru' ? 'Оценить' : 'Baholash'}
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 2. USERS MANAGEMENT */}
        {activeTab === 'users' && (
          <div className="tab-panel">
            <div className="admin-users-header-row" style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
              <div style={{ display: 'flex', gap: '10px', flex: 1, minWidth: '280px', maxWidth: '520px' }}>
                <input
                  type="text"
                  className="input"
                  placeholder={lang === 'ru' ? 'Поиск по имени, телефону или email...' : "Ism, telefon yoki email bo'yicha qidirish..."}
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                />
              </div>

              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={() => {
                    setInviteResult(null);
                    setShowInviteModal(true);
                  }}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                >
                  <span>➕</span>
                  <span>{lang === 'ru' ? 'Пригласить пользователя' : "Foydalanuvchi taklif qilish"}</span>
                </button>
                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={() => setShowBroadcastModal(true)}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                >
                  <span>📢</span>
                  <span>{lang === 'ru' ? 'Объявление всем' : "Barchaga e'lon"}</span>
                </button>
              </div>
            </div>

            {/* Filter pills */}
            <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', flexWrap: 'wrap' }}>
              {[
                { id: 'all', label: lang === 'ru' ? `Все (${db.users.length})` : `Barchasi (${db.users.length})` },
                { id: 'student', label: lang === 'ru' ? `Студенты (${db.users.filter((u) => u.role === 'student').length})` : `Talabalar (${db.users.filter((u) => u.role === 'student').length})` },
                { id: 'teacher', label: lang === 'ru' ? `Учителя (${db.users.filter((u) => u.role === 'teacher').length})` : `O'qituvchilar (${db.users.filter((u) => u.role === 'teacher').length})` },
                { id: 'blocked', label: lang === 'ru' ? `Заблокированные (${db.users.filter((u) => u.blocked).length})` : `Bloklanganlar (${db.users.filter((u) => u.blocked).length})` }
              ].map((f) => (
                <button
                  key={f.id}
                  type="button"
                  className={`btn btn-xs ${userRoleFilter === f.id ? 'btn-primary' : 'btn-soft'}`}
                  onClick={() => setUserRoleFilter(f.id)}
                >
                  {f.label}
                </button>
              ))}
            </div>

            <div className="table-card">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>{lang === 'ru' ? 'Пользователь' : 'Foydalanuvchi'}</th>
                    <th>{lang === 'ru' ? 'Контакты' : 'Aloqa'}</th>
                    <th>{lang === 'ru' ? 'Роль' : 'Rol'}</th>
                    <th>{lang === 'ru' ? 'Курсы' : 'Kurslar'}</th>
                    <th>{lang === 'ru' ? 'Статус' : 'Holati'}</th>
                    <th style={{ textAlign: 'right' }}>{lang === 'ru' ? 'Действия' : 'Amallar'}</th>
                  </tr>
                </thead>
                <tbody>
                  {db.users
                    .filter((u) => {
                      const q = userSearch.toLowerCase();
                      const matchQuery =
                        u.name.toLowerCase().includes(q) ||
                        (u.email || '').toLowerCase().includes(q) ||
                        (u.phone || '').includes(q);
                      if (!matchQuery) return false;
                      if (userRoleFilter === 'student') return u.role === 'student';
                      if (userRoleFilter === 'teacher') return u.role === 'teacher';
                      if (userRoleFilter === 'blocked') return u.blocked;
                      return true;
                    })
                    .map((u) => {
                      const isMainAdmin = (u.phone || '').replace(/\D/g, '') === '998951639101' || u.id === 'usr-admin-1';
                      const userEnrollments = (db.enrollments || []).filter((e) => e.userId === u.id);
                      return (
                        <tr key={u.id} style={u.blocked ? { opacity: 0.75, backgroundColor: 'rgba(239, 68, 68, 0.04)' } : {}}>
                          <td>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                              <img
                                src={u.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100'}
                                alt={u.name}
                                style={{ width: '38px', height: '38px', borderRadius: '50%', objectFit: 'cover' }}
                              />
                              <div>
                                <strong style={{ display: 'block', fontSize: '0.95rem' }}>
                                  {u.name} {isMainAdmin && <span title={lang === 'ru' ? "Главный Администратор" : "Bosh Administrator"} style={{ cursor: 'pointer' }}>👑</span>}
                                </strong>
                                <small className="text-muted" style={{ fontSize: '0.78rem' }}>ID: {u.id}</small>
                              </div>
                            </div>
                          </td>
                          <td>
                            <div><strong>{u.phone || '-'}</strong></div>
                            {u.email && <small className="text-muted">{u.email}</small>}
                          </td>
                          <td>
                            {isMainAdmin ? (
                              <span className="role-badge" style={{ background: 'linear-gradient(135deg, #ff5722, #f59e0b)', color: '#fff' }}>
                                👑 ADMIN
                              </span>
                            ) : (
                              <select
                                className="input input-sm"
                                style={{ padding: '4px 8px', fontSize: '0.85rem' }}
                                value={u.role}
                                onChange={(e) => adminUpdateUser(u.id, { role: e.target.value })}
                              >
                                <option value="student">{lang === 'ru' ? 'студент' : 'student'}</option>
                                <option value="teacher">{lang === 'ru' ? 'учитель' : 'teacher'}</option>
                              </select>
                            )}
                          </td>
                          <td>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                              <span className="badge-soft">{userEnrollments.length} {lang === 'ru' ? 'курсов' : 'ta'}</span>
                              <button
                                type="button"
                                className="btn btn-xs btn-ghost"
                                title={lang === 'ru' ? "Прикрепить курс" : "Kurs biriktirish"}
                                onClick={() => {
                                  setEnrollModalUser(u);
                                  setEnrollCourseId(db.courses[0]?.id || '');
                                }}
                                style={{ padding: '2px 6px' }}
                              >
                                🎓 +
                              </button>
                            </div>
                          </td>
                          <td>
                            <span className={`status-pill ${u.blocked ? 'cancelled' : 'paid'}`}>
                              {u.blocked ? (lang === 'ru' ? '🚫 ЗАБЛОКИРОВАН' : '🚫 BLOKLANGAN') : (lang === 'ru' ? '✅ АКТИВЕН' : '✅ FAOL')}
                            </span>
                          </td>
                          <td style={{ textAlign: 'right' }}>
                            <div style={{ display: 'inline-flex', gap: '6px', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                              {/* KURS BIRIKTIRISH */}
                              <button
                                type="button"
                                className="btn btn-xs btn-outline"
                                onClick={() => {
                                  setEnrollModalUser(u);
                                  setEnrollCourseId(db.courses[0]?.id || '');
                                }}
                                style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                              >
                                <span>🎓</span>
                                <span>{lang === 'ru' ? 'Курс' : 'Kurs'}</span>
                              </button>

                              {/* BLOKLASH / BLOKDAN CHIQARISH */}
                              {!isMainAdmin && (
                                <button
                                  type="button"
                                  className={`btn btn-xs ${u.blocked ? 'btn-soft' : 'btn-outline'}`}
                                  onClick={() => adminToggleBlockUser(u.id)}
                                  style={u.blocked ? { borderColor: '#10b981', color: '#10b981' } : { borderColor: '#ef4444', color: '#ef4444' }}
                                >
                                  {u.blocked ? (lang === 'ru' ? '🔓 Разблок.' : '🔓 Ochildi') : (lang === 'ru' ? '🚫 Блок' : '🚫 Bloklash')}
                                </button>
                              )}

                              {/* O'CHIRISH */}
                              {!isMainAdmin && (
                                <button
                                  type="button"
                                  className="btn btn-xs btn-ghost"
                                  title={lang === 'ru' ? "Удалить пользователя" : "Foydalanuvchini o'chirish"}
                                  onClick={() => {
                                    if (window.confirm(lang === 'ru' ? `Вы действительно хотите удалить аккаунт ${u.name}?` : `${u.name} hisobini butunlay o'chirib tashlamoqchimisiz?`)) {
                                      adminDeleteUser(u.id);
                                    }
                                  }}
                                  style={{ color: '#ef4444', padding: '4px 6px' }}
                                >
                                  🗑️
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </div>
          </div>
        )}



        {/* MODAL 1: FOYDALANUVCHI TAKLIF QILISH */}
        {showInviteModal && (
          <div className="modal-backdrop" onClick={() => setShowInviteModal(false)}>
            <div className="modal-card" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '520px' }}>
              <div className="modal-head" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ margin: 0 }}>
                  {lang === 'ru' ? '➕ Пригласить пользователя' : '➕ Foydalanuvchi Taklif Qilish'}
                </h3>
                <button type="button" className="icon-btn" onClick={() => setShowInviteModal(false)}>✕</button>
              </div>

              {!inviteResult ? (
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    const res = adminInviteUser(inviteForm);
                    if (res) {
                      setInviteResult(res);
                    }
                  }}
                  style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginTop: '16px' }}
                >
                  <div className="form-group">
                    <label className="field-label">
                      {lang === 'ru' ? 'Имя и фамилия *' : 'Ism-familiya *'}
                    </label>
                    <input
                      type="text"
                      className="input"
                      placeholder={lang === 'ru' ? 'Например: Сардор Комилов' : 'Masalan: Sardor Komilov'}
                      value={inviteForm.name}
                      onChange={(e) => setInviteForm({ ...inviteForm, name: e.target.value })}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="field-label">
                      {lang === 'ru' ? 'Номер телефона *' : 'Telefon raqam *'}
                    </label>
                    <input
                      type="tel"
                      className="input"
                      placeholder="+998 90 123 45 67"
                      value={inviteForm.phone}
                      onChange={(e) => setInviteForm({ ...inviteForm, phone: e.target.value })}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="field-label">
                      {lang === 'ru' ? 'Роль на платформе' : 'Platformadagi roli'}
                    </label>
                    <select
                      className="input"
                      value={inviteForm.role}
                      onChange={(e) => setInviteForm({ ...inviteForm, role: e.target.value })}
                    >
                      <option value="student">{lang === 'ru' ? 'Студент (Student)' : 'Talaba (Student)'}</option>
                      <option value="teacher">{lang === 'ru' ? 'Преподаватель (Mentor / Teacher)' : "O'qituvchi (Mentor / Teacher)"}</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="field-label">
                      {lang === 'ru' ? 'Бесплатный курс (необязательно)' : 'Bepul ochib beriladigan kurs (ixtiyoriy)'}
                    </label>
                    <select
                      className="input"
                      value={inviteForm.courseId}
                      onChange={(e) => setInviteForm({ ...inviteForm, courseId: e.target.value })}
                    >
                      <option value="">{lang === 'ru' ? '-- Не прикреплять курс --' : '-- Kurs biriktirmaslik --'}</option>
                      {db.courses.map((crs) => (
                        <option key={crs.id} value={crs.id}>
                          {loc(crs, 'title')} ({formatPrice(crs.price)})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="field-label">
                      {lang === 'ru' ? 'Специальное сообщение (необязательно)' : 'Maxsus xabar (ixtiyoriy)'}
                    </label>
                    <textarea
                      className="input"
                      rows={2}
                      placeholder={
                        lang === 'ru'
                          ? 'Добро пожаловать в CodeCraft! Вам открыт доступ к курсу...'
                          : "Xush kelibsiz! Sizga CodeCraft kursiga kirish imkoniyati berildi..."
                      }
                      value={inviteForm.message}
                      onChange={(e) => setInviteForm({ ...inviteForm, message: e.target.value })}
                    />
                  </div>

                  <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '10px' }}>
                    <button type="button" className="btn btn-outline" onClick={() => setShowInviteModal(false)}>
                      {lang === 'ru' ? 'Отмена' : 'Bekor qilish'}
                    </button>
                    <button type="submit" className="btn btn-primary">
                      {lang === 'ru' ? 'Пригласить и получить ссылку ✨' : 'Taklif qilish va Havola olish ✨'}
                    </button>
                  </div>
                </form>
              ) : (
                <div style={{ marginTop: '20px', textAlign: 'center' }}>
                  <div style={{ fontSize: '3rem', marginBottom: '8px' }}>🎉</div>
                  <h4>{lang === 'ru' ? 'Пользователь успешно приглашён!' : 'Foydalanuvchi muvaffaqiyatli taklif qilindi!'}</h4>
                  <p className="text-muted" style={{ fontSize: '0.9rem' }}>
                    {lang === 'ru'
                      ? 'Пользователь добавлен в систему. Отправьте ему эту ссылку для входа:'
                      : "Foydalanuvchi tizimga qo'shildi. Ushbu taklif havolasini unga yuboring:"}
                  </p>

                  <div style={{ background: 'var(--bg-alt)', padding: '12px', borderRadius: '8px', wordBreak: 'break-all', margin: '14px 0', border: '1px dashed var(--primary)' }}>
                    <code>{inviteResult.inviteLink}</code>
                  </div>

                  <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
                    <button
                      type="button"
                      className="btn btn-primary"
                      onClick={() => {
                        navigator.clipboard.writeText(inviteResult.inviteLink);
                        showToast(lang === 'ru' ? 'Ссылка приглашения скопирована!' : 'Taklif havolasi nusxalandi!', 'success');
                      }}
                    >
                      {lang === 'ru' ? '📋 Скопировать ссылку' : '📋 Havolani nusxalash'}
                    </button>
                    <button
                      type="button"
                      className="btn btn-outline"
                      onClick={() => {
                        setInviteResult(null);
                        setShowInviteModal(false);
                      }}
                    >
                      {lang === 'ru' ? 'Закрыть' : 'Yopish'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* MODAL 2: BARCHAGA E'LON YUBORISH */}
        {showBroadcastModal && (
          <div className="modal-backdrop" onClick={() => setShowBroadcastModal(false)}>
            <div className="modal-card" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '480px' }}>
              <div className="modal-head" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ margin: 0 }}>
                  {lang === 'ru' ? "📢 Отправить объявление всем" : "📢 Barchaga E'lon Yuborish"}
                </h3>
                <button type="button" className="icon-btn" onClick={() => setShowBroadcastModal(false)}>✕</button>
              </div>

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  adminBroadcastMessage(broadcastText);
                  setBroadcastText('');
                  setShowBroadcastModal(false);
                }}
                style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginTop: '16px' }}
              >
                <p className="text-muted" style={{ fontSize: '0.9rem', margin: 0 }}>
                  {lang === 'ru'
                    ? "Это объявление будет отправлено в личный чат и уведомления всех пользователей платформы."
                    : "Ushbu e'lon barcha ro'yxatdan o'tgan foydalanuvchilarning shaxsiy chatiga va bildirishnomalar paneliga yuboriladi."}
                </p>

                <div className="form-group">
                  <label className="field-label">
                    {lang === 'ru' ? "Текст объявления *" : "E'lon matni *"}
                  </label>
                  <textarea
                    className="input"
                    rows={4}
                    placeholder={
                      lang === 'ru'
                        ? "Уважаемые студенты, сегодня в 20:00 состоится прямой эфир..."
                        : "Hurmatli talabalar, bugun soat 20:00 da jonli efir bo'lib o'tadi..."
                    }
                    value={broadcastText}
                    onChange={(e) => setBroadcastText(e.target.value)}
                    required
                  />
                </div>

                <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                  <button type="button" className="btn btn-outline" onClick={() => setShowBroadcastModal(false)}>
                    {lang === 'ru' ? "Отмена" : "Bekor qilish"}
                  </button>
                  <button type="submit" className="btn btn-primary">
                    {lang === 'ru' ? "Отправить всем 📢" : "Barchaga yuborish 📢"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* MODAL 3: KURS BIRIKTIRISH (QUICK ENROLL) */}
        {enrollModalUser && (
          <div className="modal-backdrop" onClick={() => setEnrollModalUser(null)}>
            <div className="modal-card" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '460px' }}>
              <div className="modal-head" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ margin: 0 }}>
                  {lang === 'ru' ? "🎓 Прикрепить курс" : "🎓 Kurs Biriktirish"}
                </h3>
                <button type="button" className="icon-btn" onClick={() => setEnrollModalUser(null)}>✕</button>
              </div>

              <div style={{ marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <p style={{ margin: 0 }}>
                  {lang === 'ru' ? (
                    <>Какой курс вы хотите открыть для <strong>{enrollModalUser.name}</strong> ({enrollModalUser.phone}) бесплатно?</>
                  ) : (
                    <><strong>{enrollModalUser.name}</strong> ({enrollModalUser.phone}) ga qaysi kursni bepul ochib bermoqchisiz?</>
                  )}
                </p>

                <div className="form-group">
                  <label className="field-label">
                    {lang === 'ru' ? "Выберите курс:" : "Kursni tanlang:"}
                  </label>
                  <select
                    className="input"
                    value={enrollCourseId}
                    onChange={(e) => setEnrollCourseId(e.target.value)}
                  >
                    {db.courses.map((crs) => (
                      <option key={crs.id} value={crs.id}>
                        {loc(crs, 'title')} ({formatPrice(crs.price)})
                      </option>
                    ))}
                  </select>
                </div>

                <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '10px' }}>
                  <button type="button" className="btn btn-outline" onClick={() => setEnrollModalUser(null)}>
                    {lang === 'ru' ? "Отмена" : "Bekor qilish"}
                  </button>
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={() => {
                      adminEnrollUser(enrollModalUser.id, enrollCourseId);
                      setEnrollModalUser(null);
                    }}
                  >
                    {lang === 'ru' ? "Открыть курс 🚀" : "Kursni ochish 🚀"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 3. COURSES MANAGEMENT */}
        {activeTab === 'courses' && (
          <div className="tab-panel">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px', flexWrap: 'wrap', gap: '12px' }}>
              <div>
                <h3 style={{ margin: '0 0 4px 0', fontSize: '1.2rem' }}>
                  {lang === 'ru' ? 'Управление курсами' : 'Kurslarni boshqarish'}
                </h3>
                <small className="text-muted">
                  {lang === 'ru'
                    ? `Всего курсов в базе данных: ${db.courses.length}`
                    : `Ma'lumotlar bazasida jami kurslar: ${db.courses.length} ta`}
                </small>
              </div>
              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                <button
                  type="button"
                  className="btn btn-sm btn-primary"
                  onClick={() => navigate('teacher')}
                >
                  ➕ {lang === 'ru' ? 'Создать новый курс' : 'Yangi kurs yaratish'}
                </button>
                {db.courses.length === 0 && (
                  <button
                    type="button"
                    className="btn btn-sm btn-outline"
                    onClick={adminResetDefaultCourses}
                  >
                    🔄 {lang === 'ru' ? 'Восстановить стандартные курсы' : 'Standart kurslarni qaytarish'}
                  </button>
                )}
              </div>
            </div>

            {db.courses.length === 0 ? (
              <div className="empty-box" style={{ padding: '48px 20px', textAlign: 'center' }}>
                <div style={{ fontSize: '3rem', marginBottom: '12px' }}>📚</div>
                <h4>{lang === 'ru' ? 'Курсы отсутствуют' : 'Bazada hech qanday kurs mavjud emas'}</h4>
                <p className="text-muted" style={{ marginBottom: '18px' }}>
                  {lang === 'ru'
                    ? 'Все курсы были удалены. Вы можете создать новый курс или восстановить стандартные.'
                    : "Barcha kurslar o'chirilgan. Yangi kurs yaratishingiz yoki standart kurslarni qayta tiklashingiz mumkin."}
                </p>
                <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
                  <button type="button" className="btn btn-primary" onClick={() => navigate('teacher')}>
                    ➕ {lang === 'ru' ? 'Создать курс' : 'Yangi kurs yaratish'}
                  </button>
                  <button type="button" className="btn btn-outline" onClick={adminResetDefaultCourses}>
                    🔄 {lang === 'ru' ? 'Восстановить стандартные' : 'Standart kurslarni tiklash'}
                  </button>
                </div>
              </div>
            ) : (
              <div className="table-card">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>{lang === 'ru' ? "Курс" : "Kurs"}</th>
                      <th>{lang === 'ru' ? "Направление" : "Yo'nalish"}</th>
                      <th>{lang === 'ru' ? "Преподаватель" : "Ustoz"}</th>
                      <th>{lang === 'ru' ? "Цена" : "Narx"}</th>
                      <th>{lang === 'ru' ? "Статус" : "Holati"}</th>
                      <th style={{ textAlign: 'right' }}>{lang === 'ru' ? "Действия" : "Amallar"}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {db.courses.map((c) => {
                      const teacher = db.users.find((u) => u.id === c.teacherId);
                      const cat = db.categories.find((cat) => cat.id === c.categoryId);
                      return (
                        <tr key={c.id}>
                          <td>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                              {c.thumbnail && (
                                <img
                                  src={c.thumbnail}
                                  alt=""
                                  style={{ width: '40px', height: '40px', borderRadius: '8px', objectFit: 'cover' }}
                                />
                              )}
                              <div>
                                <strong>{loc(c, 'title')}</strong>
                                <small style={{ display: 'block', color: 'var(--text-muted)' }}>ID: {c.id}</small>
                              </div>
                            </div>
                          </td>
                          <td>
                            <span className="course-cat-badge" style={{ fontSize: '0.78rem' }}>
                              {loc(cat, 'name') || c.categoryId}
                            </span>
                          </td>
                          <td>{teacher?.name || 'CodeCraft Ustoz'}</td>
                          <td>{formatPrice(c.discountPrice || c.price)}</td>
                          <td>
                            <span className={`status-pill ${c.status === 'published' ? 'paid' : 'pending'}`}>
                              {c.status === 'published'
                                ? (lang === 'ru' ? 'ОПУБЛИКОВАН' : "E'LON QILINGAN")
                                : (lang === 'ru' ? 'ЧЕРНОВИК' : "QORALAMA")}
                            </span>
                          </td>
                          <td className="actions-cell" style={{ textAlign: 'right' }}>
                            <button
                              type="button"
                              className="btn btn-xs btn-outline"
                              onClick={() => adminToggleCourseStatus(c.id)}
                            >
                              {c.status === 'published'
                                ? (lang === 'ru' ? 'В черновик' : 'Qoralama')
                                : (lang === 'ru' ? 'Опубликовать' : "E'lon qilish")}
                            </button>
                            <button
                              type="button"
                              className="btn btn-xs"
                              style={{
                                color: '#ef4444',
                                borderColor: 'rgba(239, 68, 68, 0.4)',
                                background: 'rgba(239, 68, 68, 0.1)',
                                fontWeight: '600'
                              }}
                              onClick={() => {
                                const courseName = loc(c, 'title');
                                const confirmText = lang === 'ru'
                                  ? `Вы действительно хотите навсегда удалить курс "${courseName}"?`
                                  : `Haqiqatan ham "${courseName}" kursini butunlay o'chirmoqchimisiz?`;
                                if (window.confirm(confirmText)) {
                                  adminDeleteCourse(c.id);
                                }
                              }}
                              title={lang === 'ru' ? 'Удалить этот курс' : "Ushbu kursni butunlay o'chirish"}
                            >
                              🗑️ {lang === 'ru' ? "Удалить" : "O'chirish"}
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}


        {/* 5. PAYMENTS & CSV EXPORT */}
        {activeTab === 'payments' && (
          <div className="tab-panel">
            {/* ADMIN KARTA SOZLAMALARI (Click va Payme qabul qiluvchi karta) */}
            <div
              className="chart-card"
              style={{
                padding: '16px 20px',
                borderRadius: '14px',
                marginBottom: '20px',
                border: '1px solid rgba(99, 102, 241, 0.35)',
                background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.09), rgba(168, 85, 247, 0.09))'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px', marginBottom: '12px' }}>
                <div>
                  <h4 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '8px' }}>
                    💳 {lang === 'ru' ? 'Номер карты для приёма оплаты студентов:' : "Talabalardan to'lovlarni qabul qilish bank kartasi:"}
                  </h4>
                  <small className="text-muted">
                    {lang === 'ru'
                      ? 'Этот номер карты отображается студентам. Только администратор может изменять его. Доступ к курсам открывается только после подтверждения поступления средств на карту.'
                      : "Ushbu karta talabalarga to'lov uchun ko'rsatiladi. Uni faqat admin o'zgartira oladi. Talaba chek yuborgach, kartaga pul tushganini tekshirib tasdiqlaysiz."}
                  </small>
                </div>
                {!editingAdminCard ? (
                  <button
                    className="btn btn-outline btn-sm"
                    onClick={() => {
                      setNewCardInput(adminCardNumber || '');
                      setNewHolderInput(adminCardHolder || '');
                      setEditingAdminCard(true);
                    }}
                  >
                    ✏️ {lang === 'ru' ? 'Изменить карту' : "Kartani o'zgartirish"}
                  </button>
                ) : null}
              </div>

              {!editingAdminCard ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '20px', flexWrap: 'wrap' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                      {lang === 'ru' ? 'Номер карты:' : 'Karta raqami:'}
                    </span>
                    <code style={{ fontSize: '1.15rem', fontWeight: 800, letterSpacing: '1.5px', background: 'var(--surface)', padding: '6px 14px', borderRadius: '8px', border: '1px solid var(--border)', fontFamily: 'monospace' }}>
                      {adminCardNumber}
                    </code>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                      {lang === 'ru' ? 'Владелец:' : 'Egasi:'}
                    </span>
                    <strong style={{ fontSize: '1rem' }}>{adminCardHolder}</strong>
                  </div>
                </div>
              ) : (
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap', marginTop: '8px' }}>
                  <input
                    type="text"
                    className="input"
                    style={{ maxWidth: '240px', fontWeight: 700, letterSpacing: '1px', fontFamily: 'monospace' }}
                    placeholder="8600 0000 0000 0000"
                    value={newCardInput}
                    onChange={(e) => setNewCardInput(e.target.value)}
                  />
                  <input
                    type="text"
                    className="input"
                    style={{ maxWidth: '220px', fontWeight: 600 }}
                    placeholder="ALIBEK ABDUNABIYEV"
                    value={newHolderInput}
                    onChange={(e) => setNewHolderInput(e.target.value)}
                  />
                  <button
                    className="btn btn-success btn-sm"
                    onClick={() => {
                      if (!newCardInput.trim()) {
                        showToast(lang === 'ru' ? 'Введите номер карты!' : "Karta raqamini kiriting!", 'error');
                        return;
                      }
                      updateAdminCard(newCardInput.trim(), newHolderInput.trim());
                      setEditingAdminCard(false);
                      showToast(lang === 'ru' ? 'Номер карты успешно обновлён!' : "Karta raqami muvaffaqiyatli yangilandi!", 'success');
                    }}
                  >
                    💾 {lang === 'ru' ? 'Сохранить' : 'Saqlash'}
                  </button>
                  <button
                    className="btn btn-ghost btn-sm"
                    onClick={() => setEditingAdminCard(false)}
                  >
                    ✕ {lang === 'ru' ? 'Отмена' : 'Bekor qilish'}
                  </button>
                </div>
              )}
            </div>
            {/* Top KPI Cards for Payments */}
            <div className="overview-stats-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px', marginBottom: '20px' }}>
              <div className="chart-card" style={{ padding: '16px 20px', borderRadius: '12px' }}>
                <div style={{ color: '#94a3b8', fontSize: '0.85rem', marginBottom: '4px' }}>
                  {lang === 'ru' ? "💰 Подтверждённый доход" : "💰 Tasdiqlangan tushum"}
                </div>
                <div style={{ fontSize: '1.4rem', fontWeight: 'bold', color: '#10b981' }}>
                  {totalRevenue === 0 ? (lang === 'ru' ? "0 сум" : "0 so'm") : formatPrice(totalRevenue)}
                </div>
                <small className="text-muted">
                  {paidPayments.length} {lang === 'ru' ? "успешных платежей" : "ta muvaffaqiyatli to'lov"}
                </small>
              </div>
              <div className="chart-card" style={{ padding: '16px 20px', borderRadius: '12px' }}>
                <div style={{ color: '#94a3b8', fontSize: '0.85rem', marginBottom: '4px' }}>
                  {lang === 'ru' ? "⏳ Ожидающие платежи" : "⏳ Kutilayotgan to'lovlar"}
                </div>
                <div style={{ fontSize: '1.4rem', fontWeight: 'bold', color: '#f59e0b' }}>
                  {(db.payments || []).filter((p) => p.status === 'pending').length} {lang === 'ru' ? "шт" : "ta"}
                </div>
                <small className="text-muted">
                  {lang === 'ru' ? "Ожидается подтверждение админа" : "Admin tasdig'i kutilmoqda"}
                </small>
              </div>
              <div className="chart-card" style={{ padding: '16px 20px', borderRadius: '12px' }}>
                <div style={{ color: '#94a3b8', fontSize: '0.85rem', marginBottom: '4px' }}>
                  {lang === 'ru' ? "❌ Отменённые" : "❌ Bekor qilingan"}
                </div>
                <div style={{ fontSize: '1.4rem', fontWeight: 'bold', color: '#ef4444' }}>
                  {(db.payments || []).filter((p) => p.status === 'cancelled').length} {lang === 'ru' ? "шт" : "ta"}
                </div>
                <small className="text-muted">
                  {lang === 'ru' ? "Отменённые транзакции" : "Bekor qilingan tranzaksiyalar"}
                </small>
              </div>
            </div>

            <div className="panel-head-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', marginBottom: '16px' }}>
              <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
                <select
                  className="input"
                  style={{ minWidth: 200 }}
                  value={payFilter}
                  onChange={(e) => setPayFilter(e.target.value)}
                >
                  <option value="all">
                    {lang === 'ru' ? `Все платежи (${(db.payments || []).length})` : `Barcha to'lovlar (${(db.payments || []).length})`}
                  </option>
                  <option value="paid">{lang === 'ru' ? "✅ Только оплаченные (Paid)" : "✅ Faqat to'langanlar (Paid)"}</option>
                  <option value="pending">{lang === 'ru' ? "⏳ Только ожидающие (Pending)" : "⏳ Faqat kutilayotganlar (Pending)"}</option>
                  <option value="cancelled">{lang === 'ru' ? "❌ Только отменённые (Cancelled)" : "❌ Faqat bekor qilinganlar (Cancelled)"}</option>
                  <option value="payme">{lang === 'ru' ? "💳 Только Payme" : "💳 Faqat Payme"}</option>
                  <option value="click">{lang === 'ru' ? "💳 Только Click" : "💳 Faqat Click"}</option>
                </select>
              </div>

              <button className="btn btn-primary" onClick={exportPaymentsCsv} disabled={(db.payments || []).length === 0}>
                📥 {t.adminPanel.exportCsv}
              </button>
            </div>

            {(db.payments || []).length === 0 ? (
              <div className="table-card" style={{ textAlign: 'center', padding: '50px 20px', borderRadius: '14px' }}>
                <div style={{ fontSize: '3rem', marginBottom: '12px' }}>💳</div>
                <h3 style={{ marginBottom: '6px' }}>
                  {lang === 'ru' ? "Пока не совершено ни одного реального платежа" : "Hozircha hech qanday haqiqiy to'lov amalga oshirilmagan"}
                </h3>
                <p className="text-muted" style={{ maxWidth: '480px', margin: '0 auto', fontSize: '0.92rem' }}>
                  {lang === 'ru'
                    ? "Когда пользователи оплатят курсы на платформе, все их реальные платежи отобразятся здесь с возможностью подтверждения или редактирования."
                    : "Foydalanuvchilar platformada kurs xarid qilish uchun to'lov qilganlarida ularning barcha real to'lovlari bu yerda aks etadi va ularni tasdiqlash yoki tahrirlash mumkin bo'ladi."}
                </p>
              </div>
            ) : (
              <div className="table-card">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>{lang === 'ru' ? "Транзакция" : "Tranzaksiya"}</th>
                      <th>{lang === 'ru' ? "Дата" : "Sana"}</th>
                      <th>{lang === 'ru' ? "Студент" : "Talaba"}</th>
                      <th>{lang === 'ru' ? "Курс" : "Kurs"}</th>
                      <th>{lang === 'ru' ? "Способ оплаты" : "To'lov usuli"}</th>
                      <th>{lang === 'ru' ? "Чек (Фото)" : "To'lov cheki"}</th>
                      <th>{lang === 'ru' ? "Сумма" : "Summa"}</th>
                      <th>{lang === 'ru' ? "Статус" : "Holati"}</th>
                      <th style={{ textAlign: 'right' }}>{lang === 'ru' ? "Действия (Управление)" : "Amallar (Boshqaruv)"}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(db.payments || [])
                      .filter((p) => {
                        if (payFilter === 'all') return true;
                        if (payFilter === 'paid') return p.status === 'paid';
                        if (payFilter === 'pending') return p.status === 'pending';
                        if (payFilter === 'cancelled') return p.status === 'cancelled';
                        return true;
                      })
                      .map((p) => {
                        const usr = (db.users || []).find((u) => u.id === p.userId);
                        const crs = p.courseId === 'all'
                          ? { titleUz: "Barcha umumiy kurslar to'plami (Full Bundle)", titleRu: "Полный доступ ко всем курсам (Full Bundle)" }
                          : (db.courses || []).find((c) => c.id === p.courseId);
                        const isPaid = p.status === 'paid';
                        const isPending = p.status === 'pending';

                        return (
                          <tr key={p.id}>
                            <td>
                              <code style={{ fontSize: '0.85rem' }}>{p.transactionId}</code>
                            </td>
                            <td>
                              <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                                {p.createdAt ? new Date(p.createdAt).toLocaleDateString() : '-'}
                              </span>
                            </td>
                            <td>
                              <div>
                                <strong>{usr?.name || (lang === 'ru' ? "Неизвестный пользователь" : "Noma'lum foydalanuvchi")}</strong>
                                {usr?.phone && (
                                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{usr.phone}</div>
                                )}
                              </div>
                            </td>
                            <td>{crs ? loc(crs, 'title') : p.courseId}</td>
                            <td>
                              <span className="role-badge" style={{ textTransform: 'uppercase' }}>
                                {p.provider === 'card' ? '💳 Bank kartasi' : (p.provider || 'KARTA')}
                              </span>
                              {p.accountMask && (
                                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                                  <code>{p.accountMask}</code>
                                </div>
                              )}
                            </td>
                            <td>
                              {p.receiptImage ? (
                                <button
                                  type="button"
                                  className="btn btn-outline btn-sm"
                                  style={{ padding: '3px 8px', fontSize: '0.78rem', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                                  onClick={() => setViewingReceiptImage(p.receiptImage)}
                                >
                                  <img
                                    src={p.receiptImage}
                                    alt="Chek"
                                    style={{ width: '22px', height: '22px', borderRadius: '4px', objectFit: 'cover' }}
                                  />
                                  <span>👁 {lang === 'ru' ? 'Смотреть' : 'Ko\'rish'}</span>
                                </button>
                              ) : (
                                <span className="text-muted" style={{ fontSize: '0.8rem' }}>—</span>
                              )}
                            </td>
                            <td>
                              <strong style={{ color: isPaid ? '#10b981' : 'inherit' }}>
                                {formatPrice(p.amount)}
                              </strong>
                            </td>
                            <td>
                              <span
                                className={`status-pill ${p.status}`}
                                style={{
                                  fontSize: '0.75rem',
                                  padding: '3px 8px',
                                  borderRadius: '6px',
                                  fontWeight: '600',
                                  backgroundColor: isPaid ? 'rgba(16, 185, 129, 0.15)' : isPending ? 'rgba(245, 158, 11, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                                  color: isPaid ? '#10b981' : isPending ? '#f59e0b' : '#ef4444'
                                }}
                              >
                                {isPaid
                                  ? (lang === 'ru' ? "✅ ОПЛАЧЕН" : "✅ TO'LANGAN")
                                  : isPending
                                  ? (lang === 'ru' ? "⏳ ОЖИДАЕТ" : "⏳ KUTILMOQDA")
                                  : (lang === 'ru' ? "❌ ОТМЕНЁН" : "❌ BEKOR QILINGAN")}
                              </span>
                            </td>
                            <td style={{ textAlign: 'right' }}>
                              <div style={{ display: 'inline-flex', gap: '6px', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                                {/* TASDIQLASH (PUL TUSHDI) */}
                                {!isPaid && (
                                  <button
                                    type="button"
                                    className="btn btn-xs btn-success"
                                    title={lang === 'ru' ? "Подтвердить поступление денег на карту и открыть курс" : "Kartaga pul tushganini tasdiqlash va talabaga kursni ochish"}
                                    onClick={() => adminConfirmPayment(p.id)}
                                    style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', background: '#10b981', color: '#fff', border: 'none' }}
                                  >
                                    <span>✓</span>
                                    <span>{lang === 'ru' ? "Подтвердить (деньги поступили)" : "Tasdiqlash (Pul tushdi)"}</span>
                                  </button>
                                )}

                                {/* RAD ETISH (PUL TUSHMAY QOLGAN BO'LSA) */}
                                {isPending && (
                                  <button
                                    type="button"
                                    className="btn btn-xs btn-outline"
                                    title={lang === 'ru' ? "Отклонить платёж (деньги не поступили на карту)" : "To'lovni rad etish (kartaga pul tushmadi)"}
                                    onClick={() => adminCancelPayment(p.id)}
                                    style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', color: '#ef4444', borderColor: 'rgba(239, 68, 68, 0.4)' }}
                                  >
                                    <span>✕</span>
                                    <span>{lang === 'ru' ? "Отклонить (денег нет)" : "Rad etish (Pul tushmadi)"}</span>
                                  </button>
                                )}

                                {/* BEKOR QILISH (AGAR TO'LANGAN BO'LSA) */}
                                {isPaid && (
                                  <button
                                    type="button"
                                    className="btn btn-xs btn-outline"
                                    title={lang === 'ru' ? "Аннулировать оплату" : "To'lovni bekor qilish"}
                                    onClick={() => adminCancelPayment(p.id)}
                                    style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                                  >
                                    <span>✕</span>
                                    <span>{lang === 'ru' ? "Аннулировать" : "Bekor qilish"}</span>
                                  </button>
                                )}

                                {/* TAHRIRLASH */}
                                <button
                                  type="button"
                                  className="btn btn-xs btn-soft"
                                  title={lang === 'ru' ? "Редактировать сумму или статус платежа" : "To'lov summasi yoki holatini tahrirlash"}
                                  onClick={() => {
                                    setEditingPayment(p);
                                    setEditPayForm({
                                      amount: p.amount,
                                      status: p.status,
                                      provider: p.provider || 'payme'
                                    });
                                  }}
                                  style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                                >
                                  <span>✏️</span>
                                  <span>{lang === 'ru' ? "Изменить" : "Tahrirlash"}</span>
                                </button>

                                {/* O'CHIRISH */}
                                <button
                                  type="button"
                                  className="btn btn-xs btn-ghost"
                                  title={lang === 'ru' ? "Удалить запись о платеже" : "To'lov yozuvini butunlay o'chirish"}
                                  onClick={() => {
                                    if (window.confirm(lang === 'ru' ? `Вы действительно хотите удалить платёж (${p.transactionId})?` : `Haqiqatan ham ushbu to'lovni (${p.transactionId}) o'chirmoqchimisiz?`)) {
                                      adminDeletePayment(p.id);
                                    }
                                  }}
                                  style={{ color: '#ef4444', padding: '4px 6px' }}
                                >
                                  🗑️
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* MODAL: TO'LOV CHEKI RASMINI KO'RISH */}
        {viewingReceiptImage && (
          <div className="modal-backdrop" onClick={() => setViewingReceiptImage(null)}>
            <div className="modal-card" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '520px' }}>
              <div className="modal-head" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span>📸</span>
                  <span>{lang === 'ru' ? 'Чек об оплате' : "To'lov cheki"}</span>
                </h3>
                <button type="button" className="icon-btn" onClick={() => setViewingReceiptImage(null)}>✕</button>
              </div>
              <div style={{ padding: '16px', textAlign: 'center' }}>
                <img
                  src={viewingReceiptImage}
                  alt="Chek rasmi"
                  style={{
                    maxWidth: '100%',
                    maxHeight: '65vh',
                    borderRadius: '12px',
                    objectFit: 'contain',
                    border: '1px solid var(--border)',
                    boxShadow: '0 6px 20px rgba(0,0,0,0.2)'
                  }}
                />
                <div style={{ marginTop: '16px', display: 'flex', justifyContent: 'center' }}>
                  <button type="button" className="btn btn-outline" onClick={() => setViewingReceiptImage(null)}>
                    {lang === 'ru' ? 'Закрыть' : 'Yopish'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
        {editingPayment && (
          <div className="modal-backdrop" onClick={() => setEditingPayment(null)}>
            <div className="modal-card" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '480px' }}>
              <div className="modal-head" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ margin: 0 }}>
                  {lang === 'ru' ? "✏️ Редактирование платежа" : "✏️ To'lovni Tahrirlash"}
                </h3>
                <button type="button" className="icon-btn" onClick={() => setEditingPayment(null)}>✕</button>
              </div>

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  adminUpdatePayment(editingPayment.id, editPayForm);
                  setEditingPayment(null);
                }}
                style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginTop: '16px' }}
              >
                <div>
                  <label className="field-label" style={{ marginBottom: '4px' }}>
                    {lang === 'ru' ? "ID Транзакции" : "Tranzaksiya ID"}
                  </label>
                  <code style={{ display: 'block', padding: '8px 12px', background: 'var(--bg-alt)', borderRadius: '6px' }}>
                    {editingPayment.transactionId}
                  </code>
                </div>

                <div className="form-group">
                  <label className="field-label">
                    {lang === 'ru' ? "Сумма (в сумах) *" : "Summa (so'm) *"}
                  </label>
                  <input
                    type="number"
                    className="input"
                    value={editPayForm.amount}
                    onChange={(e) => setEditPayForm({ ...editPayForm, amount: e.target.value })}
                    required
                    min="0"
                  />
                </div>

                <div className="form-group">
                  <label className="field-label">
                    {lang === 'ru' ? "Статус платежа *" : "To'lov holati *"}
                  </label>
                  <select
                    className="input"
                    value={editPayForm.status}
                    onChange={(e) => setEditPayForm({ ...editPayForm, status: e.target.value })}
                  >
                    <option value="paid">{lang === 'ru' ? "✅ Оплачен (Подтверждён / Курс открывается)" : "✅ To'langan (Tasdiqlangan / Kurs ochiladi)"}</option>
                    <option value="pending">{lang === 'ru' ? "⏳ В ожидании (Pending)" : "⏳ Kutilmoqda (Pending)"}</option>
                    <option value="cancelled">{lang === 'ru' ? "❌ Отменён (Cancelled)" : "❌ Bekor qilingan (Cancelled)"}</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="field-label">
                    {lang === 'ru' ? "Платёжная система *" : "To'lov tizimi *"}
                  </label>
                  <select
                    className="input"
                    value={editPayForm.provider}
                    onChange={(e) => setEditPayForm({ ...editPayForm, provider: e.target.value })}
                  >
                    <option value="payme">Payme</option>
                    <option value="click">Click</option>
                    <option value="bank">{lang === 'ru' ? "Банковский перевод" : "Bank o'tkazmasi"}</option>
                    <option value="cash">{lang === 'ru' ? "Оплата наличными" : "Naqd to'lov"}</option>
                  </select>
                </div>

                <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '10px' }}>
                  <button type="button" className="btn btn-outline" onClick={() => setEditingPayment(null)}>
                    {lang === 'ru' ? "Отмена" : "Bekor qilish"}
                  </button>
                  <button type="submit" className="btn btn-primary">
                    {lang === 'ru' ? "💾 Сохранить" : "💾 Saqlash"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}


      </div>
    </div>
  );
}
