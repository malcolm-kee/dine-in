import { IsNumber, IsPositive } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RequestSeatDto {
  @ApiProperty({
    description: 'Number of pax',
    example: 3,
  })
  @IsNumber()
  @IsPositive()
  readonly pax: number;
}
