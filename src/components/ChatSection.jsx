import React, { useState, useEffect, useRef } from 'react';

export function ChatSection({
  db,
  currentUser,
  sendChatMessage,
  markChatRead,
  lang = 'uz'
}) {
  const [chatInput, setChatInput] = useState('');
  const [chatSearch, setChatSearch] = useState('');
  const messagesEndRef = useRef(null);

  const isAdmin =
    currentUser?.role === 'admin' ||
    currentUser?.role === 'teacher' ||
    (currentUser?.phone || '').replace(/\D/g, '') === '998951639101';

  // Find primary admin user for student's chat
  const adminUser =
    db.users?.find((u) => (u.phone || '').replace(/\D/g, '') === '998951639101') ||
    db.users?.find((u) => u.role === 'admin') ||
    { id: 'usr-admin-1', name: 'Alibek Abdunabiyev (Bosh Admin)', phone: '+998 95 163 91 01' };

  // For Admin: gather all students who have messaged or are registered
  const allStudents = (db.users || []).filter(
    (u) => u.id !== currentUser.id && u.role !== 'admin'
  );

  const chatUserIds = new Set();
  (db.messages || []).forEach((m) => {
    if (m.senderId && m.senderId !== currentUser.id && m.senderRole !== 'admin') {
      chatUserIds.add(m.senderId);
    }
    if (m.recipientId && m.recipientId !== currentUser.id && m.recipientId !== 'usr-admin-1') {
      chatUserIds.add(m.recipientId);
    }
  });

  const conversationUserIds = Array.from(
    new Set([...Array.from(chatUserIds), ...allStudents.map((s) => s.id)])
  );

  const conversations = conversationUserIds
    .map((id) => {
      const user = db.users?.find((u) => u.id === id) || {
        id,
        name: "O'quvchi",
        phone: '',
        role: 'student'
      };
      const thread = (db.messages || [])
        .filter(
          (m) =>
            (m.senderId === id && (m.recipientId === currentUser.id || m.recipientId === 'usr-admin-1' || m.recipientName === 'admin')) ||
            (m.recipientId === id && (m.senderId === currentUser.id || m.senderRole === 'admin' || m.senderId === 'usr-admin-1'))
        )
        .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));

      const unreadCount = (db.messages || []).filter(
        (m) => m.senderId === id && (m.recipientId === currentUser.id || m.recipientId === 'usr-admin-1') && !m.read
      ).length;

      const lastMsg = thread[thread.length - 1] || null;
      return { id, user, thread, lastMsg, unreadCount };
    })
    .sort((a, b) => {
      if (a.unreadCount > 0 && b.unreadCount === 0) return -1;
      if (b.unreadCount > 0 && a.unreadCount === 0) return 1;
      const aTime = a.lastMsg ? new Date(a.lastMsg.createdAt).getTime() : 0;
      const bTime = b.lastMsg ? new Date(b.lastMsg.createdAt).getTime() : 0;
      return bTime - aTime;
    });

  // Default active user for Admin
  const [selectedUserId, setSelectedUserId] = useState(() => {
    if (isAdmin) {
      return conversations[0]?.id || allStudents[0]?.id || null;
    }
    return adminUser.id;
  });

  // Keep selectedUserId valid if list changes
  useEffect(() => {
    if (isAdmin) {
      if (!selectedUserId && conversations.length > 0) {
        setSelectedUserId(conversations[0].id);
      }
    } else {
      setSelectedUserId(adminUser.id);
    }
  }, [isAdmin, conversations.length, selectedUserId, adminUser.id]);

  const currentPartnerId = isAdmin
    ? (selectedUserId || conversations[0]?.id || allStudents[0]?.id || '')
    : adminUser.id;

  // Mark active chat as read
  useEffect(() => {
    if (currentPartnerId) {
      markChatRead(currentPartnerId);
    }
  }, [currentPartnerId, db.messages]);

  // Auto scroll to bottom of chat
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [currentPartnerId, db.messages?.length]);

  const activePartner = isAdmin
    ? (db.users?.find((u) => u.id === currentPartnerId) || conversations.find((c) => c.id === currentPartnerId)?.user || {
        id: currentPartnerId,
        name: "O'quvchi",
        phone: ''
      })
    : adminUser;

  const currentThread = (db.messages || [])
    .filter((m) => {
      if (!currentPartnerId) return false;
      if (isAdmin) {
        return (
          (m.senderId === currentUser.id && m.recipientId === currentPartnerId) ||
          (m.senderId === currentPartnerId && (m.recipientId === currentUser.id || m.recipientId === 'usr-admin-1' || m.recipientName === 'admin')) ||
          (m.recipientId === currentPartnerId && (m.senderRole === 'admin' || m.senderId === 'usr-admin-1'))
        );
      } else {
        return (
          (m.senderId === currentUser.id && (m.recipientId === adminUser.id || m.recipientId === 'usr-admin-1' || m.recipientName === 'admin')) ||
          (m.recipientId === currentUser.id && (m.senderId === adminUser.id || m.senderId === 'usr-admin-1' || m.senderRole === 'admin'))
        );
      }
    })
    .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));

  function handleSend() {
    const text = chatInput.trim();
    if (!text || !currentPartnerId) return;
    sendChatMessage({ recipientId: currentPartnerId, text });
    setChatInput('');
  }

  const filteredConversations = conversations.filter((c) => {
    if (!chatSearch.trim()) return true;
    const q = chatSearch.toLowerCase();
    return (
      (c.user.name || '').toLowerCase().includes(q) ||
      (c.user.phone || '').toLowerCase().includes(q) ||
      (c.lastMsg?.text || '').toLowerCase().includes(q)
    );
  });

  const adminQuickChips = [
    "Assalomu alaykum!",
    "Vazifangiz tekshirildi va baholandi ✅",
    "To'lovingiz tasdiqlandi, kursingiz ochildi! 🎉",
    "Qaysi dars yoki mavzu bo'yicha savolingiz bor?",
    "Platformaga xush kelibsiz! Har qanday savolingizga yordam beramiz."
  ];

  const studentQuickChips = [
    "Assalomu alaykum ustoz!",
    "Mening uy vazifam tekshirildimi?",
    "Sertifikat olish uchun nechchi ball kerak?",
    "Keyingi dars qachon ochiladi?",
    "Kurs bo'yicha savolim bor edi"
  ];

  return (
    <div
      className="chat-container-card"
      style={{
        backgroundColor: 'var(--surface)',
        borderRadius: '16px',
        border: '1px solid var(--border)',
        overflow: 'hidden',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)'
      }}
    >
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: isAdmin ? '320px 1fr' : '1fr',
          minHeight: '560px'
        }}
      >
        {/* LEFT PANEL: CONVERSATIONS LIST (ADMIN ONLY) */}
        {isAdmin && (
          <div
            style={{
              borderRight: '1px solid var(--border)',
              backgroundColor: 'var(--bg-alt)',
              display: 'flex',
              flexDirection: 'column'
            }}
          >
            {/* INBOX SEARCH HEADER */}
            <div style={{ padding: '16px', borderBottom: '1px solid var(--border)' }}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: '10px'
                }}
              >
                <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span>💬</span> {lang === 'ru' ? 'Диалоги' : "O'quvchilar bilan chatlar"}
                </h4>
                <span className="role-badge" style={{ fontSize: '0.72rem' }}>
                  {conversations.length} {lang === 'ru' ? 'чат' : 'ta suhbat'}
                </span>
              </div>
              <input
                type="text"
                className="input"
                placeholder={lang === 'ru' ? 'Поиск по имени или тел...' : "Ism yoki tel bo'yicha qidirish..."}
                value={chatSearch}
                onChange={(e) => setChatSearch(e.target.value)}
                style={{ fontSize: '0.86rem', padding: '8px 12px' }}
              />
            </div>

            {/* CONVERSATION ITEMS */}
            <div style={{ flex: 1, overflowY: 'auto', maxHeight: '490px' }}>
              {filteredConversations.length === 0 ? (
                <div style={{ padding: '30px 16px', textAlign: 'center', color: 'var(--text-muted)' }}>
                  <p style={{ margin: 0, fontSize: '0.88rem' }}>
                    {lang === 'ru' ? 'Диалогов пока нет' : "Hozircha xabarlar yo'q"}
                  </p>
                </div>
              ) : (
                filteredConversations.map((c) => {
                  const isSelected = c.id === selectedUserId;
                  const initial = (c.user.name || "O").charAt(0).toUpperCase();
                  return (
                    <div
                      key={c.id}
                      onClick={() => {
                        setSelectedUserId(c.id);
                        markChatRead(c.id);
                      }}
                      style={{
                        padding: '12px 16px',
                        borderBottom: '1px solid var(--border)',
                        cursor: 'pointer',
                        backgroundColor: isSelected ? 'rgba(56, 189, 248, 0.12)' : 'transparent',
                        borderLeft: isSelected ? '4px solid var(--primary)' : '4px solid transparent',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div
                          style={{
                            width: '40px',
                            height: '40px',
                            borderRadius: '50%',
                            backgroundColor: isSelected ? 'var(--primary)' : 'var(--border)',
                            color: isSelected ? '#fff' : 'var(--text)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontWeight: 700,
                            fontSize: '0.95rem',
                            flexShrink: 0
                          }}
                        >
                          {initial}
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                            <strong
                              style={{
                                fontSize: '0.92rem',
                                whiteSpace: 'nowrap',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis'
                              }}
                            >
                              {c.user.name}
                            </strong>
                            {c.lastMsg && (
                              <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', flexShrink: 0, marginLeft: '6px' }}>
                                {new Date(c.lastMsg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </span>
                            )}
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '3px' }}>
                            <p
                              style={{
                                margin: 0,
                                fontSize: '0.8rem',
                                color: c.unreadCount > 0 ? 'var(--text)' : 'var(--text-muted)',
                                fontWeight: c.unreadCount > 0 ? 600 : 400,
                                whiteSpace: 'nowrap',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                maxWidth: '170px'
                              }}
                            >
                              {c.lastMsg ? c.lastMsg.text : (lang === 'ru' ? 'Нет сообщений' : 'Xabar yo\'q')}
                            </p>
                            {c.unreadCount > 0 && (
                              <span
                                style={{
                                  backgroundColor: '#ff5722',
                                  color: '#fff',
                                  borderRadius: '99px',
                                  padding: '2px 7px',
                                  fontSize: '0.72rem',
                                  fontWeight: 800,
                                  flexShrink: 0
                                }}
                              >
                                {c.unreadCount}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}

        {/* RIGHT PANEL: ACTIVE CHAT THREAD */}
        <div style={{ display: 'flex', flexDirection: 'column', backgroundColor: 'var(--surface)' }}>
          {/* CHAT HEADER */}
          <div
            style={{
              padding: '16px 20px',
              borderBottom: '1px solid var(--border)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              backgroundColor: 'var(--bg-alt)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ position: 'relative' }}>
                <div
                  style={{
                    width: '46px',
                    height: '46px',
                    borderRadius: '50%',
                    backgroundColor: 'var(--primary)',
                    color: '#fff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 800,
                    fontSize: '1.1rem'
                  }}
                >
                  {(activePartner.name || 'U').charAt(0).toUpperCase()}
                </div>
                <span style={{ position: 'absolute', bottom: -2, right: -2, fontSize: '13px' }}>
                  {isAdmin ? '🎓' : '🛡️'}
                </span>
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.05rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span>{activePartner.name}</span>
                  <span
                    className="role-badge"
                    style={{
                      background: isAdmin
                        ? 'linear-gradient(135deg, #3b82f6, #06b6d4)'
                        : 'linear-gradient(135deg, #ff5722, #f59e0b)',
                      color: '#fff',
                      fontSize: '0.72rem'
                    }}
                  >
                    {isAdmin ? "O'QUVCHI" : 'BOSH ADMIN'}
                  </span>
                </h3>
                <small className="text-muted">
                  {activePartner.phone ? `Tel: ${activePartner.phone} • ` : ''}
                  {lang === 'ru' ? 'Онлайн поддержка' : 'Doimiy onlayn aloqada'}
                </small>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span className="status-pill paid" style={{ fontSize: '0.78rem' }}>
                🟢 {lang === 'ru' ? 'В сети' : 'Aloqada'}
              </span>
            </div>
          </div>

          {/* CHAT MESSAGES BODY */}
          <div
            style={{
              flex: 1,
              height: '380px',
              overflowY: 'auto',
              padding: '20px',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
              backgroundColor: 'var(--surface)'
            }}
          >
            {currentThread.length === 0 ? (
              <div style={{ margin: 'auto', textAlign: 'center', color: 'var(--text-muted)' }}>
                <span style={{ fontSize: '2.5rem' }}>💬</span>
                <p style={{ marginTop: '8px', maxWidth: '380px', lineHeight: 1.5 }}>
                  {isAdmin
                    ? (lang === 'ru'
                        ? 'Напишите первое сообщение студенту. Вы можете ответить на вопросы по курсу или домашним заданиям.'
                        : "O'quvchiga birinchi xabarni yozing. Kurslar yoki uy vazifalari bo'yicha yo'l-yo'riq berishingiz mumkin.")
                    : (lang === 'ru'
                        ? 'Напишите администратору. Вопросы по курсам, оплате или домашним заданиям будут решены оперативно.'
                        : "Administratorga xabar yuboring. Kurslar, darslar yoki to'lovlar bo'yicha savollaringizga tezda javob beriladi.")}
                </p>
              </div>
            ) : (
              currentThread.map((msg) => {
                const isFromMe =
                  msg.senderId === currentUser.id ||
                  (isAdmin && (msg.senderRole === 'admin' || msg.senderId === 'usr-admin-1'));
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
                    <small
                      style={{
                        fontSize: '0.72rem',
                        color: 'var(--text-muted)',
                        marginTop: '4px',
                        padding: '0 4px'
                      }}
                    >
                      {new Date(msg.createdAt).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                      {isFromMe && ' • ✓✓'}
                    </small>
                  </div>
                );
              })
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* QUICK CHIPS */}
          <div
            style={{
              padding: '8px 16px',
              borderTop: '1px solid var(--border)',
              display: 'flex',
              gap: '8px',
              overflowX: 'auto',
              backgroundColor: 'var(--bg-alt)'
            }}
          >
            {(isAdmin ? adminQuickChips : studentQuickChips).map((chip, idx) => (
              <button
                key={idx}
                type="button"
                className="btn btn-xs btn-ghost"
                onClick={() => {
                  if (currentPartnerId) {
                    sendChatMessage({ recipientId: currentPartnerId, text: chip });
                  }
                }}
                style={{
                  whiteSpace: 'nowrap',
                  fontSize: '0.78rem',
                  border: '1px solid var(--border)',
                  borderRadius: '99px',
                  backgroundColor: 'var(--surface)'
                }}
              >
                {chip}
              </button>
            ))}
          </div>

          {/* INPUT BAR */}
          <div
            style={{
              padding: '12px 16px',
              borderTop: '1px solid var(--border)',
              display: 'flex',
              gap: '10px',
              backgroundColor: 'var(--surface)'
            }}
          >
            <input
              type="text"
              className="input"
              placeholder={
                isAdmin
                  ? (lang === 'ru'
                      ? `Ответить студенту ${activePartner.name}...`
                      : `${activePartner.name}ga javob yozing...`)
                  : (lang === 'ru'
                      ? 'Напишите сообщение администратору...'
                      : 'Bosh administratorga xabaringizni yozing...')
              }
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleSend();
                }
              }}
            />
            <button
              type="button"
              className="btn btn-primary"
              onClick={handleSend}
              style={{ minWidth: '100px' }}
            >
              {lang === 'ru' ? 'Отправить' : 'Yuborish'} ✈️
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
