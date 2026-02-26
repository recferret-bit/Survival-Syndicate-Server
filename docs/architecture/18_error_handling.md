# 22. Error Handling — RFC 7807 Problem Details

## 1. Обзор

Стандарт обработки ошибок:

| Параметр | Решение |
|----------|---------|
| Формат | **RFC 7807 Problem Details** |
| Коды ошибок | Плоские (`PLAYER_NOT_FOUND`) |
| HTTP статусы | Строгие (400, 401, 403, 404, 409, 422, 429, 500, 503) |
| Stack trace | Dev: да / Prod: нет |
| Validation | Объект `{ field: [errors] }` |
| Request ID | Да, в каждом ответе |

---

## 2. RFC 7807 Problem Details

### Формат ответа

```typescript
interface ProblemDetails {
  type: string;        // URI идентификатор типа ошибки
  title: string;       // Краткое описание
  status: number;      // HTTP status code
  detail: string;      // Детальное описание для этого случая
  instance?: string;   // URI запроса, вызвавшего ошибку
  
  // Расширения (наши поля)
  code: string;        // Код ошибки (PLAYER_NOT_FOUND)
  requestId: string;   // Correlation ID
  timestamp: string;   // ISO timestamp
  errors?: Record<string, string[]>;  // Validation errors
  stack?: string;      // Stack trace (только dev)
}
```

### Примеры ответов

```json
// 404 Not Found
{
  "type": "/errors/not-found",
  "title": "Resource Not Found",
  "status": 404,
  "detail": "Player with id '550e8400-e29b-41d4-a716-446655440000' not found",
  "instance": "/api/v1/players/550e8400-e29b-41d4-a716-446655440000",
  "code": "PLAYER_NOT_FOUND",
  "requestId": "req_abc123",
  "timestamp": "2026-02-11T10:30:00.000Z"
}

// 401 Unauthorized
{
  "type": "/errors/unauthorized",
  "title": "Unauthorized",
  "status": 401,
  "detail": "Access token has expired",
  "code": "TOKEN_EXPIRED",
  "requestId": "req_def456",
  "timestamp": "2026-02-11T10:30:00.000Z"
}

// 422 Validation Error
{
  "type": "/errors/validation",
  "title": "Validation Failed",
  "status": 422,
  "detail": "Request body validation failed",
  "code": "VALIDATION_ERROR",
  "requestId": "req_ghi789",
  "timestamp": "2026-02-11T10:30:00.000Z",
  "errors": {
    "email": ["Invalid email format", "Email already exists"],
    "password": ["Password must be at least 8 characters"]
  }
}

// 500 Internal Server Error (dev)
{
  "type": "/errors/internal",
  "title": "Internal Server Error",
  "status": 500,
  "detail": "An unexpected error occurred",
  "code": "INTERNAL_ERROR",
  "requestId": "req_jkl012",
  "timestamp": "2026-02-11T10:30:00.000Z",
  "stack": "Error: Database connection failed\n    at DatabaseService.connect (/app/src/database.ts:42:11)\n    at ..."
}
```

---

## 3. HTTP Status Codes

| Status | Название | Когда использовать |
|--------|----------|-------------------|
| **400** | Bad Request | Невалидный формат запроса, отсутствуют обязательные поля |
| **401** | Unauthorized | Отсутствует или невалидный токен |
| **403** | Forbidden | Нет прав на действие (RBAC) |
| **404** | Not Found | Ресурс не найден |
| **409** | Conflict | Конфликт состояния (дубликат, уже существует) |
| **422** | Unprocessable Entity | Валидация данных не прошла |
| **429** | Too Many Requests | Rate limit превышен |
| **500** | Internal Server Error | Непредвиденная ошибка сервера |
| **503** | Service Unavailable | Сервис временно недоступен |

---

## 4. Error Codes

### Общие коды

