import { pgTable, text, serial, timestamp, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const botUsers = pgTable("bot_users", {
  id: serial("id").primaryKey(),
  telegramId: text("telegram_id").notNull().unique(),
  username: text("username"),
  referrerId: text("referrer_id"),
  isAdmin: integer("is_admin").default(0),
  createdAt: timestamp("created_at").defaultNow(),
});

export const tracks = pgTable("tracks", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  artist: text("artist"),
  url: text("url"),
  filePath: text("file_path"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertBotUserSchema = createInsertSchema(botUsers).omit({ 
  id: true, 
  createdAt: true 
});

export const insertTrackSchema = createInsertSchema(tracks).omit({
  id: true,
  createdAt: true
});

export type BotUser = typeof botUsers.$inferSelect;
export type InsertBotUser = z.infer<typeof insertBotUserSchema>;
export type Track = typeof tracks.$inferSelect;
export type InsertTrack = z.infer<typeof insertTrackSchema>;
