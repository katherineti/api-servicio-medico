import { Inject, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { NeonDatabase } from 'drizzle-orm/neon-serverless';
import { PG_CONNECTION } from 'src/constants';
import { assignmentTable, employeeFamilyTable, employeeTable, familyTable, typesAssignmentTable } from 'src/db/schema';
import { CreateAssignmentDto } from './dto/create-assignment.dto';
import { Assignment, CreateAssignment } from 'src/db/types/assignment.types';
import { Employee } from 'src/db/types/employee.types';
import { typesAssignment } from 'src/db/types/type-assignment.types';
import { eq, and } from 'drizzle-orm'
import { CreateFamilyDto } from './dto/create-family.dto';

@Injectable()
export class AssignmentService {

    constructor(@Inject(PG_CONNECTION) private db: NeonDatabase) {}
    async createAssignment( create: CreateAssignmentDto): Promise<Assignment>{
        try {
        
            const insert: CreateAssignment = {
                ...create,
            };
            const [result] =  await this.db.insert(assignmentTable).values(insert).returning();
            Logger.debug(JSON.stringify(result));
            return result;
    
        } catch (err) {
            console.error('Error al insertar en assignmentTable:', err);
            throw new Error("Error al registrar una asignacion en la base de datos " + err);
        }
    }

    async getAllEmployees(): Promise<Employee[]> {
        try{
            return await this.db.select().from(employeeTable).orderBy(employeeTable.name);
        } catch (error) {
            console.error('Error al obtener todas las categorías', error);
            throw new Error(`Error al obtener todas las categorías: ${error.message}`);
        }
    }
/*         async getAllFamilies(): Promise<Family[]> {
        try{
            return await this.db.select().from(familyTable).orderBy(familyTable.name);
        } catch (error) {
            console.error('Error al obtener todas los familiares', error);
            throw new Error(`Error al obtener todos los familiares: ${error.message}`);
        }
    } */
    async getFamiliesByEmployee(employeeId:number): Promise<any[]> {
        try{
            return await 
            this.db.select({
                id: employeeFamilyTable.id,
                employeeId: employeeFamilyTable.employeeId,
                familyId: employeeFamilyTable.familyId,
                familyName:familyTable.name,
                familyCedula:familyTable.cedula
            })
            .from(employeeFamilyTable)
            .leftJoin(familyTable, eq(employeeFamilyTable.familyId, familyTable.id))
            .where( eq(employeeFamilyTable.employeeId, employeeId) )
            .orderBy(familyTable.name);

        } catch (error) {
            console.error('Error al obtener los familiares de un empleado', error);
            throw new Error(`Error al obtener los familiares de un empleado: ${error.message}`);
        }
    }

    async addFamilyMember(family:CreateFamilyDto){
        try{
            const [resultFamily] =  await this.db.insert(familyTable).values(family).returning();
            Logger.debug("Insert de familiar ", JSON.stringify(resultFamily))

            if(!resultFamily){
                throw new NotFoundException('Error al crear un familiar');
            }

                const insertEmployeeFamily = { 
                    employeeId: family.employeeId,
                    familyId: resultFamily.id
                }
                const [resultEmployeeFamily] =  await this.db.insert(employeeFamilyTable).values(insertEmployeeFamily).returning();

                if(!resultEmployeeFamily){
                    throw new NotFoundException('Error al crear la relacion empleado - familiar');
                }
                Logger.debug("Insert en Employee - Family ", JSON.stringify(resultEmployeeFamily))

                const [getOneFamilyByEmployeeSelected] = await 
                this.db.select({
                    id: employeeFamilyTable.id,
                    employeeId: employeeFamilyTable.employeeId,
                    familyId: employeeFamilyTable.familyId,
                    familyName:familyTable.name,
                    familyCedula:familyTable.cedula
                })
                .from(employeeFamilyTable)
                .leftJoin(familyTable, eq(employeeFamilyTable.familyId, familyTable.id))
                .where( and( 
                    eq(employeeFamilyTable.employeeId, family.employeeId),
                    eq(employeeFamilyTable.familyId, resultFamily.id)
                 ) )
                .orderBy(familyTable.name);

                Logger.debug("Consulta de la relacion Empleado seleccionado - Familiar nuevo ",JSON.stringify(getOneFamilyByEmployeeSelected))

                return getOneFamilyByEmployeeSelected;

        } catch (error) {
            console.error('Error al crear un familiar', error);
            throw new Error(`Error al crear un familiar: ${error.message}`);
        }
    }
    async getAllTypesAssignment(): Promise<typesAssignment[]> {
        try{
            return await this.db.select().from(typesAssignmentTable).orderBy(typesAssignmentTable.id);
        } catch (error) {
            console.error('Error al obtener todos los tipos de asignación', error);
            throw new Error(`Error al obtener todos los tipos de asignación: ${error.message}`);
        }
    }
}