```typescript
// libs/common/src/errors/error-codes.ts
export const ErrorCodes = {
  // General
  INTERNAL_ERROR: 'INTERNAL_ERROR',
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  NOT_FOUND: 'NOT_FOUND',
  CONFLICT: 'CONFLICT',
  
  // Auth
  UNAUTHORIZED: 'UNAUTHORIZED',
  FORBIDDEN: 'FORBIDDEN',
  TOKEN_EXPIRED: 'TOKEN_EXPIRED',
  TOKEN_INVALID: 'TOKEN_INVALID',
  INVALID_CREDENTIALS: 'INVALID_CREDENTIALS',
  
  // Player
  PLAYER_NOT_FOUND: 'PLAYER_NOT_FOUND',
  PLAYER_ALREADY_EXISTS: 'PLAYER_ALREADY_EXISTS',
  CHARACTER_NOT_FOUND: 'CHARACTER_NOT_FOUND',
  
  // Building
  BUILDING_NOT_FOUND: 'BUILDING_NOT_FOUND',
  BUILDING_MAX_LEVEL: 'BUILDING_MAX_LEVEL',
  INSUFFICIENT_RESOURCES: 'INSUFFICIENT_RESOURCES',
  UPGRADE_IN_PROGRESS: 'UPGRADE_IN_PROGRESS',
  
  // Combat
  TROPHY_NOT_FOUND: 'TROPHY_NOT_FOUND',
  ACHIEVEMENT_NOT_FOUND: 'ACHIEVEMENT_NOT_FOUND',
  ITEM_ALREADY_UNLOCKED: 'ITEM_ALREADY_UNLOCKED',
  INSUFFICIENT_TROPHIES: 'INSUFFICIENT_TROPHIES',
  
  // Match
  MATCH_NOT_FOUND: 'MATCH_NOT_FOUND',
  MATCH_ALREADY_STARTED: 'MATCH_ALREADY_STARTED',
  MATCH_FULL: 'MATCH_FULL',
  
  // Rate Limiting
  RATE_LIMIT_EXCEEDED: 'RATE_LIMIT_EXCEEDED',
  
  // External Services
  DATABASE_ERROR: 'DATABASE_ERROR',
  NATS_ERROR: 'NATS_ERROR',
  REDIS_ERROR: 'REDIS_ERROR',
} as const;

export type ErrorCode = typeof ErrorCodes[keyof typeof ErrorCodes];
```

---

## 5. Exception Classes

### Base Exception

```typescript
// libs/common/src/errors/base.exception.ts
import { HttpException, HttpStatus } from '@nestjs/common';
import { ErrorCode } from './error-codes';

export interface ProblemDetailsOptions {
  type?: string;
  title?: string;
  status: HttpStatus;
  detail: string;
  code: ErrorCode;
  errors?: Record<string, string[]>;
}

export class BaseException extends HttpException {
  public readonly code: ErrorCode;
  public readonly type: string;
  public readonly title: string;
  public readonly errors?: Record<string, string[]>;

  constructor(options: ProblemDetailsOptions) {
    const response = {
      type: options.type || `/errors/${options.code.toLowerCase().replace(/_/g, '-')}`,
      title: options.title || BaseException.getDefaultTitle(options.status),
      status: options.status,
      detail: options.detail,
      code: options.code,
      errors: options.errors,
    };

    super(response, options.status);
    
    this.code = options.code;
    this.type = response.type;
    this.title = response.title;
    this.errors = options.errors;
  }

  private static getDefaultTitle(status: HttpStatus): string {
    const titles: Record<number, string> = {
      400: 'Bad Request',
      401: 'Unauthorized',
      403: 'Forbidden',
      404: 'Not Found',
      409: 'Conflict',
      422: 'Validation Failed',
      429: 'Too Many Requests',
      500: 'Internal Server Error',
      503: 'Service Unavailable',
    };
    return titles[status] || 'Error';
  }
}
```

### Specific Exceptions

