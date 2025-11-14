import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DrizzleDbConecctionModule } from 'src/db.module';
import { DbBackupController } from './db-backup.controller';
import { DbBackupService } from './db-backup-restore.service';

@Module({
  imports: [ConfigModule, DrizzleDbConecctionModule], // Necesario para acceder a las variables de entorno de la DB
  controllers: [DbBackupController],
  providers: [DbBackupService],
})
export class DbBackupModule {}