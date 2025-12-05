import type { NeonDatabase } from "drizzle-orm/neon-serverless";
import { Buffer } from "buffer";
export declare class ExportUsersService {
    private db;
    private readonly logger;
    constructor(db: NeonDatabase);
    exportUsers(format: "xlsx" | "csv", roleFilter?: string, nameFilter?: string, cedulaFilter?: string): Promise<Buffer>;
    private generateExcel;
    private sanitizeCsv;
    private generateCsv;
}
