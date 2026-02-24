# 21. Auth & Authorization — JWT, Refresh Tokens, Guards

## 1. Обзор

| Параметр | Значение |
|----------|----------|
| Access Token TTL | **7 дней** |
| Refresh Token TTL | **30 дней** |
| Алгоритм | RS256 (рекомендуется) или HS256 |
| Хранение Refresh | Redis / PostgreSQL |
| Guard | NestJS `@UseGuards()` |

---

## 2. Архитектура

```
┌─────────────┐     ┌──────────────┐     ┌─────────────┐
│   Client    │────▶│  API Gateway │────▶│ Auth Service│
└─────────────┘     └──────────────┘     └─────────────┘
                           │                    │
                           │ JWT Validation     │ Token Issue
                           ▼                    ▼
                    ┌──────────────┐     ┌─────────────┐
                    │ Other Services│     │   Redis     │
                    └──────────────┘     │ (sessions)  │
                                         └─────────────┘
```

---

## 3. Token Payload

### Access Token

```typescript
interface AccessTokenPayload {
  sub: string;        // User ID
  username: string;
  roles: string[];    // ['player', 'admin']
  characterId?: string;
  iat: number;        // Issued at
  exp: number;        // Expiration
  jti: string;        // JWT ID (для revocation)
}
```

### Refresh Token

```typescript
interface RefreshTokenPayload {
  sub: string;        // User ID
  jti: string;        // Unique token ID
  family: string;     // Token family (для rotation)
  iat: number;
  exp: number;
}
```

---

## 4. Установка

```bash
npm install @nestjs/jwt @nestjs/passport passport passport-jwt
npm install -D @types/passport-jwt
```

---

## 5. Реализация Auth Library

### libs/auth/src/index.ts

```typescript
export * from './auth.module';
export * from './jwt.strategy';
export * from './jwt-auth.guard';
export * from './roles.guard';
export * from './decorators/current-user.decorator';
export * from './decorators/roles.decorator';
export * from './decorators/public.decorator';
export * from './interfaces/jwt-payload.interface';
export * from './interfaces/auth-user.interface';
```

### Interfaces

```typescript
// libs/auth/src/interfaces/jwt-payload.interface.ts
export interface JwtPayload {
  sub: string;
  username: string;
  roles: string[];
  characterId?: string;
  jti: string;
  iat: number;
  exp: number;
}

// libs/auth/src/interfaces/auth-user.interface.ts
export interface AuthUser {
  id: string;
  username: string;
  roles: string[];
  characterId?: string;
}
```

### JWT Strategy

```typescript
// libs/auth/src/jwt.strategy.ts
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { JwtPayload, AuthUser } from './interfaces';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET'),
      // Для RS256:
      // secretOrKey: configService.get<string>('JWT_PUBLIC_KEY'),
      // algorithms: ['RS256'],
    });
  }

  async validate(payload: JwtPayload): Promise<AuthUser> {
    // Можно добавить проверку revoked tokens через Redis
    // const isRevoked = await this.tokenService.isRevoked(payload.jti);
    // if (isRevoked) throw new UnauthorizedException('Token revoked');

    return {
      id: payload.sub,
      username: payload.username,
      roles: payload.roles,
      characterId: payload.characterId,
    };
  }
}
```

### JWT Auth Guard

```typescript
// libs/auth/src/jwt-auth.guard.ts
import { Injectable, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Reflector } from '@nestjs/core';
import { IS_PUBLIC_KEY } from './decorators/public.decorator';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private reflector: Reflector) {
    super();
  }

  canActivate(context: ExecutionContext) {
    // Проверяем @Public() декоратор
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    return super.canActivate(context);
  }

  handleRequest(err: any, user: any, info: any) {
    if (err || !user) {
      throw err || new UnauthorizedException({
        type: '/errors/unauthorized',
        title: 'Unauthorized',
        status: 401,
        detail: info?.message || 'Invalid or expired token',
      });
    }
    return user;
  }
}
```

### Roles Guard

```typescript
// libs/auth/src/roles.guard.ts
import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from './decorators/roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const { user } = context.switchToHttp().getRequest();
    
    if (!user || !user.roles) {
      throw new ForbiddenException({
        type: '/errors/forbidden',
        title: 'Forbidden',
        status: 403,
        detail: 'Access denied',
      });
    }

    const hasRole = requiredRoles.some((role) => user.roles.includes(role));
    
    if (!hasRole) {
      throw new ForbiddenException({
        type: '/errors/forbidden',
        title: 'Forbidden',
        status: 403,
        detail: `Required roles: ${requiredRoles.join(', ')}`,
      });
    }

    return true;
  }
}
```

