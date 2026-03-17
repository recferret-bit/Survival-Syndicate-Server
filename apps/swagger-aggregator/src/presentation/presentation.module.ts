import { Module } from '@nestjs/common';
import { EnvModule } from '@lib/shared';
import { SwaggerAggregatorHttpController } from './http/swagger-aggregator.http.controller';

@Module({
  imports: [EnvModule.forRoot(undefined, true)],
  controllers: [SwaggerAggregatorHttpController],
})
export class PresentationModule {}
