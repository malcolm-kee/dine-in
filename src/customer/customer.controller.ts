import { Controller, Get, Param } from '@nestjs/common';
import { CustomerService } from './customer.service';

@Controller('owner')
export class CustomerController {
  constructor(private readonly customerService: CustomerService) {}

  @Get(':slug')
  getDetails(@Param('slug') slug: string) {
    return this.customerService.getDetails(slug);
  }
}
