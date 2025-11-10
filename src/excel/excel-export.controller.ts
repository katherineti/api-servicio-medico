import { Body, Controller, Header, HttpCode, HttpStatus, Post, Res } from "@nestjs/common"
import type { Response } from "express"
import { Roles } from "src/decorators/role.decorators"
import { TypesRoles } from "src/db/enums/types-roles"
import { ExportUsersService } from "./excel-export-users.service"

interface ExportDto {
  format: "xlsx" | "csv"
  role?: string
  name?: string
  cedula?: string
}

@Controller("excel")
export class ExportController {
  constructor(private readonly exportUsersService: ExportUsersService) {}
// 1. Cabecera Content-Type
  @Header('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
  // 2. HTTP 200 OK (aunque no es estrictamente necesario, es buena práctica)
  @HttpCode(HttpStatus.OK)
  // @Roles(TypesRoles.admin, TypesRoles.adminRRHH)
  // 3. Eliminamos @Res() y @Body debe usarse para el DTO
  @Post("/download")
  // 🛑 USAR @Body() y @Res() es CRÍTICO
  async exportUsers(@Body() exportDto: ExportDto, @Res() res: Response): Promise<void> {
    try {
      // 1. Obtener el buffer del servicio (ya corregido)
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
          : "text/csv; charset=utf-8" // MIME Type para CSV

      // 2. Cabeceras obligatorias para descarga binaria
      res.setHeader("Content-Type", contentType)
      res.setHeader("Content-Disposition", `attachment; filename="${fileName}"`)
      // 3. Añadir Content-Length para prevenir corrupción de stream
      res.setHeader("Content-Length", buffer.length) 
      
      // 4. Enviar el buffer binario y finalizar la respuesta
      // res.end() asegura que no se añadan datos extra.
      res.end(buffer) 

    } catch (error) {
      console.error("Error al generar o enviar el archivo:", error)
      
      // En caso de error, enviar una respuesta JSON clara con estado 500
      // para que el frontend no intente guardar un archivo corrupto.
      // NestJS ya maneja la mayoría de los errores, pero este catch es un seguro final.
      if (!res.headersSent) {
          res.status(500).send({
              statusCode: 500,
              message: "Error interno del servidor al generar el archivo.",
          })
      }
      return
    }
  }
}
