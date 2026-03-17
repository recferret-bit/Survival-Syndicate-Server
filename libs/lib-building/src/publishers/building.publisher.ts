import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { BasePublisher } from '@lib/shared/nats';
import {
  GetBuildingsRequest,
  GetBuildingsRequestSchema,
  GetBuildingsResponse,
  GetBuildingsResponseSchema,
  BuildingSubjects,
} from '../schemas/building.schemas';

@Injectable()
export class BuildingPublisher extends BasePublisher {
  constructor(
    @Inject('NATS_CLIENT') durableClient: ClientProxy,
    @Inject('NATS_CLIENT_NON_DURABLE') nonDurableClient: ClientProxy,
  ) {
    super(durableClient, nonDurableClient, BuildingPublisher.name);
  }

  /**
   * Get buildings for character
   */
  async getBuildings(dto: GetBuildingsRequest): Promise<GetBuildingsResponse> {
    return this.sendNonDurable(
      BuildingSubjects.GET_BUILDINGS,
      dto,
      GetBuildingsRequestSchema,
      GetBuildingsResponseSchema,
    );
  }
}
