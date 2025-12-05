export declare class FilesService {
    private readonly logger;
    private readonly uploadDir;
    constructor();
    private ensureUploadDirExists;
    saveFiles(files: Express.Multer.File[], reportId: string): Promise<string[]>;
    getFilePath(relativePath: string): Promise<string>;
    deleteFile(relativePath: string): Promise<boolean>;
    deleteFiles(relativePaths: string[]): Promise<void>;
}
