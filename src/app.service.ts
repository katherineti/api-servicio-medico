import { Inject, Injectable } from '@nestjs/common';
import { PG_CONNECTION } from './constants';
import { NeonDatabase } from 'drizzle-orm/neon-serverless';
import { roleTable, usersTable } from './db/schema';
import { eq } from 'drizzle-orm'
import { CreateUserDto } from './app.controller';
// import { hash } from 'argon2'; //no me sirve
import * as argon2 from "argon2";

@Injectable()
export class AppService {

 constructor(@Inject(PG_CONNECTION) private conn: NeonDatabase) {}

  async getUsers() {
    
    const result = await this.conn
    // .select()
    .select({
      id: usersTable.id,
      nombre: usersTable.name,
      apellido: usersTable.lastname,
      // role_id: usersTable.roles_id, //no. Solo hay que cargar la informacion necesaria porque la informacion viaja como texto con el protocolo de comunicacion de datos: HTTPS , y mientras menos informacion mande mas rapido viaja
      role: roleTable.code,
    })
    .from(usersTable)
    .innerJoin( roleTable, eq( usersTable.roles_id ,roleTable.id ) )

    return result; //resultado es un json con clave(nombre del campo) y valor(valor del campo)
  }
  async getUserbyId(id:number) {
    
    const result = await this.conn.select().from(usersTable).where(
      eq( usersTable.id, id )
    )

    return result;
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

     await this.conn.insert(usersTable).values(newUser);

    } catch (err) {

      throw new Error("Error al crear un usuario" + err);
    }

     return "Usuario registrado";
  }

/*   const id= "user cualquiera' OR '1'='1";
sql ´select * from users where usersTable.login = ''´ */
}
//21/02/2025

//DELETE FROM users;  //tarda 1hr en borrar los registros
//TRUNCATE FROM users;  //

/*
AUTENTICACION
CONTRASEÑAS: HAY QUE ENCRIPTAR LAS CONTRASEÑAS PARA EVITAR HACKEOS O ROBOS DE INFORMACION
INYECCIONES SQL? */
/*
QUERY BUILDER ES  SON LAS FUNCIONES QUEUSO PARA CONSULTAS DESDE EL ORM
TAMBIEN SE PUEDE ESCRIBIR EN MODO TEXTO CONSULTA NORMAL 

instalar  https://www.npmjs.com/package/argon2 

*/

/*
    .select({
      id: usersTable.id,
      nombre: usersTable.name,
      apellido: usersTable.lastname,
      // role_id: usersTable.roles_id, //no. Solo hay que cargar la informacion necesaria porque la informacion viaja como texto con el protocolo de comunicacion de datos: HTTPS , y mientras menos informacion mande mas rapido viaja
      role: roleTable.code,
    })
*/

/*

try{
}casj{
}

es para  manejar los errores.
intenta gacer lo que esta en parentesis, y si encuentra un error ejecuta lo que hay en el hash

Ataque DoS o 'Ataque de denegacion de servicio'? investigar. inyectan virus que lo que hacen es i nyectar scripts y cuando hacen llamadas corren millones de scripts y eso tumba un servidor. entonces el serv se vuelve vulnerable y pueden acceder a sus datos.

*/