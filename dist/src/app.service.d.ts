import { NeonDatabase } from 'drizzle-orm/neon-serverless';
export declare class AppService {
    private conn;
    constructor(conn: NeonDatabase);
    getUsers(): Promise<{
        id: number;
        nombre: string;
        role: number;
    }[]>;
    getUserbyId(id: number): Promise<{
        id: number;
        name: string;
        cedula: string;
        email: string;
        password: string;
        role: number;
        isActivate: boolean;
        createdAt: Date;
        updatedAt: Date;
    }>;
    createUser(createUser: any): Promise<string>;
}