### Decorators

```typescript
// libs/auth/src/decorators/current-user.decorator.ts
import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { AuthUser } from '../interfaces';

export const CurrentUser = createParamDecorator(
  (data: keyof AuthUser | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.user as AuthUser;

    return data ? user?.[data] : user;
  },
);

// libs/auth/src/decorators/roles.decorator.ts
import { SetMetadata } from '@nestjs/common';

export const ROLES_KEY = 'roles';
export const Roles = (...roles: string[]) => SetMetadata(ROLES_KEY, roles);

// libs/auth/src/decorators/public.decorator.ts
import { SetMetadata } from '@nestjs/common';

export const IS_PUBLIC_KEY = 'isPublic';
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
```

### Auth Module

```typescript
// libs/auth/src/auth.module.ts
import { Module, Global } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtStrategy } from './jwt.strategy';
import { JwtAuthGuard } from './jwt-auth.guard';
import { RolesGuard } from './roles.guard';

@Global()
@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: {
          expiresIn: '7d', // 7 дней
          algorithm: 'HS256',
        },
        // Для RS256:
        // privateKey: configService.get<string>('JWT_PRIVATE_KEY'),
        // publicKey: configService.get<string>('JWT_PUBLIC_KEY'),
        // signOptions: { algorithm: 'RS256', expiresIn: '7d' },
      }),
    }),
  ],
  providers: [JwtStrategy, JwtAuthGuard, RolesGuard],
  exports: [JwtModule, PassportModule, JwtStrategy, JwtAuthGuard, RolesGuard],
})
export class AuthLibraryModule {}
```

---

## 6. Auth Service Implementation

### Token Service

```typescript
// apps/auth-service/src/token/token.service.ts
import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { v4 as uuidv4 } from 'uuid';
import { RedisService } from '../redis/redis.service';
import { JwtPayload } from '@app/auth';

@Injectable()
export class TokenService {
  private readonly accessTokenTtl = 7 * 24 * 60 * 60; // 7 days in seconds
  private readonly refreshTokenTtl = 30 * 24 * 60 * 60; // 30 days in seconds

  constructor(
    private jwtService: JwtService,
    private configService: ConfigService,
    private redisService: RedisService,
  ) {}

  async generateTokens(user: { id: string; username: string; roles: string[]; characterId?: string }) {
    const jti = uuidv4();
    const family = uuidv4();

    const accessToken = await this.generateAccessToken(user, jti);
    const refreshToken = await this.generateRefreshToken(user.id, family);

    // Сохраняем refresh token family в Redis
    await this.redisService.set(
      `refresh:${user.id}:${family}`,
      JSON.stringify({ jti, createdAt: Date.now() }),
      this.refreshTokenTtl,
    );

    return {
      accessToken,
      refreshToken,
      expiresIn: this.accessTokenTtl,
    };
  }

  private async generateAccessToken(
    user: { id: string; username: string; roles: string[]; characterId?: string },
    jti: string,
  ): Promise<string> {
    const payload: Omit<JwtPayload, 'iat' | 'exp'> = {
      sub: user.id,
      username: user.username,
      roles: user.roles,
      characterId: user.characterId,
      jti,
    };

    return this.jwtService.sign(payload, {
      expiresIn: '7d',
    });
  }

  private async generateRefreshToken(userId: string, family: string): Promise<string> {
    const payload = {
      sub: userId,
      jti: uuidv4(),
      family,
    };

    return this.jwtService.sign(payload, {
      secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
      expiresIn: '30d',
    });
  }

  async refreshTokens(refreshToken: string) {
    try {
      const payload = this.jwtService.verify(refreshToken, {
        secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
      });

      // Проверяем family в Redis
      const familyKey = `refresh:${payload.sub}:${payload.family}`;
      const familyData = await this.redisService.get(familyKey);

      if (!familyData) {
        // Token family не найден — возможно, была атака
        // Инвалидируем все токены пользователя
        await this.revokeAllUserTokens(payload.sub);
        throw new Error('Invalid refresh token family');
      }

      // Получаем данные пользователя
      const user = await this.getUserById(payload.sub);
      if (!user) {
        throw new Error('User not found');
      }

      // Генерируем новую пару токенов с той же family
      const jti = uuidv4();
      const accessToken = await this.generateAccessToken(user, jti);
      const newRefreshToken = await this.generateRefreshToken(user.id, payload.family);

      // Обновляем family в Redis
      await this.redisService.set(
        familyKey,
        JSON.stringify({ jti, createdAt: Date.now() }),
        this.refreshTokenTtl,
      );

      return {
        accessToken,
        refreshToken: newRefreshToken,
        expiresIn: this.accessTokenTtl,
      };
    } catch (error) {
      throw new Error('Invalid refresh token');
    }
  }

  async revokeToken(jti: string): Promise<void> {
    // Добавляем в blacklist
    await this.redisService.set(
      `revoked:${jti}`,
      '1',
      this.accessTokenTtl,
    );
  }

  async revokeAllUserTokens(userId: string): Promise<void> {
    // Удаляем все refresh token families
    const pattern = `refresh:${userId}:*`;
    const keys = await this.redisService.keys(pattern);
    
    if (keys.length > 0) {
      await this.redisService.del(...keys);
    }
  }

  async isRevoked(jti: string): Promise<boolean> {
    const revoked = await this.redisService.get(`revoked:${jti}`);
    return revoked !== null;
  }

  private async getUserById(userId: string) {
    // Запрос к базе данных
    // return this.userRepository.findById(userId);
    return null; // placeholder
  }
}
```

