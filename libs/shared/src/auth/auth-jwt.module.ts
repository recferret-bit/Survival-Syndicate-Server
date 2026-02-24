import { Module } from '@nestjs/common';
import { EnvModule } from '@lib/shared/application';
import { RedisModule } from '@lib/shared/redis';
import { AuthJwtService } from './auth-jwt.service';
import { AuthJwtGuard } from './auth-jwt.guard';

@Module({
  imports: [EnvModule.forRoot(), RedisModule],
  providers: [AuthJwtService, AuthJwtGuard],
  exports: [AuthJwtService, AuthJwtGuard],
})
export class AuthJwtModule {}
