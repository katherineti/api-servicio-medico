import { Module } from '@nestjs/common';
import { AppService } from './app.service';
import { DrizzleDbConecctionModule } from './db.module';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { APP_GUARD } from '@nestjs/core';
import { AtGuard } from './guards/at.guard';

@Module({
  imports: [
    DrizzleDbConecctionModule,
    ConfigModule.forRoot({isGlobal:true,envFilePath: '.env'}),
    AuthModule,
    UsersModule,
  ],
  // controllers: [AppController],
  controllers: [],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: AtGuard,
    },
  ],
})
export class AppModule {}