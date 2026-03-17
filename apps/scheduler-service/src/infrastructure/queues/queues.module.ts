import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { ConfigModule, ConfigService } from '@nestjs/config';

function parseRedisConnection(url: string): { host: string; port: number } {
  try {
    const u = new URL(url);
    return {
      host: u.hostname,
      port: parseInt(u.port || '6379', 10),
    };
  } catch {
    return { host: 'localhost', port: 6379 };
  }
}

@Module({
  imports: [
    BullModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (config: ConfigService) => {
        const redisUrl =
          config.get<string>('REDIS_URL') || 'redis://localhost:6379';
        const { host, port } = parseRedisConnection(redisUrl);
        return {
          connection: { host, port },
        };
      },
      inject: [ConfigService],
    }),
    BullModule.registerQueue(
      { name: 'passive-income' },
      { name: 'job-reset' },
      { name: 'shop-rotation' },
      { name: 'leaderboard' },
    ),
  ],
  exports: [BullModule],
})
export class QueuesModule {}
