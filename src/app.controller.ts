import { Body, Controller, Get, Post } from '@nestjs/common';
import { AppService } from './app.service';
import { Roles } from './decorators/role.decorators';
import { RoleType } from 'types';
import { CreateUserDto } from './users/dto/create-user.dto';
 
@Controller()
export class AppController {

  constructor(private readonly appService: AppService) {}

  @Get()
  getHello() {
    return this.appService.getUsers();
  }

  @Post()
  @Roles(RoleType.Admin)//solo  el admin puede crear usuario.
  createUser( @Body() createUser: CreateUserDto ) {
    return this.appService.createUser(createUser);
  }
}
