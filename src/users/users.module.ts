import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { DrizzleDbConecctionModule } from 'src/db.module';
import { UserController } from './user.controller';
import { AuthService } from 'src/auth/auth.service';

@Module({
  imports: [DrizzleDbConecctionModule],
  controllers: [UserController],
  providers: [UsersService, AuthService],
  exports: [UsersService]
})
export class UsersModule {}