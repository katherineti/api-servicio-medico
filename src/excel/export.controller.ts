import { Controller, Post } from "@nestjs/common"
import type { Response } from "express"
import { Roles } from "src/decorators/role.decorators"
import { TypesRoles } from "src/db/enums/types-roles"
import type { ExportUsersService } from "./export-users.service"

interface ExportDto {
  format: "xlsx" | "csv"
  role?: string
  name?: string
  cedula?: string
}

@Controller("users")
export class ExportController {
  constructor(private readonly exportUsersService: ExportUsersService) {}

  @Roles(TypesRoles.admin, TypesRoles.adminRRHH)
  @Post("export/download")
  async exportUsers(exportDto: ExportDto, res: Response): Promise<void> {
    try {
      const buffer = await this.exportUsersService.exportUsers(
        exportDto.format || "xlsx",
        exportDto.role || "all",
        exportDto.name || "",
        exportDto.cedula || "",
      )

      const timestamp = new Date().toISOString().split("T")[0]
      const fileName = exportDto.format === "xlsx" ? `Usuarios_${timestamp}.xlsx` : `Usuarios_${timestamp}.csv`

      const contentType =
        exportDto.format === "xlsx"
          ? "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
          : "text/csv; charset=utf-8"

      res.setHeader("Content-Type", contentType)
      res.setHeader("Content-Disposition", `attachment; filename="${fileName}"`)
      res.send(buffer)
    } catch (error) {
      res.status(500).json({
        message: "Error al exportar usuarios",
        error: error.message,
      })
    }
  }
}
