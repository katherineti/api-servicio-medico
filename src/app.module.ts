import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DrizzleDbConecctionModule } from './db.module';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { JwtModule } from '@nestjs/jwt';
import { JWTSecret } from './constants'; 

@Module({
  imports: [
    DrizzleDbConecctionModule,
    ConfigModule.forRoot({isGlobal:true}),
    AuthModule,
    UsersModule,

    JwtModule.register({
      global: true,
      secret: JWTSecret, //jwtConstants.secret,
      // signOptions: { expiresIn: '60s' }, //se vence en una hora
      // signOptions: { expiresIn: '1d' }, //expira en 1 dia
      signOptions: { expiresIn: 60*60*24 },  //expira en 1 dia - tambien se pone asi
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}