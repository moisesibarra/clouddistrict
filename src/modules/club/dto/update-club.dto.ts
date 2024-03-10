import { IsNumber, IsPositive } from 'class-validator'

export class UpdateClubDto {
  @IsNumber()
  @IsPositive()
  budget: number
}
