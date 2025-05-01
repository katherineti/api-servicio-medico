import { Controller, Get } from '@nestjs/common';
import { AssignmentService } from 'src/assignment/assignment.service';
import { TypesRoles } from 'src/db/enums/types-roles';
import { Roles } from 'src/decorators/role.decorators';
import { MedicalSuppliesService } from 'src/medical-supplies/medical-supplies.service';
import { UsersService } from 'src/users/users.service';

@Controller('dashboard')
export class DashboardController {
  constructor(private readonly usersService: UsersService , private readonly medicalSuppliesService: MedicalSuppliesService, private readonly assignmentService: AssignmentService) { }

    @Roles(TypesRoles.admin)
    @Get('totalUsers')
    totalUsers(): Promise<{ count: number }> {
    return this.usersService.countAllUsers();
    }

    @Roles(TypesRoles.admin)
    @Get('totalProductsOfTheDay')
    totalProductsOfTheDay(): Promise<{ count: number }> {
      return this.medicalSuppliesService.totalProductsOfTheDay();
    }
    
    @Roles(TypesRoles.admin)
    @Get('totalProductsOfMonth')
    totalProductsOfMonth(): Promise<{ count: number }> {
    return this.medicalSuppliesService.totalProductsOfMonth();
    }

    // Para el dashboard del usuario almacen:
    @Roles(TypesRoles.admin, TypesRoles.almacen)
    @Get('totalAssignmentOfTheDay')
    totalAssignmentOfTheDay(): Promise<{ count: number }> {
    return this.assignmentService.totalAssignmentOfTheDay();
    }

    @Roles(TypesRoles.admin, TypesRoles.almacen)
    @Get('totalAssignmentOfMonth')
    totalAssignmentOfMonth(): Promise<{ count: number }> {
    return this.assignmentService.totalAssignmentOfMonth();
    }

    @Roles(TypesRoles.almacen)
    @Get('totalAllProducts')
    totalAllProducts(): Promise<{ count: number }> {
      return this.medicalSuppliesService.countAllProducts();
    }
}