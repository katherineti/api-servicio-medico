import { Body, Controller, Ip, Post, Req } from '@nestjs/common';
import { SearchLogsDto } from './dto/search.logs.dto';
import { ResultGetAllLogs } from './dto/read-logs-dto';
import { LogsService } from './logs.service';
import { Usersesion } from 'src/auth/strategies/usersesion.decorator';
import { IJwtPayload } from 'src/auth/dto/jwt-payload.interface';

@Controller('logs')
export class LogsController {
    constructor(private readonly logsService: LogsService) { }
    
    @Post('getAll')
    get(@Body() body: SearchLogsDto): Promise<ResultGetAllLogs> {
    return this.logsService.getAll(body);
    }
    
    @Post()
    create(
        @Body() body: {action: string}, 
        @Ip() clienteIp: string,
        @Req() req: Request,
        @Usersesion() user: IJwtPayload
    ): Promise<any> {
        //para el log de cierre de sesion
        const _body ={
            action: body.action,
            userId: user.sub,
            productId: null,
            ipAddress: clienteIp,
            hostname: req.headers['host']
        };

    return this.logsService.create(_body);
    }
}