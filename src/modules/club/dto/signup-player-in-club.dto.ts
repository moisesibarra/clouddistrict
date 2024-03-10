import {
  IsEmail,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
} from 'class-validator'

export class SignupPlayerInClubDto {
  @IsNumber()
  @IsOptional()
  readonly id?: number

  @IsString()
  name: string

  @IsString()
  surname: string

  @IsEmail()
  email: string

  @IsNumber()
  @IsPositive()
  salary: number
}
