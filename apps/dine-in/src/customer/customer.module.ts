import { RestaurantDataModule } from '@app/restaurant-data';
import { Module } from '@nestjs/common';
import { CustomerController } from './customer.controller';
import { CustomerService } from './customer.service';

@Module({
  imports: [RestaurantDataModule],
  controllers: [CustomerController],
  providers: [CustomerService],
})
export class CustomerModule {}
