import { Controller, Get, Param, Post, Body } from '@nestjs/common';
import { CustomerService } from './customer.service';
import { RequestSeatDto } from './customer.dto';

@Controller('customer')
export class CustomerController {
  constructor(private readonly customerService: CustomerService) {}

  @Post(':restaurant')
  requestSeats(
    @Param('restaurant') restaurant: string,
    @Body() requestSeatDto: RequestSeatDto,
  ) {
    return this.customerService.requestSeats(restaurant, requestSeatDto.pax);
  }
}
