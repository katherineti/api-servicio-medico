import { Body, Controller, Post } from '@nestjs/common';
import { SearchLogsDto } from './dto/search.logs.dto';
import { ResultGetAllLogs } from './dto/read-logs-dto';
import { LogsService } from './logs.service';

@Controller('logs')
export class LogsController {
    constructor(private readonly logsService: LogsService) { }
    
    @Post('getAll')
    getUsers(@Body() body: SearchLogsDto): Promise<ResultGetAllLogs> {
    return this.logsService.getAll(body);
    }
}
