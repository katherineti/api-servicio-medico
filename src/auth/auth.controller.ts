import { Body, Controller, Post, HttpCode, HttpStatus } from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignInDto } from './signIn.dto';
import { CreateUserDto } from 'src/users/dto/create-user.dto';

//crea un archivo llamado signIn.dto.ts en tu directorio auth
/*
 aunque las dos declaraciones type son idénticas, en el contexto de NestJS y la validación de datos, es mucho mejor usar una class para definir tus DTOs.
 Este ejemplo con class permite la validación de los datos entrantes, lo cual es crucial para la seguridad y la robustez de tu aplicación.
  */
/* type signInDto = {
    email: string;
    password: string;
}; */

@Controller('auth')
export class AuthController {

    constructor( private authService: AuthService ){}

    @HttpCode(HttpStatus.OK)
    @Post('login')
    // @Roles(Role.Admin)
    // signin( @Body() signInDto: signInDto ){
    signIn( @Body() signInDto: SignInDto ): Promise<{ access_token: string }>{
        return this.authService.signIn(
            signInDto.email,
            signInDto.password
        );
    }

    @Post('signUp')
    signUp( @Body() createUser: CreateUserDto ) {
        return this.authService.signUp(createUser);
    } 
}