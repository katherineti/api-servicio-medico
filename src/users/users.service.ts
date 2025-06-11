import { Inject, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { NeonDatabase } from 'drizzle-orm/neon-serverless';
import { PG_CONNECTION } from 'src/constants';
import { usersTable } from 'src/db/schema';
import { and, count, desc, eq, ilike } from 'drizzle-orm'
import * as argon2 from "argon2";
import { CreateUser, User } from 'src/db/types/users.types';
import { UpdateUserDto } from './dto/update-user.dto';
import { IJwtPayload } from 'src/auth/dto/jwt-payload.interface';
import { IUser, ResultGetAll } from './dto/read-user-dto';
import { SearchUserDto } from './dto/search.user.dto';
import { rolesTable } from '../db/schema';
//inyeccion para driver coneccion a BD local
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import * as schema from 'src/db/schema'

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

 constructor(@Inject(PG_CONNECTION) private db: NodePgDatabase<typeof schema>) {}

  // async findOnByEmail(email: string): Promise< Omit<User, 'name'|'createdAt'|'updatedAt'> | undefined> {
  async findOnByEmail(email: string): Promise<IUser> {
    const result = await 
    this.db.select({
        id:  usersTable.id,
        email: usersTable.email,
        name: usersTable.name,
        password: usersTable.password,
        isActivate: usersTable.isActivate,
        // role: usersTable.role,
        role: rolesTable.name,
      })
    .from(usersTable)
    .leftJoin(rolesTable, eq(usersTable.role, rolesTable.id))
    .where(eq(usersTable.email , email ))
    .limit(1);
    
    return result[0];
  }

  // async getUserbyId(id: number): Promise<Omit<User, 'password'|'createdAt'|'updatedAt'> | undefined> {
  async getUserbyId(id: number): Promise<IUser> {
    try{
      const result = await this.db.select({
          id:  usersTable.id,
          name: usersTable.name,
          email: usersTable.email,
          // role: usersTable.role,
          role: rolesTable.name,
          isActivate: usersTable.isActivate
        })
        .from(usersTable)
        .leftJoin(rolesTable, eq(usersTable.id, rolesTable.id))
        .where(eq( usersTable.id, id ))
        .limit(1);
  
      return result[0] || null;
      
    }catch(err){
      console.error("Error en la base de datos al buscar el usuario " + id + ": ", err);
      throw new Error("Error al obtener el usuario " + id + " " + err);
    }
  }

  async createUser( createUser: CreateUser): Promise<any>{

    try {
      const hash = await argon2.hash( createUser.password );
      
      const newUser = {
        ...createUser,
        password: hash,
        isActivate:true,
      };

      await this.db.insert(usersTable).values(newUser);

    } catch (err) {

      throw new Error("Error al crear un usuario " + err);
    }
  }

  async update(id: number, user: Partial<UpdateUserDto>): Promise<User>{

    const User = await this.getUserbyId(id);

    if (!User) {
      throw new NotFoundException('La usuario no existe');
    }
    
    const updateData: Partial<User> = {
      name: user.name,
      role: user.role,
      isActivate: user.isActivate,
      updatedAt: new Date()
    };

    const updatedUser = await this.db
    .update(usersTable)
    .set(updateData)
    .where(eq(usersTable.id, id))

    return updatedUser[0];
  }

  // async delete(id: number): Promise<Omit<User, 'password'|'createdAt'|'updatedAt'>>{
  async delete(id: number): Promise<IUser>{

    const user = await this.getUserbyId(id);

    if (!user) {
      throw new NotFoundException('La usuario no existe');
    }
    const updateData: Partial<User> = {
      isActivate: false, 
      updatedAt: new Date()
    };

    await this.db
    .update(usersTable)
    .set(updateData)
    .where(eq(usersTable.id, id));

    return await this.getUserbyId(id);
  }

  async getAll(filter: SearchUserDto, user: IJwtPayload): Promise<ResultGetAll> {
    const buscadorLike: string = filter.name ? filter.name : '';

    //Filtrar por status = true
    const statusCondition = eq(usersTable.isActivate , true );

    //Búsqueda por nombre
    const searchCondition = ilike(usersTable.name, `%${buscadorLike}%`)

    //Combinamos las condiciones con AND
    const whereCondition = searchCondition ? and(statusCondition, searchCondition) : statusCondition

    const rows = await 
    this.db.select({
      id:  usersTable.id,
      name: usersTable.name,
      email: usersTable.email,
      isActivate: usersTable.isActivate,
      createdAt: usersTable.createdAt,
      updatedAt: usersTable.updatedAt,
      role: rolesTable.name,
      roleId: rolesTable.id,
    })
    .from(usersTable)
    .leftJoin(rolesTable, eq(usersTable.role, rolesTable.id))
    .where(searchCondition)
    .orderBy(desc(usersTable.id))
    .limit(filter.take)
    .offset((filter.page - 1) * filter.take);

    // Consulta para obtener el total de usuarios (para metadata)
    const [{ value: total }] = await this.db.select({ value: count() }).from(usersTable).where(searchCondition);

    const result = new ResultGetAll();
    result.total = total;
    result.page = filter.page;
    result.list = rows;

    return result;
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

  //Para el contador de usuarios en el dashboard
  async countAllUsers(): Promise<{ count: number }> {
    const [result] = await 
    this.db.select({ count: count() })
    .from(usersTable)
    
    return result ? result : { count: 0 };
  }
}