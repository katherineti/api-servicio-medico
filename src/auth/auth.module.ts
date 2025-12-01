import { forwardRef, Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UsersModule } from 'src/users/users.module';
import { DrizzleDbConecctionModule } from 'src/db.module';
import { JwtModule } from '@nestjs/jwt';
import { jwtConstants } from 'src/constants';
import { JwtStrategy } from './strategies/jwt.strategy';
import { PassportModule } from '@nestjs/passport';
import { LogsModule } from 'src/logs/logs.module';
import { EmailModule } from 'src/email/email.module';

@Module({
  imports: [
    DrizzleDbConecctionModule,
    forwardRef(() => UsersModule),
    LogsModule,
    EmailModule,
    PassportModule.register({
      defaultStrategy: 'jwt',
    }),
    JwtModule.register({
      global: true,
      secret: jwtConstants.secret,
      // La expiración fija se elimina para permitir el control desde el frontend.
      // signOptions: { expiresIn: '1d' },
      // signOptions: { expiresIn: '5m' },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy],
  exports:[AuthService,JwtStrategy, PassportModule]
})
export class AuthModule {}