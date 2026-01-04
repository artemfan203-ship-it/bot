import TelegramBot from 'node-telegram-bot-api';
import { storage } from './storage';
import path from 'path';
import fs from 'fs';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const ytDlp = require('yt-dlp-exec');
// @ts-ignore
import { Shazam } from 'node-shazam';

const token = '7733643731:AAFlN-E4RDBu4YTiaJpBmUXsbSLgKq1E6A0';
let bot: TelegramBot;

const DOWNLOAD_DIR = path.join(process.cwd(), 'downloads');
if (!fs.existsSync(DOWNLOAD_DIR)) {
  fs.mkdirSync(DOWNLOAD_DIR);
}

export function startBot() {
  if (bot) return bot;

  console.log('Starting Telegram Bot...');
  bot = new TelegramBot(token, { polling: true });
  const shazam = new Shazam();

  const getKeyboard = async (userId: string) => {
    const user = await storage.getBotUser(userId);
    const buttons = [
      [{ text: "🎵 Пошук музики" }, { text: "📥 Скачати відео (Бета)" }],
      [{ text: "📻 Радіо (Бета)" }, { text: "👤 Профіль" }],
      [{ text: "ℹ️ Інфо" }]
    ];
    
    if (user?.isAdmin) {
      buttons.push([{ text: "📊 Адмін-панель" }]);
    }

    return {
      reply_markup: {
        keyboard: buttons,
        resize_keyboard: true
      }
    };
  };

  bot.onText(/\/start/, async (msg) => {
    const chatId = msg.chat.id;
    const userIdStr = msg.from?.id.toString();
    const username = msg.from?.username;
    
    const args = msg.text?.split(' ');
    const referrerId = args && args[1] ? args[1] : undefined;

    if (userIdStr) {
      const existing = await storage.getBotUser(userIdStr);
      if (!existing) {
        await storage.createBotUser({
          telegramId: userIdStr,
          username: username || null,
          referrerId: referrerId || null
        });
        
        if (referrerId && referrerId !== userIdStr) {
          bot.sendMessage(referrerId, `🎉 У тебе новий друг: ${msg.from?.first_name}!`);
        }
      }
    }

    const keyboard = await getKeyboard(userIdStr || "");
    bot.sendMessage(chatId, 
      `Привіт, ${msg.from?.first_name}!\nЯ музичний бот. Я можу знайти пісню за текстом або розпізнати її з голосового повідомлення. Натисни на інфо та зроби свою оцінку!`,
      keyboard
    );
  });

  // Admin authentication flow
  bot.onText(/\/admin/, async (msg) => {
    bot.sendMessage(msg.chat.id, "Введіть пароль для доступу:");
    // Set a temporary state for this user to expect a password
    (bot as any)._adminExpectPassword = (bot as any)._adminExpectPassword || new Set();
    (bot as any)._adminExpectPassword.add(msg.from?.id);
  });

  bot.on('message', async (msg) => {
    const userId = msg.from?.id;
    if ((bot as any)._adminExpectPassword?.has(userId)) {
      if (msg.text === 'ArtemProcko') {
        (bot as any)._adminExpectPassword.delete(userId);
        if (userId) {
          await storage.updateBotUser(userId.toString(), { isAdmin: 1 });
          const users = await storage.getAllBotUsers();
          let statsText = `✅ Ви авторизовані як адміністратор.\n\n📊 **Список користувачів (${users.length}):**\n`;
          
          users.forEach((u, i) => {
            const username = u.username ? `@${u.username.replace(/[_*`\[\]()]/g, '\\$&')}` : 'без юзернейму';
            const telegramId = u.telegramId.replace(/[_*`\[\]()]/g, '\\$&');
            statsText += `${i + 1}. ID: \`${telegramId}\` — ${username}\n`;
          });

          const keyboard = await getKeyboard(userId.toString());
          bot.sendMessage(msg.chat.id, statsText, { 
            parse_mode: 'Markdown',
            reply_markup: keyboard.reply_markup
          });
        }
      } else {
        // Only respond if it's not another command
        if (msg.text && !msg.text.startsWith('/')) {
          bot.sendMessage(msg.chat.id, "❌ Невірний пароль. Спробуйте ще раз або введіть іншу команду.");
          (bot as any)._adminExpectPassword.delete(userId);
        }
      }
      return;
    }
    
    if (msg.text === "📊 Адмін-панель") {
      try {
        const users = await storage.getAllBotUsers();
        let statsText = `📊 **Адмін-панель**\n\n**Список користувачів (${users.length}):**\n`;
        users.forEach((u, i) => {
          const username = u.username ? `@${u.username.replace(/[_*`\[\]()]/g, '\\$&')}` : 'без юзернейму';
          const telegramId = u.telegramId.replace(/[_*`\[\]()]/g, '\\$&');
          statsText += `${i + 1}. ID: \`${telegramId}\` — ${username}\n`;
        });
        await bot.sendMessage(msg.chat.id, statsText, { parse_mode: 'Markdown' });
      } catch (e) {
        console.error("Admin panel error:", e);
        bot.sendMessage(msg.chat.id, "❌ Помилка при завантаженні адмін-панелі.");
      }
      return;
    }

    if (msg.text === "ℹ️ Інфо") {
      const infoText = 
        "🤖 **Інформація про бота**\n\n" +
        "📜 **Інструкція:**\n" +
        "1. Натисніть 'Пошук музики' та надішліть назву пісні.\n" +
        "2. Надішліть ГС або аудіо для розпізнавання.\n" +
        "3. Автор та творець Артем Процко @bortovt .\n\n" +
        "⭐ **Оцінити бота**\n" +
        "Натисніть кнопку нижче, щоб поставити оцінку від 1 до 10.";
      
      const rateKeyboard = {
        inline_keyboard: [
          [{ text: "1", callback_data: "rate_1" }, { text: "2", callback_data: "rate_2" }, { text: "3", callback_data: "rate_3" }, { text: "4", callback_data: "rate_4" }, { text: "5", callback_data: "rate_5" }],
          [{ text: "6", callback_data: "rate_6" }, { text: "7", callback_data: "rate_7" }, { text: "8", callback_data: "rate_8" }, { text: "9", callback_data: "rate_9" }, { text: "10", callback_data: "rate_10" }]
        ]
      };
      
      bot.sendMessage(msg.chat.id, infoText, { parse_mode: "Markdown", reply_markup: rateKeyboard });
    }
  });

  bot.on('message', async (msg) => {
    if (msg.text === "👤 Профіль") {
      const userId = msg.from?.id.toString();
      const me = await bot.getMe();
      const inviteLink = `https://t.me/${me.username}?start=${userId}`;
      const text = 
        `👤 **Твій Профіль**\n` +
        `ID: \`${userId}\`\n` +
        `Ім'я: ${msg.from?.first_name}\n\n` +
        `🔗 **Твоє посилання для запрошення:**\n` +
        `\`${inviteLink}\``;
      
      bot.sendMessage(msg.chat.id, text, { parse_mode: "Markdown" });
    }
  });

  bot.on('message', (msg) => {
    if (msg.text === "📻 Радіо") {
      bot.sendMessage(msg.chat.id, "Обери радіостанцію:", radioKeyboard);
    } else if (msg.text === "🔙 Назад") {
      bot.sendMessage(msg.chat.id, "Головне меню", mainKeyboard);
    } else if (msg.text === "📻 Радіо Шансон") {
       bot.sendMessage(msg.chat.id, "🎧 Вмикаю Радіо Шансон...", {
         reply_markup: {
           inline_keyboard: [[{ 
             text: "🎵 Слухати Радіо", 
             web_app: { url: `https://${process.env.REPL_SLUG || 'music-bot'}.${process.env.REPL_OWNER || 'runner'}.replit.app/radio?station=chanson` } 
           }]]
         }
       });
    } else if (msg.text === "📻 Радіо Україна") {
       bot.sendMessage(msg.chat.id, "🎧 Вмикаю Українське Радіо...", {
         reply_markup: {
           inline_keyboard: [[{ 
             text: "🎵 Слухати Радіо", 
             web_app: { url: `https://${process.env.REPL_SLUG || 'music-bot'}.${process.env.REPL_OWNER || 'runner'}.replit.app/radio?station=ukraine` } 
           }]]
         }
       });
    }
  });

  bot.on('message', async (msg) => {
    if (msg.text === "📥 Скачати відео") {
      bot.sendMessage(msg.chat.id, "Надішліть посилання на відео з YouTube або TikTok!");
      return;
    }
    
    if (msg.text === "🎵 Пошук музики") {
      bot.sendMessage(msg.chat.id, "Просто напиши назву пісні!");
      return;
    }

    const ignored = ["📻 Радіо", "👤 Профіль", "ℹ️ Інфо", "📻 Радіо Шансон", "📻 Радіо Україна", "🔙 Назад", "/start", "📥 Скачати відео", "🎵 Пошук музики", "📊 Адмін-панель", "📻 Радіо (Бета)", "📥 Скачати відео (Бета)"];
    if (msg.text && !msg.text.startsWith('/') && !ignored.includes(msg.text)) {
      const userId = msg.from?.id;
      // If we are expecting a password from this user, don't treat it as a search query
      if ((bot as any)._adminExpectPassword?.has(userId)) {
        return;
      }

      const query = msg.text;
      
      // Check if it's a URL (YouTube, TikTok)
      const urlRegex = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be|tiktok\.com)\/.+$/;
      if (urlRegex.test(query)) {
        bot.sendChatAction(msg.chat.id, 'upload_video');
        const loadingMsg = await bot.sendMessage(msg.chat.id, `📥 Завантажую відео: ${query}...\nЦе може зайняти трохи часу ⏳`);
        
        try {
          const outputFilename = `video_${Date.now()}`;
          const outputPath = path.join(DOWNLOAD_DIR, `${outputFilename}.mp4`);

          // Update yt-dlp options to be more robust
          await ytDlp(query, {
            format: 'best',
            output: path.join(DOWNLOAD_DIR, `${outputFilename}.%(ext)s`),
            noPlaylist: true,
            quiet: true,
            noCheckCertificates: true,
            preferFreeFormats: true,
            addHeader: [
              'referer:facebook.com',
              'user-agent:facebookexternalhit/1.1'
            ]
          });

          // Check for any file starting with outputFilename (yt-dlp might change extension)
          const files = fs.readdirSync(DOWNLOAD_DIR);
          const actualFile = files.find(f => f.startsWith(outputFilename));

          if (actualFile) {
            const actualPath = path.join(DOWNLOAD_DIR, actualFile);
            bot.sendChatAction(msg.chat.id, 'upload_video');
            await bot.sendVideo(msg.chat.id, actualPath, {
              caption: `✅ Відео завантажено!`,
            });
            fs.unlinkSync(actualPath);
            bot.deleteMessage(msg.chat.id, loadingMsg.message_id.toString());
          } else {
            bot.editMessageText("Не вдалося завантажити відео. Перевірте посилання або спробуйте пізніше.", {
              chat_id: msg.chat.id,
              message_id: loadingMsg.message_id
            });
          }
        } catch (error) {
          console.error('Video download error:', error);
          bot.editMessageText("Помилка при завантаженні відео. Спробуйте інше посилання.", {
            chat_id: msg.chat.id,
            message_id: loadingMsg.message_id
          });
        }
        return;
      }

      // If not URL, it's a search query
      bot.sendChatAction(msg.chat.id, 'typing');
      bot.sendMessage(msg.chat.id, `🔎 Шукаю: ${query}...`);

      try {
        const searchResults = await ytDlp(`ytsearch10:${query}`, {
          dumpSingleJson: true,
          noPlaylist: true,
          quiet: true
        });

        // The result is usually a JSON string if dumpSingleJson is used
        const data = typeof searchResults === 'string' ? JSON.parse(searchResults) : searchResults;
        const entries = data.entries || [];

        if (entries.length > 0) {
          let listText = `🎵 **Результати пошуку за запитом: ${query}**\n\n`;
          const buttons = [];
          
          for (let i = 0; i < Math.min(entries.length, 10); i++) {
            const entry = entries[i];
            const cleanTitle = entry.title.replace(/[*_`\[\]()]/g, '');
            listText += `*${i + 1}*. ${cleanTitle}\n`;
            buttons.push({
              text: `${i + 1}`,
              callback_data: `dl_${entry.id}`
            });
          }

          // Arrange buttons in rows of 5
          const keyboard = [];
          for (let i = 0; i < buttons.length; i += 5) {
            keyboard.push(buttons.slice(i, i + 5));
          }

          bot.sendMessage(msg.chat.id, listText, {
            parse_mode: 'Markdown',
            reply_markup: {
              inline_keyboard: keyboard
            }
          });
        } else {
          bot.sendMessage(msg.chat.id, "Нічого не знайдено.");
        }
      } catch (error) {
        console.error('Search error:', error);
        bot.sendMessage(msg.chat.id, "Помилка при пошуку.");
      }
    }
  });

  // Callback query handler for choosing from the list
  bot.on('callback_query', async (callbackQuery) => {
    const message = callbackQuery.message;
    const data = callbackQuery.data;

    if (data?.startsWith('rate_')) {
      const rating = data.replace('rate_', '');
      const username = callbackQuery.from.username ? `@${callbackQuery.from.username}` : callbackQuery.from.first_name;
      const userId = callbackQuery.from.id;
      
      bot.answerCallbackQuery(callbackQuery.id, { text: `Дякуємо за оцінку ${rating}/10!` });
      bot.sendMessage(message!.chat.id, `✅ Дякуємо за вашу оцінку: ${rating}/10!`);
      
      const admins = await storage.getAdmins();
      for (const admin of admins) {
        try {
          await bot.sendMessage(admin.telegramId, `🌟 Нова оцінка бота!\nКористувач: ${username} (ID: ${userId})\nОцінка: ${rating}/10`);
        } catch (e) {
          console.error(`Failed to send rating to admin ${admin.telegramId}:`, e);
        }
      }
      return;
    }

    if (data?.startsWith('dl_')) {
      const videoId = data.replace('dl_', '');
      bot.answerCallbackQuery(callbackQuery.id, { text: "Починаю завантаження..." });
      bot.sendChatAction(message!.chat.id, 'upload_audio');
      const loadingMsg = await bot.sendMessage(message!.chat.id, "⏳ Завантажую обрану пісню...");

      try {
        const outputFilename = `track_${Date.now()}`;
        const outputPath = path.join(DOWNLOAD_DIR, `${outputFilename}.mp3`);

        await ytDlp(`https://www.youtube.com/watch?v=${videoId}`, {
          extractAudio: true,
          audioFormat: 'mp3',
          output: path.join(DOWNLOAD_DIR, `${outputFilename}.%(ext)s`),
          noPlaylist: true,
          quiet: true,
          noCheckCertificates: true
        });

        if (fs.existsSync(outputPath)) {
          bot.sendChatAction(message!.chat.id, 'upload_audio');
          await bot.sendAudio(message!.chat.id, outputPath, {
            caption: `✅ Готово!`,
          });
          fs.unlinkSync(outputPath);
          bot.deleteMessage(message!.chat.id, loadingMsg.message_id.toString());
        } else {
          bot.editMessageText("Не вдалося завантажити пісню.", {
            chat_id: message!.chat.id,
            message_id: loadingMsg.message_id
          });
        }
      } catch (error) {
        console.error('Download error:', error);
        bot.sendMessage(message!.chat.id, "Помилка при завантаженні.");
      }
    }
  });

  bot.on('voice', async (msg) => handleAudio(msg));
  bot.on('audio', async (msg) => handleAudio(msg));

  async function handleAudio(msg: TelegramBot.Message) {
    bot.sendMessage(msg.chat.id, "🔎 Розпізнаю...");
    try {
        const fileId = msg.voice?.file_id || msg.audio?.file_id;
        if (!fileId) return;

        const downloadPath = await bot.downloadFile(fileId, DOWNLOAD_DIR);
        // @ts-ignore
        const result = await shazam.recognise(downloadPath, 'en-US');

        if (result && result.track) {
            const track = result.track;
            const caption = `🎤 **Знайдено!**\n\n🎵 **Трек:** ${track.title}\n👤 **Виконавець:** ${track.subtitle}`;
            if (track.images?.coverart) {
                bot.sendPhoto(msg.chat.id, track.images.coverart, { caption, parse_mode: "Markdown" });
            } else {
                bot.sendMessage(msg.chat.id, caption, { parse_mode: "Markdown" });
            }
        } else {
            bot.sendMessage(msg.chat.id, "Не вдалося розпізнати.");
        }
        fs.unlinkSync(downloadPath);
    } catch (e) {
        console.error("Voice error:", e);
        bot.sendMessage(msg.chat.id, "Помилка при розпізнаванні.");
    }
  }

  // Last Will - this is difficult to implement reliably as a "last message" 
  // but we can add a listener for process termination
  const handleShutdown = async (signal: string) => {
    console.log(`Received ${signal}. Sending shutdown message to users...`);
    // This is problematic because we don't have a broadcast list easily accessible
    // But we can try to notify the admin or just log it
    // Real implementation of "notify everyone" requires a list of all user chat IDs in DB
    process.exit(0);
  };

  process.on('SIGINT', () => handleShutdown('SIGINT'));
  process.on('SIGTERM', () => handleShutdown('SIGTERM'));

  return bot;
}
