import {
  Body,
  Controller,
  Delete,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { User } from 'src/db/types/users.types';
import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { Roles } from 'src/decorators/role.decorators';
import { RoleType } from 'types';
import { Usersesion } from 'src/auth/strategies/usersesion.decorator';
import { IJwtPayload } from 'src/auth/dto/jwt-payload.interface';
import { SearchUserDto } from './dto/search.user.dto';
import { ResultGetAll } from './dto/read-user-dto';
import { SignupDto } from 'src/auth/dto/signup.dto';
import { AuthService } from 'src/auth/auth.service';

@Controller('users')
export class UserController {

  constructor(private readonly userService: UsersService, private readonly authService: AuthService) { }

  @Post('getAll')
  @UsePipes(ValidationPipe)
  getUsers(@Body() body: SearchUserDto, @Usersesion() user: IJwtPayload): Promise<ResultGetAll> {
    return this.userService.getAll(body, user);
  }

  @Post('/createAccount')
  @Roles(RoleType.admin)
  @UsePipes(ValidationPipe)
  async createAccount(
    @Body() signupDto: SignupDto,
  ): Promise<any> {

    return this.authService.signUp(signupDto);
  }

  @Patch(':userId')
  // @UseGuards(AuthGuard())
  @Roles(RoleType.admin)
  @UsePipes(ValidationPipe)
  updateUser(
    @Param('userId', ParseIntPipe) userId: number,
    @Body() user: UpdateUserDto,
  ): Promise<User> {

    return this.userService.update(userId, user);
  }

  @Roles(RoleType.admin)
  @Delete(':id')
  deleteUser(@Param('id', ParseIntPipe) id: number): Promise<User> {
    return this.userService.delete(id);
  }

}