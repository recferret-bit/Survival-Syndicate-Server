import { z } from 'zod';

export const ClientAuthenticateSchema = z.object({
  type: z.literal('authenticate'),
  token: z.string().min(1),
  matchId: z.string().min(1),
});

export type ClientAuthenticate = z.infer<typeof ClientAuthenticateSchema>;
