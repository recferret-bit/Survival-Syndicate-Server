import { Module } from '@nestjs/common';
import { EnvModule } from '@lib/shared/application';

@Module({
  imports: [EnvModule.forRoot()],
  exports: [EnvModule],
})
export class InfrastructureModule {}
