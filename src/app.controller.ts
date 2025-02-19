import { Body, Controller, Get, Post } from '@nestjs/common';
import { AppService } from './app.service';

export class CreateUserDto{
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
  createUser( @Body() createUser: CreateUserDto ) {
    return this.appService.createUser(createUser);
  }
}
