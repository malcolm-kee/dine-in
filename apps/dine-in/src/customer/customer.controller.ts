import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { RequestSeatDto } from './customer.dto';
import { CustomerService } from './customer.service';

@ApiTags('customer')
@Controller('customer')
export class CustomerController {
  constructor(private readonly customerService: CustomerService) {}

  @ApiOperation({
    summary: 'Request seats for a restaurant',
  })
  @Post(':restaurant')
  requestSeats(
    @Param('restaurant') restaurant: string,
    @Body() requestSeatDto: RequestSeatDto
  ) {
    return this.customerService.requestSeats(restaurant, requestSeatDto.pax);
  }

  @ApiOperation({
    summary: 'Get details of a restaurant',
  })
  @Get(':restaurant')
  getRestaurantDetails(@Param('restaurant') restaurant: string) {
    return this.customerService.getDetails(restaurant);
  }
}
