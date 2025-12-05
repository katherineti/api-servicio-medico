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
var FilesService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.FilesService = void 0;
const common_1 = require("@nestjs/common");
const path = __importStar(require("path"));
const fsPromises = __importStar(require("node:fs/promises"));
let FilesService = FilesService_1 = class FilesService {
    constructor() {
        this.logger = new common_1.Logger(FilesService_1.name);
        this.uploadDir = path.join(process.cwd(), 'uploads');
        this.ensureUploadDirExists();
    }
    async ensureUploadDirExists() {
        try {
            await fsPromises.mkdir(this.uploadDir, { recursive: true });
        }
        catch (error) {
            this.logger.error(`Error al crear directorio de uploads: ${error.message}`);
        }
    }
    async saveFiles(files, reportId) {
        if (!files || files.length === 0) {
            return [];
        }
        const savedPaths = [];
        const reportFolder = path.join('reports', `Id ${reportId}`).replace(/\\/g, '/');
        for (const file of files) {
            const relativePath = `/uploads/${reportFolder}/${file.filename.replace(/\\/g, '/')}`;
            savedPaths.push(relativePath);
        }
        return savedPaths;
    }
    async getFilePath(relativePath) {
        const fullPath = path.join(process.cwd(), 'public', relativePath);
        try {
            await fsPromises.access(fullPath);
            return fullPath;
        }
        catch (error) {
            this.logger.error(`Archivo no encontrado: ${fullPath}`);
            throw new Error('Archivo no encontrado');
        }
    }
    async deleteFile(relativePath) {
        const fullPath = path.join(process.cwd(), 'public', relativePath);
        try {
            await fsPromises.unlink(fullPath);
            return true;
        }
        catch (error) {
            this.logger.error(`Error al eliminar archivo ${fullPath}: ${error.message}`);
            return false;
        }
    }
    async deleteFiles(relativePaths) {
        if (!relativePaths || relativePaths.length === 0) {
            return;
        }
        const deletePromises = relativePaths.map(path => this.deleteFile(path));
        await Promise.all(deletePromises);
    }
};
exports.FilesService = FilesService;
exports.FilesService = FilesService = FilesService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [])
], FilesService);
//# sourceMappingURL=files.service.js.map