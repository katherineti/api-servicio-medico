import { Module } from '@nestjs/common';
import { DrizzleDbConecctionModule } from 'src/db.module';
import { TempAuditorReportsController } from './temp-auditor-reports.controller';
import { TempAuditorReportsService } from './temp-auditor-reports.service';
import { FilesModule } from 'src/files/files.module';
import { MulterModule } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { join } from 'path';
import * as fsPromises from 'node:fs/promises';
import { PdfGeneratorService } from './pdf-generator.service';

@Module({
  imports: [
    DrizzleDbConecctionModule,
    FilesModule,
    MulterModule.register({
      storage: diskStorage({
        destination: async (req, file, callback) => {
          const reportId = req.params.id;
          if (!reportId) {
            return callback(new Error('Report ID is missing in the request parameters'), null);
          }
          const uploadFolder = join(__dirname, '..', '..', 'uploads', 'reports', 'Id '+String(reportId));
          try {
            await fsPromises.mkdir(uploadFolder, { recursive: true });
            callback(null, uploadFolder);
          } catch (error) {
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
        fileSize: 5 * 1024 * 1024, // 5MB
      },
    }),
  ],
  controllers: [TempAuditorReportsController],
  providers: [
    TempAuditorReportsService, 
    PdfGeneratorService
  ],
})
export class TempAuditorReportsModule {}