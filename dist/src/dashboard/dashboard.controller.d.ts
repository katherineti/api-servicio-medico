import { AssignmentService } from 'src/assignment/assignment.service';
import { MedicalSuppliesExpiredService } from 'src/medical-supplies-expired/medical-supplies-expired.service';
import { MedicalSuppliesService } from 'src/medical-supplies/medical-supplies.service';
import { UsersService } from 'src/users/users.service';
export declare class DashboardController {
    private readonly usersService;
    private readonly medicalSuppliesService;
    private readonly assignmentService;
    private readonly medicalSuppliesExpiredService;
    constructor(usersService: UsersService, medicalSuppliesService: MedicalSuppliesService, assignmentService: AssignmentService, medicalSuppliesExpiredService: MedicalSuppliesExpiredService);
    totalUsers(): Promise<{
        count: number;
    }>;
    totalProductsOfTheDay(): Promise<{
        count: number;
    }>;
    totalProductsOfMonth(): Promise<{
        count: number;
    }>;
    totalAssignmentOfTheDay(): Promise<{
        count: number;
    }>;
    totalAssignmentOfMonth(): Promise<{
        count: number;
    }>;
    totalAllProducts(): Promise<{
        count: number;
    }>;
    totalAssignments(): Promise<any>;
    TotalAvailableProductsByType(): Promise<any>;
    totalOfProductAssignmentsByType(): Promise<any>;
    expiredProductsCount(): Promise<any>;
}
