import {
  GetUserByIdRequestSchema,
  PlayerSubjects,
  ValidateAdminApiKeyRequestSchema,
} from './users.schemas';

describe('lib-player users schemas', () => {
  it('validates GetUserByIdRequestSchema for numeric string userId', () => {
    expect(GetUserByIdRequestSchema.parse({ userId: '123' })).toEqual({
      userId: '123',
    });
    expect(() => GetUserByIdRequestSchema.parse({ userId: 'abc' })).toThrow();
  });

  it('validates ValidateAdminApiKeyRequestSchema requires non-empty key', () => {
    expect(
      ValidateAdminApiKeyRequestSchema.parse({ apiKey: 'secret-key' }),
    ).toEqual({
      apiKey: 'secret-key',
    });
    expect(() =>
      ValidateAdminApiKeyRequestSchema.parse({ apiKey: '' }),
    ).toThrow();
  });

  it('defines PlayerSubjects constants', () => {
    expect(PlayerSubjects.GET_USER_BY_ID).toBe('users.get-user-by-id.v1');
    expect(PlayerSubjects.USER_REGISTERED).toBe('users.user-registered.v1');
  });
});
