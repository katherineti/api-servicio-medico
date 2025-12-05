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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DbBackupController = void 0;
const common_1 = require("@nestjs/common");
const fs_1 = require("fs");
const path = __importStar(require("path"));
const fs = __importStar(require("fs"));
const platform_express_1 = require("@nestjs/platform-express");
const multer_1 = require("multer");
const role_decorators_1 = require("../decorators/role.decorators");
const types_roles_1 = require("../db/enums/types-roles");
const db_backup_restore_service_1 = require("./db-backup-restore.service");
const tempUploadDir = path.join(process.cwd(), 'temp_uploads');
let DbBackupController = class DbBackupController {
    constructor(dbBackupService) {
        this.dbBackupService = dbBackupService;
    }
    async download(res) {
        const { filePath, fileName } = await this.dbBackupService.generateBackup();
        res.set({
            'Content-Type': 'application/sql',
            'Content-Disposition': `attachment; filename=\"${fileName}\"`,
        });
        const file = (0, fs_1.createReadStream)(filePath);
        file.on('close', () => {
            this.dbBackupService.cleanupFile(filePath);
        });
        return new common_1.StreamableFile(file);
    }
    async uploadBackup(file) {
        if (!file) {
            throw new Error('No se ha subido ningún archivo.');
        }
        try {
            await this.dbBackupService.restoreBackup(file.path);
            this.dbBackupService.cleanupFile(file.path);
            return { message: 'Restauración de la base de datos completada exitosamente.' };
        }
        catch (error) {
            this.dbBackupService.cleanupFile(file.path);
            throw error;
        }
    }
};
exports.DbBackupController = DbBackupController;
__decorate([
    (0, common_1.Get)('download'),
    __param(0, (0, common_1.Res)({ passthrough: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], DbBackupController.prototype, "download", null);
__decorate([
    (0, common_1.Post)('upload'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('file', {
        storage: (0, multer_1.diskStorage)({
            destination: (req, file, cb) => {
                if (!fs.existsSync(tempUploadDir)) {
                    fs.mkdirSync(tempUploadDir, { recursive: true });
                }
                cb(null, tempUploadDir);
            },
            filename: (req, file, cb) => {
                const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
                cb(null, `restore-${uniqueSuffix}${path.extname(file.originalname)}`);
            },
        }),
        fileFilter: (req, file, cb) => {
            if (path.extname(file.originalname).toLowerCase() !== '.sql') {
                return cb(new Error('Solo se permiten archivos SQL (.sql)'), false);
            }
            cb(null, true);
        },
        limits: {
            fileSize: 1024 * 1024 * 50
        }
    })),
    __param(0, (0, common_1.UploadedFile)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], DbBackupController.prototype, "uploadBackup", null);
exports.DbBackupController = DbBackupController = __decorate([
    (0, common_1.Controller)('db-backup'),
    (0, role_decorators_1.Roles)(types_roles_1.TypesRoles.admin),
    __metadata("design:paramtypes", [db_backup_restore_service_1.DbBackupService])
], DbBackupController);
//# sourceMappingURL=db-backup.controller.js.map