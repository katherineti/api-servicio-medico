import { NeonDatabase } from 'drizzle-orm/neon-serverless';
import { CreateAssignmentDto } from './dto/create-assignment.dto';
import { Assignment } from 'src/db/types/assignment.types';
import { Employee } from 'src/db/types/employee.types';
import { typesAssignment } from 'src/db/types/type-assignment.types';
import { CreateFamilyDto } from './dto/create-family.dto';
import { CreateEmployeeDto } from './dto/create-employee.dto';
import { MedicalSuppliesService } from 'src/medical-supplies/medical-supplies.service';
import { LogsService } from 'src/logs/logs.service';
import { IcustomerAccessPoint } from 'src/logs/interfaces/logs.interface';
export declare class AssignmentService {
    private db;
    private medicalSuppliesService;
    private logsService;
    constructor(db: NeonDatabase, medicalSuppliesService: MedicalSuppliesService, logsService: LogsService);
    createAssignment(create: CreateAssignmentDto, userId: number, customerAccessPoint: IcustomerAccessPoint): Promise<Assignment>;
    getAllEmployees(): Promise<Employee[]>;
    getFamiliesByEmployee(employeeId: number): Promise<any[]>;
    getAllTypesAssignment(): Promise<typesAssignment[]>;
    addFamilyMember(family: CreateFamilyDto): Promise<any>;
    addEmployee(createEmployeeDto: CreateEmployeeDto): Promise<Employee>;
    totalAssignmentOfTheDay(): Promise<{
        count: number;
    }>;
    countProductsAssignmentOfTheDay(): Promise<{
        count: number;
    }>;
    countProductsAssignmentOfMonth(typesMedicalSuppliesArray: Array<number>): Promise<{
        count: number;
    }>;
    totalAssignmentOfMonth(): Promise<{
        count: number;
    }>;
    totalAssignments(): Promise<{
        count: number;
    }>;
    getAccumulatedAssignmentProductsByType(): Promise<{
        sumAsig_medicamentos: number;
        sumAsig_uniformes: number;
        sumAsig_equiposOdontologicos: number;
    }>;
    calculateCurrentMonthRange(): {
        startOfMonth: Date;
        endOfMonth: Date;
    };
    getYear(): {
        startOfYear: Date;
        endOfYear: Date;
    };
}
