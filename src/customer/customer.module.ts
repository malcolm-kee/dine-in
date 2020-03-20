import { Module } from '@nestjs/common';
import { RestaurantModule } from 'src/restaurant/restaurant.module';
import { CustomerController } from './customer.controller';
import { CustomerService } from './customer.service';

@Module({
  imports: [RestaurantModule],
  controllers: [CustomerController],
  providers: [CustomerService],
})
export class CustomerModule {}
