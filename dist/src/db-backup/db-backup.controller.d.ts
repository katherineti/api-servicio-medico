import { StreamableFile } from '@nestjs/common';
import { Response } from 'express';
import { DbBackupService } from './db-backup-restore.service';
export declare class DbBackupController {
    private readonly dbBackupService;
    constructor(dbBackupService: DbBackupService);
    download(res: Response): Promise<StreamableFile>;
    uploadBackup(file: Express.Multer.File): Promise<{
        message: string;
    }>;
}
