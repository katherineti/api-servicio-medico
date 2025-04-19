import { Inject, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { NeonDatabase } from 'drizzle-orm/neon-serverless';
import { PG_CONNECTION, STATUS_ACTIVO } from 'src/constants';
import { usersTable } from 'src/db/schema';
import { eq, and } from 'drizzle-orm'
import * as argon2 from "argon2";
import { CreateUser, User } from 'src/db/types/users.types';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

 constructor(@Inject(PG_CONNECTION) private db: NeonDatabase) {
 }

    async findOnByEmail(email: string): Promise< Omit<User, 'name'|'isActivate'|'createdAt'|'updatedAt'> | undefined> {
        const result = await 
        this.db.select({
                id:  usersTable.id,
                email: usersTable.email,
                password: usersTable.password,
                role: usersTable.role
          })
        .from(usersTable)
        .where(eq(usersTable.email , email ))
        .limit(1);
        
        return result[0];
    }

    async getUserbyId(id: number): Promise<User | undefined> {
    
      try{
  
        const result = await this.db.select()
          .from(usersTable)
          .where(eq( usersTable.id, id ))
          .limit(1);
    
        return result[0] || null;
        
      }catch(err){
        console.error("Error en la base de datos al buscar el usuario " + id + ": ", err);
        throw new Error("Error al obtener el usuario " + id + " " + err);
      }
    }

    async createUser( createUser: CreateUser): Promise<any>{
      console.log("entrada", createUser )
  
      try {
        const hash = await argon2.hash( createUser.password );
        
        const newUser = {
          ...createUser,
          password: hash,
          isActivate:true,
          status: STATUS_ACTIVO
        };
        console.log("newUser", newUser )
  
        await this.db.insert(usersTable).values(newUser);
  
      } catch (err) {
  
        throw new Error("Error al crear un usuario " + err);
      }
  
    }

    async updateUser( updateUser: UpdateUserDto): Promise<User>{

      const User = await this.getUserbyId(updateUser.id);
  
      if (!User) {
        throw new NotFoundException('La usuario no existe');
      }
      
      const updateData: Partial<User> = {
        name: updateUser.name,
        role: updateUser.role,
        isActivate: updateUser.isActivate,
        updatedAt: new Date()
      };

      const updatedUser = await this.db
      .update(usersTable)
      .set(updateData)
      .where(eq(usersTable.id,  updateUser.id))

      return updatedUser[0];
    }

    async delete(id: number): Promise<User>{

      const User = await this.getUserbyId(id);
  
      if (!User) {
        throw new NotFoundException('La usuario no existe');
      }
      const updateData: Partial<User> = {
        isActivate: false, 
        updatedAt: new Date()
      };

      const updatedUser = await this.db
      .update(usersTable)
      .set(updateData)
      .where(eq(usersTable.id, id));

      return await this.getUserbyId(id);
    }

    async validarAdmin(email: string): Promise<any> {
      try {
        const userExists = await 
        this.db.select({
          isActivate: usersTable.isActivate,
         })
        .from(usersTable)
        .where(eq(usersTable.email, email))
        .limit(1);
  
        if (userExists) {
          return userExists[0]
        } else {
          return null
        }
  
      } catch (error) {
        this.logger.error("Error al buscar el administrador: ", error);
        throw error;
      }
    }
}