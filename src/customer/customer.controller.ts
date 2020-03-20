import { Body, Controller, Get, Param, Post, Put } from '@nestjs/common';
import { CreateAccountDto, UpdateAccountDto } from './customer.dto';
import { CustomerService } from './customer.service';

@Controller('owner')
export class CustomerController {
  constructor(private readonly ownerService: CustomerService) {}

  @Post()
  registerAccount(@Body() createAccountDto: CreateAccountDto) {
    return this.ownerService.register(createAccountDto);
  }

  @Get(':name')
  getDetails(@Param('name') name: string) {
    return this.ownerService.getDetails(name);
  }

  @Put()
  updateSetting(@Body() updateAccountDto: UpdateAccountDto) {
    return this.ownerService.updateSetting(updateAccountDto);
  }
}
