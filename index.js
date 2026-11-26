const TelegramBot = require('node-telegram-bot-api');

const token = process.env.TELEGRAM_BOT_TOKEN;
const AI_KEY = process.env.SHANGHAI_API_KEY;
const BASE_URL = process.env.AI_BASE_URL || 'https://internlm.intern-ai.org.cn/v1';
const MODEL = process.env.AI_MODEL || 'internlm2.5-latest';

const history = {};

async function callAI(chatId) {
    const res = await fetch(`${BASE_URL}/chat/completions`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${AI_KEY}`
        },
        body: JSON.stringify({
            model: MODEL,
            messages: history[chatId],
            temperature: 0.7
        })
    });
    const data = await res.json();
    if (!res.ok || !data.choices || !data.choices[0]) {
        throw new Error(data.error ? (data.error.message || JSON.stringify(data.error)) : `HTTP ${res.status}`);
    }
    return data.choices[0].message.content.trim();
}

module.exports = async (req, res) => {
    if (req.method !== 'POST') {
        return res.status(200).send('OK');
    }

    const update = req.body;
    const msg = update.message;
    if (!msg || !msg.text) {
        return res.status(200).send('OK');
    }

    const chatId = msg.chat.id;
    const text = msg.text.trim();

    try {
        if (text === '/start') {
            await global.bot.sendMessage(chatId, '🤖 欢迎使用 AI Bot!\n直接发消息和我聊天，/clear 清除记忆。');
            return res.status(200).send('OK');
        }

        if (text === '/clear') {
            history[chatId] = [];
            await global.bot.sendMessage(chatId, '🧹 记忆已清除!');
            return res.status(200).save('OK');
        }

        if (text.startsWith('/')) {
            return res.status(200).send('OK');
        }

        await global.bot.sendMessage(chatId, '⏳ 思考中...');

        if (!history[chatId]) { history[chatId] = []; }
        history[chatId].push({ role: 'user', content: text });
        if (history[chatId].length > 10) { history[chatId] = history[chatId].slice(-10); }

        const reply = await callAI(chatId);
        history[chatId].push({ role: 'assistant', content: reply });

        await global.bot.sendMessage(chatId, reply);
    } catch (err) {
        console.error('错误:', err.message);
        await global.bot.sendMessage(chatId, `❌ 调用失败: ${err.message}`).catch(() => {});
    }

    return res.status(200).send('OK');
};

global.bot = new TelegramBot(token);
console.log('✅ AI Bot Webhook 启动成功');