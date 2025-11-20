import { Body, Controller, Ip, Post, Req, UsePipes, ValidationPipe } from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignInDto } from './dto/signIn.dto';
import { Public } from 'src/decorators/public.decorator';
import { SignupDto } from './dto/signup.dto';
import { Usersesion } from './strategies/usersesion.decorator';
import { IJwtPayload } from './dto/jwt-payload.interface';
import { ChangePasswordDto } from './dto/change-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';

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
      return this.authService.refreshAccessToken(user);
    }

/*   @Post('change-password')
  @UsePipes(ValidationPipe)
  async changePassword(
    @Usersesion() user: IJwtPayload,
    @Body() changePasswordDto: ChangePasswordDto
  ): Promise<{ ok: boolean; message: string }> {
    return this.authService.changePassword(user.sub, changePasswordDto);
  } */

  @Public()
  @Post('forgot-password')
  @UsePipes(ValidationPipe)
  async forgotPassword(
    @Body() forgotPasswordDto: ForgotPasswordDto
  ): Promise<{ ok: boolean; message: string; token?: string }> {
    return this.authService.forgotPassword(forgotPasswordDto.email);
  }

  @Public()
  @Post('reset-password')
  @UsePipes(ValidationPipe)
  async resetPassword(
    @Body() resetPasswordDto: ResetPasswordDto
  ): Promise<{ ok: boolean; message: string }> {
    return this.authService.resetPassword(resetPasswordDto);
  }

}