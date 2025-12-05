import { ConfigService } from '@nestjs/config';
export declare class DbBackupService {
    private readonly configService;
    private readonly logger;
    private readonly DB_USER;
    private readonly DB_PASS;
    private readonly DB_NAME;
    private readonly DB_HOST;
    private readonly DB_PORT;
    private readonly DB_CONN_URL_CLEAN;
    private readonly POSTGRES_VERSIONS_TO_CHECK;
    constructor(configService: ConfigService);
    private findPgUtilityPath;
    generateBackup(): Promise<{
        filePath: string;
        fileName: string;
    }>;
    restoreBackup(backupFilePath: string): Promise<void>;
    cleanupFile(filePath: string): void;
}
