import { Inject, Injectable } from '@nestjs/common';
import { NeonDatabase } from 'drizzle-orm/neon-serverless';
import { PG_CONNECTION, STATUS_ACTIVO, STATUS_UPDATED } from 'src/constants';
import { roleTable, usersTable } from 'src/db/schema';
import { eq } from 'drizzle-orm'
import * as argon2 from "argon2";
import { CreateUserDto } from './dto/create-user.dto';

type User = {
    id: number;
    name: string;
    lastname: string;
    // age: number;
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

    async findOnByEmail(email: string): Promise<User | undefined> {
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
                // age: usersTable.age,
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

    async getUserbyId(id:number) {
    
      try{
  
        const result = await this.db.select()
          .from(usersTable)
          .where(eq( usersTable.id, id ));
    
        return result[0] || null;
        
      }catch(err){
        console.error("Error en la base de datos al buscar el usuario " + id + ": ", err);
        throw new Error("Error al obtener el usuario " + id + " " + err);
      }
    }

      async createUser( createUser : CreateUserDto){
    
        try {//todo lo que coloque afuera del try para llamar algo que esta dentro del try NO lo va a reconocer porque solo existe dentro de las llaves del try, por eso el insert tambien va dentro de las llaves
          console.log("hascreateUser.passwordh" ,createUser.password)
            const hash = await argon2.hash( createUser.password );
          console.log("hash", hash )
 
        const result = await  this.db.select().from(usersTable)
        console.log("CONSULTA GET " , result)
        console.log(typeof createUser.salary);

            /*     const newUser = {
            name: "katherine",
            lastname: "gutierrez",
            age: 26,
            email: "katherine.revenga@gmail.com",
            username: "kathe",
            password: "12345678",
            roles_id: 
            //tambien:
            url_image
            subdependency_id
            id_cargo
          }; */
          const newUser = {
            ...createUser,
            password: hash, //reemplaza el password que viene en el ...createUser con un nuevo valor: hash. Estoy sobreescribiendo la contraseña
            roles_id: 1,
            status: STATUS_ACTIVO
          };
    
         await this.db.insert(usersTable).values(newUser);
    
        } catch (err) {
    
          throw new Error("Error al crear un usuario " + err);
        }
    
         return "Usuario registrado";
      }

      async updateUser( createUser: CreateUserDto){
        try {//todo lo que coloque afuera del try para llamar algo que esta dentro del try NO lo va a reconocer porque solo existe dentro de las llaves del try, por eso el insert tambien va dentro de las llaves
            
          // const hash = await argon2.hash( createUser.password );

/*           const user = {
            ...createUser,
            password: hash, //reemplaza el password que viene en el ...createUser con un nuevo valor: hash. Estoy sobreescribiendo la contraseña
            roles_id: 1,
            status: 1
          }; */
          
            let g = await this.getUserbyId(createUser.id)
            console.log( "tipado del salario con get:", typeof g.salary);
        
       console.log( "tipado del salario de entrada:", typeof createUser.salary);

       return  await this.db.update(usersTable)
        .set({
          name: createUser.name,
          lastname: createUser.lastname,
          gender: createUser.gender,
          birthdate: createUser.birthdate,
          email: createUser.email,
          username: createUser.username,
          // password: createUser.password,
          url_image: createUser.url_image,
          subdependency_id: createUser.subdependency_id,
          job_title: createUser.job_title,
          contract_type: createUser.contract_type,
          // salary: createUser.salary,
          status: STATUS_UPDATED,
          // updated_at: new Date(),
        })
        .where(eq(usersTable.id,  createUser.id))
        .returning({ updatedId: usersTable.id }); //salida: [{"updatedId": 2 }]

        } catch (err) {
    
          throw new Error("Error al actualizar un usuario " + err);
        }
    
        //  return "Usuario actualizado";
      }

      delete(id:number){
        return this.db.delete(usersTable).where(eq(usersTable.id, id));
      }
}