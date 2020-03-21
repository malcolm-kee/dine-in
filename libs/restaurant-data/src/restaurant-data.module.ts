import { REDIS_URL, RESTAURANT_CONNECTION_NAME } from '@app/const';
import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ClientProxyFactory, Transport } from '@nestjs/microservices';
import { MongooseModule } from '@nestjs/mongoose';
import { ReservationSchema, RestaurantSchema } from './restaurant-data.schema';
import { RestaurantDataService } from './restaurant-data.service';
import {
  EVENT_HUB,
  RESERVATION_SCHEMA_NAME,
  RESTAURANT_SCHEMA_NAME,
} from './restaurant-data.type';
import { RestaurantReservationService } from './restaurant-reservation.service';

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
        const redisUrl = configService.get<string>(REDIS_URL);
        return ClientProxyFactory.create({
          transport: Transport.REDIS,
          options: {
            url: redisUrl,
          },
        });
      },
    },
    RestaurantDataService,
    RestaurantReservationService,
  ],
  exports: [RestaurantDataService, RestaurantReservationService],
})
export class RestaurantDataModule {}
