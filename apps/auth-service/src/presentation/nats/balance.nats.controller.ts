import { Controller, Logger } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { NonDurable } from '@lib/shared/nats';
import { ZodError } from 'zod';
import {
  BuildingSubjects,
  CreateUserBalanceRequestSchema,
  CreateUserBalanceResponseSchema,
  AddBalanceEntryRequestSchema,
  AddBalanceEntryResponseSchema,
  GetUserBalanceRequestSchema,
  GetUserBalanceResponseSchema,
} from '@lib/lib-building';
import type {
  CreateUserBalanceRequest,
  CreateUserBalanceResponse,
  AddBalanceEntryRequest,
  AddBalanceEntryResponse,
  GetUserBalanceRequest,
  GetUserBalanceResponse,
} from '@lib/lib-building';
import { CreateUserBalanceCommand } from '@app/auth-service/application/use-cases/create-user-balance/create-user-balance.command';
import { CreateUserBalanceRequestDto } from '@app/auth-service/application/use-cases/create-user-balance/create-user-balance.dto';
import { AddBalanceEntryCommand } from '@app/auth-service/application/use-cases/add-balance-entry/add-balance-entry.command';
import { AddBalanceEntryRequestDto } from '@app/auth-service/application/use-cases/add-balance-entry/add-balance-entry.dto';
import { GetUserBalanceQuery } from '@app/auth-service/application/use-cases/get-user-balance/get-user-balance.query';
import { CurrencyType } from '@app/auth-service/domain/value-objects/currency-type';
import { OperationType } from '@app/auth-service/domain/value-objects/operation-type';
import { OperationStatus } from '@app/auth-service/domain/value-objects/operation-status';
import { LedgerReason } from '@app/auth-service/domain/value-objects/ledger-reason';

@Controller()
export class BalanceNatsController {
  private readonly logger = new Logger(BalanceNatsController.name);

  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @MessagePattern(BuildingSubjects.CREATE_USER_BALANCE)
  @NonDurable()
  async handleCreateUserBalance(
    @Payload() data: CreateUserBalanceRequest,
  ): Promise<CreateUserBalanceResponse> {
    try {
      // Validate request with zod schema
      const validatedRequest = CreateUserBalanceRequestSchema.parse(data);

      this.logger.log(
        `NATS request: create user balance for userId: ${validatedRequest.userId}`,
      );

      // Convert to internal DTO for command
      // Both library schema and local DTO use string for userId
      const commandData: CreateUserBalanceRequestDto = {
        userId: validatedRequest.userId,
        currencyIsoCodes: validatedRequest.currencyIsoCodes,
      };

      const result = await this.commandBus.execute(
        new CreateUserBalanceCommand(commandData),
      );

      // Validate and return response
      // userId is already a string (both local DTO and library schema use string)
      return CreateUserBalanceResponseSchema.parse(result);
    } catch (error) {
      if (error instanceof ZodError) {
        this.logger.error(
          `Error handling create user balance request: ${JSON.stringify(error.issues)}`,
        );
      } else {
        this.logger.error(
          `Error handling create user balance request: ${error.message}`,
          error.stack,
        );
      }
      // Re-throw the error so NestJS can handle it properly
      throw error;
    }
  }

  @MessagePattern(BuildingSubjects.ADD_BALANCE_ENTRY)
  @NonDurable()
  async handleAddBalanceEntry(
    @Payload() data: AddBalanceEntryRequest,
  ): Promise<AddBalanceEntryResponse> {
    try {
      // Validate request with zod schema
      const validatedRequest = AddBalanceEntryRequestSchema.parse(data);

      this.logger.log(
        `NATS request: add balance entry for userId: ${validatedRequest.userId}, operationId: ${validatedRequest.operationId}`,
      );

      // Convert to internal DTO for command
      // Map lowercase schema values (matching Prisma) to enum types
      // Since Zod validates the input, these values are guaranteed to exist in the enums
      // Convert userId from number (library schema) to string (local DTO)
      const commandData: AddBalanceEntryRequestDto = {
        userId: validatedRequest.userId.toString(),
        operationId: validatedRequest.operationId,
        currencyType: Object.values(CurrencyType).find(
          (v) => v === validatedRequest.currencyType,
        )! as CurrencyType,
        amount: validatedRequest.amount,
        operationType: Object.values(OperationType).find(
          (v) => v === validatedRequest.operationType,
        )! as OperationType,
        operationStatus: Object.values(OperationStatus).find(
          (v) => v === validatedRequest.operationStatus,
        )! as OperationStatus,
        reason: Object.values(LedgerReason).find(
          (v) => v === validatedRequest.reason,
        )! as LedgerReason,
      };

      const result = await this.commandBus.execute(
        new AddBalanceEntryCommand(commandData),
      );

      // Validate and return response
      return AddBalanceEntryResponseSchema.parse(result);
    } catch (error) {
      if (error instanceof ZodError) {
        this.logger.error(
          `Error handling add balance entry request: ${JSON.stringify(error.issues)}`,
        );
      } else {
        this.logger.error(
          `Error handling add balance entry request: ${error.message}`,
          error.stack,
        );
      }
      // Re-throw the error so NestJS can handle it properly
      throw error;
    }
  }

  @MessagePattern(BuildingSubjects.GET_USER_BALANCE)
  @NonDurable()
  async handleGetUserBalance(
    @Payload() data: GetUserBalanceRequest,
  ): Promise<GetUserBalanceResponse> {
    try {
      // Validate request with zod schema
      const validatedRequest = GetUserBalanceRequestSchema.parse(data);

      this.logger.log(
        `NATS request: get user balance for userId: ${validatedRequest.userId}`,
      );

      // Call query handler
      const result = await this.queryBus.execute(
        new GetUserBalanceQuery({
          userId: validatedRequest.userId,
        }),
      );

      // Validate and return response
      return GetUserBalanceResponseSchema.parse(result);
    } catch (error) {
      if (error instanceof ZodError) {
        this.logger.error(
          `Error handling get user balance request: ${JSON.stringify(error.issues)}`,
        );
      } else {
        this.logger.error(
          `Error handling get user balance request: ${error.message}`,
          error.stack,
        );
      }
      // Re-throw the error so NestJS can handle it properly
      throw error;
    }
  }
}
