import { AppService } from './app.service';
export declare class AppController {
    private readonly appService;
    constructor(appService: AppService);
    getHello(): Promise<{
        id: number;
        nombre: string;
        role: number;
    }[]>;
    createUser(createUser: any): Promise<string>;
}
