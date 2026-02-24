import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe, Module } from '@nestjs/common';
import { ZodValidationPipe } from '@anatine/zod-nestjs';
import request from 'supertest';
import { AppModule } from '@app/users/app.module';
import { UserFixtures } from '@app/users/__fixtures__/user.fixtures';
import { BalancePublisher } from '@lib/lib-balance';
import { LibBalanceModule } from '@lib/lib-balance';
import { PrismaService } from '@app/users/infrastructure/prisma/prisma.service';
import {
  ZodExceptionFilter,
  HttpExceptionsFilter,
} from '@lib/shared/application';

// Mock LibBalanceModule for testing
@Module({
  providers: [
    {
      provide: BalancePublisher,
      useValue: {
        createUserBalance: jest.fn().mockResolvedValue({
          success: true,
          userId: 1,
        }),
      },
    },
  ],
  exports: [BalancePublisher],
})
class MockLibBalanceModule {}

// Helper function to remove undefined values from DTO (only for optional fields)
// This ensures the request body doesn't include undefined values which can cause issues
const cleanDto = (dto: any): any => {
  const cleaned: any = {};
  const optionalFields = [
    'email',
    'phone',
    'country',
    'name',
    'birthday',
    'gaClientId',
    'yaClientId',
    'clickId',
    'utmMedium',
    'utmSource',
    'utmCampaign',
    'pid',
    'sub1',
    'sub2',
    'sub3',
  ];

  for (const [key, value] of Object.entries(dto)) {
    // Only skip undefined for optional fields, always include required fields
    // Required fields: password, currencyIsoCode, languageIsoCode
    if (value === undefined && optionalFields.includes(key)) {
      continue;
    }
    // Always include required fields - never skip them
    cleaned[key] = value;
  }
  return cleaned;
};