```typescript
// libs/common/src/errors/exceptions.ts
import { HttpStatus } from '@nestjs/common';
import { BaseException } from './base.exception';
import { ErrorCodes, ErrorCode } from './error-codes';

// 400 Bad Request
export class BadRequestException extends BaseException {
  constructor(detail: string, code: ErrorCode = ErrorCodes.VALIDATION_ERROR) {
    super({
      status: HttpStatus.BAD_REQUEST,
      detail,
      code,
    });
  }
}

// 401 Unauthorized
export class UnauthorizedException extends BaseException {
  constructor(detail: string = 'Authentication required', code: ErrorCode = ErrorCodes.UNAUTHORIZED) {
    super({
      status: HttpStatus.UNAUTHORIZED,
      detail,
      code,
    });
  }
}

// 403 Forbidden
export class ForbiddenException extends BaseException {
  constructor(detail: string = 'Access denied', code: ErrorCode = ErrorCodes.FORBIDDEN) {
    super({
      status: HttpStatus.FORBIDDEN,
      detail,
      code,
    });
  }
}

// 404 Not Found
export class NotFoundException extends BaseException {
  constructor(resource: string, id?: string, code?: ErrorCode) {
    const detail = id 
      ? `${resource} with id '${id}' not found`
      : `${resource} not found`;
    
    super({
      status: HttpStatus.NOT_FOUND,
      detail,
      code: code || ErrorCodes.NOT_FOUND,
    });
  }
}

// 409 Conflict
export class ConflictException extends BaseException {
  constructor(detail: string, code: ErrorCode = ErrorCodes.CONFLICT) {
    super({
      status: HttpStatus.CONFLICT,
      detail,
      code,
    });
  }
}

// 422 Validation Error
export class ValidationException extends BaseException {
  constructor(errors: Record<string, string[]>) {
    super({
      status: HttpStatus.UNPROCESSABLE_ENTITY,
      detail: 'Request validation failed',
      code: ErrorCodes.VALIDATION_ERROR,
      errors,
    });
  }
}

// 429 Rate Limit
export class RateLimitException extends BaseException {
  constructor(retryAfter?: number) {
    super({
      status: HttpStatus.TOO_MANY_REQUESTS,
      detail: retryAfter 
        ? `Rate limit exceeded. Retry after ${retryAfter} seconds`
        : 'Rate limit exceeded',
      code: ErrorCodes.RATE_LIMIT_EXCEEDED,
    });
  }
}

// 500 Internal Error
export class InternalException extends BaseException {
  constructor(detail: string = 'An unexpected error occurred') {
    super({
      status: HttpStatus.INTERNAL_SERVER_ERROR,
      detail,
      code: ErrorCodes.INTERNAL_ERROR,
    });
  }
}

// 503 Service Unavailable
export class ServiceUnavailableException extends BaseException {
  constructor(service: string) {
    super({
      status: HttpStatus.SERVICE_UNAVAILABLE,
      detail: `${service} is temporarily unavailable`,
      code: ErrorCodes.INTERNAL_ERROR,
    });
  }
}
```

### Domain-Specific Exceptions

```typescript
// libs/common/src/errors/domain.exceptions.ts
import { HttpStatus } from '@nestjs/common';
import { BaseException } from './base.exception';
import { ErrorCodes } from './error-codes';

// Player
export class PlayerNotFoundException extends BaseException {
  constructor(playerId: string) {
    super({
      status: HttpStatus.NOT_FOUND,
      detail: `Player with id '${playerId}' not found`,
      code: ErrorCodes.PLAYER_NOT_FOUND,
    });
  }
}

export class PlayerAlreadyExistsException extends BaseException {
  constructor(identifier: string) {
    super({
      status: HttpStatus.CONFLICT,
      detail: `Player with email or username '${identifier}' already exists`,
      code: ErrorCodes.PLAYER_ALREADY_EXISTS,
    });
  }
}

// Building
export class BuildingNotFoundException extends BaseException {
  constructor(buildingId: string) {
    super({
      status: HttpStatus.NOT_FOUND,
      detail: `Building with id '${buildingId}' not found`,
      code: ErrorCodes.BUILDING_NOT_FOUND,
    });
  }
}

export class BuildingMaxLevelException extends BaseException {
  constructor(buildingId: string, currentLevel: number) {
    super({
      status: HttpStatus.BAD_REQUEST,
      detail: `Building '${buildingId}' is already at max level (${currentLevel})`,
      code: ErrorCodes.BUILDING_MAX_LEVEL,
    });
  }
}

export class InsufficientResourcesException extends BaseException {
  constructor(resource: string, required: number, available: number) {
    super({
      status: HttpStatus.BAD_REQUEST,
      detail: `Insufficient ${resource}: required ${required}, available ${available}`,
      code: ErrorCodes.INSUFFICIENT_RESOURCES,
    });
  }
}

// Combat
export class InsufficientTrophiesException extends BaseException {
  constructor(trophyId: string, required: number, available: number) {
    super({
      status: HttpStatus.BAD_REQUEST,
      detail: `Insufficient trophies '${trophyId}': required ${required}, available ${available}`,
      code: ErrorCodes.INSUFFICIENT_TROPHIES,
    });
  }
}

export class ItemAlreadyUnlockedException extends BaseException {
  constructor(itemType: string, itemId: string) {
    super({
      status: HttpStatus.CONFLICT,
      detail: `${itemType} '${itemId}' is already unlocked`,
      code: ErrorCodes.ITEM_ALREADY_UNLOCKED,
    });
  }
}
```

