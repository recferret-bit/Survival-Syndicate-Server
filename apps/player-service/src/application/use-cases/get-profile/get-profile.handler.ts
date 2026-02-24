import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { Logger, NotFoundException } from '@nestjs/common';
import { GetProfileQuery } from './get-profile.query';
import { GetProfileResponseDto } from './get-profile.dto';
import { UserPortRepository } from '@app/users/application/ports/user.port.repository';
import { stringToBigNumber } from '@lib/shared';

@QueryHandler(GetProfileQuery)
export class GetProfileHandler implements IQueryHandler<GetProfileQuery> {
  private readonly logger = new Logger(GetProfileHandler.name);

  constructor(private readonly userRepository: UserPortRepository) {}

  async execute(query: GetProfileQuery): Promise<GetProfileResponseDto> {
    const { userId } = query;
    this.logger.log(`Getting profile for user: ${userId}`);

    // Convert string userId to BigNumber, then to number for repository
    const userIdBigNumber = stringToBigNumber(userId);
    const userIdNumber = userIdBigNumber.toNumber();

    const user = await this.userRepository.findById(userIdNumber);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    return {
      id: user.id.toString(),
      email: user.email,
      phone: user.phone,
      name: user.name,
      country: user.country,
      birthday: user.birthday?.toISOString(),
      languageIsoCode: user.languageIsoCode,
      currencyIsoCode: user.currencyIsoCode,
    };
  }
}
