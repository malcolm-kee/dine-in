import { Body, Controller, Get, Param, Post, Put } from '@nestjs/common';
import {
  CreateAccountDto,
  UpdateAccountDto,
  UpdateTableDto,
} from './owner.dto';
import { OwnerService } from './owner.service';

@Controller('owner')
export class OwnerController {
  constructor(private readonly ownerService: OwnerService) {}

  @Post()
  registerAccount(@Body() createAccountDto: CreateAccountDto) {
    return this.ownerService.register(createAccountDto);
  }

  @Get(':slug')
  getAccountDetails(@Param('slug') slug: string) {
    return this.ownerService.getDetails(slug);
  }

  @Put()
  updateSetting(@Body() updateAccountDto: UpdateAccountDto) {
    return this.ownerService.updateSetting(updateAccountDto);
  }

  @Put(':slug')
  updateTableStatus(
    @Param('slug') slug: string,
    @Body() updateTableDto: UpdateTableDto,
  ) {
    return this.ownerService.updateTableStatus({
      restaurantSlug: slug,
      ...updateTableDto,
    });
  }
}
