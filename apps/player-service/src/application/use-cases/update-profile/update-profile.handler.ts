import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Logger, NotFoundException } from '@nestjs/common';
import { UpdateProfileCommand } from './update-profile.command';
import { UpdateProfileResponseDto } from './update-profile.dto';
import { UserPortRepository } from '@app/player-service/application/ports/user.port.repository';
import { stringToBigNumber } from '@lib/shared';

@CommandHandler(UpdateProfileCommand)
export class UpdateProfileHandler
  implements ICommandHandler<UpdateProfileCommand>
{
  private readonly logger = new Logger(UpdateProfileHandler.name);

  constructor(private readonly userRepository: UserPortRepository) {}

  async execute(
    command: UpdateProfileCommand,
  ): Promise<UpdateProfileResponseDto> {
    const { userId, request } = command;
    this.logger.log(`Updating profile for user: ${userId}`);

    // Convert string userId to BigNumber, then to number for repository
    const userIdBigNumber = stringToBigNumber(userId);
    const userIdNumber = userIdBigNumber.toNumber();

    // Find user
    const user = await this.userRepository.findById(userIdNumber);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Prepare update data
    const updateData: {
      name?: string;
      birthday?: Date;
    } = {};

    if (request.name !== undefined) {
      updateData.name = request.name;
    }

    if (request.birthday !== undefined) {
      updateData.birthday = new Date(request.birthday);
    }

    // Update user
    const updatedUser = await this.userRepository.update(
      userIdNumber,
      updateData,
    );

    this.logger.log(`Profile updated successfully for user: ${userId}`);

    return {
      name: updatedUser.name,
      birthday: updatedUser.birthday?.toISOString(),
    };
  }
}
