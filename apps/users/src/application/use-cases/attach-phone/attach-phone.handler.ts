import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import {
  BadRequestException,
  ConflictException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { AttachPhoneCommand } from './attach-phone.command';
import { AttachPhoneResponseDto } from './attach-phone.dto';
import { UserPortRepository } from '@app/users/application/ports/user.port.repository';
import { stringToBigNumber } from '@lib/shared';

@CommandHandler(AttachPhoneCommand)
export class AttachPhoneHandler implements ICommandHandler<AttachPhoneCommand> {
  private readonly logger = new Logger(AttachPhoneHandler.name);

  constructor(private readonly userRepository: UserPortRepository) {}

  async execute(command: AttachPhoneCommand): Promise<AttachPhoneResponseDto> {
    const { userId, request } = command;
    this.logger.log(`Attaching phone for user: ${userId}`);

    // Convert string userId to BigNumber, then to number for repository
    const userIdBigNumber = stringToBigNumber(userId);
    const userIdNumber = userIdBigNumber.toNumber();

    // Find user
    const user = await this.userRepository.findById(userIdNumber);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Check if user already has phone
    if (user.phone) {
      throw new BadRequestException('User already has a phone number');
    }

    // Check if phone is already taken by another user
    const existingUser = await this.userRepository.findByPhone(request.phone);
    if (existingUser) {
      throw new ConflictException('Phone is already taken by another user');
    }

    // Update user with phone
    const updatedUser = await this.userRepository.update(userIdNumber, {
      phone: request.phone,
    });

    this.logger.log(`Phone attached successfully for user: ${userId}`);

    return {
      message: 'Phone attached successfully',
      phone: updatedUser.phone!,
    };
  }
}
