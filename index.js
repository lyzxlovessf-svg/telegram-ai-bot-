require('dotenv').config();
const TelegramBot = require('node-telegram-bot-api');

const token = process.env.TELEGRAM_BOT_TOKEN;

if (!token) {
    console.error('❌ TELEGRAM_BOT_TOKEN 环境变量未设置，请检查部署配置');
    process.exit(1);
}

const bot = new TelegramBot(token, { polling: true });
const aiApiKey = process.env.AI_API_KEY;

console.log('✅ Telegram AI Bot 正在启动...');

bot.onText(/\/start/, (msg) => {
    const chatId = msg.chat.id;
    bot.sendMessage(chatId, '🤖 **欢迎使用池小淼AI机器人!**\n\n' +
        '输入任何东西我都能和你对话。\n' +
        '使用 /help 查看可用命令。');
});

bot.onText(/\/help/, (msg) => {
    const chatId = msg.chat.id;
    bot.sendMessage(chatId, '🔧 **可用命令:**\n\n' +
        '/start - 启动机器人\n' +
        '/help - 显示帮助\n' +
        '/clear - 清除对话记忆\n\n' +
        '💡 发送任何消息与我对话！');
});

bot.onText(/\/clear/, (msg) => {
    const chatId = msg.chat.id;
    bot.sendMessage(chatId, '🧹 对话记忆已清除!');
});

bot.on('message', (msg) => {
    const chatId = msg.chat.id;
    const text = msg.text.trim();

    if (text && !text.startsWith('/')) {
        bot.sendMessage(chatId, '⏳ 正在思考你的问题...');
        setTimeout(() => {
            bot.sendMessage(chatId, 
                `📝 你说了: "${text}"\n\n` +
                `🤖 当前为基模模式，完整AI功能需配置API Key。`
            );
        }, 1000);
    }
});

bot.on('polling_error', (error) => {
    console.error('⚠️ Bot 轮询出错:', error.message);
});

console.log('✅ Bot 启动成功! 等待消息...');