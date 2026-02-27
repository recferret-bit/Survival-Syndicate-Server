import { z } from 'zod';

/**
 * Zod validation schemas for Users service
 */

export const UpdateBannedUsersCacheRequestSchema = z.object({});

export const UpdateBannedUsersCacheResponseSchema = z.object({
  success: z.boolean(),
  bannedUsersCount: z.number().int().nonnegative(),
});

export type UpdateBannedUsersCacheRequest = z.infer<
  typeof UpdateBannedUsersCacheRequestSchema
>;
export type UpdateBannedUsersCacheResponse = z.infer<
  typeof UpdateBannedUsersCacheResponseSchema
>;

export const SyncActiveUsersCacheRequestSchema = z.object({});

export const SyncActiveUsersCacheResponseSchema = z.object({
  success: z.boolean(),
  totalUsers: z.number().int().nonnegative(),
  cacheSize: z.number().int().nonnegative(),
  updated: z.boolean(),
});

export type SyncActiveUsersCacheRequest = z.infer<
  typeof SyncActiveUsersCacheRequestSchema
>;
export type SyncActiveUsersCacheResponse = z.infer<
  typeof SyncActiveUsersCacheResponseSchema
>;

export const GetUserByIdRequestSchema = z.object({
  userId: z
    .string()
    .regex(/^\d+$/, 'User ID must be a positive integer string'),
});

export const GetUserByIdResponseSchema = z.object({
  userId: z
    .string()
    .regex(/^\d+$/, 'User ID must be a positive integer string'),
  userEmail: z.string().email().optional(),
  phone: z.string().optional(),
  isTest: z.boolean(),
  banned: z.boolean(),
  country: z.string().optional(),
  currencyIsoCode: z.string(),
});

export type GetUserByIdRequest = z.infer<typeof GetUserByIdRequestSchema>;
export type GetUserByIdResponse = z.infer<typeof GetUserByIdResponseSchema>;

export const ValidateAdminApiKeyRequestSchema = z.object({
  apiKey: z.string().min(1, 'API key must not be empty'),
});

export const ValidateAdminApiKeyResponseSchema = z.object({
  valid: z.boolean(),
  adminId: z.string().optional(),
  email: z.string().email().optional(),
  reason: z.enum(['not_found', 'inactive']).optional(),
});

export type ValidateAdminApiKeyRequest = z.infer<
  typeof ValidateAdminApiKeyRequestSchema
>;
export type ValidateAdminApiKeyResponse = z.infer<
  typeof ValidateAdminApiKeyResponseSchema
>;

export const UserRegisteredEventSchema = z.object({
  userId: z
    .string()
    .regex(/^\d+$/, 'User ID must be a positive integer string'),
  currencyIsoCode: z.string().min(1, 'Currency ISO code is required'),
});

export type UserRegisteredEvent = z.infer<typeof UserRegisteredEventSchema>;

/**
 * Subject definitions for NATS
 */
export const PlayerSubjects = {
  UPDATE_BANNED_USERS_CACHE: 'users.update-banned-users-cache.v1',
  SYNC_ACTIVE_USERS_CACHE: 'users.sync-active-users-cache.v1',
  GET_USER_BY_ID: 'users.get-user-by-id.v1',
  VALIDATE_ADMIN_API_KEY: 'users.validate-admin-api-key.v1',
  USER_REGISTERED: 'users.user-registered.v1',
} as const;

export type PlayerSubject =
  (typeof PlayerSubjects)[keyof typeof PlayerSubjects];
