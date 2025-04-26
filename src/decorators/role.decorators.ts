
import { SetMetadata } from '@nestjs/common';
import { TypesRoles } from 'src/db/enums/types-roles';

export const ROLES_KEY = 'roles';
export const Roles = (...roles: TypesRoles[]) => SetMetadata(ROLES_KEY, roles);