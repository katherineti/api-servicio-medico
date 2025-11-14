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
const DB_PASS = 'm5pPjogD3FhW'; 
const DB_NAME = 'ciip_medical_service'; 

// Directorio temporal para backups (ajusta según tu configuración)
const TEMP_DIR = path.join(process.cwd(), 'temp_backups');

// ✅ RUTA DE PG_DUMP (Eliminamos la constante hardcodeada global)
// const PG_DUMP_PATH = 'C:\\Program Files\\PostgreSQL\\16\\bin\\pg_dump.exe'; 

// ✅ CAMBIO CLAVE: URL de conexión LIMPIA (sin password)
const DB_CONN_URL_CLEAN = `postgresql://${DB_USER}@${DB_HOST}:${DB_PORT}/${DB_NAME}?sslmode=require`;

const execPromise = promisify(exec);

@Injectable()
export class DbBackupService {
  private readonly logger = new Logger(DbBackupService.name);
  
  // Lista de versiones a probar: 16 primero, y luego superiores
  private readonly POSTGRES_VERSIONS_TO_CHECK = [16, 17, 18, 19, 20];

  /**
   * Intenta encontrar la ruta del pg_dump.exe probando rutas de instalación comunes.
   * Prioriza la versión 16 y luego prueba versiones superiores.
   * @returns La ruta completa al ejecutable pg_dump.exe o 'pg_dump' si se usa PATH.
   */
  private findPgDumpPath(): string {
    // 1. Comando flexible por defecto (confía en la variable PATH del sistema)
    const flexibleCommand = 'pg_dump'; 

    // Solo buscamos en rutas específicas si el sistema operativo es Windows
    if (process.platform === 'win32') {
        
      // 2. Escanear carpetas de instalación de PostgreSQL (16, 17, 18...)
      for (const version of this.POSTGRES_VERSIONS_TO_CHECK) {
        // Construye la ruta de forma robusta
        const pgPath = path.join('C:\\Program Files\\PostgreSQL', String(version), 'bin', 'pg_dump.exe');
        
        this.logger.log(`Probando ruta de pg_dump para versión ${version}: ${pgPath}`);
        
        // Verifica si el archivo existe
        if (fs.existsSync(pgPath)) {
          this.logger.log(`¡pg_dump encontrado en la versión ${version}!`);
          return pgPath;
        }
      }
      
      this.logger.warn('No se encontró pg_dump en rutas de instalación estándar de Windows. Usando "pg_dump" y confiando en la variable PATH.');
    }
    
    // 3. Retorna el comando flexible si no es Windows o si no se encontró en las rutas específicas
    return flexibleCommand; 
  }

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

    // 1. Encuentra la mejor ruta para pg_dump
    const PG_DUMP_PATH = this.findPgDumpPath();
    
    // 2. Ajusta el comando de ejecución: usa comillas si es una ruta completa
    const commandToExecute = PG_DUMP_PATH === 'pg_dump' ? PG_DUMP_PATH : `"${PG_DUMP_PATH}"`;

    // 3. COMANDO AJUSTADO: Usamos el comando encontrado
    const dumpCommand = `${commandToExecute} -d "${DB_CONN_URL_CLEAN}" > ${filePath}`;

    this.logger.log(`Iniciando dump de la DB ${DB_NAME}...`);
    this.logger.log(`Comando a ejecutar: ${dumpCommand}`); 

    try {
      // La autenticación se realiza usando la variable PGPASSWORD.
      const { stderr } = await execPromise(dumpCommand, {
        env: { 
          ...process.env, 
          PGPASSWORD: DB_PASS, // pg_dump usará esto para la autenticación
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