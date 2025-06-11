import { Inject, Injectable, Logger } from '@nestjs/common';
import { NeonDatabase } from 'drizzle-orm/neon-serverless';
import { PG_CONNECTION } from 'src/constants';
import { categoriesTable, productsTable, productStatusTable } from 'src/db/schema';
import { count, desc, ilike, eq, and, sql, or, isNotNull } from 'drizzle-orm'
import { ProductsExpiredGetAll } from './dto/products-expired-dto';
import { SearchProductsExpiredDto } from './dto/search-products-expired.dto';

@Injectable()
export class MedicalSuppliesExpiredService {
    private readonly logger = new Logger(MedicalSuppliesExpiredService.name);

    constructor(@Inject(PG_CONNECTION) private db: NeonDatabase) {}

      async getAll(filter: SearchProductsExpiredDto): Promise<ProductsExpiredGetAll> {
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

        // Filtro para productos próximos a expirar (expiringProduct = true o false), Filtro para productos expirados (isExpired = true o false). Pero no se permite que ambos sean false
        whereConditions.push(
        or(

            or(
                eq(productsTable.statusId, 3),
                and(
                isNotNull(productsTable.expirationDate),
                sql`(${productsTable.expirationDate} - CURRENT_DATE) < 90`
                )
            ),

            or(
                eq(productsTable.statusId, 4),
                and(
                isNotNull(productsTable.expirationDate),
                sql`${productsTable.expirationDate} <= CURRENT_DATE`
                )
            )

        )
        );

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
          expirationDate: sql<string>`TO_CHAR(${productsTable.expirationDate}, 'YYYY-MM-DD')`,
          createdAt: productsTable.createdAt,
          updatedAt: productsTable.updatedAt,
          categoryId: categoriesTable.id,
          category: categoriesTable.name,
          statusId: productsTable.statusId,
          status: productStatusTable.status,
          isExpired: sql<boolean>`
            CASE
                WHEN ${productsTable.statusId} = 4 THEN TRUE
                WHEN ${productsTable.expirationDate} IS NOT NULL 
                    AND ${productsTable.expirationDate} <= CURRENT_DATE 
                THEN TRUE
                ELSE FALSE
            END
        `
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
    
        const result = new ProductsExpiredGetAll();
        result.total = total;
        result.page = filter.page;
        result.list = rows;
        this.logger.debug(`Resultado de productos prox a vencer y caducados: ${JSON.stringify(result)}`);
    
        return result;
      }

      async expiredProductsCount(): Promise<number> {
        const [{ value: total }] = await 
        this.db.select({ value: count() })
        .from(productsTable)
        .leftJoin(categoriesTable, eq(productsTable.categoryId, categoriesTable.id))
        .where(  
        or(
            or(
                eq(productsTable.statusId, 3),
                and(
                isNotNull(productsTable.expirationDate),
                sql`(${productsTable.expirationDate} - CURRENT_DATE) < 90`
                )
            ),

            or(
                eq(productsTable.statusId, 4),
                and(
                isNotNull(productsTable.expirationDate),
                sql`${productsTable.expirationDate} <= CURRENT_DATE`
                )
            )
        ));
        this.logger.debug(`Número de productos proximos a vencer y caducados: ${total}`);
    
        return total;
      }
}