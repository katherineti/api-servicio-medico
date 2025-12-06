import { Body, Controller, Get, Post } from '@nestjs/common';
import { AppService } from './app.service';
 
@Controller()
export class AppController {

  constructor() {}

  @Get()
  getHello(): string {
    return 'API Servicio Médico está funcionando correctamente.'; 
  }

}