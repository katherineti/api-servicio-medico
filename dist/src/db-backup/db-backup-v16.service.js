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
var DbBackupService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.DbBackupService = void 0;
const common_1 = require("@nestjs/common");
const child_process_1 = require("child_process");
const util_1 = require("util");
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const DB_HOST = 'ep-quiet-term-a5biz3w7.us-east-2.aws.neon.tech';
const DB_PORT = 5432;
const DB_USER = 'curso_owner';
const DB_PASS = 'm5pPjogD3FhW';
const DB_NAME = 'ciip_medical_service';
const TEMP_DIR = path.join(process.cwd(), 'temp_backups');
const PG_DUMP_PATH = 'C:\\Program Files\\PostgreSQL\\16\\bin\\pg_dump.exe';
const DB_CONN_URL_CLEAN = `postgresql://${DB_USER}@${DB_HOST}:${DB_PORT}/${DB_NAME}?sslmode=require`;
let DbBackupService = DbBackupService_1 = class DbBackupService {
    constructor() {
        this.logger = new common_1.Logger(DbBackupService_1.name);
        this.execPromise = (0, util_1.promisify)(child_process_1.exec);
    }
    async generateBackup() {
        if (!fs.existsSync(TEMP_DIR)) {
            fs.mkdirSync(TEMP_DIR, { recursive: true });
        }
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const fileName = `${DB_NAME}_backup_${timestamp}.sql`;
        const filePath = path.join(TEMP_DIR, fileName);
        const dumpCommand = `"${PG_DUMP_PATH}" -d "${DB_CONN_URL_CLEAN}" > ${filePath}`;
        this.logger.log(`Iniciando dump de la DB ${DB_NAME}...`);
        this.logger.log(`Comando a ejecutar: ${dumpCommand}`);
        try {
            const { stderr } = await this.execPromise(dumpCommand, {
                env: {
                    ...process.env,
                    PGPASSWORD: DB_PASS,
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
    (0, common_1.Injectable)()
], DbBackupService);
//# sourceMappingURL=db-backup-v16.service.js.map