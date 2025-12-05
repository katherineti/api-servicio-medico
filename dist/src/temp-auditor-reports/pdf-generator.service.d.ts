import { Response } from 'express';
import { Reports } from 'src/db/types/reports.types';
export declare class PdfGeneratorService {
    private readonly logger;
    private readonly MAX_IMAGES;
    private readonly MAX_RETRIES;
    private readonly fonts;
    private readonly STANDARD_IMAGE_WIDTH;
    constructor();
    private verifyFonts;
    generatePdf(report: Reports, res: Response): Promise<void>;
    private validateReport;
    private handleError;
    private createDocumentDefinition_;
    private createDocumentDefinition;
    private loadLogoWithRetry;
    private processImages;
    private loadImageWithRetry;
    private getMimeType;
    private formatDate;
    private getValidContent;
    capitalizarOracion(oracion: any): any;
    private debugReportContent;
    private logSectionContent;
    TitleTable(content: any, report: any): any;
    private ResumenTable;
    ConclusionesTable(content: any, report: any): any;
}
