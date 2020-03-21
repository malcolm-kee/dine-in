import {
  IsArray,
  IsIn,
  IsNotEmpty,
  IsNumber,
  IsPositive,
  IsString,
  ValidateNested,
  IsMongoId,
} from 'class-validator';
import { RestaurantTableStatus } from 'src/restaurant';

export class TableDto {
  @IsString()
  @IsNotEmpty()
  readonly label: string;

  @IsPositive()
  @IsNumber()
  readonly numberOfSeat: number;
}

export class CreateAccountDto {
  @IsString()
  @IsNotEmpty()
  readonly name: string;

  @ValidateNested()
  @IsArray()
  readonly tables: TableDto[];
}

export class UpdateAccountDto {
  @IsString()
  @IsNotEmpty()
  readonly slug: string;

  @IsString()
  @IsNotEmpty()
  readonly name: string;

  @ValidateNested()
  @IsArray()
  readonly tables: TableDto[];
}

export class UpdateTableDto {
  @IsMongoId()
  readonly tableId: string;

  @IsString()
  @IsIn(['occupied', 'vacant'])
  readonly status: RestaurantTableStatus;
}
