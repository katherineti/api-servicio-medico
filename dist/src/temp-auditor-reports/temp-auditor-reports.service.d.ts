import { NeonDatabase } from 'drizzle-orm/neon-serverless';
import { Reports } from 'src/db/types/reports.types';
import { ReportCreateDto } from './dto/reports.dto';
import { ReportUpdateDto } from './dto/report-update.dto';
import { FilesService } from 'src/files/files.service';
import { SearchReportsDto } from './dto/search.reports.dto';
import { ReportsGetAll } from './dto/read-reports-dto';
export declare class ResultGetAllAuditores {
    total: number;
    list: {
        id: number;
        name: string;
        email: string;
        isActivate: boolean;
        role: number;
    }[];
}
export declare class TempAuditorReportsService {
    private db;
    private filesService;
    private readonly logger;
    constructor(db: NeonDatabase, filesService: FilesService);
    create(body: ReportCreateDto): Promise<Reports>;
    getById(id: number): Promise<Reports | null>;
    getAll(filter: SearchReportsDto): Promise<ReportsGetAll>;
    update(id: number, body: Partial<ReportUpdateDto>): Promise<Reports>;
    updateWithImages(id: number, body: ReportUpdateDto, files: Express.Multer.File[]): Promise<Reports | {
        saved: Reports;
        error?: string;
    } | undefined>;
    delete(id: number): Promise<Reports>;
    getAllAuditores(): Promise<ResultGetAllAuditores>;
    validateArrayadditionalAuditor(body: any): Promise<any>;
    duplicate(body: {
        id: number;
    }): Promise<Reports>;
}
