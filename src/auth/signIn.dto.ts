import { IsString, IsNotEmpty } from 'class-validator';

export class SignInDto {
  @IsString()
  @IsNotEmpty()
//   username: string;
  email: string;

  @IsString()
  @IsNotEmpty()
  password: string;
}