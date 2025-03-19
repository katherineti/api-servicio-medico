
import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AbstractInstanceResolver } from '@nestjs/core/injector/abstract-instance-resolver';
import { JwtService } from '@nestjs/jwt';
import { ROLES_KEY } from 'src/decorators/role.decorators';
import {RoleType} from 'types'

//Un Guard es una clase que determina si una solicitud debe ser manejada por un controlador. 

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(
    private reflector: Reflector, 
    private jwtService: JwtService
  ) {}

  canActivate(context: ExecutionContext): boolean {
    // const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
    //en el controlador cuando uso el decorador @Roles(RoleType.Admin) le mando en el parametro un valor string del rol que quiero. si no le mando nada entonces este guard recibe un UNDEFINED
    const requiredRoles = this.reflector.getAllAndOverride<RoleType[] | undefined>(ROLES_KEY, [
      context.getHandler(), //obtiene el método del controlador que se está ejecutando. POST;GET;UPDATE
      context.getClass(), // obtiene la clase del controlador.
    ]);
    console.log("requiredRoles ", requiredRoles ) //salida: requiredRoles  [ 'admin' ]
    if ( typeof requiredRoles=='undefined' || requiredRoles.length===0) {
      // console.log("retorna un true, dar acceso a la info")
    return true; //guard 
    //SI NO LLEGA NADA NO REQUIERE AUTENTICACION Y ME DA ACCESO A LA INFO
  }
    /* if (!requiredRoles) {
      return true;
    } */

    const request = context.switchToHttp().getRequest();
    console.log("request",request.headers.authorization)
    const bearerToken = request.headers.authorization

    if(typeof bearerToken == 'undefined'){
      return false
    }
    const tokenSinBearer = bearerToken.replace("Bearer ", "")
    console.log("tokenSinBearer", tokenSinBearer )

    const payloadToken=this.jwtService.decode(tokenSinBearer)
    console.log("payloadToken", payloadToken )
    console.log("payloadToken.role", payloadToken.role )
   
    // if( requiredRoles.includes('USER')){
    //   return true;
    // }

    // const { user } = context.switchToHttp().getRequest();    console.log("user " , user) //salida: user  undefined
/*    return requiredRoles.some((role) => user.roles?.includes(role)); */ //El Guard verifica si alguno de los roles requeridos está incluido en los roles del usuario (user.roles).//some() devuelve true si al menos un elemento del array cumple la condición.
      //user.roles?.includes(role) verifica si el array de roles del usuario contiene el rol requerido.
    
    // return true; //si recibe informacion accede a la informacion y NO da error//si no colocoo nada aqui entonces retorna un false y da error 403
    // return false;
    const elUsuarioTieneElRolRequerido = requiredRoles.includes(payloadToken.role); 
    return elUsuarioTieneElRolRequerido//requiredRoles.includes(payloadToken.role); //si el rol del usuarioi (payloadToken.role) esta dentro del arreglo requiredRoles que es el que yo defino en roletype
    // return ["ADMIN"].includes(payloadToken.role);
 
} 
/*
*puede activarse
*si devuelve true la ruta se puede AbstractInstanceResolversi es false no se activa y no puedo acceder 
*falso es no tengo acceso 
*/
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
//link documentacion nest.js: https://docs.nestjs.com/security/authorization
/*
Obtención del Usuario:
const { user } = context.switchToHttp().getRequest();
Aquí, el Guard obtiene el objeto user de la solicitud HTTP. Se asume que el objeto user ha sido agregado a la solicitud por un Guard de autenticación anterior (por ejemplo, un Guard de JWT).
*/