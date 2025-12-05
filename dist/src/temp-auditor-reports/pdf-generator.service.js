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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var PdfGeneratorService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.PdfGeneratorService = void 0;
const common_1 = require("@nestjs/common");
const pdfmake_1 = __importDefault(require("pdfmake"));
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const constants_1 = require("../constants");
let PdfGeneratorService = PdfGeneratorService_1 = class PdfGeneratorService {
    constructor() {
        this.logger = new common_1.Logger(PdfGeneratorService_1.name);
        this.MAX_IMAGES = 10;
        this.MAX_RETRIES = 3;
        this.STANDARD_IMAGE_WIDTH = 300;
        try {
            this.fonts = {
                Roboto: {
                    normal: path.join(process.cwd(), 'src', 'assets', 'fonts', 'Roboto-Regular.ttf'),
                    bold: path.join(process.cwd(), 'src', 'assets', 'fonts', 'Roboto-Medium.ttf'),
                    italics: path.join(process.cwd(), 'src', 'assets', 'fonts', 'Roboto-Italic.ttf'),
                    bolditalics: path.join(process.cwd(), 'src', 'assets', 'fonts', 'Roboto-MediumItalic.ttf')
                }
            };
            this.verifyFonts();
        }
        catch (error) {
            this.logger.error('Error al inicializar el servicio de generación de PDF:', error);
            this.fonts = {
                Roboto: {
                    normal: 'Helvetica',
                    bold: 'Helvetica-Bold',
                    italics: 'Helvetica-Oblique',
                    bolditalics: 'Helvetica-BoldOblique'
                }
            };
            this.logger.warn('Usando fuentes de respaldo debido a un error al cargar las fuentes personalizadas');
        }
    }
    verifyFonts() {
        try {
            const fontPaths = [
                this.fonts.Roboto.normal,
                this.fonts.Roboto.bold,
                this.fonts.Roboto.italics,
                this.fonts.Roboto.bolditalics
            ];
            for (const fontPath of fontPaths) {
                if (!fs.existsSync(fontPath)) {
                    throw new Error(`La fuente ${fontPath} no existe`);
                }
            }
        }
        catch (error) {
            this.logger.error('Error al verificar fuentes:', error);
            throw error;
        }
    }
    async generatePdf(report, res) {
        try {
            this.validateReport(report);
            this.logger.log(`Generando PDF para el reporte ${report.id}`);
            this.debugReportContent(report);
            let processedImages = [];
            try {
                processedImages = await this.processImages(report);
            }
            catch (error) {
                this.handleError({
                    code: 'IMAGE_PROCESSING_ERROR',
                    message: `Error al procesar imágenes para el reporte ${report.id}`,
                    details: { reportId: report.id },
                    originalError: error
                });
                processedImages = [];
            }
            let docDefinition;
            try {
                docDefinition = await this.createDocumentDefinition(report, processedImages);
            }
            catch (error) {
                throw this.handleError({
                    code: 'DOCUMENT_DEFINITION_ERROR',
                    message: `Error al crear la definición del documento para el reporte ${report.id}`,
                    details: { reportId: report.id },
                    originalError: error
                });
            }
            const printer = new pdfmake_1.default(this.fonts);
            let pdfDoc;
            try {
                pdfDoc = printer.createPdfKitDocument(docDefinition);
            }
            catch (error) {
                throw this.handleError({
                    code: 'PDF_CREATION_ERROR',
                    message: `Error al crear el documento PDF para el reporte ${report.id}`,
                    details: { reportId: report.id },
                    originalError: error
                });
            }
            pdfDoc.on('error', (error) => {
                this.handleError({
                    code: 'PDF_GENERATION_ERROR',
                    message: `Error durante la generación del PDF para el reporte ${report.id}`,
                    details: { reportId: report.id },
                    originalError: error
                });
                if (!res.headersSent) {
                    res.status(500).json({
                        statusCode: 500,
                        message: `Error al generar PDF: ${error.message}`
                    });
                }
            });
            try {
                res.setHeader('Content-Type', 'application/pdf');
                res.setHeader('Content-Disposition', `attachment; filename="reporte-auditoria-${report.id}.pdf"`);
            }
            catch (error) {
                throw this.handleError({
                    code: 'RESPONSE_HEADER_ERROR',
                    message: `Error al configurar encabezados de respuesta para el reporte ${report.id}`,
                    details: { reportId: report.id },
                    originalError: error
                });
            }
            try {
                pdfDoc.pipe(res);
                pdfDoc.end();
                this.logger.log(`PDF generado exitosamente para el reporte ${report.id}`);
            }
            catch (error) {
                throw this.handleError({
                    code: 'PDF_STREAMING_ERROR',
                    message: `Error al enviar el PDF para el reporte ${report.id}`,
                    details: { reportId: report.id },
                    originalError: error
                });
            }
        }
        catch (error) {
            if (error instanceof common_1.InternalServerErrorException || error instanceof common_1.BadRequestException) {
                throw error;
            }
            this.logger.error(`Error no manejado al generar PDF para el reporte ${report?.id}:`, error);
            if (res.headersSent) {
                return;
            }
            res.status(500).json({
                statusCode: 500,
                message: `Error al generar PDF: ${error.message || 'Error desconocido'}`
            });
        }
    }
    validateReport(report) {
        if (!report) {
            throw new common_1.BadRequestException('El informe es requerido');
        }
        if (!report.id) {
            throw new common_1.BadRequestException('El ID del informe es requerido');
        }
        const requiredFields = ['title', 'code', 'receiver', 'auditorId'];
        const missingFields = requiredFields.filter(field => !report[field]);
        if (missingFields.length > 0) {
            throw new common_1.BadRequestException(`Campos requeridos faltantes: ${missingFields.join(', ')}`);
        }
    }
    handleError(error) {
        if (error.originalError) {
            this.logger.error(`${error.code}: ${error.message}`, error.originalError.stack);
        }
        else {
            this.logger.error(`${error.code}: ${error.message}`);
        }
        if (error.details) {
            this.logger.error('Detalles del error:', error.details);
        }
        return new common_1.InternalServerErrorException(error.message);
    }
    async createDocumentDefinition_(report, processedImages) {
        try {
            let logoData = null;
            try {
                logoData = await this.loadLogoWithRetry();
            }
            catch (error) {
                this.logger.warn('No se pudo cargar el logo, continuando sin él:', error.message);
            }
            const styles = {
                header: {
                    fontSize: 18,
                    bold: true,
                    margin: [0, 20, 0, 10],
                    color: '#003366'
                },
                subheader: {
                    fontSize: 16,
                    bold: true,
                    margin: [0, 15, 0, 5],
                    color: '#003366'
                },
                tableHeader: {
                    bold: true,
                    fontSize: 12,
                    color: '#000000',
                    fillColor: '#f2f2f2'
                },
                tableCell: {
                    fontSize: 11
                },
                tableCellBold: {
                    fontSize: 11,
                    bold: true
                },
                coverTitle: {
                    fontSize: 24,
                    bold: true,
                    alignment: 'center',
                    margin: [0, 20, 0, 20],
                    color: '#003366'
                },
                coverInfo: {
                    fontSize: 14,
                    margin: [0, 5, 0, 5],
                    alignment: 'center'
                },
                footer: {
                    fontSize: 10,
                    alignment: 'center',
                    color: '#666666',
                    margin: [0, 10, 0, 0]
                },
                paragraph: {
                    fontSize: 11,
                    margin: [0, 5, 0, 10],
                    alignment: 'justify'
                }
            };
            const content = [];
            content.push(logoData ? { image: `data:image/png;base64,${logoData.toString('base64')}`, width: 150, alignment: 'center', margin: [0, 0, 0, 30] } : {}, { text: 'INFORME DE AUDITORÍA', style: 'coverTitle' }, { text: '\n\n' }, { text: `Código: ${this.getValidContent(report.code)}`, style: 'coverInfo' }, { text: `Título: ${this.getValidContent(report.title)}`, style: 'coverInfo' }, { text: `Destinatario: ${this.getValidContent(report.receiver)}`, style: 'coverInfo' }, { text: `Auditor ID: ${this.getValidContent(report.auditorId)}`, style: 'coverInfo' }, { text: `Fecha de inicio: ${this.formatDate(report.startDate)}`, style: 'coverInfo' }, { text: `Fecha de finalización: ${this.formatDate(report.endDate)}`, style: 'coverInfo' }, { text: `Fecha de emisión: ${this.formatDate(new Date())}`, style: 'coverInfo' }, { text: '', pageBreak: 'after' });
            return {
                content: content,
                styles: styles,
                defaultStyle: {
                    font: 'Roboto'
                },
                pageSize: 'A4',
                pageMargins: [40, 60, 40, 60],
                footer: function (currentPage, pageCount) {
                    return {
                        text: `Informe de Auditoría ${report.code} - Página ${currentPage} de ${pageCount}`,
                        style: 'footer'
                    };
                },
                header: function (currentPage, pageCount, pageSize) {
                    if (currentPage === 1)
                        return null;
                    return {
                        stack: [
                            {
                                columns: [
                                    logoData ? {
                                        image: `data:image/png;base64,${logoData.toString('base64')}`,
                                        width: 60,
                                        margin: [40, 10, 0, 0]
                                    } : {},
                                    {
                                        text: `Informe de Auditoría - ${report.code}`,
                                        alignment: 'right',
                                        margin: [0, 20, 40, 0],
                                        fontSize: 10,
                                        color: '#666666'
                                    }
                                ]
                            },
                            {
                                canvas: [
                                    {
                                        type: 'line',
                                        x1: 40,
                                        y1: 40,
                                        x2: pageSize.width - 40,
                                        y2: 40,
                                        lineWidth: 1,
                                        lineColor: '#cccccc'
                                    }
                                ]
                            }
                        ]
                    };
                }
            };
        }
        catch (error) {
            throw this.handleError({
                code: 'DOCUMENT_DEFINITION_ERROR',
                message: `Error al crear la definición del documento para el reporte ${report.id}`,
                details: { reportId: report.id },
                originalError: error
            });
        }
    }
    async createDocumentDefinition(report, processedImages) {
        try {
            let logoData = null;
            try {
                logoData = await this.loadLogoWithRetry();
            }
            catch (error) {
                this.logger.warn('No se pudo cargar el logo, continuando sin él:', error.message);
            }
            const styles = {
                headerSection: {
                    fontSize: 10,
                    alignment: 'right',
                    color: '#666666',
                    margin: [0, 5, 0, 0]
                },
                reportTitle: {
                    fontSize: 12,
                    bold: true,
                    alignment: 'center',
                    margin: [40, 5, 40, 10],
                    color: '#003366'
                },
                reportTitle2: {
                    fontSize: 14,
                    bold: true,
                    alignment: 'center',
                    margin: [0, 15, 0, 10],
                    color: '#003366'
                },
                tableHeader: {
                    bold: true,
                    fontSize: 10,
                    color: '#FFFFFF',
                    fillColor: '#003366',
                    alignment: 'center',
                    margin: [0, 5, 0, 5]
                },
                tableCellLabel: {
                    bold: true,
                    fontSize: 10,
                    color: '#000000',
                    fillColor: '#E0E0E0',
                    margin: [5, 5, 5, 5]
                },
                tableCellValue: {
                    fontSize: 10,
                    color: '#000000',
                    fillColor: '#F5F5F5',
                    margin: [5, 5, 5, 5]
                },
                sectionTitleBand: {
                    fontSize: 12,
                    bold: true,
                    color: '#FFFFFF',
                    fillColor: '#003366',
                    alignment: 'center',
                    margin: [0, 10, 0, 10],
                    paddingLeft: 0,
                    paddingRight: 0,
                    paddingTop: 5,
                    paddingBottom: 5
                },
                paragraph: {
                    fontSize: 11,
                    margin: [0, 5, 0, 5],
                    alignment: 'justify'
                },
                list: {
                    fontSize: 11,
                    margin: [0, 5, 0, 5]
                },
                footer: {
                    fontSize: 9,
                    alignment: 'center',
                    color: '#666666',
                    margin: [0, 10, 0, 0]
                },
                coverTitle: {
                    fontSize: 24,
                    bold: true,
                    alignment: 'center',
                    margin: [0, 100, 0, 50],
                    color: '#003366'
                },
                coverInfo: {
                    fontSize: 12,
                    margin: [0, 5, 0, 5],
                    alignment: 'center'
                },
                coverImage: {
                    alignment: 'center',
                    margin: [0, 0, 0, 30]
                }
            };
            const content = [];
            content.push({ text: 'INFORME FINAL DE AUDITORÍA', style: 'reportTitle' });
            this.TitleTable(content, report);
            this.ResumenTable(content, report);
            this.ConclusionesTable(content, report);
            if (processedImages && processedImages.length > 0) {
                content.push({ text: 'VI. IMÁGENES DE EVIDENCIA', style: 'sectionTitleBand', pageBreak: 'before' });
                processedImages.forEach((img) => {
                    if (img.exists && img.dataUrl) {
                        content.push({
                            image: img.dataUrl,
                            width: this.STANDARD_IMAGE_WIDTH,
                            alignment: 'center',
                            margin: [0, 10, 0, 10]
                        });
                        content.push({
                            text: `Evidencia ${img.index}: ${img.path.split('/').pop()}`,
                            alignment: 'center',
                            fontSize: 9,
                            color: '#666666',
                            margin: [0, 0, 0, 20]
                        });
                    }
                    else {
                        this.logger.warn(`No se pudo incluir la imagen: ${img.path}. Razón: ${img.error}`);
                        content.push({
                            text: `[Imagen no disponible: ${img.path}]`,
                            alignment: 'center',
                            color: 'red',
                            fontSize: 9,
                            margin: [0, 10, 0, 10]
                        });
                    }
                });
            }
            content.push({ text: '\n\n\n' }, { text: 'Fin del Informe de Auditoría', alignment: 'center', fontSize: 10, color: '#666666' });
            return {
                content: content,
                styles: styles,
                defaultStyle: {
                    font: 'Roboto'
                },
                pageSize: "A4",
                pageMargins: [40, 80, 40, 60],
                background: function (currentPage, pageSize) {
                    if (logoData) {
                        return {
                            image: `data:image/jpeg;base64,${logoData.toString("base64")}`,
                            maxWidth: 515,
                            maxHeight: 80,
                            alignment: "center",
                            margin: [0, 20, 0, 0],
                        };
                    }
                    return '';
                },
                header: (currentPage, pageCount, pageSize) => {
                    return [];
                },
                footer: function (currentPage, pageCount) {
                    return {
                        text: `Informe de Auditoría ${report.code} - Página ${currentPage} de ${pageCount}`,
                        style: 'footer'
                    };
                },
            };
        }
        catch (error) {
            throw this.handleError({
                code: 'DOCUMENT_DEFINITION_ERROR',
                message: `Error al crear la definición del documento para el reporte ${report.id}`,
                details: { reportId: report.id },
                originalError: error
            });
        }
    }
    async loadLogoWithRetry() {
        const possibleLogoPaths = [
            path.join(process.cwd(), 'uploads', constants_1.membreteCIIP)
        ];
        for (let attempt = 0; attempt < this.MAX_RETRIES; attempt++) {
            try {
                for (const logoPath of possibleLogoPaths) {
                    if (fs.existsSync(logoPath)) {
                        return fs.readFileSync(logoPath);
                    }
                }
                this.logger.warn(`Intento ${attempt + 1}/${this.MAX_RETRIES}: Logo no encontrado en las ubicaciones esperadas`);
                if (attempt < this.MAX_RETRIES - 1) {
                    await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 100));
                }
            }
            catch (error) {
                this.logger.warn(`Intento ${attempt + 1}/${this.MAX_RETRIES}: Error al cargar el logo:`, error);
                if (attempt < this.MAX_RETRIES - 1) {
                    await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 100));
                }
            }
        }
        throw new Error('No se pudo cargar el logo después de varios intentos');
    }
    async processImages(report) {
        let processedImages = [];
        if (!report.images) {
            return processedImages;
        }
        try {
            let images = [];
            if (typeof report.images === 'string') {
                try {
                    images = JSON.parse(report.images);
                }
                catch (error) {
                    throw this.handleError({
                        code: 'IMAGE_PARSE_ERROR',
                        message: `Error al parsear JSON de imágenes para el reporte ${report.id}`,
                        details: { reportId: report.id, imagesRaw: report.images },
                        originalError: error
                    });
                }
            }
            else if (Array.isArray(report.images)) {
                images = report.images;
            }
            else {
                this.logger.warn(`Formato de imágenes no reconocido para el reporte ${report.id}:`, typeof report.images);
                return processedImages;
            }
            if (images.length > this.MAX_IMAGES) {
                this.logger.log(`Limitando de ${images.length} a ${this.MAX_IMAGES} imágenes para el reporte ${report.id}`);
                images = images.slice(0, this.MAX_IMAGES);
            }
            for (let i = 0; i < images.length; i++) {
                const imagePath = images[i];
                if (!imagePath) {
                    this.logger.warn(`Ruta de imagen vacía en el índice ${i} para el reporte ${report.id}`);
                    processedImages.push({
                        index: i + 1,
                        dataUrl: '',
                        path: 'Ruta vacía',
                        exists: false
                    });
                    continue;
                }
                try {
                    const imageResult = await this.loadImageWithRetry(report.id, imagePath);
                    processedImages.push({
                        index: i + 1,
                        ...imageResult
                    });
                }
                catch (error) {
                    this.logger.error(`Error al procesar imagen ${imagePath} para el reporte ${report.id}:`, error);
                    processedImages.push({
                        index: i + 1,
                        dataUrl: '',
                        path: imagePath,
                        exists: false,
                        error: error.message
                    });
                }
            }
        }
        catch (error) {
            if (error instanceof common_1.InternalServerErrorException) {
                throw error;
            }
            throw this.handleError({
                code: 'IMAGE_PROCESSING_ERROR',
                message: `Error al procesar imágenes para el reporte ${report.id}`,
                details: { reportId: report.id },
                originalError: error
            });
        }
        return processedImages;
    }
    async loadImageWithRetry(reportId, imagePath) {
        const fileName = imagePath.split('/').pop() || imagePath;
        const possiblePaths = [
            path.join(process.cwd(), 'uploads', 'reports', `Id ${reportId}`, fileName),
        ];
        console.log(`Buscando imagen: ${fileName} para reporte ${reportId}`);
        for (const fullPath of possiblePaths) {
            console.log(`Verificando: ${fullPath}`);
            if (fs.existsSync(fullPath)) {
                console.log(`✅ ¡Imagen encontrada!: ${fullPath}`);
                const imageBuffer = fs.readFileSync(fullPath);
                const base64Image = imageBuffer.toString('base64');
                const mimeType = this.getMimeType(fullPath);
                return {
                    dataUrl: `data:${mimeType};base64,${base64Image}`,
                    path: imagePath,
                    exists: true,
                    fullPath: fullPath
                };
            }
        }
        console.error(`❌ Imagen NO encontrada: ${fileName}`);
        return {
            dataUrl: '',
            path: imagePath,
            exists: false,
            error: 'Imagen no encontrada en el sistema de archivos'
        };
    }
    getMimeType(filePath) {
        try {
            const ext = path.extname(filePath).toLowerCase();
            switch (ext) {
                case '.png':
                    return 'image/png';
                case '.jpg':
                case '.jpeg':
                    return 'image/jpeg';
                case '.gif':
                    return 'image/gif';
                case '.svg':
                    return 'image/svg+xml';
                case '.webp':
                    return 'image/webp';
                case '.bmp':
                    return 'image/bmp';
                default:
                    this.logger.warn(`Tipo de archivo no reconocido: ${ext}, usando tipo genérico`);
                    return 'application/octet-stream';
            }
        }
        catch (error) {
            this.logger.error('Error al determinar el tipo MIME:', error);
            return 'application/octet-stream';
        }
    }
    formatDate(date) {
        try {
            if (!date)
                return 'N/A';
            const d = new Date(date);
            if (isNaN(d.getTime()))
                return 'Fecha inválida';
            return d.toLocaleDateString('es-ES', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric'
            });
        }
        catch (error) {
            this.logger.error('Error al formatear fecha:', error);
            return 'Error en fecha';
        }
    }
    getValidContent(content) {
        try {
            if (content === null || content === undefined) {
                return 'No se ha proporcionado información.';
            }
            if (typeof content === 'string' && content.trim() === '') {
                return 'No se ha proporcionado información.';
            }
            if (typeof content === 'object') {
                try {
                    return JSON.stringify(content, null, 2);
                }
                catch (error) {
                    this.logger.error('Error al convertir objeto a JSON:', error);
                    return 'Contenido en formato no compatible.';
                }
            }
            return this.capitalizarOracion(content);
        }
        catch (error) {
            this.logger.error('Error al procesar contenido:', error);
            return 'Error al procesar contenido.';
        }
    }
    capitalizarOracion(oracion) {
        if (oracion.length === 0) {
            return "";
        }
        return oracion.charAt(0).toUpperCase() + oracion.slice(1);
    }
    debugReportContent(report) {
        try {
            this.logger.log('=== DEPURACIÓN DEL CONTENIDO DEL REPORTE ===');
            this.logger.log(`ID: ${report.id}`);
            this.logger.log(`Título: ${report.title}`);
            this.logger.log(`Código: ${report.code}`);
            this.logger.log(`Receptor: ${report.receiver}`);
            this.logger.log(`ID Auditor: ${report.auditorId}`);
            this.logger.log(`Fecha inicio: ${report.startDate}`);
            this.logger.log(`Fecha fin: ${report.endDate}`);
            this.logSectionContent('Objetivo', report.summary_objective);
            this.logSectionContent('Alcance', report.summary_scope);
            this.logSectionContent('Metodología (resumen)', report.summary_methodology);
            this.logSectionContent('Conclusiones (resumen)', report.summary_conclusionAndObservation);
            this.logSectionContent('Introducción', report.introduction);
            this.logSectionContent('Metodología detallada', report.detailed_methodology);
            this.logSectionContent('Hallazgos', report.findings);
            this.logSectionContent('Conclusiones', report.conclusions);
            if (report.images) {
                try {
                    const images = typeof report.images === 'string' ? JSON.parse(report.images) : report.images;
                    this.logger.log(`Imágenes: ${images.length}`);
                    images.forEach((img, index) => {
                        if (index < 5) {
                            this.logger.log(`  - Imagen ${index + 1}: ${img}`);
                        }
                    });
                    if (images.length > 5) {
                        this.logger.log(`  ... y ${images.length - 5} más`);
                    }
                }
                catch (error) {
                    this.logger.error('Error al parsear imágenes:', error);
                    this.logger.log(`Imágenes (raw): ${report.images}`);
                }
            }
            else {
                this.logger.log('No hay imágenes en el reporte');
            }
            this.logger.log('=== FIN DE DEPURACIÓN ===');
        }
        catch (error) {
            this.logger.error('Error al depurar contenido del reporte:', error);
        }
    }
    logSectionContent(sectionName, content) {
        try {
            const contentType = typeof content;
            let preview = '';
            if (content === null || content === undefined) {
                preview = 'null/undefined';
            }
            else if (contentType === 'string') {
                preview = content.length > 50 ? `${content.substring(0, 50)}...` : content;
            }
            else if (contentType === 'object') {
                preview = 'Objeto/Array';
            }
            else {
                preview = String(content);
            }
            this.logger.log(`${sectionName}: ${contentType} - ${preview}`);
        }
        catch (error) {
            this.logger.error(`Error al registrar contenido de sección ${sectionName}:`, error);
        }
    }
    TitleTable(content, report) {
        let long50 = 'Sed ut perspiciatis unde omnis iste natus error si';
        let pruebaLong20000 = 'Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta.';
        return content.push({
            margin: [0, 10, 0, 10],
            table: {
                widths: ['*', '*', '*'],
                layout: {
                    hLineWidth: function (i, node) {
                        return (i === 0 || i === node.table.body.length) ? 1 : 0.5;
                    },
                    vLineWidth: function (i, node) {
                        return (i === 0 || i === node.table.widths.length) ? 1 : 0.5;
                    },
                    hLineColor: function (i, node) {
                        return (i === 0 || i === node.table.body.length) ? '#003366' : '#BBBBBB';
                    },
                    vLineColor: function (i, node) {
                        return (i === 0 || i === node.table.widths.length) ? '#003366' : '#BBBBBB';
                    },
                    paddingLeft: function (i, node) { return 10; },
                    paddingRight: function (i, node) { return 10; },
                    paddingTop: function (i, node) { return 5; },
                    paddingBottom: function (i, node) { return 5; }
                },
                body: [
                    [
                        { text: 'Destinatario', style: 'tableHeader' },
                        { text: 'Auditor', style: 'tableHeader' },
                        { text: 'Fecha de finalizado', style: 'tableHeader' }
                    ],
                    [
                        { text: this.getValidContent(report.receiver), style: 'tableCellValue' },
                        { text: this.getValidContent(report.auditor || report.auditorId), style: 'tableCellValue' },
                        { text: this.formatDate(report.endDate || new Date()), style: 'tableCellValue' }
                    ]
                ]
            }
        });
    }
    ResumenTable(content, report) {
        console.log("report en ResumenTable() ", report);
        content.push({ text: 'Resumen', style: 'reportTitle' }, {
            style: 'tableExample',
            table: {
                widths: ['30%', '70%'],
                body: [
                    [{ text: 'Objetivos:', style: 'tableCellLabel' }, { text: this.getValidContent(report.summary_objective || 'N/A'), style: 'tableCellValue' }],
                    [{ text: 'Alcance:', style: 'tableCellLabel' }, { text: this.getValidContent(report.summary_scope || 'N/A'), style: 'tableCellValue' }],
                    [{ text: 'Metodología:', style: 'tableCellLabel' }, { text: this.getValidContent(report.summary_methodology || 'N/A'), style: 'tableCellValue' }],
                    [{ text: 'Conclusiones/observaciones:', style: 'tableCellLabel' }, { text: this.getValidContent(report.summary_conclusionAndObservation || 'N/A'), style: 'tableCellValue' }],
                ]
            },
            layout: {
                hLineWidth: function (i, node) {
                    return (i === 0 || i === node.table.body.length) ? 1 : 0.5;
                },
                vLineWidth: function (i, node) {
                    return (i === 0 || i === node.table.widths.length) ? 1 : 0.5;
                },
                hLineColor: function (i, node) {
                    return (i === 0 || i === node.table.body.length) ? '#003366' : '#BBBBBB';
                },
                vLineColor: function (i, node) {
                    return (i === 0 || i === node.table.widths.length) ? '#003366' : '#BBBBBB';
                },
                paddingLeft: function (i, node) { return 10; },
                paddingRight: function (i, node) { return 10; },
                paddingTop: function (i, node) { return 5; },
                paddingBottom: function (i, node) { return 5; }
            },
            margin: [0, 10, 0, 20]
        });
    }
    ConclusionesTable(content, report) {
        content.push({ text: 'Conclusiones', style: 'reportTitle' }, {
            style: 'tableExample',
            widths: ['100%'],
            headerRows: 1,
            margin: [0, 10, 0, 10],
            table: {
                layout: {
                    hLineWidth: function (i, node) {
                        return (i === 0 || i === node.table.body.length) ? 1 : 0.5;
                    },
                    vLineWidth: function (i, node) {
                        return (i === 0 || i === node.table.widths.length) ? 1 : 0.5;
                    },
                    hLineColor: function (i, node) {
                        return (i === 0 || i === node.table.body.length) ? '#003366' : '#BBBBBB';
                    },
                    vLineColor: function (i, node) {
                        return (i === 0 || i === node.table.widths.length) ? '#003366' : '#BBBBBB';
                    },
                    paddingLeft: function (i, node) { return 10; },
                    paddingRight: function (i, node) { return 10; },
                    paddingTop: function (i, node) { return 5; },
                    paddingBottom: function (i, node) { return 5; }
                },
                widths: ['*'],
                body: [
                    [{ text: 'Introducción', style: 'tableHeader' }],
                    [{ text: this.getValidContent(report.introduction), style: 'tableCellValue' }]
                ]
            }
        });
        content.push({
            table: {
                widths: ['*'],
                layout: {
                    hLineWidth: function (i, node) {
                        return (i === 0 || i === node.table.body.length) ? 1 : 0.5;
                    },
                    vLineWidth: function (i, node) {
                        return (i === 0 || i === node.table.widths.length) ? 1 : 0.5;
                    },
                    hLineColor: function (i, node) {
                        return (i === 0 || i === node.table.body.length) ? '#003366' : '#BBBBBB';
                    },
                    vLineColor: function (i, node) {
                        return (i === 0 || i === node.table.widths.length) ? '#003366' : '#BBBBBB';
                    },
                    paddingLeft: function (i, node) { return 10; },
                    paddingRight: function (i, node) { return 10; },
                    paddingTop: function (i, node) { return 5; },
                    paddingBottom: function (i, node) { return 5; }
                },
                body: [
                    [{ text: 'Metodología', style: 'tableHeader' }],
                    [{ text: this.getValidContent(report.detailed_methodology), style: 'tableCellValue' }]
                ]
            }
        });
        content.push({
            table: {
                widths: ['*'],
                layout: {
                    hLineWidth: function (i, node) {
                        return (i === 0 || i === node.table.body.length) ? 1 : 0.5;
                    },
                    vLineWidth: function (i, node) {
                        return (i === 0 || i === node.table.widths.length) ? 1 : 0.5;
                    },
                    hLineColor: function (i, node) {
                        return (i === 0 || i === node.table.body.length) ? '#003366' : '#BBBBBB';
                    },
                    vLineColor: function (i, node) {
                        return (i === 0 || i === node.table.widths.length) ? '#003366' : '#BBBBBB';
                    },
                    paddingLeft: function (i, node) { return 10; },
                    paddingRight: function (i, node) { return 10; },
                    paddingTop: function (i, node) { return 5; },
                    paddingBottom: function (i, node) { return 5; }
                },
                body: [
                    [{ text: 'Hallazgos', style: 'tableHeader' }],
                    [{ text: this.getValidContent(report.findings), style: 'tableCellValue' }]
                ]
            }
        });
        content.push({
            table: {
                widths: ['*'],
                layout: {
                    hLineWidth: function (i, node) {
                        return (i === 0 || i === node.table.body.length) ? 1 : 0.5;
                    },
                    vLineWidth: function (i, node) {
                        return (i === 0 || i === node.table.widths.length) ? 1 : 0.5;
                    },
                    hLineColor: function (i, node) {
                        return (i === 0 || i === node.table.body.length) ? '#003366' : '#BBBBBB';
                    },
                    vLineColor: function (i, node) {
                        return (i === 0 || i === node.table.widths.length) ? '#003366' : '#BBBBBB';
                    },
                    paddingLeft: function (i, node) { return 10; },
                    paddingRight: function (i, node) { return 10; },
                    paddingTop: function (i, node) { return 5; },
                    paddingBottom: function (i, node) { return 5; }
                },
                body: [
                    [{ text: 'Conclusiones', style: 'tableHeader' }],
                    [{ text: this.getValidContent(report.conclusions), style: 'tableCellValue' }]
                ]
            }
        });
        return content;
    }
};
exports.PdfGeneratorService = PdfGeneratorService;
exports.PdfGeneratorService = PdfGeneratorService = PdfGeneratorService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [])
], PdfGeneratorService);
//# sourceMappingURL=pdf-generator.service.js.map