import { Inject, Injectable } from '@nestjs/common';
import { NeonDatabase } from 'drizzle-orm/neon-serverless';
import { PG_CONNECTION } from 'src/constants';
import { usersTable } from 'src/db/schema';
import { eq } from 'drizzle-orm'

type User = {
    id: number;
    name: string;
    lastname: string;
    age: number;
    email: string;
    username: string;
    password: string;
    created_at: Date;
    roles_id: number;
};

@Injectable()
export class UsersService {

 constructor(@Inject(PG_CONNECTION) private db: NeonDatabase) {}

    async findOne(email: string): Promise<User | undefined> {
        const result = await this.db.select()
        .from(usersTable)
        .where(eq(usersTable.email , email ));
        // return this.users.find(user => user.username === username);
        return result[0];
      }

}
