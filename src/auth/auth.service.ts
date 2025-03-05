// import { Injectable } from '@nestjs/common';
import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { NeonDatabase } from 'drizzle-orm/neon-serverless';
import { JWTSecret, PG_CONNECTION } from 'src/constants';
import { UsersService } from 'src/users/users.service';
import * as argon2 from "argon2";
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {

     constructor(
        @Inject(PG_CONNECTION) private db: NeonDatabase,
        private usersService: UsersService,
        private jwtService: JwtService
    ) {}

        async signIn(email:string, password: string): Promise<{ access_token: string }> {
            
            const user = await this.usersService.findOne(email);

            if(!user){
               throw new UnauthorizedException("Usuario no encontrado"); 
            }

            const authorized = await argon2.verify( user.password , password ); //devuelve true o false

            if( !authorized ){
                throw new UnauthorizedException("Contraseña incorrecta");
            }

            const payload = { 
              sub: user.id, 
              username: user.username, 
              email: user.email
            };
            console.log("JWTSecret " , JWTSecret)
            console.log("payload " , payload)

            return { //TOKEN es la firma 
              access_token: await this.jwtService.signAsync(payload, {
                secret: JWTSecret
              }),
            };
          }
}