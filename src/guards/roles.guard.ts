
import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AbstractInstanceResolver } from '@nestjs/core/injector/abstract-instance-resolver';
import { ROLES_KEY } from 'src/decorators/role.decorators';
import {RoleType} from 'types'
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    // const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
    //en el controlador cuando uso el decorador @Roles(RoleType.Admin) le mando en el parametro un valor string del rol que quiero. si no le mando nada entonces este guard recibe un UNDEFINED
    const requiredRoles = this.reflector.getAllAndOverride<RoleType[] | undefined>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    /* if (!requiredRoles) {
      return true;
    } */
      console.log("requiredRoles ", requiredRoles )

  
   
    if ( typeof requiredRoles=='undefined' || requiredRoles.length===0) {
        console.log("retorna un true, dar acceso a la info")
      return true; //guard 
      //SI NO LLEGA NADA NO REQUIERE AUTENTICACION Y ME DA ACCESO A LA INFO
    }

    return true; //si recibe informacion accede a la informacion y NO da error//si no colocoo nada aqui entonces retorna un false y da error 403

    // const { user } = context.switchToHttp().getRequest();
    // return requiredRoles.some((role) => user.roles?.includes(role));
  
}/* 

puede activarse
si devuelve true la ruta se puede AbstractInstanceResolversi es false no se activa y no puedo acceder 
falso es no tengo acceso */
}
/*
EN EL AppModule IMPORTO EL GUARD ASI: {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
    Y ESTO  LO QUE HACE ES QUE EL GUARD SE VA A USAR EN TODO EL MODULO APP
    COMO SABEMOS QUE EL USER QUE ENTRA ES ADMIN?EN EL TOKEN
 */

    // cuando retorna falso la respuesta es un  "error": "Forbidden",
