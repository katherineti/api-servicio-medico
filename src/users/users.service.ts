import { Inject, Injectable } from '@nestjs/common';
import { NeonDatabase } from 'drizzle-orm/neon-serverless';
import { PG_CONNECTION } from 'src/constants';
import { roleTable, usersTable } from 'src/db/schema';
import { eq } from 'drizzle-orm'
import { CreateUserDto } from 'src/app.controller';
import * as argon2 from "argon2";

type User = {
    id: number;
    name: string;
    lastname: string;
    age: number;
    email: string;
    username: string;
    password: string;
    created_at: Date;
    // roles_id: number;
    role: string;
};

@Injectable()
export class UsersService {

 constructor(@Inject(PG_CONNECTION) private db: NeonDatabase) {}

    async findOne(email: string): Promise<User | undefined> {
        const result = await 
        // this.db.select()
        this.db.select({
/*             id: usersTable.id,
            nombre: usersTable.name,
            apellido: usersTable.lastname,
            // role_id: usersTable.roles_id, //no. Solo hay que cargar la informacion necesaria porque la informacion viaja como texto con el protocolo de comunicacion de datos: HTTPS , y mientras menos informacion mande mas rapido viaja
            role: roleTable.code, */

            
                id:  usersTable.id,
                name: usersTable.name,
                lastname: usersTable.lastname,
                age: usersTable.age,
                email: usersTable.email,
                username: usersTable.username,
                password: usersTable.password,
                created_at: usersTable.created_at,
                // created_at: Date;
                // roles_id: number;
                role: roleTable.code,
            
          })
        .from(usersTable)
        .innerJoin( roleTable, eq( usersTable.roles_id ,roleTable.id ) )
        .where(eq(usersTable.email , email ));
        // return this.users.find(user => user.username === username);
        return result[0];
    }

      async createUser( createUser : CreateUserDto){
    
        try {//todo lo que coloque afuera del try para llamar algo que esta dentro del try NO lo va a reconocer porque solo existe dentro de las llaves del try, por eso el insert tambien va dentro de las llaves
          console.log("hascreateUser.passwordh" ,createUser.password)
            const hash = await argon2.hash( createUser.password );
          console.log("hash", hash ) 
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
            password: hash, //reemplaza el password que viene en el ...createUser con un nuevo valor: hash. Estoy sobreescribiendo la contraseña
            roles_id: 1
          };
    
         await this.db.insert(usersTable).values(newUser);
    
        } catch (err) {
    
          throw new Error("Error al crear un usuario " + err);
        }
    
         return "Usuario registrado";
      }

}
