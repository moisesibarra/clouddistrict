import { IsNumber, IsOptional, IsPositive, IsString } from 'class-validator';

export class PaginationQueryDto {
  @IsNumber()
  @IsPositive()
  @IsOptional()
  offset: number

  @IsNumber()
  @IsPositive()
  @IsOptional()
  limit: number

  @IsString()
  @IsOptional()
  searchTerm: string
}