---

## 6. Global Exception Filter

```typescript
// libs/common/src/filters/http-exception.filter.ts
import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { ConfigService } from '@nestjs/config';
import { BaseException } from '../errors/base.exception';
import { ErrorCodes } from '../errors/error-codes';

interface ProblemDetailsResponse {
  type: string;
  title: string;
  status: number;
  detail: string;
  instance: string;
  code: string;
  requestId: string;
  timestamp: string;
  errors?: Record<string, string[]>;
  stack?: string;
}

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);
  private readonly isDev: boolean;

  constructor(private configService: ConfigService) {
    this.isDev = configService.get('NODE_ENV') !== 'production';
  }

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const requestId = request.headers['x-request-id'] as string || this.generateRequestId();
    const timestamp = new Date().toISOString();

    let problemDetails: ProblemDetailsResponse;

    if (exception instanceof BaseException) {
      problemDetails = this.handleBaseException(exception, request, requestId, timestamp);
    } else if (exception instanceof HttpException) {
      problemDetails = this.handleHttpException(exception, request, requestId, timestamp);
    } else {
      problemDetails = this.handleUnknownException(exception as Error, request, requestId, timestamp);
    }

    // Логирование
    this.logError(problemDetails, exception);

    // Добавляем stack trace только в dev
    if (this.isDev && exception instanceof Error) {
      problemDetails.stack = exception.stack;
    }

    response
      .status(problemDetails.status)
      .header('Content-Type', 'application/problem+json')
      .header('X-Request-Id', requestId)
      .json(problemDetails);
  }

  private handleBaseException(
    exception: BaseException,
    request: Request,
    requestId: string,
    timestamp: string,
  ): ProblemDetailsResponse {
    const response = exception.getResponse() as any;

    return {
      type: response.type,
      title: response.title,
      status: response.status,
      detail: response.detail,
      instance: request.url,
      code: response.code,
      requestId,
      timestamp,
      errors: response.errors,
    };
  }

  private handleHttpException(
    exception: HttpException,
    request: Request,
    requestId: string,
    timestamp: string,
  ): ProblemDetailsResponse {
    const status = exception.getStatus();
    const response = exception.getResponse();
    
    let detail: string;
    let errors: Record<string, string[]> | undefined;

    if (typeof response === 'string') {
      detail = response;
    } else if (typeof response === 'object') {
      const res = response as any;
      detail = res.message || res.detail || 'An error occurred';
      
      // Handle class-validator errors
      if (Array.isArray(res.message)) {
        errors = this.transformValidationErrors(res.message);
        detail = 'Request validation failed';
      }
    } else {
      detail = 'An error occurred';
    }

    const code = this.getErrorCodeFromStatus(status);

    return {
      type: `/errors/${code.toLowerCase().replace(/_/g, '-')}`,
      title: this.getTitleFromStatus(status),
      status,
      detail,
      instance: request.url,
      code,
      requestId,
      timestamp,
      errors,
    };
  }

  private handleUnknownException(
    exception: Error,
    request: Request,
    requestId: string,
    timestamp: string,
  ): ProblemDetailsResponse {
    return {
      type: '/errors/internal',
      title: 'Internal Server Error',
      status: HttpStatus.INTERNAL_SERVER_ERROR,
      detail: this.isDev ? exception.message : 'An unexpected error occurred',
      instance: request.url,
      code: ErrorCodes.INTERNAL_ERROR,
      requestId,
      timestamp,
    };
  }

  private transformValidationErrors(messages: any[]): Record<string, string[]> {
    const errors: Record<string, string[]> = {};

    for (const msg of messages) {
      if (typeof msg === 'string') {
        // Simple string message
        if (!errors['_general']) errors['_general'] = [];
        errors['_general'].push(msg);
      } else if (msg.property && msg.constraints) {
        // class-validator error object
        if (!errors[msg.property]) errors[msg.property] = [];
        errors[msg.property].push(...Object.values(msg.constraints));
      }
    }

    return errors;
  }

  private getErrorCodeFromStatus(status: number): string {
    const codes: Record<number, string> = {
      400: ErrorCodes.VALIDATION_ERROR,
      401: ErrorCodes.UNAUTHORIZED,
      403: ErrorCodes.FORBIDDEN,
      404: ErrorCodes.NOT_FOUND,
      409: ErrorCodes.CONFLICT,
      422: ErrorCodes.VALIDATION_ERROR,
      429: ErrorCodes.RATE_LIMIT_EXCEEDED,
      500: ErrorCodes.INTERNAL_ERROR,
      503: ErrorCodes.INTERNAL_ERROR,
    };
    return codes[status] || ErrorCodes.INTERNAL_ERROR;
  }

  private getTitleFromStatus(status: number): string {
    const titles: Record<number, string> = {
      400: 'Bad Request',
      401: 'Unauthorized',
      403: 'Forbidden',
      404: 'Not Found',
      409: 'Conflict',
      422: 'Validation Failed',
      429: 'Too Many Requests',
      500: 'Internal Server Error',
      503: 'Service Unavailable',
    };
    return titles[status] || 'Error';
  }

  private generateRequestId(): string {
    return `req_${Date.now().toString(36)}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private logError(problemDetails: ProblemDetailsResponse, exception: unknown) {
    const logData = {
      requestId: problemDetails.requestId,
      status: problemDetails.status,
      code: problemDetails.code,
      detail: problemDetails.detail,
      instance: problemDetails.instance,
    };

    if (problemDetails.status >= 500) {
      this.logger.error(logData, exception instanceof Error ? exception.stack : undefined);
    } else if (problemDetails.status >= 400) {
      this.logger.warn(logData);
    }
  }
}
```

---

## 7. Validation Pipe с Swagger

```typescript
// libs/common/src/pipes/validation.pipe.ts
import {
  PipeTransform,
  Injectable,
  ArgumentMetadata,
  HttpStatus,
} from '@nestjs/common';
import { validate, ValidationError } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { ValidationException } from '../errors/exceptions';

