import { Controller, Get, UseGuards, Res, StreamableFile } from '@nestjs/common';
import { Response } from 'express';
import { createReadStream } from 'fs';
import { DbBackupService } from './db-backup.service';
import { Roles } from 'src/decorators/role.decorators';
import { TypesRoles } from 'src/db/enums/types-roles';
// Opcional: Importa tus guards de autenticación y roles si los usas para proteger esta ruta
// import { AuthGuard } from '../auth/auth.guard'; 
// import { RolesGuard } from '../auth/roles.guard'; 
// import { Roles } from '../auth/roles.decorator';

@Controller('db-backup')
// ✅ Protección: Es fundamental proteger este endpoint.
// Por ejemplo, solo permitir el acceso a usuarios con rol 'admin'.
// @UseGuards(AuthGuard, RolesGuard) 
// @Roles('admin') 
@Roles(TypesRoles.admin, TypesRoles.adminRRHH)

export class DbBackupController {
  constructor(private readonly dbBackupService: DbBackupService) {}

  /**
   * Endpoint GET que inicia la generación y descarga del backup de la base de datos.
   * La URL de este endpoint será: [URL_BASE]/db-backup/download
   */
  @Get('download')
  async download(
    // Usamos @Res({ passthrough: true }) para controlar los encabezados 
    // mientras permitimos que NestJS maneje el StreamableFile.
    @Res({ passthrough: true }) res: Response,
  ): Promise<StreamableFile> {
    
    // 1. Llama al servicio para generar el dump y obtener la ruta.
    const { filePath, fileName } = await this.dbBackupService.generateBackup();

    // 2. Configura los encabezados de respuesta. Esto le dice al navegador
    // que debe forzar la descarga del archivo con el nombre especificado.
    res.set({
      'Content-Type': 'application/sql', // Tipo de contenido para archivos SQL
      'Content-Disposition': `attachment; filename="${fileName}"`,
    });

    // 3. Crea un stream de lectura del archivo generado.
    const file = createReadStream(filePath);

    // 4. Limpia el archivo temporal en el servidor después de que el stream
    // haya terminado de enviarse al cliente (ya sea por éxito o error).
    file.on('close', () => {
      this.dbBackupService.cleanupFile(filePath);
    });
    
    // 5. Devuelve el archivo como StreamableFile de NestJS.
    return new StreamableFile(file);
  }
}