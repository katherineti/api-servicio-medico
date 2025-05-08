import { Body, Controller, Delete, Get, Param, ParseIntPipe, Post, Put, UsePipes, ValidationPipe } from '@nestjs/common';
import { RolesService } from './roles.service';
import { Roles } from 'src/decorators/role.decorators';
import { TypesRoles } from 'src/db/enums/types-roles';
import { SearchRolesDto } from './dto/search.roles.dto';
import { ResultGetAllRoles } from './dto/read-role-dto';
import { RoleDto } from './dto/role.dto';

@Controller('roles')
export class RolesController {
  constructor(private readonly rolesService: RolesService) { }

    @Roles(TypesRoles.admin, TypesRoles.auditor)
    @Post('getAll')
    @UsePipes(ValidationPipe)
    get(@Body() body: SearchRolesDto): Promise<ResultGetAllRoles> {
        return this.rolesService.get(body);
    }

    @Post('/create')
    @Roles(TypesRoles.admin)
    @UsePipes(ValidationPipe)
    async create(@Body() body: RoleDto): Promise<any> {
        return this.rolesService.create(body);
    }

    @Put(':id')
    @Roles(TypesRoles.admin)
    @UsePipes(ValidationPipe)
    update(
    @Param('id', ParseIntPipe) id: number,
    @Body() role: RoleDto,
    ): Promise<any> {

    return this.rolesService.update(id, role);
    }

    @Roles(TypesRoles.admin)
    @Delete(':id')
    delete(@Param('id', ParseIntPipe) id: number): Promise<any> {
    return this.rolesService.delete(id);
    }

    @Get('getRolesActives')
    getActives(): Promise<any> {
        return this.rolesService.getRoles_Actives();
    }
}