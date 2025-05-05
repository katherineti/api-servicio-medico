import { Injectable, UnauthorizedException, ConflictException, Logger, NotFoundException } from '@nestjs/common';
import { jwtConstants } from 'src/constants';
import { UsersService } from 'src/users/users.service';
import * as argon2 from "argon2";
import { JwtService } from '@nestjs/jwt';
import { SignupDto } from './dto/signup.dto';
import { IJwtPayload } from './dto/jwt-payload.interface';
import { TypesRoles } from 'src/db/enums/types-roles';
import { LogsService } from 'src/logs/logs.service';

interface IcustomerAccessPoint{
  ip: string,
  hostname: string
}
@Injectable()
export class AuthService {

  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    public logsService: LogsService
  ) {}

    async signIn(email:string, password: string, customerAccessPoint: IcustomerAccessPoint): Promise<{ token: string }> {
        
      const user = await this.usersService.findOnByEmail(email);

      if(!user){
          throw new UnauthorizedException("Usuario no encontrado"); 
      }

      if (user.isActivate === false) {
        throw new NotFoundException('El usuario esta inactivo');
      }

      const authorized = await argon2.verify( user.password , password ); //devuelve true o false

      if( !authorized ){
          throw new UnauthorizedException("Contraseña incorrecta");
      }

      const payload: IJwtPayload = { 
        sub: user.id, 
        email: user.email,
        role: user.role as TypesRoles
      };
      Logger.debug("Payload " ,JSON.stringify(payload));

      this.logsService.create({
        action: 'Inicio de sesión',
        userId: user.id,
        ipAddress:customerAccessPoint.ip,
        hostname:customerAccessPoint.hostname
      });

      return {
        token: await this.jwtService.signAsync(payload, {
          secret: jwtConstants.secret
        }),
      };
    }

    async signUp(signUp:SignupDto): Promise<{
      ok: boolean,
      status: number,
      description: string,
    }> {

      const userExist = await this.usersService.findOnByEmail(signUp.email);

      if (userExist) {
        throw new ConflictException('El correo ya existe.');
      }
          
      await this.usersService.createUser(signUp);

      const objSaved = {
        ok: true,
        status: 201,
        description: 'Usuario registrado',
      };
  
      return objSaved;
    }
}