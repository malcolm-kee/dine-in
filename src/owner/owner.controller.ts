import { Body, Controller, Get, Param, Post, Put } from '@nestjs/common';
import { ApiOperation } from '@nestjs/swagger';
import {
  CreateAccountDto,
  UpdateAccountDto,
  UpdateTableDto,
} from './owner.dto';
import { OwnerService } from './owner.service';

@Controller('owner')
export class OwnerController {
  constructor(private readonly ownerService: OwnerService) {}

  @ApiOperation({
    summary: 'Create an account for a restaurant',
  })
  @Post()
  registerAccount(@Body() createAccountDto: CreateAccountDto) {
    return this.ownerService.register(createAccountDto);
  }

  @ApiOperation({
    summary: 'Get details of a restaurant',
    parameters: [
      {
        name: 'slug',
        description: 'slug for the restaurant',
        in: 'path',
      },
    ],
  })
  @Get(':slug')
  getAccountDetails(@Param('slug') slug: string) {
    return this.ownerService.getDetails(slug);
  }

  @ApiOperation({
    summary: 'Update setting of a restaurant',
  })
  @Put()
  updateSetting(@Body() updateAccountDto: UpdateAccountDto) {
    return this.ownerService.updateSetting(updateAccountDto);
  }

  @ApiOperation({
    summary: 'Update table status',
  })
  @Put('table/:slug')
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
