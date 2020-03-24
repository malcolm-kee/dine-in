import {
  AuthenticatedRequest,
  AuthService,
  JwtAuthGuard,
  LocalAuthGuard,
} from '@app/auth';
import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Put,
  Request,
  UseGuards,
} from '@nestjs/common';
import { ApiOperation } from '@nestjs/swagger';
import {
  CreateAccountDto,
  UpdateAccountDto,
  UpdateTableDto,
} from './owner.dto';
import { OwnerService } from './owner.service';

@Controller('owner')
export class OwnerController {
  constructor(
    private readonly ownerService: OwnerService,
    private readonly authService: AuthService,
  ) {}

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
  @Get('setting/:slug')
  getAccountDetails(@Param('slug') slug: string) {
    return this.ownerService.getDetails(slug);
  }

  @ApiOperation({
    summary: 'Update setting of a restaurant',
  })
  @UseGuards(JwtAuthGuard)
  @Put()
  updateSetting(
    @Request() req: AuthenticatedRequest,
    @Body() updateAccountDto: UpdateAccountDto,
  ) {
    return this.ownerService.updateSetting({
      ...updateAccountDto,
      ownerId: req.user.userId,
    });
  }

  @ApiOperation({
    summary: 'Update table status',
  })
  @UseGuards(JwtAuthGuard)
  @Put('table/:slug')
  updateTableStatus(
    @Request() req: AuthenticatedRequest,
    @Param('slug') slug: string,
    @Body() updateTableDto: UpdateTableDto,
  ) {
    return this.ownerService.updateTableStatus({
      ...updateTableDto,
      restaurantSlug: slug,
      ownerId: req.user.userId,
    });
  }

  @ApiOperation({
    summary: 'Login as restaurant owner',
  })
  @UseGuards(LocalAuthGuard)
  @Post('login')
  async login(@Request() req) {
    return this.authService.login(req.user);
  }

  @ApiOperation({
    summary: 'Get your user profile',
  })
  @UseGuards(JwtAuthGuard)
  @Get('profile')
  getProfile(@Request() req: AuthenticatedRequest) {
    return req.user;
  }
}
