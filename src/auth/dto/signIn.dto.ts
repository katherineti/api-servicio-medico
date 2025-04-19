import { IsString, IsNotEmpty, IsEmail } from 'class-validator';

export class SignInDto {
  
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsNotEmpty()
  @IsString()
  password: string;
}