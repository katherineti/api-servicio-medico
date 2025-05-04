import { IsNotEmpty, IsNumber } from 'class-validator';

export class SearchLogsDto {

  @IsNumber()
  @IsNotEmpty()
  page: number;

  @IsNumber()
  @IsNotEmpty()
  take: number;
}