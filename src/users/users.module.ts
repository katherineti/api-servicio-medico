import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { DrizzleDbConecctionModule } from 'src/db.module';

@Module({
  imports: [DrizzleDbConecctionModule],
  providers: [UsersService],
  exports: [UsersService]
})
export class UsersModule {}