import { Controller, Get } from '@nestjs/common';
import { AssignmentService } from 'src/assignment/assignment.service';
import { TypesRoles } from 'src/db/enums/types-roles';
import { Roles } from 'src/decorators/role.decorators';
import { MedicalSuppliesExpiredService } from 'src/medical-supplies-expired/medical-supplies-expired.service';
import { MedicalSuppliesService } from 'src/medical-supplies/medical-supplies.service';
import { UsersService } from 'src/users/users.service';

@Controller('dashboard')
export class DashboardController {
  constructor(private readonly usersService: UsersService , private readonly medicalSuppliesService: MedicalSuppliesService, private readonly assignmentService: AssignmentService, private readonly medicalSuppliesExpiredService: MedicalSuppliesExpiredService) { }

    @Roles(TypesRoles.admin, TypesRoles.adminRRHH, TypesRoles.auditor)
    @Get('totalUsers')
    totalUsers(): Promise<{ count: number }> {
    return this.usersService.countAllUsers();
    }

    @Roles(TypesRoles.admin, TypesRoles.adminRRHH, TypesRoles.auditor)
    @Get('totalProductsOfTheDay')
    totalProductsOfTheDay(): Promise<{ count: number }> {
      return this.medicalSuppliesService.totalProductsOfTheDay();
    }
    
    @Roles(TypesRoles.admin, TypesRoles.adminRRHH, TypesRoles.auditor)
    @Get('totalProductsOfMonth')
    totalProductsOfMonth(): Promise<{ count: number }> {
    return this.medicalSuppliesService.totalProductsOfMonth();
    }

    @Roles(TypesRoles.admin, TypesRoles.adminRRHH, TypesRoles.almacen, TypesRoles.auditor)
    @Get('totalAssignmentOfTheDay')
    totalAssignmentOfTheDay(): Promise<{ count: number }> {
    return this.assignmentService.totalAssignmentOfTheDay();
    }

    @Roles(TypesRoles.admin, TypesRoles.adminRRHH, TypesRoles.almacen, TypesRoles.auditor)
    @Get('totalAssignmentOfMonth')
    totalAssignmentOfMonth(): Promise<{ count: number }> {
    return this.assignmentService.totalAssignmentOfMonth();
    }

    @Get('totalAllProducts')
    totalAllProducts(): Promise<{ count: number }> {
      return this.medicalSuppliesService.countAllProducts();
    }

    //Solo para el rol: Médico. Corresponde al Card en el dashboard: 'Registro Anual de las Asignaciones de Insumos Médicos a Empleados'
    @Get('totalAssignments')
    totalAssignments(): Promise<any> {
      return this.assignmentService.totalAssignments();
    }

    @Roles(TypesRoles.admin, TypesRoles.adminRRHH, TypesRoles.almacen)
    @Get('totalAvailableProductsByType')
    TotalAvailableProductsByType(): Promise<any> {
    return this.medicalSuppliesService.getAccumulatedStockByType();
    }

    @Roles(TypesRoles.admin, TypesRoles.adminRRHH, TypesRoles.almacen)
    @Get('totalOfProductAssignmentsByType')
    totalOfProductAssignmentsByType(): Promise<any> {
    return this.assignmentService.getAccumulatedAssignmentProductsByType();
    }

    @Get('expiredProductsCount')
    expiredProductsCount(): Promise<any> {
    return this.medicalSuppliesExpiredService.expiredProductsCount();
    }
}