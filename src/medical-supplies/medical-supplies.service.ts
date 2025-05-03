import { Inject, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { NeonDatabase } from 'drizzle-orm/neon-serverless';
import { IJwtPayload } from 'src/auth/dto/jwt-payload.interface';
import { PG_CONNECTION, PRODUCT_STATUS_ACTIVO, PRODUCT_STATUS_INACTIVO } from 'src/constants';
import { categoriesTable, productsTable, productStatusTable } from 'src/db/schema';
import { count, desc, ilike, eq, and, sql } from 'drizzle-orm'
import { SearchProductsDto } from './dto/search.products.dto';
import { ProductsGetAll } from './dto/read-products-dto';
import { Product } from 'src/db/types/products.types';

import { promises as fs } from 'fs';
import { join } from 'path';
import { CategoriesService, ICategory } from 'src/categories/categories.service';

@Injectable()
export class MedicalSuppliesService {
  private readonly logger = new Logger(MedicalSuppliesService.name);

  constructor(@Inject(PG_CONNECTION) private db: NeonDatabase , private categoriesService: CategoriesService) {}

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

  async getAll(filter: SearchProductsDto, user: IJwtPayload): Promise<ProductsGetAll> {

    const whereConditions = [];
    // Búsqueda por nombre (ilike) si se proporciona
    if (filter.name) {
      whereConditions.push(ilike(productsTable.name, `%${filter.name}%`));
    }
    // Búsqueda por categoria (ilike) si se proporciona
    if (filter.category) {
      whereConditions.push(ilike(categoriesTable.name, `%${filter.category}%`));
    }
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
      type: productsTable.type,
      expirationDate: productsTable.expirationDate,
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

  async create(createMedicalSupplyDto: any, file?: Express.Multer.File): Promise<any> {
    //recibo expirationDate: 'Sat May 03 2025 00:00:00 GMT-0400 (hora de Venezuela)'

    let imageUrl: string | null = null;
    let category:ICategory;
    
    
    if (file) {
      category = await this.categoriesService.getById(createMedicalSupplyDto.category);
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
     const fechaStringToDate = new Date(createMedicalSupplyDto.expirationDate);
     let obj= {
        name: createMedicalSupplyDto.name,
        description: createMedicalSupplyDto.description,
        categoryId: createMedicalSupplyDto.category,
        type: createMedicalSupplyDto.type,
        stock: Number(createMedicalSupplyDto.stock),
        code: createMedicalSupplyDto.code,
        url_image: imageUrl,
        statusId: PRODUCT_STATUS_ACTIVO,
        expirationDate: fechaStringToDate
      }

      const [newMedicalSupply] = await this.db.insert(productsTable).values(obj).returning();

      return newMedicalSupply;
    } catch (error) {
      console.error('Error al insertar en la base de datos', error);
      return { error: 'Error al insertar en la base de datos' };
    }
  }

  async update(id:number, updateMedicalSupplyDto: any, file?: Express.Multer.File): Promise<any> {
    console.log('Datos del producto:', updateMedicalSupplyDto);

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
      category = await this.categoriesService.getById(updateMedicalSupplyDto.category);
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
      const fechaStringToDate = new Date(updateMedicalSupplyDto.expirationDate);
      const updateData: Partial<Product> = {
        name: updateMedicalSupplyDto.name,
        description: updateMedicalSupplyDto.description,
        categoryId: updateMedicalSupplyDto.category,
        type: updateMedicalSupplyDto.type,
        stock: updateMedicalSupplyDto.stock,
        statusId: updateMedicalSupplyDto.status,
        updatedAt: new Date(),
        url_image: imageUrl,
        expirationDate: fechaStringToDate
      };
  
      const updated = await this.db
      .update(productsTable)
      .set(updateData)
      .where(eq(productsTable.id, id))
  
      return updated[0];
/*      let obj= {
        name: createMedicalSupplyDto.name,
        description: createMedicalSupplyDto.description,
        categoryId: createMedicalSupplyDto.category,
        type: createMedicalSupplyDto.type,
        stock: Number(createMedicalSupplyDto.stock),
        code: createMedicalSupplyDto.code,
        url_image: imageUrl,
        statusId: PRODUCT_STATUS_ACTIVO
      }
      const [newMedicalSupply] = await this.db.insert(productsTable).values(obj).returning();

      return newMedicalSupply; */
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
        sql`${productsTable.createdAt} >= ${startOfDayCaracas.toISOString()} AND ${productsTable.createdAt} <= ${endOfDayCaracas.toISOString()}`
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
        sql`${productsTable.createdAt} >= ${startOfMonthCaracas.toISOString()} AND ${productsTable.createdAt} <= ${endOfMonthCaracas.toISOString()}`
      );

    return result || { count: 0 };
  }

  //Para el contador de productos en el dashboard de almacen
  async countAllProducts(): Promise<{ count: number }> {
    const [result] = await 
    this.db.select({ count: count() })
    .from(productsTable)
    
    return result ? result : { count: 0 };
  }
}