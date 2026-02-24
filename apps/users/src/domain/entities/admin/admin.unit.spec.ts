import { Admin } from './admin';
import { AdminStatus, AdminProps } from './admin.type';
import { ValidationException } from '@lib/shared/application';
import BigNumber from 'bignumber.js';

describe('Admin Entity', () => {
  const createAdminProps = (overrides?: Partial<AdminProps>): AdminProps => ({
    id: new BigNumber(1),
    email: 'admin@example.com',
    apiKey: 'test-api-key-12345',
    status: AdminStatus.active,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  });

  describe('Creation', () => {
    it('should create admin with valid data', () => {
      const props = createAdminProps();
      const admin = new Admin(props);

      expect(admin.id).toEqual(new BigNumber(1));
      expect(admin.email).toBe('admin@example.com');
      expect(admin.apiKey).toBe('test-api-key-12345');
      expect(admin.status).toBe(AdminStatus.active);
    });

    it('should reject admin with empty email', () => {
      expect(() => {
        new Admin(createAdminProps({ email: '' }));
      }).toThrow(ValidationException);
    });

    it('should reject admin with empty API key', () => {
      expect(() => {
        new Admin(createAdminProps({ apiKey: '' }));
      }).toThrow(ValidationException);
    });
  });

  describe('Status Management', () => {
    it('should check if admin is active', () => {
      const admin = new Admin(createAdminProps({ status: AdminStatus.active }));
      expect(admin.isActive()).toBe(true);
    });

    it('should check if admin is inactive', () => {
      const admin = new Admin(
        createAdminProps({ status: AdminStatus.inactive }),
      );
      expect(admin.isActive()).toBe(false);
    });

    it('should activate an inactive admin', () => {
      const admin = new Admin(
        createAdminProps({ status: AdminStatus.inactive }),
      );
      admin.activate();
      expect(admin.status).toBe(AdminStatus.active);
      expect(admin.isActive()).toBe(true);
    });

    it('should deactivate an active admin', () => {
      const admin = new Admin(createAdminProps({ status: AdminStatus.active }));
      admin.deactivate();
      expect(admin.status).toBe(AdminStatus.inactive);
      expect(admin.isActive()).toBe(false);
    });
  });

  describe('Getters', () => {
    it('should return all admin properties correctly', () => {
      const createdAt = new Date('2024-01-01');
      const updatedAt = new Date('2024-01-02');

      const admin = new Admin(
        createAdminProps({
          id: new BigNumber(123),
          email: 'superadmin@test.com',
          apiKey: 'super-secret-key',
          status: AdminStatus.active,
          createdAt,
          updatedAt,
        }),
      );

      expect(admin.id).toEqual(new BigNumber(123));
      expect(admin.email).toBe('superadmin@test.com');
      expect(admin.apiKey).toBe('super-secret-key');
      expect(admin.status).toBe(AdminStatus.active);
      expect(admin.createdAt).toEqual(createdAt);
      expect(admin.updatedAt).toEqual(updatedAt);
    });
  });
});
