
import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { ROLES_KEY } from 'src/decorators/role.decorators';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(
    private reflector: Reflector, 
  ) {}

  canActivate(context: ExecutionContext): boolean {
  
    const roles = this.reflector.getAllAndOverride<string[] | undefined>(ROLES_KEY, [
      context.getHandler(), 
      context.getClass(),
    ]);

    console.log("requiredRoles ", roles ) 

    if (!roles) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const { user } = request;

    // const isAuth = roles.some( (role)=>role === user)
    // if(!isAuth){
    //   throw new UnauthorizedException("No tienes permisos");
    // }

    const hasRole = () =>
      user.roles.some((role: string) => roles.includes(role));

    return user?.roles && hasRole();

  console.log("................................");
  } 

}