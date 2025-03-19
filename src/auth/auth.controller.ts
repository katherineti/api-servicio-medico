import { Body, Controller, Post, HttpCode, HttpStatus, Param } from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignInDto } from './signIn.dto';
import { CreateUserDto } from 'src/users/dto/create-user.dto';
import { RoleType } from 'types';
import { Roles } from 'src/decorators/role.decorators';
import { UpdateUserDto } from 'src/users/dto/update-user.dto';
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
      @Roles(RoleType.Admin)//solo  el admin puede crear usuario.
    signUp( @Body() createUser: CreateUserDto ) {
        return this.authService.signUp(createUser);
    } 

    @Post('update')
    @Roles(RoleType.Admin)//solo  el admin puede crear usuario.
    // update( @Body() createUser: CreateUserDto, @Param('id') id: number ) {
    update( @Body() createUser: any) {//le agregue el id
        return this.authService.updateUser(createUser);
    } 

    @Post('delete')
    @Roles(RoleType.Admin)//solo  el admin puede crear usuario.
    delete( @Body() user: {id:number} ) {console.log("controlador eliminar ")
        return this.authService.deleteUser(user.id);
    } 


}