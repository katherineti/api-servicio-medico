import { Body, Controller, Get, Ip, Param, ParseIntPipe, Post, Req, UsePipes, ValidationPipe } from '@nestjs/common';
import { AssignmentService } from './assignment.service';
import { CreateAssignmentDto } from './dto/create-assignment.dto';
import { Family } from 'src/db/types/family.types';
import { Employee } from 'src/db/types/employee.types';
import { typesAssignment } from 'src/db/types/type-assignment.types';
import { Assignment } from 'src/db/types/assignment.types';
import { CreateFamilyDto } from './dto/create-family.dto';
import { Usersesion } from 'src/auth/strategies/usersesion.decorator';
import { IJwtPayload } from 'src/auth/dto/jwt-payload.interface';

@Controller('assignment')
export class AssignmentController {
    constructor(private readonly assignmentService: AssignmentService) { }
    @Post('create-assignment')
    @UsePipes(ValidationPipe)
    async createAssignment(
        @Body() createAssignmentDto: CreateAssignmentDto,
            @Usersesion() user: IJwtPayload,
            @Ip() clienteIp: string,
            @Req() req: Request
    ): Promise<Assignment>{
        let client = {
            ip: clienteIp,
            hostname: req.headers['host']
        };
        return this.assignmentService.createAssignment(createAssignmentDto, user.sub, client);
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

    @Post('addFamilyMember')
    addFamilyMember( @Body() createFamilyDto: CreateFamilyDto ): Promise<any>{
        return this.assignmentService.addFamilyMember(createFamilyDto)
    }

    @Post('addEmployee')
    addEmployee( @Body() createEmployeeDto: any ): Promise<Employee>{
        return this.assignmentService.addEmployee(createEmployeeDto)
    }
}