import { Controller, Get } from '@nestjs/common';
import { TypesRoles } from 'src/db/enums/types-roles';
import { Roles } from 'src/decorators/role.decorators';
import { MedicalSuppliesService } from 'src/medical-supplies/medical-supplies.service';
import { UsersService } from 'src/users/users.service';

@Controller('dashboard')
export class DashboardController {
  constructor(private readonly usersService: UsersService , private readonly medicalSuppliesService: MedicalSuppliesService) { }

    @Roles(TypesRoles.admin)
    @Get('totalUsers')
    totalUsers(): Promise<{ count: number }> {
    return this.usersService.countAllUsers();
    }

    @Get('totalProductsOfTheDay')
    totalProductsOfTheDay(): Promise<{ count: number }> {
    return this.medicalSuppliesService.totalProductsOfTheDay();
    }

    @Get('totalProductsOfMonth')
    totalProductsOfMonth(): Promise<{ count: number }> {
    return this.medicalSuppliesService.totalProductsOfMonth();
    }
}
