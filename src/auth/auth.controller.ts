import { Body, Controller, Post, HttpCode, HttpStatus, Param } from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignInDto } from './dto/signIn.dto';
import { Public } from 'src/decorators/public.decorator';
import { SignupDto } from './dto/signup.dto';

@Controller('auth')
export class AuthController {

    constructor( private authService: AuthService ){}

    @Public()
    @Post('signin')
    // @Roles(Role.Admin)
    signIn( @Body() signInDto: SignInDto ): Promise<{ access_token: string }>{
        return this.authService.signIn(
            signInDto.email,
            signInDto.password
        );
    }

    @Public()
    @Post('signup')
    signUp( @Body() signupDto: SignupDto ): Promise<string> {
        return this.authService.signUp(signupDto);
    } 

/*     @Post('update')
    @Roles(RoleType.Admin)//solo  el admin puede crear usuario.
    update( @Body() createUser: CreateUserDto) {//le agregue el id
        return this.authService.updateUser(createUser);
    } 

    @Post('delete')
    @Roles(RoleType.Admin)//solo  el admin puede crear usuario.
    delete( @Body() user: {id:number} ) {console.log("controlador eliminar ")
        return this.authService.deleteUser(user.id);
    }  */
}