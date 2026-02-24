import { Tracking } from './tracking';
import { UserFixtures } from '@app/users/__fixtures__/user.fixtures';
import { ValidationException } from '@lib/shared/application';
import BigNumber from 'bignumber.js';

describe('Tracking Entity', () => {
  describe('Creation', () => {
    it('should create tracking with valid data', () => {
      const tracking = UserFixtures.createTracking();
      expect(tracking.id).toBe(1);
      expect(tracking.userId).toEqual(new BigNumber(1));
      expect(tracking.firstIp).toBe('127.0.0.1');
      expect(tracking.lastIp).toBe('127.0.0.1');
    });

    it('should create tracking with optional fields', () => {
      const tracking = UserFixtures.createTracking({
        gaClientId: 'ga-123',
        yaClientId: 'ya-456',
        clickId: 'click-789',
        utmMedium: 'email',
        utmSource: 'newsletter',
        utmCampaign: 'summer-sale',
        pid: 'partner-123',
        sub1: 'sub1-value',
        sub2: 'sub2-value',
        sub3: 'sub3-value',
      });

      expect(tracking.gaClientId).toBe('ga-123');
      expect(tracking.yaClientId).toBe('ya-456');
      expect(tracking.clickId).toBe('click-789');
      expect(tracking.utmMedium).toBe('email');
      expect(tracking.utmSource).toBe('newsletter');
      expect(tracking.utmCampaign).toBe('summer-sale');
      expect(tracking.pid).toBe('partner-123');
      expect(tracking.sub1).toBe('sub1-value');
      expect(tracking.sub2).toBe('sub2-value');
      expect(tracking.sub3).toBe('sub3-value');
    });

    it('should reject tracking with empty first IP', () => {
      expect(() => {
        UserFixtures.createTracking({ firstIp: '' });
      }).toThrow(ValidationException);
    });

    it('should reject tracking with whitespace-only first IP', () => {
      expect(() => {
        UserFixtures.createTracking({ firstIp: '   ' });
      }).toThrow(ValidationException);
    });

    it('should reject tracking with empty last IP', () => {
      expect(() => {
        UserFixtures.createTracking({ lastIp: '' });
      }).toThrow(ValidationException);
    });

    it('should reject tracking with whitespace-only last IP', () => {
      expect(() => {
        UserFixtures.createTracking({ lastIp: '   ' });
      }).toThrow(ValidationException);
    });

    it('should reject tracking with invalid user ID (zero)', () => {
      expect(() => {
        UserFixtures.createTracking({ userId: new BigNumber(0) });
      }).toThrow(ValidationException);
    });

    it('should reject tracking with invalid user ID (negative)', () => {
      expect(() => {
        UserFixtures.createTracking({ userId: new BigNumber(-1) });
      }).toThrow(ValidationException);
    });
  });

  describe('Domain Methods', () => {
    it('should update last IP', () => {
      const tracking = UserFixtures.createTracking();
      tracking.updateLastIp('192.168.1.1');

      expect(tracking.lastIp).toBe('192.168.1.1');
    });

    it('should reject update with empty IP', () => {
      const tracking = UserFixtures.createTracking();

      expect(() => {
        tracking.updateLastIp('');
      }).toThrow(ValidationException);
    });

    it('should reject update with whitespace-only IP', () => {
      const tracking = UserFixtures.createTracking();

      expect(() => {
        tracking.updateLastIp('   ');
      }).toThrow(ValidationException);
    });
  });

  describe('Getters', () => {
    it('should return all tracking properties correctly', () => {
      const tracking = UserFixtures.createTracking({
        id: 123,
        userId: new BigNumber(456),
        firstIp: '10.0.0.1',
        lastIp: '10.0.0.2',
        gaClientId: 'ga-client-id',
        yaClientId: 'ya-client-id',
        clickId: 'click-id',
        utmMedium: 'medium',
        utmSource: 'source',
        utmCampaign: 'campaign',
        pid: 'pid-value',
        sub1: 'sub1',
        sub2: 'sub2',
        sub3: 'sub3',
      });

      expect(tracking.id).toBe(123);
      expect(tracking.userId).toEqual(new BigNumber(456));
      expect(tracking.firstIp).toBe('10.0.0.1');
      expect(tracking.lastIp).toBe('10.0.0.2');
      expect(tracking.gaClientId).toBe('ga-client-id');
      expect(tracking.yaClientId).toBe('ya-client-id');
      expect(tracking.clickId).toBe('click-id');
      expect(tracking.utmMedium).toBe('medium');
      expect(tracking.utmSource).toBe('source');
      expect(tracking.utmCampaign).toBe('campaign');
      expect(tracking.pid).toBe('pid-value');
      expect(tracking.sub1).toBe('sub1');
      expect(tracking.sub2).toBe('sub2');
      expect(tracking.sub3).toBe('sub3');
    });

    it('should return undefined for optional fields when not provided', () => {
      const tracking = UserFixtures.createTracking();

      expect(tracking.gaClientId).toBeUndefined();
      expect(tracking.yaClientId).toBeUndefined();
      expect(tracking.clickId).toBeUndefined();
      expect(tracking.utmMedium).toBeUndefined();
      expect(tracking.utmSource).toBeUndefined();
      expect(tracking.utmCampaign).toBeUndefined();
      expect(tracking.pid).toBeUndefined();
      expect(tracking.sub1).toBeUndefined();
      expect(tracking.sub2).toBeUndefined();
      expect(tracking.sub3).toBeUndefined();
    });
  });
});
