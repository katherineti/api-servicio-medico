export declare class DbBackupService {
    private readonly logger;
    private readonly execPromise;
    generateBackup(): Promise<{
        filePath: string;
        fileName: string;
    }>;
    cleanupFile(filePath: string): void;
}
