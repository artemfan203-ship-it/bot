import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  
  app.get(api.botStats.get.path, async (req, res) => {
    const count = await storage.getBotUserCount();
    res.json({ userCount: count });
  });

  app.get(api.songs.search.path, async (req, res) => {
    const query = req.query.query as string;
    if (!query) return res.status(400).json([]);
    
    try {
      const { Shazam } = await import('node-shazam');
      const shazam = new Shazam();
      const results = await shazam.search_music('en-US', 'US', query, '5', '0');
      
      let data = results;
      if (typeof results === 'string') {
        data = JSON.parse(results);
      }

      const hits = data?.tracks?.hits || [];
      const songs = hits.map((hit: any) => {
        const track = hit.track || hit;
        return {
          id: track.key || Math.random().toString(),
          title: track.title || hit.heading?.title,
          artist: track.subtitle || hit.heading?.subtitle,
          image: track.images?.default || track.images?.coverart,
          url: track.url || hit.url,
        };
      });

      res.json(songs);
    } catch (error) {
      console.error("Search API error:", error);
      res.status(500).json([]);
    }
  });

  app.get('/radio', (req, res) => {
    const station = req.query.station;
    res.send(`
      <!DOCTYPE html>
      <html lang="uk">
      <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Радіо Плеєр</title>
          <script src="https://telegram.org/js/telegram-web-app.js"></script>
          <style>
              body {
                  background: #0f172a;
                  color: white;
                  font-family: 'Inter', sans-serif;
                  display: flex;
                  flex-direction: column;
                  align-items: center;
                  justify-content: center;
                  height: 100vh;
                  margin: 0;
                  text-align: center;
              }
              .card {
                  background: #1e293b;
                  padding: 2rem;
                  border-radius: 1rem;
                  box-shadow: 0 10px 25px rgba(0,0,0,0.5);
                  width: 90%;
                  max-width: 400px;
              }
              h1 { margin-bottom: 1.5rem; font-size: 1.5rem; }
              audio { width: 100%; margin: 1.5rem 0; }
              button {
                  background: #ef4444;
                  color: white;
                  border: none;
                  padding: 0.75rem 1.5rem;
                  border-radius: 0.5rem;
                  font-weight: 600;
                  cursor: pointer;
                  transition: transform 0.2s;
              }
              button:active { transform: scale(0.95); }
          </style>
      </head>
      <body>
          <div class="card">
              <h1>📻 ${station === 'chanson' ? 'Радіо Шансон' : 'Українське Радіо'}</h1>
              <audio controls autoplay src="${station === 'chanson' ? 'https://cast.radiogroup.com.ua/chanson' : 'http://ukr.radio:8000/ur1-mp3'}"></audio>
              <br>
              <button onclick="Telegram.WebApp.close()">Закрити</button>
          </div>
      </body>
      </html>
    `);
  });

  // Seed data
  if ((await storage.getBotUserCount()) === 0) {
    await storage.createBotUser({ telegramId: '123456789', username: 'demo_user', referrerId: null });
  }

  // Start the bot
  try {
    const { startBot } = await import('./bot');
    startBot();
  } catch (error) {
    console.error("Failed to start Telegram bot:", error);
  }

  return httpServer;
}
