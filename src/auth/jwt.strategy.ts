
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { jwtConstants } from 'src/constants';
import { IJwtPayload } from './dto/jwt-payload.interface';
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
    // return { userId: payload.sub, email: payload.email };
    return this.validateAdmin(payload);
  }

  async validateAdmin(payload: IJwtPayload) {
    const { email } = payload;
    console.log("email:" , payload)
    const user = await this.usersService.validarAdmin(email);

    console.log("user", user);
    if (!user) {
      throw new UnauthorizedException();
    }

    return payload;
  }
}