import { TrackingPrismaMapper } from './tracking.prisma.mapper';
import { Tracking } from '@app/player-service/domain/entities/tracking/tracking';
import { bigNumberToBigInt } from '@lib/shared/utils/amount.utils';
import { Prisma } from '@prisma/meta';
import BigNumber from 'bignumber.js';

// Mock Prisma Tracking type structure
type MockPrismaTracking = {
  id: number;
  userId: bigint;
  firstIp: string;
  lastIp: string;
  gaClientId: string | null;
  yaClientId: string | null;
  clickId: string | null;
  utmMedium: string | null;
  utmSource: string | null;
  utmCampaign: string | null;
  pid: string | null;
  sub1: string | null;
  sub2: string | null;
  sub3: string | null;
};

describe('TrackingPrismaMapper', () => {
  const createMockPrismaTracking = (
    overrides?: Partial<MockPrismaTracking>,
  ): MockPrismaTracking => {
    return {
      id: 1,
      userId: 1n,
      firstIp: '127.0.0.1',
      lastIp: '127.0.0.1',
      gaClientId: null,
      yaClientId: null,
      clickId: null,
      utmMedium: null,
      utmSource: null,
      utmCampaign: null,
      pid: null,
      sub1: null,
      sub2: null,
      sub3: null,
      ...overrides,
    };
  };

  describe('toDomain', () => {
    it('should map Prisma tracking to domain tracking with all fields', () => {
      const prismaTracking = createMockPrismaTracking({
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

      const domainTracking = TrackingPrismaMapper.toDomain(
        prismaTracking as Prisma.TrackingGetPayload<{}>,
      );

      expect(domainTracking).toBeInstanceOf(Tracking);
      expect(domainTracking.id).toBe(1);
      expect(domainTracking.userId).toEqual(new BigNumber(1));
      expect(domainTracking.firstIp).toBe('127.0.0.1');
      expect(domainTracking.lastIp).toBe('127.0.0.1');
      expect(domainTracking.gaClientId).toBe('ga-123');
      expect(domainTracking.yaClientId).toBe('ya-456');
      expect(domainTracking.clickId).toBe('click-789');
      expect(domainTracking.utmMedium).toBe('email');
      expect(domainTracking.utmSource).toBe('newsletter');
      expect(domainTracking.utmCampaign).toBe('summer-sale');
      expect(domainTracking.pid).toBe('partner-123');
      expect(domainTracking.sub1).toBe('sub1-value');
      expect(domainTracking.sub2).toBe('sub2-value');
      expect(domainTracking.sub3).toBe('sub3-value');
    });

    it('should convert null gaClientId to undefined', () => {
      const prismaTracking = createMockPrismaTracking({ gaClientId: null });
      const domainTracking = TrackingPrismaMapper.toDomain(
        prismaTracking as Prisma.TrackingGetPayload<{}>,
      );

      expect(domainTracking.gaClientId).toBeUndefined();
    });

    it('should convert null yaClientId to undefined', () => {
      const prismaTracking = createMockPrismaTracking({ yaClientId: null });
      const domainTracking = TrackingPrismaMapper.toDomain(
        prismaTracking as Prisma.TrackingGetPayload<{}>,
      );

      expect(domainTracking.yaClientId).toBeUndefined();
    });

    it('should convert null clickId to undefined', () => {
      const prismaTracking = createMockPrismaTracking({ clickId: null });
      const domainTracking = TrackingPrismaMapper.toDomain(
        prismaTracking as Prisma.TrackingGetPayload<{}>,
      );

      expect(domainTracking.clickId).toBeUndefined();
    });

    it('should convert null utmMedium to undefined', () => {
      const prismaTracking = createMockPrismaTracking({ utmMedium: null });
      const domainTracking = TrackingPrismaMapper.toDomain(
        prismaTracking as Prisma.TrackingGetPayload<{}>,
      );

      expect(domainTracking.utmMedium).toBeUndefined();
    });

    it('should convert null utmSource to undefined', () => {
      const prismaTracking = createMockPrismaTracking({ utmSource: null });
      const domainTracking = TrackingPrismaMapper.toDomain(
        prismaTracking as Prisma.TrackingGetPayload<{}>,
      );

      expect(domainTracking.utmSource).toBeUndefined();
    });

    it('should convert null utmCampaign to undefined', () => {
      const prismaTracking = createMockPrismaTracking({ utmCampaign: null });
      const domainTracking = TrackingPrismaMapper.toDomain(
        prismaTracking as Prisma.TrackingGetPayload<{}>,
      );

      expect(domainTracking.utmCampaign).toBeUndefined();
    });

    it('should convert null pid to undefined', () => {
      const prismaTracking = createMockPrismaTracking({ pid: null });
      const domainTracking = TrackingPrismaMapper.toDomain(
        prismaTracking as Prisma.TrackingGetPayload<{}>,
      );

      expect(domainTracking.pid).toBeUndefined();
    });

    it('should convert null sub1 to undefined', () => {
      const prismaTracking = createMockPrismaTracking({ sub1: null });
      const domainTracking = TrackingPrismaMapper.toDomain(
        prismaTracking as Prisma.TrackingGetPayload<{}>,
      );

      expect(domainTracking.sub1).toBeUndefined();
    });

    it('should convert null sub2 to undefined', () => {
      const prismaTracking = createMockPrismaTracking({ sub2: null });
      const domainTracking = TrackingPrismaMapper.toDomain(
        prismaTracking as Prisma.TrackingGetPayload<{}>,
      );

      expect(domainTracking.sub2).toBeUndefined();
    });

    it('should convert null sub3 to undefined', () => {
      const prismaTracking = createMockPrismaTracking({ sub3: null });
      const domainTracking = TrackingPrismaMapper.toDomain(
        prismaTracking as Prisma.TrackingGetPayload<{}>,
      );

      expect(domainTracking.sub3).toBeUndefined();
    });

    it('should handle tracking with only required fields', () => {
      const prismaTracking = createMockPrismaTracking({
        gaClientId: null,
        yaClientId: null,
        clickId: null,
        utmMedium: null,
        utmSource: null,
        utmCampaign: null,
        pid: null,
        sub1: null,
        sub2: null,
        sub3: null,
      });

      const domainTracking = TrackingPrismaMapper.toDomain(
        prismaTracking as Prisma.TrackingGetPayload<{}>,
      );

      expect(domainTracking.id).toBe(1);
      expect(domainTracking.userId).toEqual(new BigNumber(1));
      expect(domainTracking.firstIp).toBe('127.0.0.1');
      expect(domainTracking.lastIp).toBe('127.0.0.1');
      expect(domainTracking.gaClientId).toBeUndefined();
      expect(domainTracking.yaClientId).toBeUndefined();
      expect(domainTracking.clickId).toBeUndefined();
      expect(domainTracking.utmMedium).toBeUndefined();
      expect(domainTracking.utmSource).toBeUndefined();
      expect(domainTracking.utmCampaign).toBeUndefined();
      expect(domainTracking.pid).toBeUndefined();
      expect(domainTracking.sub1).toBeUndefined();
      expect(domainTracking.sub2).toBeUndefined();
      expect(domainTracking.sub3).toBeUndefined();
    });
  });

  describe('toPrisma', () => {
    it('should map domain tracking to Prisma input with all fields', () => {
      const createTracking = {
        userId: new BigNumber(1),
        firstIp: '127.0.0.1',
        lastIp: '192.168.1.1',
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
      };

      const prismaInput = TrackingPrismaMapper.toPrisma(createTracking);

      expect(prismaInput.userId).toBe(1n);
      expect(prismaInput.firstIp).toBe('127.0.0.1');
      expect(prismaInput.lastIp).toBe('192.168.1.1');
      expect(prismaInput.gaClientId).toBe('ga-123');
      expect(prismaInput.yaClientId).toBe('ya-456');
      expect(prismaInput.clickId).toBe('click-789');
      expect(prismaInput.utmMedium).toBe('email');
      expect(prismaInput.utmSource).toBe('newsletter');
      expect(prismaInput.utmCampaign).toBe('summer-sale');
      expect(prismaInput.pid).toBe('partner-123');
      expect(prismaInput.sub1).toBe('sub1-value');
      expect(prismaInput.sub2).toBe('sub2-value');
      expect(prismaInput.sub3).toBe('sub3-value');
    });

    it('should convert undefined gaClientId to null', () => {
      const createTracking = {
        userId: new BigNumber(1),
        firstIp: '127.0.0.1',
        lastIp: '127.0.0.1',
        gaClientId: undefined,
      };

      const prismaInput = TrackingPrismaMapper.toPrisma(createTracking);

      expect(prismaInput.gaClientId).toBeNull();
    });

    it('should convert undefined yaClientId to null', () => {
      const createTracking = {
        userId: new BigNumber(1),
        firstIp: '127.0.0.1',
        lastIp: '127.0.0.1',
        yaClientId: undefined,
      };

      const prismaInput = TrackingPrismaMapper.toPrisma(createTracking);

      expect(prismaInput.yaClientId).toBeNull();
    });

    it('should convert undefined clickId to null', () => {
      const createTracking = {
        userId: new BigNumber(1),
        firstIp: '127.0.0.1',
        lastIp: '127.0.0.1',
        clickId: undefined,
      };

      const prismaInput = TrackingPrismaMapper.toPrisma(createTracking);

      expect(prismaInput.clickId).toBeNull();
    });

    it('should convert undefined utmMedium to null', () => {
      const createTracking = {
        userId: new BigNumber(1),
        firstIp: '127.0.0.1',
        lastIp: '127.0.0.1',
        utmMedium: undefined,
      };

      const prismaInput = TrackingPrismaMapper.toPrisma(createTracking);

      expect(prismaInput.utmMedium).toBeNull();
    });

    it('should convert undefined utmSource to null', () => {
      const createTracking = {
        userId: new BigNumber(1),
        firstIp: '127.0.0.1',
        lastIp: '127.0.0.1',
        utmSource: undefined,
      };

      const prismaInput = TrackingPrismaMapper.toPrisma(createTracking);

      expect(prismaInput.utmSource).toBeNull();
    });

    it('should convert undefined utmCampaign to null', () => {
      const createTracking = {
        userId: new BigNumber(1),
        firstIp: '127.0.0.1',
        lastIp: '127.0.0.1',
        utmCampaign: undefined,
      };

      const prismaInput = TrackingPrismaMapper.toPrisma(createTracking);

      expect(prismaInput.utmCampaign).toBeNull();
    });

    it('should convert undefined pid to null', () => {
      const createTracking = {
        userId: new BigNumber(1),
        firstIp: '127.0.0.1',
        lastIp: '127.0.0.1',
        pid: undefined,
      };

      const prismaInput = TrackingPrismaMapper.toPrisma(createTracking);

      expect(prismaInput.pid).toBeNull();
    });

    it('should convert undefined sub1 to null', () => {
      const createTracking = {
        userId: new BigNumber(1),
        firstIp: '127.0.0.1',
        lastIp: '127.0.0.1',
        sub1: undefined,
      };

      const prismaInput = TrackingPrismaMapper.toPrisma(createTracking);

      expect(prismaInput.sub1).toBeNull();
    });

    it('should convert undefined sub2 to null', () => {
      const createTracking = {
        userId: new BigNumber(1),
        firstIp: '127.0.0.1',
        lastIp: '127.0.0.1',
        sub2: undefined,
      };

      const prismaInput = TrackingPrismaMapper.toPrisma(createTracking);

      expect(prismaInput.sub2).toBeNull();
    });

    it('should convert undefined sub3 to null', () => {
      const createTracking = {
        userId: new BigNumber(1),
        firstIp: '127.0.0.1',
        lastIp: '127.0.0.1',
        sub3: undefined,
      };

      const prismaInput = TrackingPrismaMapper.toPrisma(createTracking);

      expect(prismaInput.sub3).toBeNull();
    });

    it('should handle empty string optional fields as null', () => {
      const createTracking = {
        userId: new BigNumber(1),
        firstIp: '127.0.0.1',
        lastIp: '127.0.0.1',
        gaClientId: '',
        yaClientId: '',
        clickId: '',
      };

      const prismaInput = TrackingPrismaMapper.toPrisma(createTracking);

      expect(prismaInput.gaClientId).toBeNull();
      expect(prismaInput.yaClientId).toBeNull();
      expect(prismaInput.clickId).toBeNull();
    });

    it('should handle tracking with only required fields', () => {
      const createTracking = {
        userId: new BigNumber(1),
        firstIp: '127.0.0.1',
        lastIp: '192.168.1.1',
      };

      const prismaInput = TrackingPrismaMapper.toPrisma(createTracking);

      expect(prismaInput.userId).toBe(bigNumberToBigInt(new BigNumber(1)));
      expect(prismaInput.firstIp).toBe('127.0.0.1');
      expect(prismaInput.lastIp).toBe('192.168.1.1');
      expect(prismaInput.gaClientId).toBeNull();
      expect(prismaInput.yaClientId).toBeNull();
      expect(prismaInput.clickId).toBeNull();
      expect(prismaInput.utmMedium).toBeNull();
      expect(prismaInput.utmSource).toBeNull();
      expect(prismaInput.utmCampaign).toBeNull();
      expect(prismaInput.pid).toBeNull();
      expect(prismaInput.sub1).toBeNull();
      expect(prismaInput.sub2).toBeNull();
      expect(prismaInput.sub3).toBeNull();
    });
  });

  describe('toDomainList', () => {
    it('should map array of Prisma tracking to domain tracking', () => {
      const prismaTrackings = [
        createMockPrismaTracking({
          id: 1,
          userId: 1n,
          firstIp: '127.0.0.1',
        }),
        createMockPrismaTracking({
          id: 2,
          userId: 2n,
          firstIp: '192.168.1.1',
        }),
        createMockPrismaTracking({
          id: 3,
          userId: 3n,
          firstIp: '10.0.0.1',
        }),
      ];

      const domainTrackings = TrackingPrismaMapper.toDomainList(
        prismaTrackings as Prisma.TrackingGetPayload<{}>[],
      );

      expect(domainTrackings).toHaveLength(3);
      expect(domainTrackings[0]).toBeInstanceOf(Tracking);
      expect(domainTrackings[0].id).toBe(1);
      expect(domainTrackings[0].userId).toEqual(new BigNumber(1));
      expect(domainTrackings[0].firstIp).toBe('127.0.0.1');
      expect(domainTrackings[1].id).toBe(2);
      expect(domainTrackings[1].userId).toEqual(new BigNumber(2));
      expect(domainTrackings[1].firstIp).toBe('192.168.1.1');
      expect(domainTrackings[2].id).toBe(3);
      expect(domainTrackings[2].userId).toEqual(new BigNumber(3));
      expect(domainTrackings[2].firstIp).toBe('10.0.0.1');
    });

    it('should handle empty array', () => {
      const domainTrackings = TrackingPrismaMapper.toDomainList([]);

      expect(domainTrackings).toHaveLength(0);
      expect(Array.isArray(domainTrackings)).toBe(true);
    });

    it('should preserve null/undefined conversions in list', () => {
      const prismaTrackings = [
        createMockPrismaTracking({
          id: 1,
          gaClientId: null,
          yaClientId: null,
        }),
        createMockPrismaTracking({
          id: 2,
          gaClientId: 'ga-123',
          yaClientId: 'ya-456',
        }),
      ];

      const domainTrackings = TrackingPrismaMapper.toDomainList(
        prismaTrackings as Prisma.TrackingGetPayload<{}>[],
      );

      expect(domainTrackings[0].gaClientId).toBeUndefined();
      expect(domainTrackings[0].yaClientId).toBeUndefined();
      expect(domainTrackings[1].gaClientId).toBe('ga-123');
      expect(domainTrackings[1].yaClientId).toBe('ya-456');
    });
  });
});
