import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { DrizzleDbConecctionModule } from 'src/db.module';
import { UserController } from './user.controller';

@Module({
  imports: [DrizzleDbConecctionModule],
  controllers: [UserController],
  providers: [UsersService],
  exports: [UsersService]
})
export class UsersModule {}