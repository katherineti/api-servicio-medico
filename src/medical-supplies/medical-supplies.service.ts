import { Inject, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { NeonDatabase } from 'drizzle-orm/neon-serverless';
import { PG_CONNECTION, PRODUCT_STATUS_INACTIVO, PRODUCT_TYPE_UNIFORMES } from 'src/constants';
import { categoriesTable, productsTable, productStatusTable, providersTable } from 'src/db/schema';
import { count, desc, ilike, eq, and, sql, ne, sum, or, gte, lte, inArray } from 'drizzle-orm'
import { SearchProductsDto } from './dto/search.products.dto';
import { ProductsGetAll } from './dto/read-products-dto';
import { Product } from 'src/db/types/products.types';
import { promises as fs } from 'fs';
import { join } from 'path';
import { CategoriesService, ICategory } from 'src/categories/categories.service';
import { CreateProductDto } from './dto/create-product.dto';
import { IcustomerAccessPoint } from 'src/logs/interfaces/logs.interface';
import { LogsService } from 'src/logs/logs.service';
import { IJwtPayload } from 'src/auth/dto/jwt-payload.interface';
import { PgColumn } from 'drizzle-orm/pg-core';

/* export interface stockMedicalSuppliesAvailables {
  sum_medicamentos: string,
  sum_uniformes: string,
  sum_equiposOdontologicos: string
} */
export interface stockMedicalSuppliesAvailables {
  sum_medicamentos: number,
  sum_uniformes: number,
  sum_equiposOdontologicos: number
}

@Injectable()
export class MedicalSuppliesService {
  private readonly logger = new Logger(MedicalSuppliesService.name);

  constructor(@Inject(PG_CONNECTION) private db: NeonDatabase, private categoriesService: CategoriesService, private logsService: LogsService) {}

  async getProductbyId(id: number): Promise<any> {
      try{
          const result = await this.db.select({
            id: productsTable.id,
            url_image: productsTable.url_image,
            description: productsTable.description,
            code: productsTable.code,
            stock: productsTable.stock,
            name: productsTable.name,
            type: productsTable.type,
            createdAt: productsTable.createdAt,
            updatedAt: productsTable.updatedAt,
            categoryId: categoriesTable.id,
            category: categoriesTable.name,
            statusId: productsTable.statusId,
          })
          .from(productsTable)
          .leftJoin(categoriesTable, eq(productsTable.categoryId, categoriesTable.id))
          .where(eq( productsTable.id, id ))
          .limit(1);

          return result[0] || null;

      }catch(err){
          console.error("Error en la base de datos al buscar el producto " + id + ": ", err);
          throw new Error("Error al obtener el producto " + id + " " + err);
      }
  }

  async getProductbyCode(code: string): Promise<any> {
      try{
          const result = await this.db.select({
            id: productsTable.id,
            url_image: productsTable.url_image,
            description: productsTable.description,
            code: productsTable.code,
            stock: productsTable.stock,
            name: productsTable.name,
            type: productsTable.type,
            createdAt: productsTable.createdAt,
            updatedAt: productsTable.updatedAt,
            categoryId: categoriesTable.id,
            category: categoriesTable.name,
            statusId: productsTable.statusId,
          })
          .from(productsTable)
          .leftJoin(categoriesTable, eq(productsTable.categoryId, categoriesTable.id))
          .where(eq( productsTable.code, code ))
          .limit(1);

          return result[0] || null;

      }catch(err){
          console.error("Error en la base de datos al buscar el producto por el codigo" + code + ": ", err);
          throw new Error("Error al obtener el producto por el codigo" + code + " " + err);
      }
  }

  async getAll(filter: SearchProductsDto, usersesion: IJwtPayload): Promise<ProductsGetAll> {
    const whereConditions = [];

// --- Definiciones de Lógica de Negocio ---
    const ROL_ADMIN_RRHH = 'admin RRHH'; // El valor exacto del rol en el token
    const ROL_ALMACEN = 'almacen'; // El valor exacto del rol en el token
    const TYPE_ID_UNIFORME = PRODUCT_TYPE_UNIFORMES;          // ID para Uniformes según typesProducts
    // Verificamos si el usuario es el Admin de RRHH
    const IS_RRHH_ADMIN = usersesion.role === ROL_ADMIN_RRHH;
    const IS_ALMACEN = usersesion.role === ROL_ALMACEN;
console.log("IS_RRHH_ADMIN" , IS_RRHH_ADMIN)
console.log("IS_ALMACEN" , IS_ALMACEN)
    // Búsqueda por nombre (ilike) si se proporciona
    if (filter.name) {
      whereConditions.push(ilike(productsTable.name, `%${filter.name}%`));
    }
    // Búsqueda por categoria (ilike) si se proporciona
    if (filter.category) {
      whereConditions.push(ilike(categoriesTable.name, `%${filter.category}%`));
    }

    // Búsqueda por fecha de expiracion seleccionada, si se proporciona
    if (filter.expirationDate) {
      const datePart = filter.expirationDate.toString().split('T')[0];
      whereConditions.push(eq(productsTable.expirationDate, datePart));
    }

    // Condición para excluir statusId = 4 (productos caducados)
    //visibles los prod. con status: 1=disponibles, 3=Proximo a vencerse
    //ocultos los prod. con status: 2=No Disponible, 4=Caducado
    whereConditions.push(or( eq(productsTable.statusId, 1) , eq(productsTable.statusId, 3) ));

    // Lógica de Uniformes: Solo Admin RRHH o Almacén pueden verlos
    // Se añade la restricción (excluir uniformes) SÓLO si el usuario NO es NINGUNO de los dos.
    if (!(IS_RRHH_ADMIN || IS_ALMACEN)) {
        // Excluimos los uniformes (type != TYPE_ID_UNIFORME)
        whereConditions.push(ne(productsTable.type, TYPE_ID_UNIFORME));
    } 
    // Si es Admin RRhH O Almacén, la condición es falsa, NO se añade la restricción,
    // y la consulta mostrará todos los tipos de productos (incluyendo Uniformes).

    // Condición de búsqueda combinada (si hay alguna)
    const whereClause = whereConditions.length > 0 ? and(...whereConditions) : undefined;

    const rows = await
    this.db.select({
      id: productsTable.id,
      url_image: productsTable.url_image,
      description: productsTable.description,
      code: productsTable.code,
      stock: productsTable.stock,
      name: productsTable.name,
      providerId: providersTable.id, provider: providersTable.name, //nuevo
      type: productsTable.type,
      expirationDate: sql<string>`TO_CHAR(${productsTable.expirationDate}, 'YYYY-MM-DD')`,
      createdAt: productsTable.createdAt,
      updatedAt: productsTable.updatedAt,
      categoryId: categoriesTable.id,
      category: categoriesTable.name,
      statusId: productsTable.statusId,
      status: productStatusTable.status
    })
    .from(productsTable)
    .leftJoin(categoriesTable, eq(productsTable.categoryId, categoriesTable.id))
    .leftJoin(productStatusTable, eq(productsTable.statusId, productStatusTable.id ) )
    .leftJoin(providersTable, eq(productsTable.providerId, providersTable.id ) )
    .where(whereClause)
    .orderBy(desc(productsTable.id))
    .limit(filter.take)
    .offset((filter.page - 1) * filter.take);

    // Consulta para obtener el total de productos
    const [{ value: total }] = await 
    this.db.select({ value: count() })
    .from(productsTable)
    .leftJoin(categoriesTable, eq(productsTable.categoryId, categoriesTable.id))
    .where(whereClause);

    const result = new ProductsGetAll();
    result.total = total;
    result.page = filter.page;
    result.list = rows;

    return result;
  }

  async create(createMedicalSupplyDto: CreateProductDto, userId: number, customerAccessPoint: IcustomerAccessPoint, file?: Express.Multer.File): Promise<any> {
    //recibo expirationDate: 'Sat May 03 2025 00:00:00 GMT-0400 (hora de Venezuela)'
    let imageUrl: string | null = null;
    let category:ICategory;

    const existCodeMedicalSupply = await this.getProductbyCode(createMedicalSupplyDto.code);

    if (existCodeMedicalSupply) {
      throw new NotFoundException('El código del insumo médico ya existe.');
    }
    
    if (file) {
      category = await this.categoriesService.getById(Number(createMedicalSupplyDto.category));
      const categoryWithoutSpaces = this.removesSpacesInString(category.name);

      const timestamp = Date.now();
      const randomString = Math.random().toString(36).substring(2, 15);

      const filename = `product_${timestamp}_${randomString}_${file.originalname}`;

      // const uploadDir = join(__dirname, '../../dist/uploads'+categoryWithoutSpaces);
      const uploadDir = join(process.cwd(), 'uploads/'+categoryWithoutSpaces); //join(process.cwd(), 'uploads')
      this.logger.log( "Ruta estatica donde se guarda la imagen del insumo medicos/inventario almacen creado", uploadDir)

      const imagePath = join(uploadDir, filename);

      imageUrl = `/${categoryWithoutSpaces}/${filename}`;
      // imageUrl = `/${filename}`;
      this.logger.log( "Archivo", JSON.stringify(file))

      try {
        await fs.mkdir(uploadDir, { recursive: true });
        console.log(imagePath, file.buffer)
        await fs.writeFile(imagePath, file.buffer); // Ahora file.buffer contendrá el contenido del archivo
      } catch (error) {
        console.error('Error al guardar la imagen', error);
        return { id: Date.now(), ...createMedicalSupplyDto, url_image: null, error: 'Error al guardar la imagen' };
      }
    }

    try {

      let obj= {
        name: createMedicalSupplyDto.name,
        description: createMedicalSupplyDto.description,
        categoryId: Number(createMedicalSupplyDto.category),
        type: Number(createMedicalSupplyDto.type),
        stock: Number(createMedicalSupplyDto.stock),
        code: createMedicalSupplyDto.code,
        url_image: imageUrl,
        statusId: Number(createMedicalSupplyDto.status),
        providerId: Number(createMedicalSupplyDto.providerId)
      }
      
      if(createMedicalSupplyDto.expirationDate && obj.type!=2 && obj.type!=3 ){//si el tipo de prod es medicamento si puede ingresar la fecha expiracion
          const fechaStringToDate = new Date(createMedicalSupplyDto.expirationDate);
          const expirationDateString = fechaStringToDate.toISOString().split('T')[0]; // Obtiene 'YYYY-MM-DD'
          obj['expirationDate']= createMedicalSupplyDto.expirationDate? expirationDateString : null;
      }

      const [newMedicalSupply] = await this.db.insert(productsTable).values(obj).returning();

      //Inserta un log 
      this.logsService.create({
        action: 'Insumo médico agregado',
        userId: userId,
        productId: newMedicalSupply.id,
        ipAddress: customerAccessPoint.ip,
        hostname: customerAccessPoint.hostname
      });

      return newMedicalSupply;
    } catch (error) {
      console.error('Error al insertar en la base de datos', error);
      return { error: 'Error al insertar en la base de datos' };
    }
  }

  async update(id:number, updateMedicalSupplyDto: CreateProductDto, file?: Express.Multer.File): Promise<any> {
    this.logger.log("updateMedicalSupplyDto",updateMedicalSupplyDto)
    let imageUrl: string | null = null;
    let category:ICategory;

    const prod = await this.getProductbyId(id);

    if (!prod) {
      throw new NotFoundException('El producto no existe.');
    }

    if(prod.url_image ){
      imageUrl = prod.url_image;
    }

    const existCodeMedicalSupply = updateMedicalSupplyDto.code === prod.code ? true : false;

    if (existCodeMedicalSupply) {
      throw new NotFoundException('El código del insumo médico ya existe');
    }
    
    if (file) {
      category = await this.categoriesService.getById(Number(updateMedicalSupplyDto.category));
      const categoryWithoutSpaces = this.removesSpacesInString(category.name);

      const timestamp = Date.now();
      const randomString = Math.random().toString(36).substring(2, 15);

      const filename = `product_${timestamp}_${randomString}_${file.originalname}`;

      // const uploadDir = join(__dirname, '../../dist/uploads'+categoryWithoutSpaces);
      // const uploadDir = join(__dirname, '../../uploads/'+categoryWithoutSpaces);
      const uploadDir = join(process.cwd(), 'uploads/'+categoryWithoutSpaces);;
      this.logger.log( "Ruta estatica donde se guarda la imagen del insumo medicos/inventario almacen actualizado", uploadDir);

      const imagePath = join(uploadDir, filename);

      imageUrl = `/${categoryWithoutSpaces}/${filename}`;
      // imageUrl = `/${filename}`;
      this.logger.log( "Archivo", JSON.stringify(file));
      try {
        await fs.mkdir(uploadDir, { recursive: true });
        console.log(imagePath, file.buffer)
        await fs.writeFile(imagePath, file.buffer); // Ahora file.buffer contendrá el contenido del archivo
      } catch (error) {
        console.error('Error al guardar la imagen', error);
        return { id: Date.now(), ...updateMedicalSupplyDto, url_image: null, error: 'Error al guardar la imagen' };
      }
    }

    if( updateMedicalSupplyDto.url_image==="null"){
      imageUrl=null;
    }

    try {
      const updateData: Partial<Product> = {
        name: updateMedicalSupplyDto.name,
        description: updateMedicalSupplyDto.description,
        categoryId: Number(updateMedicalSupplyDto.category),
        type: Number(updateMedicalSupplyDto.type),
        stock: Number(updateMedicalSupplyDto.stock),
        statusId: Number(updateMedicalSupplyDto.status),
        updatedAt: new Date(),
        url_image: imageUrl,
        providerId: Number(updateMedicalSupplyDto.providerId)
      };
      
      if(updateMedicalSupplyDto.expirationDate && updateData.type!=2 && updateData.type!=3 ){//si el tipo de prod es medicamento si puede ingresar la fecha expiracion
        const fechaStringToDate = new Date(updateMedicalSupplyDto.expirationDate);
        const expirationDateString = fechaStringToDate.toISOString().split('T')[0]; // Obtiene 'YYYY-MM-DD'
        updateData['expirationDate']= updateMedicalSupplyDto.expirationDate? expirationDateString : null;
      }
      if(updateMedicalSupplyDto.expirationDate==='null'){
         updateData['expirationDate']= null;
      }
      this.logger.log("updateData " , updateData)
      
      const updated = await this.db
      .update(productsTable)
      .set(updateData)
      .where(eq(productsTable.id, id))
  
      return updated[0];
      this.logger.log("updated[0] " , updated[0])

    } catch (error) {
      console.error('Error al actualizar el registro', error);
      return { error: 'Error al actualizar el registro' };
    }
  }

  async delete(id: number): Promise<Product>{

    const prod = await this.getProductbyId(id);

    if (!prod) {
      throw new NotFoundException('La usuario no existe');
    }
    const updateData: Partial<Product> = {
      statusId: PRODUCT_STATUS_INACTIVO,
      updatedAt: new Date()
    };

    await this.db
    .update(productsTable)
    .set(updateData)
    .where(eq(productsTable.id, id));

    return await this.getProductbyId(id);
  }

  removesSpacesInString(texto: string): string {
    return texto.replace(/\s+/g, '_');
  }

  //Para el contador de producto del dia, en el dashboard
  async totalProductsOfTheDay(): Promise<{ count: number }> {
    const nowCaracas = new Date();

    const startOfDayCaracas = new Date(nowCaracas);
    startOfDayCaracas.setHours(0, 0, 0, 0);

    const endOfDayCaracas = new Date(nowCaracas);
    endOfDayCaracas.setHours(23, 59, 59, 999);

    const [result] = await this.db
      .select({ count: count() })
      .from(productsTable)
      .where(
        and(
          sql`${productsTable.createdAt} >= ${startOfDayCaracas.toISOString()} AND ${productsTable.createdAt} <= ${endOfDayCaracas.toISOString()}`,
          // Condición para excluir statusId = 4 (productos caducados)
          // or( eq(productsTable.statusId, 1) , eq(productsTable.statusId, 3) )
          inArray(productsTable.statusId, [1,2,3,4])
        )
      );

    return result || { count: 0 };
  }

  async totalProductsOfMonth(): Promise<{ count: number }> {
      const now = new Date()
      const nowUtc = new Date(now.toISOString())
      const currentYear = nowUtc.getUTCFullYear()
      const currentMonth = nowUtc.getUTCMonth()
      const startOfMonth = new Date(Date.UTC(currentYear, currentMonth, 1, 0, 0, 0, 0))
      const endOfMonth = new Date(Date.UTC(currentYear, currentMonth + 1, 0, 23, 59, 59, 999))

      const [result] = await this.db
        .select({ count: count() })
        .from(productsTable)
        .where(
          and(
            and(
                gte(productsTable.createdAt, startOfMonth),
                lte(productsTable.createdAt, endOfMonth)
            ),
            inArray(productsTable.statusId, [1,2,3,4])
          )
        );

      return result || { count: 0 };
  }

  //Para el contador de productos en el dashboard de almacen
  async countAllProducts(): Promise<{ count: number }> {
    const [result] = await 
    this.db.select({ count: count() }).from(productsTable).where(
      inArray(productsTable.statusId, [1,2,3,4])
/*       or( 
        eq(productsTable.statusId, 1), 
        eq(productsTable.statusId, 3)), */
    );
    
    return result ? result : { count: 0 };
  }

  /*
  Nuevos 
  getAccumulatedStockByType: Uniformes Disponibles, Equipos Odontológicos Disponibles, Total Medicamentos Disponibles
  Consulta que devuelva el acomulado de los stocks de los productos que son de tipo 1,2 o 3.
  Y que son productos disponibles o proximos a vencer.
  mensual
  */
  public async getAccumulatedStockByType(): Promise<stockMedicalSuppliesAvailables> {
    const dateRanges = this.calculateCurrentMonthRange()
    const result = await this.db
      .select({
        sum_medicamentos: sum(sql`CASE WHEN ${productsTable.type} = 1 THEN ${productsTable.stock} ELSE 0 END`).as('sum_medicamentos'),
        sum_uniformes: sum(sql`CASE WHEN ${productsTable.type} = 2 THEN ${productsTable.stock} ELSE 0 END`).as('sum_uniformes'),
        'sum_equiposOdontologicos': sum(sql`CASE WHEN ${productsTable.type} = 3 THEN ${productsTable.stock} ELSE 0 END`).as('sum_equiposOdontologicos'),
      })
      .from(productsTable)
      .where(
        and(
          sql`${productsTable.type} IN (1, 2, 3)`,
          or( eq(productsTable.statusId, 1) , eq(productsTable.statusId, 3) ),
          // Filtro por mes
          gte(productsTable.createdAt, dateRanges.startOfMonth),
          lte(productsTable.createdAt, dateRanges.endOfMonth),
        )
      );
 
      const data = result[0];

      // Crea un objeto base con todos los valores en 0.
      // Esto asegura que siempre se devuelva una estructura completa.
      const finalResult: stockMedicalSuppliesAvailables = {
        sum_medicamentos: 0,
        sum_uniformes: 0,
        sum_equiposOdontologicos: 0,
      };

      // Si `data` existe, mapea los valores a `finalResult`.
      // Usa el operador de coalescencia nula (??) para reemplazar `null` con `0`.
      if (data) {
        finalResult.sum_medicamentos = Number(data.sum_medicamentos ?? 0);
        finalResult.sum_uniformes = Number(data.sum_uniformes ?? 0);
        finalResult.sum_equiposOdontologicos = Number(data.sum_equiposOdontologicos ?? 0);
      }

      return finalResult;
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
}
