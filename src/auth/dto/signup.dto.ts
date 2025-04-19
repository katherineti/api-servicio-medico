import {
  IsNotEmpty,
  IsOptional,
  IsString,
  IsEmail,
  Matches
} from 'class-validator';

export class SignupDto {

  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsOptional()
  @IsString()
  password: string;

  @IsNotEmpty()
  @IsString()
  @Matches(/^[a-zA-ZÀ-ÿ0-9\s]+$/)
  name: string;

  @IsOptional()
  role: string;
}