import { loadDotEnv, startTelegramBotPolling } from './apiMiddleware.js';

loadDotEnv();

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;

console.log('====================================================');
console.log('🤖 CodeCraft Telegram Bot Runner (Render / Standalone)');
console.log('====================================================');

if (!BOT_TOKEN) {
  console.error('❌ XATOLIK: TELEGRAM_BOT_TOKEN muhit o\'zgaruvchisi topilmadi!');
  console.error('👉 Iltimos, .env faylida yoki Render Dashboard "Environment" bo\'limida TELEGRAM_BOT_TOKEN ni kiriting.');
  process.exit(1);
}

// Bot polling xizmatini ishga tushirish
startTelegramBotPolling();

console.log(`✅ Telegram bot muvaffaqiyatli ishga tushdi!`);
console.log(`🔑 Bot Token: ${BOT_TOKEN.slice(0, 10)}...${BOT_TOKEN.slice(-5)}`);
console.log(`🕒 Vaqt: ${new Date().toISOString()}`);
console.log(`⚡ Node.js: ${process.version} | PID: ${process.pid}`);
console.log('====================================================\n');

// Har 10 daqiqada faollik haqida log chiqarish (Render loglarida tekshirish uchun)
setInterval(() => {
  console.log(`💓 [HEARTBEAT] CodeCraft Telegram Bot faol ishlamoqda (${new Date().toLocaleTimeString()})`);
}, 10 * 60_000);

// Jarayonni to'xtatish signallari
function handleShutdown(signal) {
  console.log(`\n🛑 Qabul qilingan signal: ${signal}. Bot to'xtatilmoqda...`);
  process.exit(0);
}

process.on('SIGINT', () => handleShutdown('SIGINT'));
process.on('SIGTERM', () => handleShutdown('SIGTERM'));
