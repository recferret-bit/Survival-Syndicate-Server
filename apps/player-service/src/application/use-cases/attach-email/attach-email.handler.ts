import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import {
  BadRequestException,
  ConflictException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { AttachEmailCommand } from './attach-email.command';
import { AttachEmailResponseDto } from './attach-email.dto';
import { UserPortRepository } from '@app/users/application/ports/user.port.repository';
import { stringToBigNumber } from '@lib/shared';

@CommandHandler(AttachEmailCommand)
export class AttachEmailHandler implements ICommandHandler<AttachEmailCommand> {
  private readonly logger = new Logger(AttachEmailHandler.name);

  constructor(private readonly userRepository: UserPortRepository) {}

  async execute(command: AttachEmailCommand): Promise<AttachEmailResponseDto> {
    const { userId, request } = command;
    this.logger.log(`Attaching email for user: ${userId}`);

    // Convert string userId to BigNumber, then to number for repository
    const userIdBigNumber = stringToBigNumber(userId);
    const userIdNumber = userIdBigNumber.toNumber();

    // Find user
    const user = await this.userRepository.findById(userIdNumber);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Check if user already has email
    if (user.email) {
      throw new BadRequestException('User already has an email address');
    }

    // Check if email is already taken by another user
    const existingUser = await this.userRepository.findByEmail(request.email);
    if (existingUser) {
      throw new ConflictException('Email is already taken by another user');
    }

    // Update user with email
    const updatedUser = await this.userRepository.update(userIdNumber, {
      email: request.email,
    });

    this.logger.log(`Email attached successfully for user: ${userId}`);

    return {
      message: 'Email attached successfully',
      email: updatedUser.email!,
    };
  }
}
