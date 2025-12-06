import {Controller, Get } from '@nestjs/common';
import { Public } from './decorators/public.decorator';

@Controller()
export class AppController {

  constructor() {}
  @Public()
  @Get()
  getHello(): string {
    return 'API Servicio Médico está funcionando correctamente.'; 
  }

}