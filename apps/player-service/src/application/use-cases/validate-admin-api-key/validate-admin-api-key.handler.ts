import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { Logger } from '@nestjs/common';
import { ValidateAdminApiKeyQuery } from './validate-admin-api-key.query';
import { ValidateAdminApiKeyResponseDto } from './validate-admin-api-key.dto';
import { AdminPortRepository } from '@app/users/application/ports/admin.port.repository';

@QueryHandler(ValidateAdminApiKeyQuery)
export class ValidateAdminApiKeyHandler
  implements IQueryHandler<ValidateAdminApiKeyQuery>
{
  private readonly logger = new Logger(ValidateAdminApiKeyHandler.name);

  constructor(private readonly adminRepository: AdminPortRepository) {}

  async execute(
    query: ValidateAdminApiKeyQuery,
  ): Promise<ValidateAdminApiKeyResponseDto> {
    const { apiKey } = query;
    this.logger.log('Validating admin API key');

    const admin = await this.adminRepository.findByApiKey(apiKey);

    if (!admin) {
      this.logger.warn('Admin API key not found');
      return {
        valid: false,
        reason: 'not_found',
      };
    }

    if (!admin.isActive()) {
      this.logger.warn(`Admin account is inactive: ${admin.email}`);
      return {
        valid: false,
        adminId: admin.id.toString(),
        email: admin.email,
        reason: 'inactive',
      };
    }

    this.logger.log(`Admin API key validated successfully: ${admin.email}`);
    return {
      valid: true,
      adminId: admin.id.toString(),
      email: admin.email,
    };
  }
}
