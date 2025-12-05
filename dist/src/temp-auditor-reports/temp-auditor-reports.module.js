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
Object.defineProperty(exports, "__esModule", { value: true });
exports.TempAuditorReportsModule = void 0;
const common_1 = require("@nestjs/common");
const db_module_1 = require("../db.module");
const temp_auditor_reports_controller_1 = require("./temp-auditor-reports.controller");
const temp_auditor_reports_service_1 = require("./temp-auditor-reports.service");
const files_module_1 = require("../files/files.module");
const platform_express_1 = require("@nestjs/platform-express");
const multer_1 = require("multer");
const path_1 = require("path");
const fsPromises = __importStar(require("node:fs/promises"));
const pdf_generator_service_1 = require("./pdf-generator.service");
let TempAuditorReportsModule = class TempAuditorReportsModule {
};
exports.TempAuditorReportsModule = TempAuditorReportsModule;
exports.TempAuditorReportsModule = TempAuditorReportsModule = __decorate([
    (0, common_1.Module)({
        imports: [
            db_module_1.DrizzleDbConecctionModule,
            files_module_1.FilesModule,
            platform_express_1.MulterModule.register({
                storage: (0, multer_1.diskStorage)({
                    destination: async (req, file, callback) => {
                        const reportId = req.params.id;
                        if (!reportId) {
                            return callback(new Error('Report ID is missing in the request parameters'), null);
                        }
                        const uploadFolder = (0, path_1.join)(process.cwd(), 'uploads', 'reports', 'Id ' + String(reportId));
                        console.log("Ruta estatica donde se guarda la imagen del reporte de auditoria creado", uploadFolder);
                        try {
                            await fsPromises.mkdir(uploadFolder, { recursive: true });
                            callback(null, uploadFolder);
                        }
                        catch (error) {
                            callback(error, null);
                        }
                    },
                    filename: (req, file, callback) => {
                        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
                        const originalName = file.originalname.replace(/\s/g, '-');
                        const filename = `report-${uniqueSuffix}-${originalName}`;
                        callback(null, filename);
                    },
                }),
                limits: {
                    fileSize: 5 * 1024 * 1024,
                },
            }),
        ],
        controllers: [temp_auditor_reports_controller_1.TempAuditorReportsController],
        providers: [
            temp_auditor_reports_service_1.TempAuditorReportsService,
            pdf_generator_service_1.PdfGeneratorService
        ],
    })
], TempAuditorReportsModule);
//# sourceMappingURL=temp-auditor-reports.module.js.map