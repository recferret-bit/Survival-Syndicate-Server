import { z } from 'zod';

export const ClientAuthenticateSchema = z.object({
  type: z.literal('authenticate'),
  token: z.string().min(1),
  matchId: z.string().min(1),
});

export type ClientAuthenticate = z.infer<typeof ClientAuthenticateSchema>;

export const ClientReconnectSchema = z.object({
  type: z.literal('reconnect'),
  token: z.string().min(1),
  matchId: z.string().min(1),
});

export type ClientReconnect = z.infer<typeof ClientReconnectSchema>;

export const ClientInputSchema = z.object({
  type: z.literal('input'),
  clientTimestamp: z.number().optional(),
  sequenceNumber: z.number().optional(),
  movement: z.object({ x: z.number(), y: z.number() }).optional(),
  aimAngle: z.number().optional(),
  actions: z.array(z.string()).optional(),
});

export type ClientInput = z.infer<typeof ClientInputSchema>;
