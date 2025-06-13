import { Module } from '@nestjs/common';
import { ProvidersController } from './providers.controller';
import { ProvidersService } from './providers.service';
import { DrizzleDbConecctionModule } from 'src/db.module';

@Module({
  imports:[DrizzleDbConecctionModule],
  controllers: [ProvidersController],
  providers: [ProvidersService]
})
export class ProvidersModule {}
