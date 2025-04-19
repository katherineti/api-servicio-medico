import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { jwtConstants, JWTSecret } from 'src/constants';
import { UsersService } from 'src/users/users.service';
import * as argon2 from "argon2";
import { JwtService } from '@nestjs/jwt';
import { SignupDto } from './dto/signup.dto';
import { IJwtPayload } from './dto/jwt-payload.interface';

@Injectable()
export class AuthService {

     constructor(
        private usersService: UsersService,
        private jwtService: JwtService
    ) {}

        async signIn(email:string, password: string): Promise<{ access_token: string }> {
            
          const user = await this.usersService.findOnByEmail(email);

          if(!user){
              throw new UnauthorizedException("Usuario no encontrado"); 
          }
          const authorized = await argon2.verify( user.password , password ); //devuelve true o false

          if( !authorized ){
              throw new UnauthorizedException("Contraseña incorrecta");
          }

          const payload: IJwtPayload = { 
            sub: user.id, 
            // username: user.username, 
            email: user.email,
            role: user.role
          };

          return {
            access_token: await this.jwtService.signAsync(payload, {
              secret: jwtConstants.secret
            }),
          };
        }

        async signUp(signUp:SignupDto): Promise<string> {

          const userExist = await this.usersService.findOnByEmail(signUp.email);

          if (userExist) {
            throw new ConflictException('El correo ya existe.');
          }
              
          const user = await this.usersService.createUser(signUp);
          return user;
        }
}