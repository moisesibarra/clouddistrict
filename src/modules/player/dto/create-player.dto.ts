import { IsEmail, IsString } from 'class-validator'

export class CreatePlayerDto {
  @IsString()
  name: string

  @IsString()
  surname: string

  @IsEmail()
  email: string
}
