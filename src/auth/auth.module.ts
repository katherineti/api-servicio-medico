import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UsersModule } from 'src/users/users.module';
import { DrizzleDbConecctionModule } from 'src/db.module';
import { JwtModule } from '@nestjs/jwt';
import { jwtConstants } from 'src/constants';
import { JwtStrategy } from './strategies/jwt.strategy';
import { PassportModule } from '@nestjs/passport';

@Module({
  imports: [
    UsersModule,
    DrizzleDbConecctionModule,
    PassportModule.register({
      defaultStrategy: 'jwt',
    }),
    JwtModule.register({
      global: true,
      secret: jwtConstants.secret,
      signOptions: { expiresIn: '1d' },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy],
  exports:[AuthService,JwtStrategy, PassportModule]
})
export class AuthModule {}