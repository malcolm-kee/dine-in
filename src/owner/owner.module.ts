import { Module } from '@nestjs/common';
import { RestaurantModule } from 'src/restaurant/restaurant.module';
import { OwnerController } from './owner.controller';
import { OwnerService } from './owner.service';

@Module({
  imports: [RestaurantModule],
  controllers: [OwnerController],
  providers: [OwnerService],
})
export class OwnerModule {}
