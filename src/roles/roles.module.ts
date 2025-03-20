import { Module } from '@nestjs/common';
import { RolesService } from './roles.service';
import { DrizzleDbConecctionModule } from 'src/db.module';

@Module({
  imports: [DrizzleDbConecctionModule],
  providers: [RolesService],
  exports: [RolesService]
})
export class RolesModule {}
