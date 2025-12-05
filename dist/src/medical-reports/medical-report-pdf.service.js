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
var MedicalReportPdfService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.MedicalReportPdfService = void 0;
const common_1 = require("@nestjs/common");
const medical_reports_service_1 = require("./medical-reports.service");
const path = __importStar(require("path"));
const fs = __importStar(require("fs"));
const base_report_service_1 = require("../dashboard-report/medical-supplies-available/base-report.service");
const constants_1 = require("../constants");
let MedicalReportPdfService = MedicalReportPdfService_1 = class MedicalReportPdfService extends base_report_service_1.BaseReportService {
    constructor(medicalReportsService) {
        super();
        this.medicalReportsService = medicalReportsService;
        this.logger = new common_1.Logger(MedicalReportPdfService_1.name);
    }
    async generateMedicalReportPdf(reportId, res, download = false) {
        try {
            this.logger.log(`Generando PDF para el informe médico ID: ${reportId}`);
            const medicalReport = await this.medicalReportsService.getById(reportId);
            if (!medicalReport) {
                throw new common_1.NotFoundException(`Informe médico con ID ${reportId} no encontrado.`);
            }
            const doctor = await this.medicalReportsService.getDoctor(medicalReport.doctorId);
            const patient = await this.medicalReportsService.getPatient(medicalReport.patientId);
            const datePatient = patient?.birthdate || null;
            this.logger.log("doctor", doctor);
            this.logger.log("patient", patient);
            const reportData = {
                ...medicalReport,
                doctorName: doctor?.name || "N/A",
                doctorCedula: doctor?.cedula || "N/A",
                patientName: patient?.name || "N/A",
                patientCedula: patient?.cedula || "N/A",
                patientPlaceOfBirth: patient?.birthdate || "N/A",
                patientDateOfBirth: datePatient || "N/A",
                patientPlaceBirth: patient?.placeBirth || "N/A",
                patientAge: patient?.age || "N/A",
                patientMaritalStatus: patient?.civilStatus || "N/A",
                patientSex: patient?.gender || "N/A",
            };
            this.logger.log("reportData", reportData);
            const docDefinition = await this.createMedicalReportDocumentDefinition(reportData);
            const filename = `informe-medico-${reportId}-${this.formatDateForFilename(new Date())}.pdf`;
            this.setResponseHeaders(res, filename, download);
            await this.generatePdfResponse(docDefinition, res, filename);
            this.logger.log(`PDF de informe médico para ID ${reportId} generado exitosamente.`);
        }
        catch (error) {
            this.logger.error(`Error al generar PDF del informe médico para ID ${reportId}:`, error);
            if (!res.headersSent) {
                res.status(500).json({
                    statusCode: 500,
                    message: `Error al generar PDF del informe médico: ${error.message || "Error desconocido"}`,
                });
            }
        }
    }
    async generateCustomPdf(reportData, res, options) {
        this.logger.warn("generateCustomPdf no es el método principal para MedicalReportPdfService. Use generateMedicalReportPdf en su lugar.");
        throw new Error("Este método no está implementado para MedicalReportPdfService. Por favor, use generateMedicalReportPdf.");
    }
    async createMedicalReportDocumentDefinition(reportData) {
        const styles = {
            ...this.getCommonStyles(),
            headerBackground: {
                fillColor: "#003366",
                color: "#FFFFFF",
                bold: true,
                alignment: "center",
                fontSize: 10,
                margin: [0, 3, 0, 3],
            },
            sectionHeader: {
                fontSize: 11,
                bold: true,
                color: "#003366",
                margin: [0, 10, 0, 5],
            },
            tableLabel: {
                bold: true,
                fontSize: 8,
                color: "#000000",
                fillColor: "#E0E0E0",
                margin: [2, 2, 2, 2],
            },
            tableValue: {
                fontSize: 8,
                color: "#000000",
                fillColor: "#F5F5F5",
                margin: [2, 2, 2, 2],
            },
            reportTitle: {
                fontSize: 12,
                bold: true,
                alignment: "center",
                color: "#003366",
                margin: [40, 5, 40, 10],
            },
            footerText: {
                fontSize: 7,
                color: "#666666",
                alignment: "center",
                margin: [0, 2, 0, 0],
            },
            smallText: {
                fontSize: 7,
                color: "#000000",
            },
            checkboxLabel: {
                fontSize: 8,
                color: "#000000",
                margin: [0, 0, 2, 0],
            },
            tableHeaderBlue: {
                fillColor: "#003366",
                color: "#FFFFFF",
                bold: true,
                fontSize: 8,
                alignment: "left",
                margin: [0, 2, 0, 2],
            },
            tableCellContent: {
                fontSize: 8,
                color: "#000000",
                margin: [2, 2, 2, 2],
            },
            tableCellContent_informe: {
                fontSize: 8,
                color: "#000000",
                margin: [2, 2, 2, 2],
                lineBreak: 'auto',
                alignment: 'justify',
            },
            tableCellUnderline: {
                fontSize: 8,
                color: "#000000",
                alignment: "justify",
                margin: [2, 2, 2, 2],
            },
            checkboxSquare: {
                fontSize: 8,
                color: "#000000",
                margin: [0, 0, 2, 0],
            },
        };
        let gobiernoLogo = null;
        try {
            const gobiernoPath = path.join(process.cwd(), "uploads", constants_1.membreteCIIP);
            console.log("*****RUTA process.cwd()", path.join(process.cwd()));
            console.log("*****RUTA gobiernoPath", gobiernoPath);
            if (fs.existsSync(gobiernoPath)) {
                gobiernoLogo = fs.readFileSync(gobiernoPath).toString("base64");
            }
            else {
                this.logger.warn(`Logo Gobierno no encontrado en ${gobiernoPath}`);
            }
        }
        catch (error) {
            this.logger.error("Error al cargar los logos:", error);
        }
        const createdAtDate = new Date(reportData.createdAt);
        const day = createdAtDate.getDate().toString();
        const month = (createdAtDate.getMonth() + 1).toString();
        const year = createdAtDate.getFullYear().toString();
        this.logger.log('reportData...', reportData);
        let pruebaApsCenter100caracteres = 'Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Aenean commodo ligula eget dolor. Aenean m';
        let pruebaNombrePaciene = 'Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Aenean commodo ligula eget dolor. Aenean massa. Cum sociis natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Donec qu';
        let pruebaLugarNac = 'Lorem ipsum dolor sit amet, consectetuer';
        let mivar = 'Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta.';
        let descripcioninforme700caracteres = `Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Aenean commodo ligula eget dolor. Aenean massa. Cum sociis natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus.

Donec quam felis, ultricies nec, pellentesque eu, pretium quis, sem. Nulla consequat massa quis enim. Donec pede justo, fringilla vel, aliquet nec, vulputate eget, arcu.

In enim justo, rhoncus ut, imperdiet a, venenatis vitae, justo. Nullam dictum felis eu pede mollis pretium. Integer tincidunt. Cras dapibus. Vivamus elementum semper nisi. Aenean vulputate eleifend tellus. Aenean leo ligula, porttitor eu, consequat vitae, eleifend ac, enim. Aliquam lorem ante, dapibus in, viverra quis, feugiat a, tellus`;
        const docDefinition = {
            content: [
                {
                    columns: [
                        {
                            text: "INFORME MÉDICO",
                            style: "reportTitle",
                            width: "*",
                            margin: [0, 10, 0, 0],
                        },
                    ],
                    margin: [0, 0, 0, 10],
                },
                {
                    table: {
                        widths: ["25%", "25%", "25%", "25%"],
                        heights: [30, 20],
                        body: [
                            [
                                { text: "2. Centro APS:", style: "tableHeaderBlue" },
                                { text: this.toTitleCase(reportData.apsCenter) || "", style: "tableCellUnderline" },
                                { text: "1. Fecha de Elaboración:", style: "tableHeaderBlue" },
                                {
                                    columns: [
                                        { text: day + '/' + month + '/' + year, style: "tableCellUnderline" },
                                    ],
                                    margin: [0, 0, 0, 0],
                                    columnGap: 2,
                                },
                            ],
                            [
                                { text: "3. Aseguradora:", style: "tableHeaderBlue" },
                                { text: this.toTitleCase(reportData.insurance) || "", colSpan: 3, style: "tableCellUnderline" },
                                {},
                                {},
                            ],
                        ],
                    },
                    layout: this.getTableLayout(),
                    margin: [0, 5, 0, 10],
                },
                {
                    table: {
                        widths: ["*", "*", "*", "*"],
                        heights: [null, 30, null, null, null],
                        body: [
                            [{ text: "Datos del Paciente", style: "tableHeaderBlue", colSpan: 4, alignment: "center" }, {}, {}, {}],
                            [{ text: "Nombre y apellido:", style: "tableHeaderBlue", colSpan: 1 }, { text: this.toTitleCase(reportData.patientName), colSpan: 3, style: "tableCellUnderline" }, {}, {}],
                            [{ text: "Lugar de Nacimiento:", style: "tableHeaderBlue", colSpan: 1 }, { text: this.toTitleCase(reportData.patientPlaceBirth), colSpan: 3, style: "tableCellUnderline" }, {}, {}],
                            [
                                { text: "N° Cédula de Identidad:", style: "tableHeaderBlue" },
                                { text: reportData.patientCedula, style: "tableCellUnderline" },
                                { text: "Fecha de Nacimiento:", style: "tableHeaderBlue" },
                                { text: this.showDateBirth(reportData.patientDateOfBirth), style: "tableCellUnderline" },
                            ],
                            [
                                { text: "Edad:", style: "tableHeaderBlue" },
                                { text: reportData.patientAge.toString(), style: "tableCellUnderline" },
                                { text: "Estado Civil:", style: "tableHeaderBlue" },
                                { text: this.getCivilStatusString(reportData.patientMaritalStatus), style: "tableCellUnderline" },
                            ],
                            [
                                { text: "Género:", style: "tableHeaderBlue" },
                                { text: this.showSex(reportData.patientSex), style: "tableCellUnderline" },
                                { text: "", colSpan: 2, style: "tableCellContent" },
                            ],
                        ],
                    },
                    layout: this.getTableLayout(),
                    margin: [0, 0, 0, 10],
                },
                { text: "11. Informe", style: "headerBackground", margin: [0, 0, 0, 0] },
                {
                    table: {
                        widths: ["*"],
                        heights: [null, 230],
                        body: [
                            [
                                { text: 'Informe', colSpan: 1, style: "tableHeaderBlue", alignment: "center" },
                            ],
                            [
                                {
                                    text: this.capitalizarOracion(reportData.description) || "",
                                    style: "tableCellContent_informe",
                                    border: [true, true, true, true],
                                },
                            ],
                        ],
                    },
                    layout: {
                        hLineWidth: (i, node) => 1,
                        vLineWidth: (i, node) => 1,
                        hLineColor: (i, node) => "#000000",
                        vLineColor: (i, node) => "#000000",
                        paddingLeft: (i, node) => 5,
                        paddingRight: (i, node) => 5,
                        paddingTop: (i, node) => 5,
                        paddingBottom: (i, node) => 5,
                    },
                    margin: [0, 0, 0, 20],
                },
                {
                    table: {
                        widths: ["25%", "25%", "25%", "25%"],
                        heights: [null, 70],
                        body: [
                            [
                                { text: "1. Nombre del Médico", style: "tableHeaderBlue" },
                                { text: "2. Cédula", style: "tableHeaderBlue" },
                                { text: "3. M.P.P.S. - C.M", style: "tableHeaderBlue" },
                                { text: "4. Firma y Sello", style: "tableHeaderBlue" },
                            ],
                            [
                                {
                                    text: this.toTitleCase(reportData.doctorName),
                                    style: "tableCellUnderline",
                                },
                                { text: reportData.doctorCedula, style: "tableCellUnderline", alignment: "center" },
                                { text: reportData.mppsCM, style: "tableCellUnderline", alignment: "center" },
                                { text: "", style: "tableCellUnderline" },
                            ],
                        ],
                    },
                    layout: this.getTableLayout(),
                    margin: [0, 10, 0, 0],
                },
            ],
            styles: styles,
            defaultStyle: {
                font: "Roboto",
                fontSize: 9,
            },
            pageSize: "A4",
            pageMargins: [40, 80, 40, 60],
            background: function (currentPage, pageSize) {
                const gobiernoPath = path.join(process.cwd(), "uploads", constants_1.membreteCIIP);
                const gobiernoLogo = fs.readFileSync(gobiernoPath).toString("base64");
                if (gobiernoLogo) {
                    return {
                        image: `data:image/jpeg;base64,${gobiernoLogo}`,
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
            footer: (currentPage, pageCount) => ({
                columns: [
                    { text: "DNI-e:Informe Medico", alignment: "left", style: "footerText", margin: [40, 0, 0, 0] },
                    { text: `Pág: ${currentPage}/${pageCount}`, alignment: "center", style: "footerText" },
                    {
                        text: `Fecha de Emisión: ${this.formatDate(reportData.createdAt).split(",")[0]}`,
                        alignment: "right",
                        style: "footerText",
                        margin: [0, 0, 40, 0],
                    },
                ],
            }),
        };
        return docDefinition;
    }
    formatDateForFilename(date) {
        const year = date.getFullYear();
        const month = (date.getMonth() + 1).toString().padStart(2, "0");
        const day = date.getDate().toString().padStart(2, "0");
        return `${year}-${month}-${day}`;
    }
    setResponseHeaders(res, filename, isDownload) {
        res.setHeader("Content-Type", "application/pdf");
        res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
        res.setHeader("Pragma", "no-cache");
        res.setHeader("Expires", "0");
        res.setHeader("Content-Disposition", isDownload ? `attachment; filename="${filename}"` : `inline; filename="${filename}"`);
    }
    showSex(sex) {
        return sex === 'M' ? 'Masculino' : 'Femenino';
    }
    getCivilStatusString(civilStatus) {
        switch (civilStatus) {
            case 'S':
                return 'Soltero(a)';
            case 'C':
                return 'Casado(a)';
            case 'D':
                return 'Divorciado(a)';
            case 'Sep':
                return 'Separado(a)';
            case 'V':
                return 'Viudo(a)';
            default:
                return '';
        }
    }
    showDateBirth(dateBirth) {
        if (dateBirth) {
            const [year, month, day] = dateBirth.split("-");
            return day + '/' + month + '/' + year;
        }
    }
    capitalizarOracion(oracion) {
        if (oracion.length === 0) {
            return "";
        }
        return oracion.charAt(0).toUpperCase() + oracion.slice(1);
    }
    toTitleCase(str) {
        if (!str) {
            return '';
        }
        return str
            .toLowerCase()
            .split(' ')
            .map(word => {
            if (word.length === 0) {
                return '';
            }
            return word.charAt(0).toUpperCase() + word.slice(1);
        })
            .join(' ');
    }
};
exports.MedicalReportPdfService = MedicalReportPdfService;
exports.MedicalReportPdfService = MedicalReportPdfService = MedicalReportPdfService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [medical_reports_service_1.MedicalReportsService])
], MedicalReportPdfService);
//# sourceMappingURL=medical-report-pdf.service.js.map