### Auth Controller

```typescript
// apps/auth-service/src/auth/auth.controller.ts
import { Controller, Post, Body, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { TokenService } from '../token/token.service';
import { Public, CurrentUser, JwtAuthGuard } from '@app/auth';
import { LoginDto, RegisterDto, RefreshTokenDto, TokenResponseDto } from './dto';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private tokenService: TokenService,
  ) {}

  @Public()
  @Post('register')
  @ApiOperation({ summary: 'Register new user' })
  @ApiResponse({ status: 201, type: TokenResponseDto })
  async register(@Body() dto: RegisterDto): Promise<TokenResponseDto> {
    const user = await this.authService.register(dto);
    return this.tokenService.generateTokens(user);
  }

  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Login with credentials' })
  @ApiResponse({ status: 200, type: TokenResponseDto })
  async login(@Body() dto: LoginDto): Promise<TokenResponseDto> {
    const user = await this.authService.validateUser(dto.email, dto.password);
    return this.tokenService.generateTokens(user);
  }

  @Public()
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Refresh access token' })
  @ApiResponse({ status: 200, type: TokenResponseDto })
  async refresh(@Body() dto: RefreshTokenDto): Promise<TokenResponseDto> {
    return this.tokenService.refreshTokens(dto.refreshToken);
  }

  @UseGuards(JwtAuthGuard)
  @Post('logout')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Logout (revoke current token)' })
  async logout(@CurrentUser('id') userId: string): Promise<void> {
    await this.tokenService.revokeAllUserTokens(userId);
  }
}
```

### DTOs

```typescript
// apps/auth-service/src/auth/dto/login.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MinLength } from 'class-validator';

export class LoginDto {
  @ApiProperty({ example: 'user@example.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'password123' })
  @IsString()
  @MinLength(8)
  password: string;
}

// apps/auth-service/src/auth/dto/register.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MinLength, MaxLength } from 'class-validator';

export class RegisterDto {
  @ApiProperty({ example: 'user@example.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'username' })
  @IsString()
  @MinLength(3)
  @MaxLength(20)
  username: string;

  @ApiProperty({ example: 'password123' })
  @IsString()
  @MinLength(8)
  password: string;
}

// apps/auth-service/src/auth/dto/token-response.dto.ts
import { ApiProperty } from '@nestjs/swagger';

export class TokenResponseDto {
  @ApiProperty()
  accessToken: string;

  @ApiProperty()
  refreshToken: string;

  @ApiProperty({ example: 604800 })
  expiresIn: number;
}

// apps/auth-service/src/auth/dto/refresh-token.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class RefreshTokenDto {
  @ApiProperty()
  @IsString()
  refreshToken: string;
}
```

---

## 7. Использование в сервисах

### Глобальный Guard в API Gateway

```typescript
// apps/api-gateway/src/main.ts
import { NestFactory, Reflector } from '@nestjs/core';
import { JwtAuthGuard, RolesGuard } from '@app/auth';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  const reflector = app.get(Reflector);
  
  // Глобальный JWT Guard
  app.useGlobalGuards(
    new JwtAuthGuard(reflector),
    new RolesGuard(reflector),
  );

  await app.listen(3000);
}
bootstrap();
```

### Использование в контроллерах

