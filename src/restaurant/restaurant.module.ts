import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { RESTAURANT_CONNECTION_NAME } from 'src/app.type';
import { RestaurantSchema } from './restaurant.schema';
import { RestaurantService } from './restaurant.service';
import { RESTAURANT_SCHEMA_NAME } from './restaurant.type';

@Module({
  imports: [
    MongooseModule.forFeature(
      [
        {
          name: RESTAURANT_SCHEMA_NAME,
          schema: RestaurantSchema,
        },
      ],
      RESTAURANT_CONNECTION_NAME,
    ),
  ],
  providers: [RestaurantService],
  exports: [RestaurantService],
})
export class RestaurantModule {}
