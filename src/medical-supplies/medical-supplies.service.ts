import { Inject, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { NeonDatabase } from 'drizzle-orm/neon-serverless';
import { PG_CONNECTION, PRODUCT_STATUS_INACTIVO } from 'src/constants';
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

export interface stockMedicalSuppliesAvailables {
  sum_medicamentos: string,
  sum_uniformes: string,
  sum_equiposOdontologicos: string
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

  async getAll(filter: SearchProductsDto): Promise<ProductsGetAll> {
    const whereConditions = [];
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
    whereConditions.push(or( eq(productsTable.statusId, 1) , eq(productsTable.statusId, 3) ));

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
    
    if (file) {
      category = await this.categoriesService.getById(Number(createMedicalSupplyDto.category));
      const categoryWithoutSpaces = this.removesSpacesInString(category.name);

      const timestamp = Date.now();
      const randomString = Math.random().toString(36).substring(2, 15);

      const filename = `product_${timestamp}_${randomString}_${file.originalname}`;

      // const uploadDir = join(__dirname, '../../dist/uploads'+categoryWithoutSpaces);
      const uploadDir = join(__dirname, '../../uploads/'+categoryWithoutSpaces);

      console.log("RUTA DESDE EL SERVER: " , join(__dirname, '../../dist/uploads'))
      const imagePath = join(uploadDir, filename);

      imageUrl = `/${categoryWithoutSpaces}/${filename}`;
      // imageUrl = `/${filename}`;
      console.log("file: ",file)
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
    let imageUrl: string | null = null;
    let category:ICategory;

    const prod = await this.getProductbyId(id);

    if (!prod) {
      throw new NotFoundException('El producto no existe');
    }

    if(prod.url_image ){
      imageUrl = prod.url_image;
    }
    
    if (file) {
      category = await this.categoriesService.getById(Number(updateMedicalSupplyDto.category));
      const categoryWithoutSpaces = this.removesSpacesInString(category.name);

      const timestamp = Date.now();
      const randomString = Math.random().toString(36).substring(2, 15);

      const filename = `product_${timestamp}_${randomString}_${file.originalname}`;

      // const uploadDir = join(__dirname, '../../dist/uploads'+categoryWithoutSpaces);
      const uploadDir = join(__dirname, '../../uploads/'+categoryWithoutSpaces);

      console.log("RUTA DESDE EL SERVER: " , join(__dirname, '../../dist/uploads'))
      const imagePath = join(uploadDir, filename);

      imageUrl = `/${categoryWithoutSpaces}/${filename}`;
      // imageUrl = `/${filename}`;
      console.log("file: ",file)
      try {
        await fs.mkdir(uploadDir, { recursive: true });
        console.log(imagePath, file.buffer)
        await fs.writeFile(imagePath, file.buffer); // Ahora file.buffer contendrá el contenido del archivo
      } catch (error) {
        console.error('Error al guardar la imagen', error);
        return { id: Date.now(), ...updateMedicalSupplyDto, url_image: null, error: 'Error al guardar la imagen' };
      }
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
    console.log("updateData " , updateData)
      
      const updated = await this.db
      .update(productsTable)
      .set(updateData)
      .where(eq(productsTable.id, id))
  
      return updated[0];

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
    const nowCaracas = new Date();
    const year = nowCaracas.getFullYear();
    const month = nowCaracas.getMonth();

    // Obtener el primer día del mes actual en Caracas
    const startOfMonthCaracas = new Date(year, month, 1, 0, 0, 0, 0);

    // Obtener el último día del mes actual en Caracas
    const endOfMonthCaracas = new Date(year, month + 1, 0, 23, 59, 59, 999);

    const [result] = await this.db
      .select({ count: count() })
      .from(productsTable)
      .where(
        and(
          sql`${productsTable.createdAt} >= ${startOfMonthCaracas.toISOString()} AND ${productsTable.createdAt} <= ${endOfMonthCaracas.toISOString()}`,
          // Condición para excluir statusId = 4 (productos caducados)
          // or( eq(productsTable.statusId, 1) , eq(productsTable.statusId, 3) )
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
}