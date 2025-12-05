import { AssignmentService } from './assignment.service';
import { CreateAssignmentDto } from './dto/create-assignment.dto';
import { Employee } from 'src/db/types/employee.types';
import { typesAssignment } from 'src/db/types/type-assignment.types';
import { Assignment } from 'src/db/types/assignment.types';
import { CreateFamilyDto } from './dto/create-family.dto';
import { IJwtPayload } from 'src/auth/dto/jwt-payload.interface';
export declare class AssignmentController {
    private readonly assignmentService;
    constructor(assignmentService: AssignmentService);
    createAssignment(createAssignmentDto: CreateAssignmentDto, user: IJwtPayload, clienteIp: string, req: Request): Promise<Assignment>;
    getUsers(): Promise<Employee[]>;
    getFamiliesByEmployee(employeeId: number): Promise<any[]>;
    getAllTypesAssignment(): Promise<typesAssignment[]>;
    addFamilyMember(createFamilyDto: CreateFamilyDto): Promise<any>;
    addEmployee(createEmployeeDto: any): Promise<Employee>;
}
