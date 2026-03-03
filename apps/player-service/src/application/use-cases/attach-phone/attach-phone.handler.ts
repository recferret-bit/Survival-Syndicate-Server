import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Logger } from '@nestjs/common';
import { AttachPhoneCommand } from './attach-phone.command';
import { AttachPhoneResponseDto } from './attach-phone.dto';
import { UserPortRepository } from '@app/player-service/application/ports/user.port.repository';
import { stringToBigNumber } from '@lib/shared';
import {
  HttpAlreadyExistsException,
  HttpInvalidArgumentException,
  HttpNotFoundException,
} from '@lib/shared/application';

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
      throw new HttpNotFoundException('User not found');
    }

    // Check if user already has phone
    if (user.phone) {
      throw new HttpInvalidArgumentException('User already has a phone number');
    }

    // Check if phone is already taken by another user
    const existingUser = await this.userRepository.findByPhone(request.phone);
    if (existingUser) {
      throw new HttpAlreadyExistsException(
        'Phone is already taken by another user',
      );
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
