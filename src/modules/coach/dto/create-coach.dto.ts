import { IsEmail, IsNumber, IsOptional, IsString } from 'class-validator'

export class CreateCoachDto {
  @IsString()
  name: string

  @IsString()
  surname: string

  @IsEmail()
  email: string
}
