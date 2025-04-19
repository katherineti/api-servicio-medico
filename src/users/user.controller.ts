import {
  Body,
  Controller,
  Delete,
  Param,
  ParseIntPipe,
  Post,
} from '@nestjs/common';
import { User } from 'src/db/types/users.types';
import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { Roles } from 'src/decorators/role.decorators';
import { RoleType } from 'types';

@Controller('users')
export class UserController {

  constructor(private readonly userService: UsersService) { }

  @Roles(RoleType.admin)
  @Post('update')
  update( @Body() updateUserDto: UpdateUserDto): Promise<User> {
    if (updateUserDto.id) {
      updateUserDto.id = Number(updateUserDto.id);
    }
      return this.userService.updateUser(updateUserDto);
  } 

  @Roles(RoleType.admin)
  @Delete(':id')
  deleteUser(@Param('id', ParseIntPipe) id: number): Promise<User> {
    return this.userService.delete(id);
  }
}