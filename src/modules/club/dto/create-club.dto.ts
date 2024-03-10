import { IsNumber, IsString } from 'class-validator';

export class CreateClubDto {
  @IsString()
  name: string

  @IsNumber()
  budget: number
}
