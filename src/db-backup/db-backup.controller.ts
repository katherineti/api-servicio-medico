import { Controller, Get, UseGuards, Res, StreamableFile, Post, UseInterceptors, UploadedFile } from '@nestjs/common';
import { Response } from 'express';
import { createReadStream } from 'fs';
import * as path from 'path'; // Se necesita para el path de subida
import * as fs from 'fs'; // Se necesita para crear directorios
import { FileInterceptor } from '@nestjs/platform-express'; // Nuevo import
import { diskStorage } from 'multer'; // Nuevo import
// import { DbBackupService } from './db-backup.service';
import { Roles } from 'src/decorators/role.decorators';
import { TypesRoles } from 'src/db/enums/types-roles';
import { DbBackupService } from './db-backup-restore.service';

// Directorio temporal para Multer (para los archivos SQL subidos)
const tempUploadDir = path.join(process.cwd(), 'temp_uploads'); 

@Controller('db-backup')
@Roles(TypesRoles.admin) 
export class DbBackupController {
  constructor(private readonly dbBackupService: DbBackupService) {}

  /**
   * Endpoint GET que inicia la generación y descarga del backup de la base de datos.
   * La URL de este endpoint será: [URL_BASE]/db-backup/download
   */
  @Get('download')
  async download(
    @Res({ passthrough: true }) res: Response,
  ): Promise<StreamableFile> {
    
    // 1. Llama al servicio para generar el dump y obtener la ruta.
    const { filePath, fileName } = await this.dbBackupService.generateBackup();

    // 2. Configura los encabezados de respuesta.
    res.set({
      'Content-Type': 'application/sql', 
      'Content-Disposition': `attachment; filename=\"${fileName}\"`,
    });

    // 3. Crea un stream de lectura del archivo generado.
    const file = createReadStream(filePath);

    // 4. Limpia el archivo temporal después de que el stream termine.
    file.on('close', () => {
      this.dbBackupService.cleanupFile(filePath);
    });

    return new StreamableFile(file);
  }

  /**
   * ✅ NUEVO ENDPOINT: Endpoint POST que recibe un archivo .sql y lo usa para restaurar la base de datos.
   * La URL de este endpoint será: [URL_BASE]/db-backup/upload
   */
  @Post('upload')
  @UseInterceptors(
    FileInterceptor('file', { // 'file' es la clave que debe usar Angular en el FormData
      storage: diskStorage({
        destination: (req, file, cb) => {
          if (!fs.existsSync(tempUploadDir)) {
            fs.mkdirSync(tempUploadDir, { recursive: true });
          }
          cb(null, tempUploadDir);
        },
        filename: (req, file, cb) => {
          // Asigna un nombre único y conserva la extensión .sql
          const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
          cb(null, `restore-${uniqueSuffix}${path.extname(file.originalname)}`);
        },
      }),
      fileFilter: (req, file, cb) => {
        // Solo permitir archivos .sql
        if (path.extname(file.originalname).toLowerCase() !== '.sql') {
          return cb(new Error('Solo se permiten archivos SQL (.sql)'), false);
        }
        cb(null, true);
      },
      limits: {
          fileSize: 1024 * 1024 * 50 // Límite de 50MB, ajusta si es necesario
      }
    }),
  )
  async uploadBackup(
    @UploadedFile() file: Express.Multer.File,
  ): Promise<{ message: string }> {
    if (!file) {
      throw new Error('No se ha subido ningún archivo.');
    }
    
    try {
        // Ejecuta la restauración usando el archivo temporal
        await this.dbBackupService.restoreBackup(file.path);
        
        // Limpiar el archivo subido después de la restauración exitosa
        this.dbBackupService.cleanupFile(file.path);

        return { message: 'Restauración de la base de datos completada exitosamente.' };
    } catch (error) {
        // En caso de error, el servicio ya limpia el archivo subido (en el finally)
        // pero por si acaso, lo confirmamos aquí, aunque es redundante.
        this.dbBackupService.cleanupFile(file.path); 
        
        // Relanzar el error para que NestJS lo maneje y devuelva un 500/400
        throw error; 
    }
  }
}