import type { Response } from "express";
import { ExportUsersService } from "./excel-export-users.service";
interface ExportDto {
    format: "xlsx" | "csv";
    role?: string;
    name?: string;
    cedula?: string;
}
export declare class ExportController {
    private readonly exportUsersService;
    constructor(exportUsersService: ExportUsersService);
    exportUsers(exportDto: ExportDto, res: Response): Promise<void>;
}
export {};
