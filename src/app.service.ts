import { Inject, Injectable } from '@nestjs/common';
import { PG_CONNECTION } from './constants';
import { NeonDatabase } from 'drizzle-orm/neon-serverless';
import { usersTable } from './db/schema';
import { eq } from 'drizzle-orm'
import * as argon2 from "argon2";

@Injectable()
export class AppService {

 constructor(@Inject(PG_CONNECTION) private conn: NeonDatabase) { }

  async getUsers() {

    try{
    
      const result = await this.conn
      .select({
        id: usersTable.id,
        nombre: usersTable.name,
        role: usersTable.role,
      })
      .from(usersTable)
  
      return result;

    }catch(err){

      console.error("Error al obtener usuarios:", err);
      throw new Error("Error al obtener usuarios");
    }

  }

  async getUserbyId(id:number) {
    
    try{

      const result = await this.conn.select()
        .from(usersTable)
        .where(eq( usersTable.id, id ));
  
      return result[0] || null;
      
    }catch(err){
      console.error("Error en la base de datos al buscar el usuario:", err);
      throw new Error("Error al obtener el usuario " + err);
    }
  }

  async createUser( createUser : any){

    try {//todo lo que coloque afuera del try para llamar algo que esta dentro del try NO lo va a reconocer porque solo existe dentro de las llaves del try, por eso el insert tambien va dentro de las llaves

      const hash = await argon2.hash( createUser.password );

      this.conn.select().from(usersTable)
      const newUser = {
        ...createUser,
        // password: hash, //reemplaza el password que viene en el ...createUser con un nuevo valor: hash. Estoy sobreescribiendo la contraseña
        roles_id: 1,
      };

    } catch (err) {

      throw new Error("Error al crear un usuario " + err);
    }

     return "Usuario registrado";
  }
}