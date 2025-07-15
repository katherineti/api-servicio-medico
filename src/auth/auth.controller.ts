import { Body, Controller, Ip, Post, Req, UsePipes, ValidationPipe } from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignInDto } from './dto/signIn.dto';
import { Public } from 'src/decorators/public.decorator';
import { SignupDto } from './dto/signup.dto';
import { Usersesion } from './strategies/usersesion.decorator';
import { IJwtPayload } from './dto/jwt-payload.interface';

@Controller('auth')
export class AuthController {

    constructor( private authService: AuthService ){}

    @Public()
    @Post('signin')
    @UsePipes(ValidationPipe)
    signIn( 
        @Body() signInDto: SignInDto, 
        @Ip() clienteIp: string,
        @Req() req: Request
    ): Promise<{ token: string }>{
        let client = {
            ip: clienteIp,
            hostname: req.headers['host']
        };
        return this.authService.signIn(
            signInDto.email,
            signInDto.password,
            client
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

  // Nuevo endpoint para refrescar el token
  // No necesita @Public() porque solo los usuarios autenticados (con un token válido) pueden acceder
  @Post('refresh-token')
    async refreshToken(@Usersesion() user: IJwtPayload): Promise<{ token: string }> {
        console.log("user",user)
      return this.authService.refreshAccessToken(user);
    }
}