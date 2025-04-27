import { Module } from '@nestjs/common';
import { AppService } from './app.service';
import { DrizzleDbConecctionModule } from './db.module';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { APP_GUARD } from '@nestjs/core';
import { AtGuard } from './guards/at.guard';
import { MedicalSuppliesModule } from './medical-supplies/medical-supplies.module';
import { CategoriesModule } from './categories/categories.module';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { AssignmentModule } from './assignment/assignment.module';
@Module({
  imports: [
    DrizzleDbConecctionModule,
    ConfigModule.forRoot({isGlobal:true,envFilePath: '.env'}),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'uploads'),
      serveRoot: '/uploads', // Ruta URL desde donde se servirán los archivos de imagen
    }),
    AuthModule,
    UsersModule,
    MedicalSuppliesModule,
    CategoriesModule,
    AssignmentModule,
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