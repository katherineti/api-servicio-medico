import { Injectable, Logger } from '@nestjs/common';
import { exec } from 'child_process';
import { promisify } from 'util'; 
import * as fs from 'fs';
import * as path from 'path';
import { ConfigService } from '@nestjs/config';

// Directorio temporal para backups (ajusta según tu configuración)
const TEMP_DIR = path.join(process.cwd(), 'temp_backups');

const execPromise = promisify(exec);

@Injectable()
export class DbBackupService {
  private readonly logger = new Logger(DbBackupService.name);

// Definir propiedades privadas para los valores del .env
  private readonly DB_USER: string;
  private readonly DB_PASS: string;
  private readonly DB_NAME: string;
  private readonly DB_HOST: string;
  private readonly DB_PORT: number;
  private readonly DB_CONN_URL_CLEAN: string;
  
  // Lista de versiones a probar: 16 primero, y luego superiores
  private readonly POSTGRES_VERSIONS_TO_CHECK = [16, 17, 18, 19, 20];

// ✅ 1. INYECTAR ConfigService y LEER VARIABLES
  constructor(private readonly configService: ConfigService) {
    // Leer y asignar valores del .env
    this.DB_USER = this.configService.get<string>('DB_USER');
    this.DB_PASS = this.configService.get<string>('DB_PASS');
    this.DB_NAME = this.configService.get<string>('DB_NAME');
    this.DB_HOST = this.configService.get<string>('DB_HOST');
    // Asegurarse de que el puerto sea un número
    this.DB_PORT = parseInt(this.configService.get<string>('DB_PORT'), 10);
    
    // Calcular DB_CONN_URL_CLEAN (La URL limpia sin contraseña, ya que PGPASSWORD la proveerá)
    // Mantén el sslmode=require para tu conexión a Neon.
    this.DB_CONN_URL_CLEAN = `postgresql://${this.DB_USER}@${this.DB_HOST}:${this.DB_PORT}/${this.DB_NAME}?sslmode=require`;
  }

  /**
   * Intenta encontrar la ruta de la utilidad de PostgreSQL (pg_dump o psql).
   * @param utilityName Nombre de la utilidad a buscar ('pg_dump' o 'psql').
   * @returns La ruta completa al ejecutable o el nombre simple si se usa PATH.
   */
  private findPgUtilityPath(utilityName: 'pg_dump' | 'psql'): string {
    const flexibleCommand = utilityName; 

    // Solo buscamos en rutas específicas si el sistema operativo es Windows
    if (process.platform === 'win32') {
        
      // Escanear carpetas de instalación de PostgreSQL (16, 17, 18...)
      for (const version of this.POSTGRES_VERSIONS_TO_CHECK) {
        // Construye la ruta de forma robusta
        const utilityFileName = `${utilityName}.exe`;
        const pgPath = path.join('C:\\Program Files\\PostgreSQL', String(version), 'bin', utilityFileName);
        
        this.logger.log(`Probando ruta de ${utilityName} para v${version}: ${pgPath}`);
        
        // Verifica si el archivo existe
        if (fs.existsSync(pgPath)) {
          this.logger.log(`¡${utilityName} encontrado en la versión ${version}!`);
          return pgPath;
        }
      }
      
      this.logger.warn(`No se encontró ${utilityName} en rutas de instalación estándar de Windows. Usando "${utilityName}" y confiando en la variable PATH.`);
    }
    
    // Retorna el comando flexible si no es Windows o si no se encontró
    return flexibleCommand; 
  }
  
  // =========================================================================
  // MÉTODO 1: GENERAR BACKUP (pg_dump)
  // =========================================================================

  async generateBackup(): Promise<{ filePath: string; fileName: string }> {
    if (!fs.existsSync(TEMP_DIR)) {
      fs.mkdirSync(TEMP_DIR, { recursive: true });
    }

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const fileName = `${this.DB_NAME}_backup_${timestamp}.sql`;
    const filePath = path.join(TEMP_DIR, fileName);

    // 1. Encuentra la mejor ruta para pg_dump
    const PG_DUMP_PATH = this.findPgUtilityPath('pg_dump');
    
    // 2. Ajusta el comando de ejecución: usa comillas si es una ruta completa
    const commandToExecute = PG_DUMP_PATH === 'pg_dump' ? PG_DUMP_PATH : `"${PG_DUMP_PATH}"`;

    // 3. COMANDO AJUSTADO: Usamos el comando encontrado
    // Comilla doble para que funcione con espacios en nombres de archivo/path
    // const dumpCommand = `${commandToExecute} -d "${this.DB_CONN_URL_CLEAN}" > ${filePath}`;
    const dumpCommand = `${commandToExecute} --clean -d \"${this.DB_CONN_URL_CLEAN}\" > ${filePath}`;
    //--clean : las copias de seguridad incluirán el comando DROP TABLE IF EXISTS para cada tabla. Resuelve el problema de las claves duplicadas en la restauración.

    this.logger.log(`Iniciando dump de la DB ${this.DB_NAME}...`);
    this.logger.log(`Comando a ejecutar: ${dumpCommand}`); 

    try {
      const { stderr } = await execPromise(dumpCommand, {
        env: { 
          ...process.env, 
          PGPASSWORD: this.DB_PASS, 
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

  // =========================================================================
  // ✅ NUEVO MÉTODO 2: RESTAURAR BACKUP (psql)
  // =========================================================================

  async restoreBackup(backupFilePath: string): Promise<void> {
    const PSQL_PATH = this.findPgUtilityPath('psql');
    
    // Ajusta el comando de ejecución: usa comillas si es una ruta completa
    const commandToExecute = PSQL_PATH === 'psql' ? PSQL_PATH : `"${PSQL_PATH}"`;

    // Comando de restauración: psql -d [URL_CONEXIÓN] < [ARCHIVO_DUMP]
    const restoreCommand = `${commandToExecute} -d "${this.DB_CONN_URL_CLEAN}" < "${backupFilePath}"`;

    this.logger.log(`Iniciando restauración de la DB ${this.DB_NAME} desde: ${backupFilePath}...`);
    this.logger.log(`Comando a ejecutar: ${restoreCommand}`);

    try {
      // PGPASSWORD se usa para la autenticación
      const { stderr } = await execPromise(restoreCommand, {
        env: { 
          ...process.env, 
          PGPASSWORD: this.DB_PASS, 
          PGSSLMODE: 'require', 
        },
        // Aumentar el buffer si el dump es muy grande (ej. 5MB)
        maxBuffer: 1024 * 5000, 
      });

      if (stderr) {
        this.logger.warn(`psql emitió advertencias: ${stderr}`);
      }
      
      this.logger.log(`Restauración exitosa.`);

    } catch (error) {
      this.logger.error(`Error al ejecutar el comando de restauración: ${error.message}`);
      // Limpiamos el archivo subido si la restauración falla
      this.cleanupFile(backupFilePath);
      throw new Error(`Fallo al restaurar la base de datos. Verifique el formato del archivo: ${error.message}`);
    }
    // El controlador se encargará de limpiar el archivo subido
  }

  // =========================================================================
  // MÉTODO 3: LIMPIEZA
  // =========================================================================

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