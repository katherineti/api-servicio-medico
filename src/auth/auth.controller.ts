import { Body, Controller, Post, UsePipes, ValidationPipe } from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignInDto } from './dto/signIn.dto';
import { Public } from 'src/decorators/public.decorator';
import { SignupDto } from './dto/signup.dto';

@Controller('auth')
export class AuthController {

    constructor( private authService: AuthService ){}

    @Public()
    @Post('signin')
    @UsePipes(ValidationPipe)
    signIn( @Body() signInDto: SignInDto ): Promise<{ token: string }>{
        return this.authService.signIn(
            signInDto.email,
            signInDto.password
        );
    }

    @Public()
    @Post('signup')
    @UsePipes(ValidationPipe)
    signUp( @Body() signupDto: SignupDto ): Promise<{
        ok: boolean,
        status: number,
        description: string,
      }> {
        return this.authService.signUp(signupDto);
    } 
}