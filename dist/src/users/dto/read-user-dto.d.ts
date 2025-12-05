export declare class ResultGetAll {
    total: number;
    page: number;
    list: Omit<IUser, 'password'>[];
}
export declare class IUser {
    id: number;
    name?: string;
    email: string;
    password?: string;
    roleId?: number;
    role: string;
    isActivate: boolean;
    createdAt?: Date;
    updatedAt?: Date;
}
