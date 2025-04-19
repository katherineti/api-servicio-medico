import { Body, Controller, Get, Post } from '@nestjs/common';
import { AppService } from './app.service';
 
@Controller()
export class AppController {

  constructor(private readonly appService: AppService) {}

  @Get()
  getHello() {
    return this.appService.getUsers();
  }

  @Post()
  // @Roles(RoleType.Admin)//solo  el admin puede crear usuario.
  createUser( @Body() createUser: any ) {
    return this.appService.createUser(createUser);
  }
}