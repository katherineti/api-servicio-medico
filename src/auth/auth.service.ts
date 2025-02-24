// import { Injectable } from '@nestjs/common';
import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { NeonDatabase } from 'drizzle-orm/neon-serverless';
import { PG_CONNECTION } from 'src/constants';
import { UsersService } from 'src/users/users.service';
import * as argon2 from "argon2";

@Injectable()
export class AuthService {

     constructor(
        @Inject(PG_CONNECTION) private db: NeonDatabase,
        private usersService: UsersService) {}

        async signin(email:string, password: string) {
            
            const user = await this.usersService.findOne(email);

            if(!user){
               throw new UnauthorizedException("Usuario no encontrado"); 
            }

            const authorized = await argon2.verify( user.password , password ); //devuelve true o false

            if( !authorized ){
                throw new UnauthorizedException("Contraseña incorrecta");
            }
          }
}