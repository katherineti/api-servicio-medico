import { Inject, Injectable } from '@nestjs/common';
import { PG_CONNECTION } from './constants';
import { NeonDatabase } from 'drizzle-orm/neon-serverless';
import { usersTable } from './db/schema';
import { eq } from 'drizzle-orm'
import { CreateUserDto } from './app.controller';

@Injectable()
export class AppService {

 constructor(@Inject(PG_CONNECTION) private conn: NeonDatabase) {}


  async getUsers() {
    
    const result = await this.conn.select().from(usersTable)

    return result;
  }
  async getUserbyId(id:number) {
    
    const result = await this.conn.select().from(usersTable).where(
      eq( usersTable.id, id )
    )

    return result;
  }
  async createUser( createUser : CreateUserDto){
/*     const newUser = {
      name: "katherine",
      lastname: "gutierrez",
      age: 26,
      email: "katherine.revenga@gmail.com",
      username: "kathe",
      password: "12345678",
      roles_id: 1
    }; */
    const newUser = {
      ...createUser,
      roles_id: 1
    };

     await this.conn.insert(usersTable).values(newUser)
     return "Usuario registrado";
  }
}