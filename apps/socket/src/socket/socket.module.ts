import { REDIS_URL } from '@app/const';
import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ClientProxyFactory, Transport } from '@nestjs/microservices';
import { SocketController } from './socket.controller';
import { SocketGateway } from './socket.gateway';
import { EVENT_HUB } from './socket.type';

@Module({
  providers: [
    SocketGateway,
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
  controllers: [SocketController],
})
export class SocketModule {}
