import { Controller, Post, Get, Param, Put, Body } from '@nestjs/common';
import { OwnerService } from './owner.service';
import { CreateAccountDto, UpdateAccountDto } from './owner.dto';

@Controller('owner')
export class OwnerController {
  constructor(private readonly ownerService: OwnerService) {}

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
