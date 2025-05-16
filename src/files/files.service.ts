import { Injectable, Logger } from '@nestjs/common';
import * as path from 'path';
import * as fsPromises from 'node:fs/promises';

@Injectable()
export class FilesService {
  private readonly logger = new Logger(FilesService.name);
  private readonly uploadDir = path.join(process.cwd(), 'uploads');

  constructor() {
    this.ensureUploadDirExists();
  }

  private async ensureUploadDirExists() {
    try {
      await fsPromises.mkdir(this.uploadDir, { recursive: true });
    } catch (error) {
      this.logger.error(`Error al crear directorio de uploads: ${error.message}`);
    }
  }

  async saveFiles(files: Express.Multer.File[], reportId: string): Promise<string[]> {
    if (!files || files.length === 0) {
      return [];
    }

    const savedPaths: string[] = [];
    const reportFolder = path.join('reports', `Id ${reportId}`).replace(/\\/g, '/'); 

    for (const file of files) {
      const relativePath = `/uploads/${reportFolder}/${file.filename.replace(/\\/g, '/')}`; 
      savedPaths.push(relativePath);
    }

    return savedPaths;
  }

  async getFilePath(relativePath: string): Promise<string> {
    const fullPath = path.join(process.cwd(), 'public', relativePath);
    try {
      await fsPromises.access(fullPath);
      return fullPath;
    } catch (error) {
      this.logger.error(`Archivo no encontrado: ${fullPath}`);
      throw new Error('Archivo no encontrado');
    }
  }

  async deleteFile(relativePath: string): Promise<boolean> {
    const fullPath = path.join(process.cwd(), 'public', relativePath);
    try {
      await fsPromises.unlink(fullPath);
      return true;
    } catch (error) {
      this.logger.error(`Error al eliminar archivo ${fullPath}: ${error.message}`);
      return false;
    }
  }

  async deleteFiles(relativePaths: string[]): Promise<void> {
    if (!relativePaths || relativePaths.length === 0) {
      return;
    }

    const deletePromises = relativePaths.map(path => this.deleteFile(path));
    await Promise.all(deletePromises);
  }
}