require('dotenv').config();
const TelegramBot = require('node-telegram-bot-api');

const token = process.env.TELEGRAM_BOT_TOKEN;
if (!token) { console.error('❌ TELEGRAM_BOT_TOKEN 未设置'); process.exit(1); }

const AI_KEY = process.env.SHANGHAI_API_KEY;
const BASE_URL = process.env.AI_BASE_URL || 'https://internlm.intern-ai.org.cn/v1';
const MODEL = process.env.AI_MODEL || 'internlm2.5-latest';

const bot = new TelegramBot(token, { polling: true });

// 每个用户的对话记忆
const history = {};

bot.onText(/\/start/, (msg) => {
    bot.sendMessage(msg.chat.id, '🤖 欢迎使用 AI Bot!\n直接发消息和我聊天，/clear 清除记忆。');
});

bot.onText(/\/clear/, (msg) => {
    history[msg.chat.id] = [];
    bot.sendMessage(msg.chat.id, '🧹 记忆已清除!');
});

bot.on('message', async (msg) => {
    const chatId = msg.chat.id;
    const text = (msg.text || '').trim();
    if (!text || text.startsWith('/')) return;

    if (!AI_KEY) {
        bot.sendMessage(chatId, '❌ 未配置 SHANGHAI_API_KEY，请在 Vercel 环境变量设置。');
        return;
    }

    // 初始化记忆
    if (!history[chatId]) history[chatId] = [];
    history[chatId].push({ role: 'user', content: text });
    // 只保留最近 10 条，防止超长
   ▌