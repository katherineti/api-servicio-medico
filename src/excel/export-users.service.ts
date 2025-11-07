import { Inject, Injectable, Logger } from "@nestjs/common"
import type { NeonDatabase } from "drizzle-orm/neon-serverless"
import { usersTable, rolesTable } from "src/db/schema"
import { and, eq, ilike, asc, gte, lt } from "drizzle-orm"
import { Workbook } from "exceljs"
import { PG_CONNECTION } from "src/constants"

@Injectable()
export class ExportUsersService {
  private readonly logger = new Logger(ExportUsersService.name)

  constructor(@Inject(PG_CONNECTION) private db: NeonDatabase) {}

  async exportUsers(
    format: "xlsx" | "csv",
    roleFilter?: string,
    nameFilter?: string,
    cedulaFilter?: string,
  ): Promise<Buffer> {
    try {
      const currentYear = new Date().getFullYear()
      const startOfYear = new Date(`${currentYear}-01-01`)
      const endOfYear = new Date(`${currentYear + 1}-01-01`)

      const whereConditions = [gte(usersTable.createdAt, startOfYear), lt(usersTable.createdAt, endOfYear)]

      if (roleFilter && roleFilter !== "all") {
        whereConditions.push(eq(rolesTable.name, roleFilter))
      }

      if (nameFilter && nameFilter.trim()) {
        whereConditions.push(ilike(usersTable.name, `%${nameFilter}%`))
      }

      if (cedulaFilter && cedulaFilter.trim()) {
        whereConditions.push(ilike(usersTable.cedula, `%${cedulaFilter}%`))
      }

      const rows = await this.db
        .select({
          id: usersTable.id,
          name: usersTable.name,
          email: usersTable.email,
          isActivate: usersTable.isActivate,
          createdAt: usersTable.createdAt,
          updatedAt: usersTable.updatedAt,
          role: rolesTable.name,
          cedula: usersTable.cedula,
        })
        .from(usersTable)
        .leftJoin(rolesTable, eq(usersTable.role, rolesTable.id))
        .where(and(...whereConditions))
        .orderBy(asc(rolesTable.name), asc(usersTable.name))

      if (format === "xlsx") {
        return await this.generateExcel(rows)
      } else {
        return await this.generateCsv(rows)
      }
    } catch (error) {
      this.logger.error("Error exporting users:", error)
      throw error
    }
  }

  private async generateExcel(data: any[]): Promise<Buffer> {
    const workbook = new Workbook()
    const worksheet = workbook.addWorksheet("Usuarios")

    worksheet.columns = [
      { header: "Nombre", key: "name", width: 25 },
      { header: "Email", key: "email", width: 30 },
      { header: "Rol", key: "role", width: 15 },
      { header: "Estado", key: "isActivate", width: 12 },
      { header: "Fecha Creación", key: "createdAt", width: 20 },
    ]

    worksheet.getRow(1).font = { bold: true, color: { argb: "FFFFFFFF" } }
    worksheet.getRow(1).fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF4472C4" } }

    data.forEach((user, index) => {
      const row = worksheet.addRow({
        name: user.name,
        email: user.email,
        role: user.role || "N/A",
        isActivate: user.isActivate ? "Activo" : "Inactivo",
        createdAt: new Date(user.createdAt).toLocaleString("es-VE"),
      })

      if (index % 2 === 0) {
        row.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFF2F2F2" } }
      }
    })

    const buffer = await workbook.xlsx.writeBuffer()
    return Buffer.from(buffer)
  }

  private async generateCsv(data: any[]): Promise<Buffer> {
    let csv = "Nombre,Email,Rol,Estado,Fecha Creación\n"

    data.forEach((user) => {
      const row = [
        `"${user.name}"`,
        user.email,
        user.role || "N/A",
        user.isActivate ? "Activo" : "Inactivo",
        new Date(user.createdAt).toLocaleString("es-VE"),
      ].join(",")

      csv += row + "\n"
    })

    return Buffer.from(csv, "utf-8")
  }
}