"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var DbBackupService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.DbBackupService = void 0;
const common_1 = require("@nestjs/common");
const child_process_1 = require("child_process");
const util_1 = require("util");
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const config_1 = require("@nestjs/config");
const TEMP_DIR = path.join(process.cwd(), 'temp_backups');
const execPromise = (0, util_1.promisify)(child_process_1.exec);
let DbBackupService = DbBackupService_1 = class DbBackupService {
    constructor(configService) {
        this.configService = configService;
        this.logger = new common_1.Logger(DbBackupService_1.name);
        this.POSTGRES_VERSIONS_TO_CHECK = [16, 17, 18, 19, 20];
        this.DB_USER = this.configService.get('DB_USER');
        this.DB_PASS = this.configService.get('DB_PASS');
        this.DB_NAME = this.configService.get('DB_NAME');
        this.DB_HOST = this.configService.get('DB_HOST');
        this.DB_PORT = parseInt(this.configService.get('DB_PORT'), 10);
        this.DB_CONN_URL_CLEAN = `postgresql://${this.DB_USER}@${this.DB_HOST}:${this.DB_PORT}/${this.DB_NAME}?sslmode=require`;
    }
    findPgUtilityPath(utilityName) {
        const flexibleCommand = utilityName;
        if (process.platform === 'win32') {
            for (const version of this.POSTGRES_VERSIONS_TO_CHECK) {
                const utilityFileName = `${utilityName}.exe`;
                const pgPath = path.join('C:\\Program Files\\PostgreSQL', String(version), 'bin', utilityFileName);
                this.logger.log(`Probando ruta de ${utilityName} para v${version}: ${pgPath}`);
                if (fs.existsSync(pgPath)) {
                    this.logger.log(`¡${utilityName} encontrado en la versión ${version}!`);
                    return pgPath;
                }
            }
            this.logger.warn(`No se encontró ${utilityName} en rutas de instalación estándar de Windows. Usando "${utilityName}" y confiando en la variable PATH.`);
        }
        return flexibleCommand;
    }
    async generateBackup() {
        if (!fs.existsSync(TEMP_DIR)) {
            fs.mkdirSync(TEMP_DIR, { recursive: true });
        }
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const fileName = `${this.DB_NAME}_backup_${timestamp}.sql`;
        const filePath = path.join(TEMP_DIR, fileName);
        const PG_DUMP_PATH = this.findPgUtilityPath('pg_dump');
        const commandToExecute = PG_DUMP_PATH === 'pg_dump' ? PG_DUMP_PATH : `"${PG_DUMP_PATH}"`;
        const dumpCommand = `${commandToExecute} --clean -d \"${this.DB_CONN_URL_CLEAN}\" > ${filePath}`;
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
        }
        catch (error) {
            this.logger.error(`Error al ejecutar el comando de dump: ${error.message}`);
            throw new Error(`Fallo al generar el backup de la base de datos: ${error.message}`);
        }
    }
    async restoreBackup(backupFilePath) {
        const PSQL_PATH = this.findPgUtilityPath('psql');
        const commandToExecute = PSQL_PATH === 'psql' ? PSQL_PATH : `"${PSQL_PATH}"`;
        const restoreCommand = `${commandToExecute} -d "${this.DB_CONN_URL_CLEAN}" < "${backupFilePath}"`;
        this.logger.log(`Iniciando restauración de la DB ${this.DB_NAME} desde: ${backupFilePath}...`);
        this.logger.log(`Comando a ejecutar: ${restoreCommand}`);
        try {
            const { stderr } = await execPromise(restoreCommand, {
                env: {
                    ...process.env,
                    PGPASSWORD: this.DB_PASS,
                    PGSSLMODE: 'require',
                },
                maxBuffer: 1024 * 5000,
            });
            if (stderr) {
                this.logger.warn(`psql emitió advertencias: ${stderr}`);
            }
            this.logger.log(`Restauración exitosa.`);
        }
        catch (error) {
            this.logger.error(`Error al ejecutar el comando de restauración: ${error.message}`);
            this.cleanupFile(backupFilePath);
            throw new Error(`Fallo al restaurar la base de datos. Verifique el formato del archivo: ${error.message}`);
        }
    }
    cleanupFile(filePath) {
        try {
            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
                this.logger.log(`Archivo temporal limpiado: ${filePath}`);
            }
        }
        catch (err) {
            this.logger.error(`Fallo al limpiar el archivo ${filePath}: ${err.message}`);
        }
    }
};
exports.DbBackupService = DbBackupService;
exports.DbBackupService = DbBackupService = DbBackupService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], DbBackupService);
//# sourceMappingURL=db-backup-restore.service.js.map