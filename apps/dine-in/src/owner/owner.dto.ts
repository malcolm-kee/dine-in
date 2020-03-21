import { RestaurantTableStatus } from '@app/restaurant-data';
import { ApiProperty } from '@nestjs/swagger';
import {
  IsArray,
  IsIn,
  IsMongoId,
  IsNotEmpty,
  IsNumber,
  IsPositive,
  IsString,
  ValidateNested,
} from 'class-validator';

export class TableDto {
  @ApiProperty({
    description: 'Label for the table',
    example: 'T1',
  })
  @IsString()
  @IsNotEmpty()
  readonly label: string;

  @ApiProperty({
    description: 'Number of seats of the table',
    example: 4,
  })
  @IsPositive()
  @IsNumber()
  readonly numberOfSeat: number;
}

export class CreateAccountDto {
  @ApiProperty({
    description: 'Name for the restaurant',
    example: 'Kedai Kopi 168',
  })
  @IsString()
  @IsNotEmpty()
  readonly name: string;

  @ApiProperty({
    description: 'Table setup for the restaurant',
    type: [TableDto],
  })
  @ValidateNested()
  @IsArray()
  readonly tables: TableDto[];
}

export class UpdateAccountDto {
  @ApiProperty({
    description:
      'Slug for the restaurant. This is used as identifier to find the restaurant',
    example: 'kedai-kopi-168',
  })
  @IsString()
  @IsNotEmpty()
  readonly slug: string;

  @ApiProperty({
    description: 'Name for the restaurant',
    example: 'Kedai Kopi 178',
  })
  @IsString()
  @IsNotEmpty()
  readonly name: string;

  @ApiProperty({
    description: 'Table setup for the restaurant',
    type: [TableDto],
  })
  @ValidateNested()
  @IsArray()
  readonly tables: TableDto[];
}

export class UpdateTableDto {
  @ApiProperty({
    description: 'Id for the table',
    example: '5e75a2f2ac6c3b0e1988b09d',
  })
  @IsMongoId()
  readonly tableId: string;

  @ApiProperty({
    description: 'New status for the table',
    enum: ['occupied', 'vacant'],
  })
  @IsString()
  @IsIn(['occupied', 'vacant'])
  readonly status: RestaurantTableStatus;
}
