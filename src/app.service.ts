import { Inject, Injectable } from '@nestjs/common';
import { PG_CONNECTION } from './constants';
import { NeonDatabase } from 'drizzle-orm/neon-serverless';
import { usersTable } from './db/schema';

@Injectable()
export class AppService {

 constructor(@Inject(PG_CONNECTION) private conn: NeonDatabase) {}


  async getUsers() {
    
    const result = await this.conn.select().from(usersTable)

    return result;
  }
}
