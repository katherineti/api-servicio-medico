import { ConflictException, Inject, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { NeonDatabase } from 'drizzle-orm/neon-serverless';
import { PG_CONNECTION } from 'src/constants';
import { assignmentTable, employeeFamilyTable, employeeTable, familyTable, productsTable, typesAssignmentTable, typesOfProductsTable } from 'src/db/schema';
import { CreateAssignmentDto } from './dto/create-assignment.dto';
import { Assignment, CreateAssignment } from 'src/db/types/assignment.types';
import { Employee } from 'src/db/types/employee.types';
import { typesAssignment } from 'src/db/types/type-assignment.types';
import { eq, and, count, sql, gte, lt, inArray, ne, sum, lte, isNotNull } from 'drizzle-orm'
import { CreateFamilyDto } from './dto/create-family.dto';
import { CreateEmployeeDto } from './dto/create-employee.dto';
import { Product } from 'src/db/types/products.types';
import { MedicalSuppliesService } from 'src/medical-supplies/medical-supplies.service';
import { LogsService } from 'src/logs/logs.service';
import { IcustomerAccessPoint } from 'src/logs/interfaces/logs.interface';

@Injectable()
export class AssignmentService {

    constructor(@Inject(PG_CONNECTION) private db: NeonDatabase, private medicalSuppliesService: MedicalSuppliesService, private logsService: LogsService) {}

    async createAssignment( create: CreateAssignmentDto, userId: number, customerAccessPoint: IcustomerAccessPoint): Promise<Assignment>{
        console.log("Body ", create)
        const product:Product = await this.medicalSuppliesService.getProductbyId(create.productId);
        if (!product) {
            throw new NotFoundException('El producto no existe.');
        }

        // Calcula el stock disponible considerando las asignaciones 
        const stockDisponible = product.stock;
        
        // Asegura que la cantidad de productos a asignar no exceda el stock disponible.
        if (stockDisponible < create.products) {
            throw new ConflictException('El stock actual del producto es insuficiente.');
        }

        if(product.statusId===4){
            throw new ConflictException('El producto ha caducado. No puede asignar un producto en este estado.');
        }

        Logger.debug("Producto " , JSON.stringify(product));
        //Insert de la asignación
        const insert: CreateAssignment = {
            ...create,
        };
        const [result] =  await this.db.insert(assignmentTable).values(insert).returning();
        Logger.debug("Insert de la asignacion ", JSON.stringify(result));

        if(!result){
            throw new Error('Error al crear la asignación de producto para el empleado.');
        }

        //Actualiza el stock en la tabla productos
        const updateData: Partial<Product> = {
        name: product.name,
        description: product.description,
        categoryId: product.categoryId,
        type: product.type,
        stock: (stockDisponible - create.products ) as number,
        statusId: product.statusId,
        updatedAt: new Date(),
        };

        const updatedStockProduct = await this.db
        .update(productsTable)
        .set(updateData)
        .where(eq(productsTable.id, product.id))
        .returning()
        .execute()

        if(!updatedStockProduct){
        throw new ConflictException('Error al actualizar el stock del producto.');
        }
        Logger.debug("Stock actualizado en la tabla productos " + JSON.stringify(updatedStockProduct));

        //Inserta un log 
        this.logsService.create({
            action: 'Asignación de insumo médico',
            userId: userId,
            productId: create.productId,
            ipAddress: customerAccessPoint.ip,
            hostname: customerAccessPoint.hostname
        });

        return result; //Retorna el resultado del insert de la asignacion
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

    async getAllTypesAssignment(): Promise<typesAssignment[]> {
        try{
            return await this.db.select().from(typesAssignmentTable).orderBy(typesAssignmentTable.id);
        } catch (error) {
            console.error('Error al obtener todos los tipos de asignación', error);
            throw new Error(`Error al obtener todos los tipos de asignación: ${error.message}`);
        }
    }

    async addFamilyMember(family:CreateFamilyDto): Promise<any>{
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

    async addEmployee(createEmployeeDto:CreateEmployeeDto): Promise<Employee>{
        try{
            const [resulEmployee] =  await this.db.insert(employeeTable).values(createEmployeeDto).returning();
            Logger.debug("Insert de empleado", JSON.stringify(resulEmployee))
            return resulEmployee;
        } catch (error) {
            console.error('Error al crear un empleado', error);
            throw new Error(`Error al crear un empleado: ${error.message}`);
        }
    }

   //Para el contador de registros de asignaciones de insumos medicos al empleado, del dia, en el dashboard. 
   /**
    * 
    * @description inArray(productsTable.type, [1, 2, 3]) :
    * select * from public."typesProducts" :
    *  id    type
       1	"Medicamentos"
       2	"Uniformes"
       3	"Equipos odontologicos"
       @description ne(productsTable.statusId, 4) : debe omitir los insumos medicos caducados, porque no se deben realizar asignaciones de productos caducados
    */
    async totalAssignmentOfTheDay(): Promise<{ count: number }> {
        const today = new Date();
        today.setHours(0, 0, 0, 0); // Establece la hora a 00:00:00.000
        const endOfDay = new Date(today);
        endOfDay.setHours(23, 59, 59, 999);
    
        let whereConditions = and(
            isNotNull(assignmentTable.employeeId),
            gte(assignmentTable.createdAt, today),
            lt(assignmentTable.createdAt, endOfDay),
            inArray(productsTable.type, [1, 2, 3]),
            inArray(productsTable.statusId, [1, 2, 3, 4])
        );
    
        const [assignmentsCount] = await this.db
          .select({ count: count() })
          .from(assignmentTable)
          .innerJoin(productsTable, eq(productsTable.id, assignmentTable.productId))
          .where(whereConditions);
        
        Logger.debug("Contador de registros de asignaciones de insumos medicos al empleado, del dia, en el dashboard" , JSON.stringify(assignmentsCount))
        return assignmentsCount;
    }

    /*Suma los numeros de productos asignados a empleados, hoy, en el dashboard*/
    async countProductsAssignmentOfTheDay(): Promise<{ count: number }> {
        const today = new Date();   today.setHours(0, 0, 0, 0); // Establece la hora a 00:00:00.000
        const endOfDay = new Date(today);   endOfDay.setHours(23, 59, 59, 999);
    
        let whereConditions = and(
            isNotNull(assignmentTable.employeeId),
            gte(assignmentTable.createdAt, today),
            lt(assignmentTable.createdAt, endOfDay),
            inArray(productsTable.type, [1, 2, 3]),
            inArray(productsTable.statusId, [1, 2, 3, 4]),
        );
    
        const [assignmentSum] = await this.db
        .select({
            count: sql<number>`sum(${assignmentTable.products})`.as('count'),
        })
        .from(assignmentTable)
        .innerJoin(productsTable, eq(productsTable.id, assignmentTable.productId))
        .where(whereConditions);
        
        return assignmentSum;
    }

    /*Suma los numeros de productos asignados a empleados, en el mes actual */
    async countProductsAssignmentOfMonth(typesMedicalSuppliesArray:Array<number>): Promise<{ count: number }> {
        const nowCaracas = new Date();
        const year = nowCaracas.getFullYear();
        const month = nowCaracas.getMonth();
    
        // Obtener el primer día del mes actual en Caracas
        const startOfMonthCaracas = new Date(year, month, 1, 0, 0, 0, 0);
    
        // Obtener el último día del mes actual en Caracas
        const endOfMonthCaracas = new Date(year, month + 1, 0, 23, 59, 59, 999);
    
        const [assignmentSum] = await this.db
        .select({
            count: sql<number>`sum(${assignmentTable.products})`.as('count'),
        })
        .from(assignmentTable)
        .innerJoin(productsTable, eq(productsTable.id, assignmentTable.productId))
        .where(
            and(
                isNotNull(assignmentTable.employeeId),
                sql`${assignmentTable.createdAt} >= ${startOfMonthCaracas.toISOString()} AND ${assignmentTable.createdAt} <= ${endOfMonthCaracas.toISOString()}`,
                // inArray(productsTable.type, [1, 2, 3]),
                inArray(productsTable.type, typesMedicalSuppliesArray),
                inArray(productsTable.statusId, [1, 2, 3, 4]),
            )
        );
        
        return assignmentSum;
    }

   //Para el contador de registros de asignaciones de insumos medicos al empleado,en el mes. 
    async totalAssignmentOfMonth(): Promise<{ count: number }> {
        const nowCaracas = new Date();
        const year = nowCaracas.getFullYear();
        const month = nowCaracas.getMonth();
    
        // Obtener el primer día del mes actual en Caracas
        const startOfMonthCaracas = new Date(year, month, 1, 0, 0, 0, 0);
    
        // Obtener el último día del mes actual en Caracas
        const endOfMonthCaracas = new Date(year, month + 1, 0, 23, 59, 59, 999);
    
        const [result] = await this.db
          .select({ count: count() })
          .from(assignmentTable)
          .innerJoin(productsTable, eq(productsTable.id, assignmentTable.productId))
          .where(
            and(
                isNotNull(assignmentTable.employeeId),
                sql`${assignmentTable.createdAt} >= ${startOfMonthCaracas.toISOString()} AND ${assignmentTable.createdAt} <= ${endOfMonthCaracas.toISOString()}`,
                inArray(productsTable.type, [1, 2, 3]),
                inArray(productsTable.statusId, [1, 2, 3, 4]),
            )
           );
    
        return result || { count: 0 };
    }

    /* Solo para el rol: Médico
    Corresponde al Card en el dashboard: 'Registro Anual de las Asignaciones de Insumos Médicos a Empleados'
    Para el contador de registros de asignaciones de insumos medicos al empleado, en el dashboard de medico. */ //Excepto insumos medicos caducados(Ya no) : ne(productsTable.statusId, 4)
    async totalAssignments(): Promise<{ count: number }> {
    const dateRanges = this.getYear();

        const [result] = await this
        .db.select({ count: count() })
        .from(assignmentTable)
        .innerJoin(productsTable, eq(productsTable.id, assignmentTable.productId))
        .where(
            and(
                isNotNull(assignmentTable.employeeId),
                gte(assignmentTable.createdAt, dateRanges.startOfYear),
                lte(assignmentTable.createdAt, dateRanges.endOfYear),
                inArray(productsTable.type, [1, 2, 3]),
                inArray(productsTable.statusId, [1, 2, 3, 4]),
            )
        );
    
        return result || { count: 0 };
    }

    /**
     * getAccumulatedAssignmentProductsByType()
     * @returns Asignaciones a empleados en el mes: Suma el numero de insumos medicos asignados, por tipo 
       result[0] = {
            sumAsig_medicamentos: '4',
            sumAsig_uniformes: '2',
            sumAsig_equiposOdontologicos: '1'
        }
     */
    async getAccumulatedAssignmentProductsByType() {
    const dateRanges = this.calculateCurrentMonthRange()
    const result = await this.db
        .select({
        sumAsig_medicamentos: sql<number>`COALESCE(SUM(CASE WHEN ${productsTable.type} = 1 THEN ${assignmentTable.products} ELSE 0 END), 0)`.as('sumAsig_medicamentos'),
        sumAsig_uniformes: sql<number>`COALESCE(SUM(CASE WHEN ${productsTable.type} = 2 THEN ${assignmentTable.products} ELSE 0 END), 0)`.as('sumAsig_uniformes'),
        sumAsig_equiposOdontologicos: sql<number>`COALESCE(SUM(CASE WHEN ${productsTable.type} = 3 THEN ${assignmentTable.products} ELSE 0 END), 0)`.as('sumAsig_equiposOdontologicos'),
        })
      .from(assignmentTable)
      .innerJoin(productsTable, eq(productsTable.id, assignmentTable.productId))
      .innerJoin(typesOfProductsTable, eq(typesOfProductsTable.id, productsTable.type))
      .where(
        and(
            isNotNull(assignmentTable.employeeId),
            inArray(productsTable.type, [1, 2, 3]),
            inArray(productsTable.statusId, [1, 2, 3, 4]),
            gte(assignmentTable.createdAt, dateRanges.startOfMonth),
            lte(assignmentTable.createdAt, dateRanges.endOfMonth),
        )
    );
    return result[0];
  }

   /**
   * Calculate date range for current month in UTC
   */
  public calculateCurrentMonthRange() {
    const now = new Date()
    const nowUtc = new Date(now.toISOString())

    const currentYear = nowUtc.getUTCFullYear()
    const currentMonth = nowUtc.getUTCMonth()

    const startOfMonth = new Date(Date.UTC(currentYear, currentMonth, 1, 0, 0, 0, 0))
    const endOfMonth = new Date(Date.UTC(currentYear, currentMonth + 1, 0, 23, 59, 59, 999))

    return {
      startOfMonth,
      endOfMonth,
    }
  }
  public getYear() {
    const now = new Date();
    const currentYear = now.getUTCFullYear();
    const startOfYear = new Date(Date.UTC(currentYear, 0, 1, 0, 0, 0, 0));
    const endOfYear = new Date(Date.UTC(currentYear, 11, 31, 23, 59, 59, 999));

    return {
      startOfYear,
      endOfYear,
    }
  }
}