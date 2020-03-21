import { RestaurantDataModule } from '@app/restaurant-data';
import { Module } from '@nestjs/common';
import { OwnerController } from './owner.controller';
import { OwnerService } from './owner.service';

@Module({
  imports: [RestaurantDataModule],
  controllers: [OwnerController],
  providers: [OwnerService],
})
export class OwnerModule {}
