import { forwardRef, Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { DrizzleDbConecctionModule } from 'src/db.module';
import { UserController } from './user.controller';
import { AuthModule } from 'src/auth/auth.module';
import { ExcelExportModule } from 'src/excel/excel-export.module';

@Module({
  imports: [
    DrizzleDbConecctionModule,
    forwardRef(() => AuthModule
    ), 
    ExcelExportModule
  ],
  controllers: [UserController],
  providers: [UsersService],
  exports: [UsersService]
})
export class UsersModule {}