@Injectable()
export class CustomValidationPipe implements PipeTransform<any> {
  async transform(value: any, { metatype }: ArgumentMetadata) {
    if (!metatype || !this.toValidate(metatype)) {
      return value;
    }

    const object = plainToInstance(metatype, value);
    const errors = await validate(object, {
      whitelist: true,
      forbidNonWhitelisted: true,
    });

    if (errors.length > 0) {
      const formattedErrors = this.formatErrors(errors);
      throw new ValidationException(formattedErrors);
    }

    return object;
  }

  private toValidate(metatype: Function): boolean {
    const types: Function[] = [String, Boolean, Number, Array, Object];
    return !types.includes(metatype);
  }

  private formatErrors(errors: ValidationError[]): Record<string, string[]> {
    const result: Record<string, string[]> = {};

    for (const error of errors) {
      const field = error.property;
      const messages = error.constraints
        ? Object.values(error.constraints)
        : ['Invalid value'];

      if (!result[field]) {
        result[field] = [];
      }
      result[field].push(...messages);

      // Handle nested errors
      if (error.children && error.children.length > 0) {
        const nestedErrors = this.formatErrors(error.children);
        for (const [nestedField, nestedMessages] of Object.entries(nestedErrors)) {
          const fullField = `${field}.${nestedField}`;
          result[fullField] = nestedMessages;
        }
      }
    }

    return result;
  }
}
```

### Swagger Schema для ошибок

```typescript
// libs/common/src/dto/problem-details.dto.ts
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ProblemDetailsDto {
  @ApiProperty({ example: '/errors/not-found' })
  type: string;

  @ApiProperty({ example: 'Not Found' })
  title: string;

  @ApiProperty({ example: 404 })
  status: number;

  @ApiProperty({ example: "Player with id '123' not found" })
  detail: string;

  @ApiProperty({ example: '/api/v1/players/123' })
  instance: string;

  @ApiProperty({ example: 'PLAYER_NOT_FOUND' })
  code: string;

  @ApiProperty({ example: 'req_abc123' })
  requestId: string;

  @ApiProperty({ example: '2026-02-11T10:30:00.000Z' })
  timestamp: string;

  @ApiPropertyOptional({
    example: {
      email: ['Invalid email format'],
      password: ['Password must be at least 8 characters'],
    },
  })
  errors?: Record<string, string[]>;
}

export class ValidationErrorDto extends ProblemDetailsDto {
  @ApiProperty({
    example: {
      email: ['Invalid email format', 'Email already exists'],
      password: ['Password must be at least 8 characters'],
    },
  })
  errors: Record<string, string[]>;
}
```

### Использование в Controller

```typescript
// apps/player-service/src/player/player.controller.ts
import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { ProblemDetailsDto, ValidationErrorDto } from '@app/common';
import { CreatePlayerDto, PlayerResponseDto } from './dto';

