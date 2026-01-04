import { z } from 'zod';
import { tracks } from './schema';

export const api = {
  botStats: {
    get: {
      method: 'GET' as const,
      path: '/api/bot/stats',
      responses: {
        200: z.object({ 
          userCount: z.number() 
        }),
      },
    },
  },
  songs: {
    search: {
      method: 'GET' as const,
      path: '/api/songs/search',
      input: z.object({
        query: z.string(),
      }),
      responses: {
        200: z.array(z.custom<typeof tracks.$inferSelect>()),
      },
    },
  },
};

export function buildUrl(path: string, params?: Record<string, string | number>): string {
  let url = path;
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (url.includes(`:${key}`)) {
        url = url.replace(`:${key}`, String(value));
      }
    });
  }
  return url;
}
