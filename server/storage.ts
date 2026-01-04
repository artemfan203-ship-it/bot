import { db } from "./db";
import { botUsers, tracks, type InsertBotUser, type BotUser, type InsertTrack, type Track } from "@shared/schema";
import { eq, count } from "drizzle-orm";

export interface IStorage {
  createBotUser(user: InsertBotUser): Promise<BotUser>;
  getBotUser(telegramId: string): Promise<BotUser | undefined>;
  getBotUserCount(): Promise<number>;
  getAllBotUsers(): Promise<BotUser[]>;
  updateBotUser(telegramId: string, updates: Partial<BotUser>): Promise<void>;
  getAdmins(): Promise<BotUser[]>;
  createTrack(track: InsertTrack): Promise<Track>;
  getTrack(id: number): Promise<Track | undefined>;
}

export class DatabaseStorage implements IStorage {
  async createBotUser(user: InsertBotUser): Promise<BotUser> {
    const [newUser] = await db.insert(botUsers).values(user).returning();
    return newUser;
  }

  async getBotUser(telegramId: string): Promise<BotUser | undefined> {
    const [user] = await db.select().from(botUsers).where(eq(botUsers.telegramId, telegramId));
    return user;
  }

  async getBotUserCount(): Promise<number> {
    const [result] = await db.select({ count: count() }).from(botUsers);
    return result.count;
  }

  async getAllBotUsers(): Promise<BotUser[]> {
    return await db.select().from(botUsers);
  }

  async updateBotUser(telegramId: string, updates: Partial<BotUser>): Promise<void> {
    await db.update(botUsers).set(updates).where(eq(botUsers.telegramId, telegramId));
  }

  async getAdmins(): Promise<BotUser[]> {
    return await db.select().from(botUsers).where(eq(botUsers.isAdmin, 1));
  }

  async createTrack(track: InsertTrack): Promise<Track> {
    const [newTrack] = await db.insert(tracks).values(track).returning();
    return newTrack;
  }

  async getTrack(id: number): Promise<Track | undefined> {
    const [track] = await db.select().from(tracks).where(eq(tracks.id, id));
    return track;
  }
}

export const storage = new DatabaseStorage();