```typescript
// apps/player-service/src/player/player.controller.ts
import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { CurrentUser, Roles, Public, JwtAuthGuard, RolesGuard, AuthUser } from '@app/auth';
import { PlayerService } from './player.service';

@ApiTags('players')
@ApiBearerAuth()
@Controller('players')
export class PlayerController {
  constructor(private playerService: PlayerService) {}

  // Публичный эндпоинт
  @Public()
  @Get('leaderboard')
  async getLeaderboard() {
    return this.playerService.getLeaderboard();
  }

  // Требует авторизации (по умолчанию)
  @Get('me')
  async getMe(@CurrentUser() user: AuthUser) {
    return this.playerService.findById(user.id);
  }

  // Требует определённой роли
  @Roles('admin')
  @Get(':id')
  async getPlayer(@Param('id') id: string) {
    return this.playerService.findById(id);
  }

  // Доступ к отдельным полям user
  @Get('my-characters')
  async getMyCharacters(@CurrentUser('id') userId: string) {
    return this.playerService.getCharacters(userId);
  }
}
```

### NATS с авторизацией

```typescript
// Передаём user context через NATS
// В API Gateway
@Post('buildings/:id/upgrade')
async upgradeBuilding(
  @Param('id') buildingId: string,
  @CurrentUser() user: AuthUser,
) {
  return firstValueFrom(
    this.natsClient.send('building.upgrade', {
      buildingId,
      userId: user.id,
      characterId: user.characterId,
    }),
  );
}

// В Building Service
@MessagePattern('building.upgrade')
async upgradeBuilding(@Payload() data: { buildingId: string; userId: string; characterId: string }) {
  // userId уже валидирован на Gateway
  return this.buildingService.upgrade(data.characterId, data.buildingId);
}
```

---

## 8. Конфигурация

### .env

```bash
# JWT
JWT_SECRET=your-super-secret-key-min-32-chars-long
JWT_REFRESH_SECRET=your-refresh-secret-key-min-32-chars

# Для RS256 (рекомендуется для prod)
# JWT_PRIVATE_KEY="-----BEGIN RSA PRIVATE KEY-----\n...\n-----END RSA PRIVATE KEY-----"
# JWT_PUBLIC_KEY="-----BEGIN PUBLIC KEY-----\n...\n-----END PUBLIC KEY-----"
```

### Генерация RS256 ключей

```bash
# Генерация приватного ключа
openssl genrsa -out private.pem 2048

# Извлечение публичного ключа
openssl rsa -in private.pem -pubout -out public.pem

# Конвертация в одну строку для .env
awk 'NF {sub(/\r/, ""); printf "%s\\n",$0;}' private.pem
```

---

## 9. Security Best Practices

### Checklist

- [x] Access Token TTL: 7 дней
- [x] Refresh Token TTL: 30 дней
- [x] Refresh Token Rotation (новый refresh при каждом обновлении)
- [x] Token Family tracking (защита от кражи refresh token)
- [x] JTI для revocation
- [x] Redis blacklist для отозванных токенов
- [ ] Rate limiting на /auth/* endpoints
- [ ] HTTPS only
- [ ] Secure & HttpOnly cookies (если используете cookies)

### Token Refresh Flow

```
1. Client sends refresh token
2. Server validates refresh token
3. Server checks token family in Redis
4. If family not found → SECURITY BREACH → revoke all user tokens
5. If valid → generate new access + refresh tokens
6. Update family in Redis
7. Return new tokens
```

### Automatic Logout on Breach

```typescript
// Если обнаружен невалидный refresh token family,
// значит кто-то пытался использовать старый token
// → отзываем ВСЕ токены пользователя

async refreshTokens(refreshToken: string) {
  const payload = this.jwtService.verify(refreshToken, ...);
  
  const familyExists = await this.redis.exists(`refresh:${payload.sub}:${payload.family}`);
  
  if (!familyExists) {
    // BREACH DETECTED
    await this.revokeAllUserTokens(payload.sub);
    throw new UnauthorizedException('Session invalidated due to security concerns');
  }
  
  // ... continue with refresh
}
```

---

## 10. API Reference

| Endpoint | Method | Auth | Description |
|----------|--------|------|-------------|
| `/auth/register` | POST | Public | Регистрация |
| `/auth/login` | POST | Public | Вход |
| `/auth/refresh` | POST | Public | Обновление токенов |
| `/auth/logout` | POST | Bearer | Выход (revoke tokens) |
| `/auth/me` | GET | Bearer | Текущий пользователь |
