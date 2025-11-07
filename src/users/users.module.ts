import { forwardRef, Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { DrizzleDbConecctionModule } from 'src/db.module';
import { UserController } from './user.controller';
import { AuthModule } from 'src/auth/auth.module';
import { ExportController } from 'src/excel/export.controller';
import { ExportUsersService } from 'src/excel/export-users.service';

@Module({
  imports: [
    DrizzleDbConecctionModule,
    forwardRef(() => AuthModule
    )
  ],
  controllers: [UserController, ExportController],
  providers: [UsersService, ExportUsersService],
  exports: [UsersService, ExportUsersService]
})
export class UsersModule {}