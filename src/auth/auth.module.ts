import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UsersModule } from 'src/users/users.module';
import { DrizzleDbConecctionModule } from 'src/db.module';
import { JwtModule } from '@nestjs/jwt';
import { JWTSecret } from 'src/constants';

@Module({
  imports: [
    UsersModule,
    DrizzleDbConecctionModule,
    JwtModule.register({
      global: true,
      secret: JWTSecret, //jwtConstants.secret,
      // signOptions: { expiresIn: '60s' }, //se vence en una hora
      // signOptions: { expiresIn: '1d' }, //expira en 1 dia
      signOptions: { expiresIn: 60*60*24 },  //expira en 1 dia - tambien se pone asi
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService],
  exports:[AuthService]
})
export class AuthModule {}