@ApiTags('players')
@ApiBearerAuth()
@Controller('players')
export class PlayerController {
  @Post()
  @ApiOperation({ summary: 'Create a new player' })
  @ApiResponse({ status: 201, type: PlayerResponseDto })
  @ApiResponse({ status: 422, type: ValidationErrorDto, description: 'Validation failed' })
  @ApiResponse({ status: 409, type: ProblemDetailsDto, description: 'Player already exists' })
  async create(@Body() dto: CreatePlayerDto): Promise<PlayerResponseDto> {
    // ...
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get player by ID' })
  @ApiResponse({ status: 200, type: PlayerResponseDto })
  @ApiResponse({ status: 404, type: ProblemDetailsDto, description: 'Player not found' })
  async findOne(@Param('id') id: string): Promise<PlayerResponseDto> {
    // ...
  }
}
```

---

## 8. Request ID Middleware

```typescript
// libs/common/src/middleware/request-id.middleware.ts
import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class RequestIdMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    const requestId = req.headers['x-request-id'] as string || `req_${uuidv4().replace(/-/g, '').slice(0, 16)}`;
    
    req.headers['x-request-id'] = requestId;
    res.setHeader('X-Request-Id', requestId);
    
    next();
  }
}
```

### Регистрация

```typescript
// apps/swagger-aggregator/src/app.module.ts
import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { RequestIdMiddleware } from '@app/common';

@Module({})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(RequestIdMiddleware).forRoutes('*');
  }
}
```

---

## 9. Использование в сервисах

```typescript
// apps/building-service/src/building/building.service.ts
import { Injectable } from '@nestjs/common';
import {
  BuildingNotFoundException,
  BuildingMaxLevelException,
  InsufficientResourcesException,
} from '@app/common';

@Injectable()
export class BuildingService {
  async upgrade(characterId: string, buildingId: string) {
    const building = await this.buildingRepo.findOne(buildingId);
    
    if (!building) {
      throw new BuildingNotFoundException(buildingId);
    }

    if (building.level >= building.maxLevel) {
      throw new BuildingMaxLevelException(buildingId, building.level);
    }

    const cost = this.calculateUpgradeCost(building);
    const resources = await this.resourceService.getResources(characterId);

    if (resources.cash < cost.cash) {
      throw new InsufficientResourcesException('cash', cost.cash, resources.cash);
    }

    // ... upgrade logic
  }
}
```

---

## 10. NATS Error Handling

```typescript
// libs/common/src/filters/nats-exception.filter.ts
import { Catch, RpcExceptionFilter, ArgumentsHost } from '@nestjs/common';
import { Observable, throwError } from 'rxjs';
import { BaseException } from '../errors/base.exception';
import { ErrorCodes } from '../errors/error-codes';

@Catch()
export class NatsExceptionFilter implements RpcExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost): Observable<any> {
    const timestamp = new Date().toISOString();

    if (exception instanceof BaseException) {
      const response = exception.getResponse() as any;
      return throwError(() => ({
        ...response,
        timestamp,
      }));
    }

    // Unknown error
    const message = exception instanceof Error ? exception.message : 'Unknown error';
    
    return throwError(() => ({
      type: '/errors/internal',
      title: 'Internal Server Error',
      status: 500,
      detail: message,
      code: ErrorCodes.INTERNAL_ERROR,
      timestamp,
    }));
  }
}
```

---

## 11. Exports

```typescript
// libs/common/src/index.ts
// Errors
export * from './errors/error-codes';
export * from './errors/base.exception';
export * from './errors/exceptions';
export * from './errors/domain.exceptions';

// Filters
export * from './filters/http-exception.filter';
export * from './filters/nats-exception.filter';

// Pipes
export * from './pipes/validation.pipe';

// Middleware
export * from './middleware/request-id.middleware';

// DTOs
export * from './dto/problem-details.dto';
```

---

## 12. Checklist

- [x] RFC 7807 Problem Details формат
- [x] Плоские коды ошибок
- [x] Строгие HTTP статусы
- [x] Stack trace только в dev
- [x] Validation errors как объект
- [x] Request ID в каждом ответе
- [x] Content-Type: application/problem+json
- [x] Swagger аннотации для ошибок
- [x] NATS error handling
- [x] Domain-specific exceptions
