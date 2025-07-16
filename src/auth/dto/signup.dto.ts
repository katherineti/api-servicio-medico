import {
  IsNotEmpty,
  IsOptional,
  IsString,
  IsEmail,
  Matches,
  IsNumber,
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
  @IsNumber()
  role: number;
  
  //Nuevo porque el medico debe tener cedula para el informe medico
  @IsNotEmpty()
  @IsString()
  cedula: string;
}