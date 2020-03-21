import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ClientProxyFactory, Transport } from '@nestjs/microservices';
import { MongooseModule } from '@nestjs/mongoose';
import { RESTAURANT_CONNECTION_NAME } from 'src/app.type';
import { RestaurantReservationService } from './restaurant-reservation.service';
import { ReservationSchema, RestaurantSchema } from './restaurant.schema';
import { RestaurantService } from './restaurant.service';
import {
  EVENT_HUB,
  RESERVATION_SCHEMA_NAME,
  RESTAURANT_SCHEMA_NAME,
} from './restaurant.type';

@Module({
  imports: [
    MongooseModule.forFeature(
      [
        {
          name: RESTAURANT_SCHEMA_NAME,
          schema: RestaurantSchema,
        },
        {
          name: RESERVATION_SCHEMA_NAME,
          schema: ReservationSchema,
        },
      ],
      RESTAURANT_CONNECTION_NAME,
    ),
  ],
  providers: [
    {
      provide: EVENT_HUB,
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const redisUrl = configService.get<string>('REDIS_URL');
        return ClientProxyFactory.create({
          transport: Transport.REDIS,
          options: {
            url: redisUrl,
          },
        });
      },
    },
    RestaurantService,
    RestaurantReservationService,
  ],
  exports: [RestaurantService, RestaurantReservationService],
})
export class RestaurantModule {}
