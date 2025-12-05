import { NeonDatabase } from 'drizzle-orm/neon-serverless';
import { SearchRolesDto } from './dto/search.roles.dto';
import { ResultGetAllRoles } from './dto/read-role-dto';
import { CreateRole, RolesSelect } from 'src/db/types/roles.types';
import { RoleDto } from './dto/role.dto';
export declare class RolesService {
    private db;
    constructor(db: NeonDatabase);
    get(filter: SearchRolesDto): Promise<ResultGetAllRoles>;
    getRoleById(id: number): Promise<any>;
    create(newRole: CreateRole): Promise<any>;
    update(id: number, roleDto: Partial<RoleDto>): Promise<RolesSelect>;
    delete(id: number): Promise<RolesSelect>;
    getRoles_Actives(): Promise<any>;
}
