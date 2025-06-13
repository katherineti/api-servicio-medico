import { Body, Controller, Get, Post } from '@nestjs/common';
import { ProvidersGetAll } from './dto/read-providers-dto';
import { ProvidersService } from './providers.service';
import { CreateProvider } from 'src/db/types/providers.types';

@Controller('providers')
export class ProvidersController {
    constructor(private readonly providersService: ProvidersService) { }

    @Get()
    get(): Promise<ProvidersGetAll> {
      return this.providersService.getAll();
    }

    @Post('create')
    async create(
     @Body() providerDto: CreateProvider,
    ): Promise<any> {

    return this.providersService.create(providerDto);
    }
}