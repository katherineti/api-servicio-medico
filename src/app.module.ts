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
import { DashboardModule } from './dashboard/dashboard.module';
import { RolesGuard } from './guards/roles.guard';
import { RolesModule } from './roles/roles.module';
import { LogsModule } from './logs/logs.module';
import { TempAuditorReportsModule } from './temp-auditor-reports/temp-auditor-reports.module';
import { FilesModule } from './files/files.module';
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
    DashboardModule,
    RolesModule,
    LogsModule,
    TempAuditorReportsModule,
    FilesModule,
  ],
  // controllers: [AppController],
  controllers: [],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: AtGuard,
    },
    {
      provide: APP_GUARD,
      useClass: RolesGuard
    }
  ],
})
export class AppModule {}