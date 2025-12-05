import { SearchLogsDto } from './dto/search.logs.dto';
import { ResultGetAllLogs } from './dto/read-logs-dto';
import { LogsService } from './logs.service';
import { IJwtPayload } from 'src/auth/dto/jwt-payload.interface';
export declare class LogsController {
    private readonly logsService;
    constructor(logsService: LogsService);
    get(body: SearchLogsDto): Promise<ResultGetAllLogs>;
    create(body: {
        action: string;
    }, clienteIp: string, req: Request, user: IJwtPayload): Promise<any>;
}
