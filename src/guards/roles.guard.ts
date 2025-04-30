
import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
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

    if (!roles) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const { user } = request;

    if (!user || user.role === undefined) {
      return false;
    }
    
    // Si user.role es un string, lo comparamos directamente con los roles permitidos
    const hasRole = () => roles.includes(user.role);

    return user?.role && hasRole();
  } 

}