import { ProvidersGetAll } from './dto/read-providers-dto';
import { ProvidersService } from './providers.service';
import { CreateProvider } from 'src/db/types/providers.types';
export declare class ProvidersController {
    private readonly providersService;
    constructor(providersService: ProvidersService);
    get(): Promise<ProvidersGetAll>;
    create(providerDto: CreateProvider): Promise<any>;
}