describe('UsersHttpController (Integration)', () => {
  let app: INestApplication;
  let balancePublisher: BalancePublisher;
  let prisma: PrismaService;
  let moduleRef: TestingModule;

  beforeAll(async () => {
    moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideModule(LibBalanceModule)
      .useModule(MockLibBalanceModule)
      .compile();

    balancePublisher = moduleRef.get<BalancePublisher>(BalancePublisher);
    prisma = moduleRef.get<PrismaService>(PrismaService);
    await prisma.$connect();

    app = moduleRef.createNestApplication();
    app.setGlobalPrefix('api/v2');
    // When using createZodDto, Zod validation happens automatically when the DTO is instantiated
    // whitelist: false because 'declare' properties don't exist at runtime for ValidationPipe to see
    // transform: true ensures the DTO class is instantiated, which triggers Zod validation
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: false, // Don't strip - 'declare' properties aren't visible to ValidationPipe
        transform: true, // Transform to DTO class (triggers Zod validation)
        forbidNonWhitelisted: false,
        transformOptions: {
          enableImplicitConversion: true,
        },
        skipMissingProperties: false,
      }),
      new ZodValidationPipe(),
    );
    // Register ZodExceptionFilter before HttpExceptionsFilter to catch Zod errors first
    app.useGlobalFilters(new ZodExceptionFilter(), new HttpExceptionsFilter());
    await app.init();
  });

  afterAll(async () => {
    await app.close();
    await prisma.$disconnect();
    await moduleRef.close();
  });

  beforeEach(async () => {
    // Clean up test data before each test
    await prisma.tracking.deleteMany({});
    await prisma.user.deleteMany({});
  });

  describe('POST /users/register', () => {
    it('should register a new user', async () => {
      const dto = UserFixtures.createRegisterUserDto({
        email: `test-${Date.now()}@example.com`,
        phone: `+123456789${Math.floor(Math.random() * 1000)}`,
      });

      const response = await request(app.getHttpServer())
        .post('/api/v2/users/register')
        .send(cleanDto(dto));

      if (response.status !== 201) {
        console.error('Registration failed:', {
          status: response.status,
          body: response.body,
          dto: cleanDto(dto),
        });
      }

      expect(response.status).toBe(201);

      expect(response.body).toHaveProperty('token');
      expect(response.body).toHaveProperty('user');
      expect(response.body.user).toHaveProperty('id');
      expect(response.body.user).toHaveProperty('currencyCode', 'USD');
      expect(response.body.user).toHaveProperty('languageCode', 'en');
    });

    it('should register user with only email', async () => {
      const dto = UserFixtures.createRegisterUserDto({
        email: `test-email-${Date.now()}@example.com`,
        phone: undefined,
      });

      const response = await request(app.getHttpServer())
        .post('/api/v2/users/register')
        .send(cleanDto(dto));

      if (response.status !== 201) {
        console.log('Status:', response.status);
        console.log('Body:', JSON.stringify(response.body, null, 2));
      }

      expect(response.status).toBe(201);
      expect(response.body.user).toHaveProperty('email', dto.email);
    });

    it('should register user with only phone', async () => {
      const dto = UserFixtures.createRegisterUserDto({
        email: undefined,
        phone: `+123456789${Math.floor(Math.random() * 10000)}`,
      });

      const response = await request(app.getHttpServer())
        .post('/api/v2/users/register')
        .send(cleanDto(dto))
        .expect(201);

      expect(response.body.user).toHaveProperty('phone', dto.phone);
    });

    it('should reject duplicate email', async () => {
      const dto = UserFixtures.createRegisterUserDto({
        email: `duplicate-${Date.now()}@example.com`,
      });

      // First registration
      await request(app.getHttpServer())
        .post('/api/v2/users/register')
        .send(cleanDto(dto))
        .expect(201);

      // Second registration with same email
      await request(app.getHttpServer())
        .post('/api/v2/users/register')
        .send(cleanDto(dto))
        .expect(409);
    });

    it('should reject invalid email format', async () => {
      const dto = UserFixtures.createRegisterUserDto({
        email: 'invalid-email',
      });

      await request(app.getHttpServer())
        .post('/api/v2/users/register')
        .send(cleanDto(dto))
        .expect(400);
    });

    it('should reject invalid currency ISO code', async () => {
      const dto = UserFixtures.createRegisterUserDto({
        currencyIsoCode: 'INVALID',
      });

      await request(app.getHttpServer())
        .post('/api/v2/users/register')
        .send(cleanDto(dto))
        .expect(400);
    });

    it('should reject invalid language ISO code', async () => {
      const dto = UserFixtures.createRegisterUserDto({
        languageIsoCode: 'INVALID',
      });

      await request(app.getHttpServer())
        .post('/api/v2/users/register')
        .send(cleanDto(dto))
        .expect(400);
    });

    it('should reject password that is too short', async () => {
      const dto = UserFixtures.createRegisterUserDto({
        password: '12345', // Less than 6 characters
      });

      await request(app.getHttpServer())
        .post('/api/v2/users/register')
        .send(cleanDto(dto))
        .expect(400);
    });

    it('should reject request without email or phone', async () => {
      const dto = UserFixtures.createRegisterUserDto({
        email: undefined,
        phone: undefined,
      });

      await request(app.getHttpServer())
        .post('/api/v2/users/register')
        .send(cleanDto(dto))
        .expect(400);
    });
  });

  describe('POST /users/login', () => {
    let registeredUser: {
      email?: string;
      phone?: string;
      password: string;
    };

    beforeEach(async () => {
      // Register a fresh user for each login test so cleanup hooks don't remove it
      const registerDto = UserFixtures.createRegisterUserDto({
        email: `login-test-${Date.now()}@example.com`,
        password: 'TestPassword123!',
      });

      const response = await request(app.getHttpServer())
        .post('/api/v2/users/register')
        .send(cleanDto(registerDto));

      if (response.status !== 201) {
        throw new Error(
          `Failed to register user for login tests. Status: ${response.status}, Body: ${JSON.stringify(response.body)}`,
        );
      }

      registeredUser = {
        email: registerDto.email,
        password: registerDto.password,
      };
    });

    it('should login user with email', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/v2/users/login')
        .send({
          email: registeredUser.email,
          password: registeredUser.password,
        })
        .expect(200);

      expect(response.body).toHaveProperty('token');
      expect(response.body).toHaveProperty('user');
      expect(response.body.user).toHaveProperty('id');
    });

    it('should login user with phone', async () => {
      // Register user with phone
      const registerDto = UserFixtures.createRegisterUserDto({
        email: undefined,
        phone: `+123456789${Math.floor(Math.random() * 10000)}`,
        password: 'TestPassword123!',
      });

      await request(app.getHttpServer())
        .post('/api/v2/users/register')
        .send(cleanDto(registerDto))
        .expect(201);

      const response = await request(app.getHttpServer())
        .post('/api/v2/users/login')
        .send({
          phone: registerDto.phone,
          password: registerDto.password,
        })
        .expect(200);

      expect(response.body).toHaveProperty('token');
    });

    it('should reject login with wrong password', async () => {
      await request(app.getHttpServer())
        .post('/api/v2/users/login')
        .send({
          email: registeredUser.email,
          password: 'WrongPassword123!',
        })
        .expect(401);
    });

    it('should reject login for non-existent user', async () => {
      await request(app.getHttpServer())
        .post('/api/v2/users/login')
        .send({
          email: 'nonexistent@example.com',
          password: 'Password123!',
        })
        .expect(401);
    });

    it('should reject login without email or phone', async () => {
      await request(app.getHttpServer())
        .post('/api/v2/users/login')
        .send({
          password: 'Password123!',
        })
        .expect(400);
    });
  });
});
