
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { jwtConstants } from 'src/constants';
import { IJwtPayload } from '../dto/jwt-payload.interface';
import { UsersService } from 'src/users/users.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {

  constructor( private usersService: UsersService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: jwtConstants.secret,
    });
  }

  async validate(payload: IJwtPayload) {
    return this.validateAdmin(payload);
  }

  async validateAdmin(payload: IJwtPayload) {
    const { email } = payload;

    const user = await this.usersService.validarAdmin(email);

    if (!user) {
      throw new UnauthorizedException();
    }

    return payload;
  }
}