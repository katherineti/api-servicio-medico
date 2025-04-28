import { Body, Controller, Get, Param, ParseIntPipe, Post, UsePipes, ValidationPipe } from '@nestjs/common';
import { AssignmentService} from './assignment.service';
import { CreateAssignmentDto } from './dto/create-assignment.dto';
import { Family } from 'src/db/types/family.types';
import { Employee } from 'src/db/types/employee.types';
import { typesAssignment } from 'src/db/types/type-assignment.types';
import { Assignment } from 'src/db/types/assignment.types';

@Controller('assignment')
export class AssignmentController {
    constructor(private readonly assignmentService: AssignmentService) { }
    @Post('create-assignment')
    @UsePipes(ValidationPipe)
    async createAssignment(
        @Body() createAssignmentDto: CreateAssignmentDto,
    ): Promise<Assignment>{
        return this.assignmentService.createAssignment(createAssignmentDto);
    }

    @Get('getAllEmployees')
    getUsers( ): Promise<Employee[]> {
    return this.assignmentService.getAllEmployees();
    }

    @Get('getFamiliesByEmployee/:employeeId')
    getFamiliesByEmployee(
       @Param('employeeId', ParseIntPipe) employeeId: number,
    ): Promise<any[]> {
        console.log("this.assignmentService.getFamiliesByEmployee(employeeId) -> " , this.assignmentService.getFamiliesByEmployee(employeeId))
    return this.assignmentService.getFamiliesByEmployee(employeeId);
    }

    @Get('getAllTypesAssignment')
    getAllTypesAssignment( ): Promise<typesAssignment[]> {
    return this.assignmentService.getAllTypesAssignment();
    }
}