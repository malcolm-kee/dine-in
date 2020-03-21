import { REDIS_URL } from '@app/const';
import { RestaurantDataModule } from '@app/restaurant-data';
import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ClientProxyFactory, Transport } from '@nestjs/microservices';
import { QueueController } from './queue.controller';
import { EVENT_HUB } from './queue.type';

@Module({
  imports: [RestaurantDataModule],
  controllers: [QueueController],
  providers: [
    {
      provide: EVENT_HUB,
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const redisUrl = configService.get<string>(REDIS_URL);
        return ClientProxyFactory.create({
          transport: Transport.REDIS,
          options: {
            url: redisUrl,
          },
        });
      },
    },
  ],
})
export class QueueModule {}
