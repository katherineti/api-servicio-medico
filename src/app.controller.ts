import { Body, Controller, Get, Post } from '@nestjs/common';
import { AppService } from './app.service';
import { Roles } from './decorators/role.decorators';
import { RoleType } from 'types';

export class CreateUserDto{//datos desde el formulario de registro de usuario
  name:string;
  lastname:string;
  email:string;
  username:string;
  password:string;
  age:number;
}
 
@Controller()
export class AppController {

  constructor(private readonly appService: AppService) {}

  @Get()
  getHello() {
    return this.appService.getUsers();
  }

  @Post()
  @Roles(RoleType.Admin)
  createUser( @Body() createUser: CreateUserDto ) {
    return this.appService.createUser(createUser);
  }
}
