const express = require('express');
const TelegramBot = require('node-telegram-bot-api');
const app = express();

// Your bot token from BotFather
const token = process.env.BOT_TOKEN;
// Your game short name from BotFather
const gameShortName = process.env.GAME_NAME || 'my2048game';
// Your Netlify URL
const gameUrl = process.env.GAME_URL;

// Render provides the PORT environment variable
const port = process.env.PORT || 3000;

// Parse JSON
app.use(express.json());

// Create bot instance (disable polling since we're using webhooks)
const bot = new TelegramBot(token);

// Set the webhook
// The webhook URL will be: https://your-app.onrender.com/webhook
app.post(`/webhook`, (req, res) => {
  bot.processUpdate(req.body);
  res.sendStatus(200);
});

// Health check endpoint (required for Render)
app.get('/health', (req, res) => {
  res.status(200).send('OK');
});

// Start command
bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;
  bot.sendMessage(chatId, 
    '🎮 *2048 Game*\n\n' +
    'Send /play to start playing!\n' +
    'Use arrow keys or swipe to move tiles.',
    { parse_mode: 'Markdown' }
  );
});

// Play command
bot.onText(/\/play/, (msg) => {
  bot.sendGame(msg.chat.id, gameShortName);
});

// Handle play button clicks
bot.on('callback_query', (query) => {
  bot.answerCallbackQuery(query.id, {
    url: gameUrl
  });
});

// Start express server
app.listen(port, () => {
  console.log(`Bot server running on port ${port}`);
  
  // Set webhook after server starts
  const webhookUrl = `${process.env.RENDER_EXTERNAL_URL || `https://localhost:${port}`}/webhook`;
  bot.setWebHook(webhookUrl);
  console.log(`Webhook set to: ${webhookUrl}`);
});