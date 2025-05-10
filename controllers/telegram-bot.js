// telegram-bot.js
import TelegramBot from 'node-telegram-bot-api';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
dotenv.config();

const token = process.env.TG_BOT_TOKEN;
if (!token) throw new Error('Missing TG_BOT_TOKEN in .env');

const bot = new TelegramBot(token, { polling: true });
const DB_FILE = path.resolve('./chatIds.json');

// Helper to load/save subscribers
function loadChatIds() {
  if (!fs.existsSync(DB_FILE)) return [];
  return JSON.parse(fs.readFileSync(DB_FILE));
}
function saveChatIds(ids) {
  fs.writeFileSync(DB_FILE, JSON.stringify(ids, null, 2));
}

// على /start أضف المستخدم للقائمة
bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;
  let ids = loadChatIds();
  if (!ids.includes(chatId)) {
    ids.push(chatId);
    saveChatIds(ids);
  }
  bot.sendMessage(chatId, '✅ تم تفعيل الإشعارات! ستصلك طلبات المتجر تلقائيًا.');
});

// دالة ترسل الإشعار لكل المشتركين
export function notifyNewOrder(order) {
  const ids = loadChatIds();
  const text = `
🌟 إشعار طلبات \nعندك طلبية جديدة بالمتجر!

━━━━━━━━━━━━━━━━━━
📦 *رقم الطلب:* #${order.id}

👤 *العميل:* ${order.name}
📱 *رقم الهاتف:* ${order.mobile}

📝 *ملاحظات:* 
${order.note || '— لا توجد ملاحظات —'}

🖼 *صور مرفقة:* ${order.images.length} صورة

━━━━━━━━━━━━━━━━━━
📬 *سارع بالتواصل مع العميل الآن!*
`.trim();



  ids.forEach(chatId => {
    bot.sendMessage(chatId, text).catch(err => {
      // لو المستخدم حظر البوت أو خطأ، نشيل الـ chatId
      if (err.response && err.response.statusCode === 403) {
        const filtered = ids.filter(id => id !== chatId);
        saveChatIds(filtered);
      }
    });
  });
}
