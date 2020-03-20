export class TableDto {
  readonly label: string;
  readonly numberOfSeat: number;
}

export class CreateAccountDto {
  readonly name: string;
  readonly tables: TableDto[];
}

export class UpdateAccountDto {
  readonly name: string;
  readonly tables: TableDto[];
}
