import { IsString, IsNotEmpty, IsOptional, IsBoolean} from 'class-validator';

export class RoleDto{

    @IsNotEmpty()
    @IsString()
    name: string;

    @IsOptional()
    @IsString()
    description?: string;

    @IsNotEmpty()
    @IsBoolean()
    isActivate:boolean;
}