import { RolesService } from './roles.service';
import { SearchRolesDto } from './dto/search.roles.dto';
import { ResultGetAllRoles } from './dto/read-role-dto';
import { RoleDto } from './dto/role.dto';
export declare class RolesController {
    private readonly rolesService;
    constructor(rolesService: RolesService);
    get(body: SearchRolesDto): Promise<ResultGetAllRoles>;
    create(body: RoleDto): Promise<any>;
    update(id: number, role: RoleDto): Promise<any>;
    delete(id: number): Promise<any>;
    getActives(): Promise<any>;
}
