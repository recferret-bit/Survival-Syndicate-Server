import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { Logger, NotFoundException } from '@nestjs/common';
import { GetUserByIdQuery } from './get-user-by-id.query';
import { GetUserByIdResponseDto } from './get-user-by-id.dto';
import { UserPortRepository } from '@app/users/application/ports/user.port.repository';
import { stringToBigNumber } from '@lib/shared';

@QueryHandler(GetUserByIdQuery)
export class GetUserByIdHandler implements IQueryHandler<GetUserByIdQuery> {
  private readonly logger = new Logger(GetUserByIdHandler.name);

  constructor(private readonly userRepository: UserPortRepository) {}

  async execute(query: GetUserByIdQuery): Promise<GetUserByIdResponseDto> {
    const { userId } = query;
    this.logger.log(`Getting user by ID: ${userId}`);

    // Convert string userId to BigNumber, then to number for repository
    const userIdBigNumber = stringToBigNumber(userId);
    const userIdNumber = userIdBigNumber.toNumber();

    const user = await this.userRepository.findById(userIdNumber);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    return {
      userId: user.id.toString(),
      userEmail: user.email,
      phone: user.phone,
      isTest: user.isTest,
      banned: user.banned,
      country: user.country ?? '',
      currencyIsoCode: user.currencyIsoCode,
    };
  }
}
