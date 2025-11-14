import { Injectable, Logger } from '@nestjs/common';
import { exec } from 'child_process';
import { promisify } from 'util'; 
import * as fs from 'fs';
import * as path from 'path';

// Asegúrate de que tus variables de entorno estén bien definidas aquí
// Usamos los datos proporcionados por el usuario
const DB_HOST = 'ep-quiet-term-a5biz3w7.us-east-2.aws.neon.tech';
const DB_PORT = 5432;
const DB_USER = 'curso_owner';
const DB_PASS = 'm5pPjogD3FhW'; // Contraseña de la URL del usuario
const DB_NAME = 'ciip_medical_service'; // Nombre de la DB simple

// Directorio temporal para backups (ajusta según tu configuración)
const TEMP_DIR = path.join(process.cwd(), 'temp_backups');

// ✅ RUTA DE PG_DUMP
const PG_DUMP_PATH = 'C:\\Program Files\\PostgreSQL\\16\\bin\\pg_dump.exe'; 


// ✅ CAMBIO CLAVE: URL de conexión LIMPIA (sin password)
// Usamos el formato que funciona para la conexión (incluyendo sslmode=require)
// y quitamos la contraseña para pasarla por PGPASSWORD.
const DB_CONN_URL_CLEAN = `postgresql://${DB_USER}@${DB_HOST}:${DB_PORT}/${DB_NAME}?sslmode=require`;


@Injectable()
export class DbBackupService {
  private readonly logger = new Logger(DbBackupService.name);
  private readonly execPromise = promisify(exec);

  /**
   * Genera el backup de la base de datos PostgreSQL.
   */
  async generateBackup(): Promise<{ filePath: string; fileName: string }> {
    if (!fs.existsSync(TEMP_DIR)) {
      fs.mkdirSync(TEMP_DIR, { recursive: true });
    }

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const fileName = `${DB_NAME}_backup_${timestamp}.sql`;
    const filePath = path.join(TEMP_DIR, fileName);

    // ✅ COMANDO AJUSTADO: Usamos el flag -d con la URL limpia.
    const dumpCommand = `"${PG_DUMP_PATH}" -d "${DB_CONN_URL_CLEAN}" > ${filePath}`;

    this.logger.log(`Iniciando dump de la DB ${DB_NAME}...`);
    this.logger.log(`Comando a ejecutar: ${dumpCommand}`); 

    try {
      // ✅ AJUSTE DE ENTORNO: 
      // La autenticación se realiza usando la variable PGPASSWORD.
      const { stderr } = await this.execPromise(dumpCommand, {
        env: { 
          ...process.env, 
          PGPASSWORD: DB_PASS, // ¡pg_dump usará esto para la autenticación!
          // PGSSLMODE es redundante si está en la URL, pero lo dejamos como seguridad
          PGSSLMODE: 'require', 
        },
      });

      if (stderr) {
        this.logger.warn(`pg_dump emitió advertencias: ${stderr}`);
      }

      this.logger.log(`Dump exitoso. Archivo guardado en: ${filePath}`);
      return { filePath, fileName };
    } catch (error) {
      this.logger.error(`Error al ejecutar el comando de dump: ${error.message}`);
      throw new Error(`Fallo al generar el backup de la base de datos: ${error.message}`);
    }
  }

  /**
   * Limpia el archivo temporal.
   */
  cleanupFile(filePath: string): void {
    try {
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        this.logger.log(`Archivo temporal limpiado: ${filePath}`);
      }
    } catch (err) {
      this.logger.error(`Fallo al limpiar el archivo ${filePath}: ${err.message}`);
    }
  }
}